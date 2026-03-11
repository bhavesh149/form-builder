from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from loguru import logger

from app.models import Form, FormVersion, FormStatus
from app.schemas.form import FormCreate, FormUpdate


def create_form(db: Session, data: FormCreate, user_id: UUID) -> Form:
    """Create a new form with its first version."""
    form = Form(
        title=data.title,
        description=data.description,
        created_by=user_id,
        status=FormStatus.DRAFT,
        collect_respondent_info=data.collect_respondent_info,
        current_version=1,
    )
    db.add(form)
    db.flush()

    version = FormVersion(
        form_id=form.id,
        version=1,
        fields_schema=[field.model_dump() for field in data.fields_schema],
        logic_rules=[rule.model_dump() for rule in (data.logic_rules or [])],
    )
    db.add(version)
    db.commit()
    db.refresh(form)

    logger.info(f"Created form '{form.title}' (id={form.id})")
    return form


def get_form(db: Session, form_id: UUID) -> Optional[Form]:
    """Get a form by ID with its latest version."""
    return (
        db.query(Form)
        .options(joinedload(Form.versions))
        .filter(Form.id == form_id)
        .first()
    )


def list_forms(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[List[Form], int]:
    """List forms with optional search and filter. Returns (items, total_count)."""
    query = db.query(Form)

    if search:
        query = query.filter(Form.title.ilike(f"%{search}%"))
    if status:
        query = query.filter(Form.status == status)

    query = query.order_by(Form.created_at.desc())
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total


def update_form(db: Session, form_id: UUID, data: FormUpdate) -> Optional[Form]:
    """Update a form, creating a new version if schema changes."""
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        return None

    if data.title is not None:
        form.title = data.title
    if data.description is not None:
        form.description = data.description
    if data.status is not None:
        form.status = data.status
    if data.collect_respondent_info is not None:
        form.collect_respondent_info = data.collect_respondent_info

    # If fields or logic changed, create a new version
    if data.fields_schema is not None or data.logic_rules is not None:
        form.current_version += 1

        latest = (
            db.query(FormVersion)
            .filter(FormVersion.form_id == form_id)
            .order_by(FormVersion.version.desc())
            .first()
        )

        new_version = FormVersion(
            form_id=form.id,
            version=form.current_version,
            fields_schema=(
                [f.model_dump() for f in data.fields_schema]
                if data.fields_schema
                else latest.fields_schema
            ),
            logic_rules=(
                [r.model_dump() for r in data.logic_rules]
                if data.logic_rules
                else (latest.logic_rules if latest else [])
            ),
        )
        db.add(new_version)

    db.commit()
    db.refresh(form)
    logger.info(f"Updated form '{form.title}' to v{form.current_version}")
    return form


def delete_form(db: Session, form_id: UUID) -> bool:
    """Delete a form and all its versions."""
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        return False
    db.delete(form)
    db.commit()
    logger.info(f"Deleted form '{form.title}' (id={form_id})")
    return True
