"""
Thread and Message models for chat
"""
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from database import Base


class Thread(Base):
    __tablename__ = "threads"
    __table_args__ = {"schema": "chat"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("auth.users.id"), nullable=False, index=True)

    # Thread metadata
    thread_metadata = Column("metadata", JSON, default=dict)  # mode, tags, etc.

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Thread {self.id}>"


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = {"schema": "chat"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id = Column(String, ForeignKey("chat.threads.id"), nullable=False, index=True)

    role = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)

    # Citations, tool calls, etc.
    message_metadata = Column("metadata", JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Message {self.id} role={self.role}>"


class Checkpoint(Base):
    """LangGraph checkpoints for thread state"""
    __tablename__ = "checkpoints"
    __table_args__ = {"schema": "chat"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id = Column(String, ForeignKey("chat.threads.id"), nullable=False, index=True)

    checkpoint_data = Column(JSON, nullable=False)
    step = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Checkpoint {self.id} thread={self.thread_id} step={self.step}>"
