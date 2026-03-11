from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class BranchResponse(BaseModel):
    id: UUID
    name: str
    location: str
    created_at: datetime

    class Config:
        from_attributes = True


class BranchCreate(BaseModel):
    name: str
    location: str
