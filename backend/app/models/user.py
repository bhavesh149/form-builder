import uuid
from datetime import datetime

from sqlalchemy import Column, String, Enum as SAEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base

import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, create_constraint=True, checkfirst=True), nullable=False, default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    forms = relationship("Form", back_populates="creator")
    submissions = relationship("FormSubmission", back_populates="submitter")

    def __repr__(self):
        return f"<User {self.email}>"
