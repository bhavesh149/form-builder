from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.database import get_db
from app.models.user import User
from app.schemas.submission import SubmissionCreate, SubmissionResponse, SubmissionListResponse, PaginatedSubmissionListResponse
from app.services import submission_service
from app.services.submission_service import SubmissionValidationError
from app.auth.deps import get_current_user

router = APIRouter(prefix="/api/forms", tags=["Submissions"])


@router.post("/{form_id}/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    form_id: UUID,
    data: SubmissionCreate,
    db: Session = Depends(get_db),
):
    """Submit a form response."""
    try:
        submission = submission_service.create_submission(db, form_id, data, None)
        return submission
    except SubmissionValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Validation failed", "field_errors": e.errors},
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{form_id}/submissions", response_model=PaginatedSubmissionListResponse)
def list_submissions(
    form_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """List submissions for a form (paginated)."""
    items, total = submission_service.list_submissions(db, form_id, skip=skip, limit=limit)
    return PaginatedSubmissionListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission(
    submission_id: UUID,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get a specific submission."""
    submission = submission_service.get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return submission
