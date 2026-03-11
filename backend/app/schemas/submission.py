from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime


class SubmissionCreate(BaseModel):
    branch_id: UUID
    submission_data: dict[str, Any]
    respondent_name: Optional[str] = None
    respondent_email: Optional[EmailStr] = None


class SubmissionResponse(BaseModel):
    id: UUID
    form_id: UUID
    form_version: int
    branch_id: UUID
    submitted_by: Optional[UUID] = None
    respondent_name: Optional[str] = None
    respondent_email: Optional[str] = None
    submission_data: dict[str, Any]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SubmissionListResponse(BaseModel):
    id: UUID
    form_id: UUID
    form_version: int
    branch_id: UUID
    submitted_by: Optional[UUID] = None
    respondent_name: Optional[str] = None
    respondent_email: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedSubmissionListResponse(BaseModel):
    items: List[SubmissionListResponse]
    total: int
    skip: int
    limit: int
