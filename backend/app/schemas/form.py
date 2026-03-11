from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class FormFieldSchema(BaseModel):
    """Schema for a single form field definition."""
    id: str
    type: str  # text, number, select, radio, checkbox_group, file_upload, video_upload
    label: str
    name: Optional[str] = None
    required: bool = False
    placeholder: Optional[str] = None
    default_value: Optional[Any] = None
    validation_rules: Optional[dict] = None
    data_source: Optional[str] = None  # e.g., "/metadata/branches"
    options: Optional[List[dict]] = None  # for static select/radio


class LogicRule(BaseModel):
    """Schema for a conditional logic rule. Supports compound conditions with AND/OR."""
    condition: dict  # {"field": "depth", "operator": ">=", "value": 4}
    conditions: Optional[List[dict]] = None  # Multiple conditions for compound rules
    logic: Optional[str] = None  # "and" or "or" — how to combine conditions
    action: dict  # {"show": "warning_message"} or {"require": "video_evidence"}


class FormCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    fields_schema: List[FormFieldSchema]
    logic_rules: Optional[List[LogicRule]] = []
    collect_respondent_info: bool = False


class FormUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    fields_schema: Optional[List[FormFieldSchema]] = None
    logic_rules: Optional[List[LogicRule]] = None
    status: Optional[str] = None
    collect_respondent_info: Optional[bool] = None


class FormVersionResponse(BaseModel):
    id: UUID
    version: int
    fields_schema: List[dict]
    logic_rules: Optional[List[dict]] = []
    created_at: datetime

    class Config:
        from_attributes = True


class FormResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    status: str
    current_version: int
    collect_respondent_info: bool = False
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    latest_version: Optional[FormVersionResponse] = None

    class Config:
        from_attributes = True


class FormListResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    status: str
    current_version: int
    collect_respondent_info: bool = False
    fields_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedFormListResponse(BaseModel):
    items: List[FormListResponse]
    total: int
    skip: int
    limit: int
