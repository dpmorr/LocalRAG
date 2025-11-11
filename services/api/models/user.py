"""
User model
"""
from sqlalchemy import Column, String, DateTime, JSON, Integer, Text, ARRAY
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    is_admin = Column(String, default="false")  # "true" or "false" for admin access

    # Profile fields
    current_role = Column(String)
    years_experience = Column(Integer)
    skills = Column(ARRAY(String), default=list)
    goals = Column(ARRAY(String), default=list)
    preferences = Column(JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User {self.email}>"
