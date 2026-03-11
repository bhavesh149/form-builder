from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.db.database import get_db
from app.models.user import User
from app.schemas.form import FormCreate, FormUpdate, FormResponse, FormListResponse, FormVersionResponse, PaginatedFormListResponse
from app.services import form_service
from app.auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/api/forms", tags=["Forms"])


@router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(
    data: FormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new form definition (admin only)."""
    form = form_service.create_form(db, data, current_user.id)
    return _build_form_response(form)


@router.get("", response_model=PaginatedFormListResponse)
def list_forms(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """List all forms with optional filters (paginated)."""
    forms, total = form_service.list_forms(db, search=search, status=status_filter, skip=skip, limit=limit)
    items = []
    for form in forms:
        latest = _get_latest_version(form)
        items.append(FormListResponse(
            id=form.id,
            title=form.title,
            description=form.description,
            status=form.status.value if hasattr(form.status, 'value') else form.status,
            current_version=form.current_version,
            collect_respondent_info=form.collect_respondent_info,
            fields_count=len(latest.fields_schema) if latest else 0,
            created_at=form.created_at,
        ))
    return PaginatedFormListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{form_id}", response_model=FormResponse)
def get_form(
    form_id: UUID,
    db: Session = Depends(get_db),
):
    """Get a form definition by ID."""
    form = form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return _build_form_response(form)


@router.put("/{form_id}", response_model=FormResponse)
def update_form(
    form_id: UUID,
    data: FormUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """Update a form definition (admin only). Creates a new version if schema changes."""
    form = form_service.update_form(db, form_id, data)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return _build_form_response(form)


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """Delete a form definition (admin only)."""
    if not form_service.delete_form(db, form_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")


def _get_latest_version(form):
    """Helper to get the latest version from a form's versions."""
    if form.versions:
        return max(form.versions, key=lambda v: v.version)
    return None


def _build_form_response(form) -> FormResponse:
    """Helper to build FormResponse with latest version."""
    latest = _get_latest_version(form)
    return FormResponse(
        id=form.id,
        title=form.title,
        description=form.description,
        status=form.status.value if hasattr(form.status, 'value') else form.status,
        current_version=form.current_version,
        collect_respondent_info=form.collect_respondent_info,
        created_by=form.created_by,
        created_at=form.created_at,
        updated_at=form.updated_at,
        latest_version=FormVersionResponse(
            id=latest.id,
            version=latest.version,
            fields_schema=latest.fields_schema,
            logic_rules=latest.logic_rules or [],
            created_at=latest.created_at,
        ) if latest else None,
    )
