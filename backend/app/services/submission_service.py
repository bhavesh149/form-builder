from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from loguru import logger

from app.models import FormSubmission, Form, FormVersion, Branch
from app.schemas.submission import SubmissionCreate


class SubmissionValidationError(ValueError):
    """Raised when submission data fails schema validation."""

    def __init__(self, errors: Dict[str, str]):
        self.errors = errors
        summary = "; ".join(f"{k}: {v}" for k, v in errors.items())
        super().__init__(f"Validation failed — {summary}")


def _is_numeric(value: Any) -> bool:
    if isinstance(value, (int, float)):
        return True
    if isinstance(value, str):
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False
    return False


def validate_submission_data(
    fields_schema: List[dict],
    submission_data: Dict[str, Any],
) -> Dict[str, str]:
    """Validate submission_data against the form's fields_schema.

    Supports submission keys being either field.id or field.name.
    Returns a dict of key -> error message for every failing field.
    An empty dict means the data is valid.
    """
    errors: Dict[str, str] = {}
    schema_map = {field["id"]: field for field in fields_schema}

    for field_id, field_def in schema_map.items():
        field_name = field_def.get("name")
        value = submission_data.get(field_id)
        if value is None and field_name:
            value = submission_data.get(field_name)
        error_key = field_name or field_id
        field_label = field_def.get("label", field_id)
        field_type = field_def.get("type", "text")
        is_required = field_def.get("required", False)

        is_empty = value is None or value == "" or value == []

        if is_required and is_empty:
            errors[error_key] = f"{field_label} is required"
            continue

        if is_empty:
            continue

        if field_type == "number":
            if not _is_numeric(value):
                errors[error_key] = (
                    f"{field_label} must be a number, got '{value}'"
                )

        elif field_type == "text":
            if not isinstance(value, str):
                errors[error_key] = (
                    f"{field_label} must be a text value"
                )

        elif field_type in ("select", "radio"):
            options = field_def.get("options") or []
            data_source = field_def.get("data_source")
            if options and not data_source:
                allowed = {opt["value"] for opt in options if "value" in opt}
                if str(value) not in allowed:
                    errors[error_key] = (
                        f"{field_label}: '{value}' is not a valid option"
                    )

        elif field_type == "checkbox_group":
            if not isinstance(value, list):
                errors[error_key] = f"{field_label} must be a list of values"
            else:
                options = field_def.get("options") or []
                data_source = field_def.get("data_source")
                if options and not data_source:
                    allowed = {opt["value"] for opt in options if "value" in opt}
                    invalid = [v for v in value if str(v) not in allowed]
                    if invalid:
                        errors[error_key] = (
                            f"{field_label}: invalid options {invalid}"
                        )

    return errors


def create_submission(
    db: Session,
    form_id: UUID,
    data: SubmissionCreate,
    user_id: Optional[UUID] = None,
) -> FormSubmission:
    """Create a new form submission after validation."""
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise ValueError("Form not found")
    if form.status != "published":
        raise ValueError("Form is not published")

    branch = db.query(Branch).filter(Branch.id == data.branch_id).first()
    if not branch:
        raise ValueError("Branch not found")

    if form.collect_respondent_info:
        respondent_errors: Dict[str, str] = {}
        if not data.respondent_name or not data.respondent_name.strip():
            respondent_errors["respondent_name"] = "Name is required"
        if not data.respondent_email or not data.respondent_email.strip():
            respondent_errors["respondent_email"] = "Email is required"
        if respondent_errors:
            raise SubmissionValidationError(respondent_errors)

    # Fetch the current version's field schema and validate
    form_version = (
        db.query(FormVersion)
        .filter(
            FormVersion.form_id == form_id,
            FormVersion.version == form.current_version,
        )
        .first()
    )
    if form_version and form_version.fields_schema:
        validation_errors = validate_submission_data(
            form_version.fields_schema,
            data.submission_data,
        )
        if validation_errors:
            raise SubmissionValidationError(validation_errors)

    submission = FormSubmission(
        form_id=form_id,
        form_version=form.current_version,
        branch_id=data.branch_id,
        submitted_by=user_id,
        respondent_name=data.respondent_name,
        respondent_email=data.respondent_email,
        submission_data=data.submission_data,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    logger.info(f"Created submission {submission.id} for form {form_id}")
    return submission


def get_submission(db: Session, submission_id: UUID) -> Optional[FormSubmission]:
    """Get a submission by ID."""
    return db.query(FormSubmission).filter(FormSubmission.id == submission_id).first()


def list_submissions(
    db: Session,
    form_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> tuple[List[FormSubmission], int]:
    """List submissions for a form. Returns (items, total_count)."""
    query = (
        db.query(FormSubmission)
        .filter(FormSubmission.form_id == form_id)
        .order_by(FormSubmission.created_at.desc())
    )
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total
