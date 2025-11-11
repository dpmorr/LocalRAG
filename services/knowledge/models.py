"""
Database models for Knowledge Service
"""
from sqlalchemy import Column, String, DateTime, JSON, Text, Integer, Float
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

from database import Base


class Document(Base):
    """Document metadata"""
    __tablename__ = "documents"
    __table_args__ = {"schema": "knowledge"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    filename = Column(String, nullable=False)
    content_type = Column(String)

    # Storage paths
    raw_path = Column(String)  # S3 path to raw file
    clean_path = Column(String)  # S3 path to processed markdown

    # Processing status
    status = Column(String, default="processing")  # processing, ready, failed
    progress = Column(Integer, default=0)
    error_message = Column(Text)

    # Metadata
    doc_metadata = Column("metadata", JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Chunk(Base):
    """Text chunks from documents"""
    __tablename__ = "chunks"
    __table_args__ = {"schema": "knowledge"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)

    # Content
    text = Column(Text, nullable=False)
    position = Column(Integer)  # Position in document

    # Metadata
    chunk_metadata = Column("metadata", JSON, default=dict)  # heading, section, etc.

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Embedding(Base):
    """Vector embeddings for chunks"""
    __tablename__ = "embeddings"
    __table_args__ = {"schema": "knowledge"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chunk_id = Column(String, nullable=False, index=True, unique=True)

    # Vector (1024 dimensions for BGE-M3)
    vector = Column(Vector(1024), nullable=False)

    # For quick lookups
    doc_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
