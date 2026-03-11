from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.branch import Branch
from app.schemas.branch import BranchResponse, BranchCreate
from app.auth.deps import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/api/metadata", tags=["Metadata"])


@router.get("/branches", response_model=List[BranchResponse])
def get_branches(
    db: Session = Depends(get_db),
):
    """Get all branches."""
    return db.query(Branch).order_by(Branch.name).all()


@router.post("/branches", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(
    data: BranchCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_admin),
):
    """Create a new branch (admin only)."""
    existing = db.query(Branch).filter(Branch.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Branch already exists",
        )

    branch = Branch(name=data.name, location=data.location)
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch
