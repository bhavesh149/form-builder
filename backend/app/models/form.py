import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SAEnum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base

import enum


class FormStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Form(Base):
    __tablename__ = "forms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    status = Column(SAEnum(FormStatus, create_constraint=True, checkfirst=True), nullable=False, default=FormStatus.DRAFT)
    collect_respondent_info = Column(Boolean, nullable=False, default=False, server_default="false")
    current_version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    creator = relationship("User", back_populates="forms")
    versions = relationship("FormVersion", back_populates="form", cascade="all, delete-orphan")
    submissions = relationship("FormSubmission", back_populates="form")

    def __repr__(self):
        return f"<Form {self.title} v{self.current_version}>"
