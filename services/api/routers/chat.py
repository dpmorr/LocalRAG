"""
Chat/Thread endpoints - LangGraph orchestration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from database import get_db
from models.user import User
from models.thread import Thread, Message
from routers.auth import get_current_user
from services.chat_orchestrator import ChatOrchestrator

router = APIRouter()


# Schemas
class ThreadCreate(BaseModel):
    message: str
    mode: str = "quick"  # quick or deep


class MessageCreate(BaseModel):
    content: str


class CitationResponse(BaseModel):
    doc_id: str
    chunk_id: str
    text: str
    source: str
    score: float


class MessageResponse(BaseModel):
    id: str
    role: str  # user or assistant
    content: str
    citations: List[CitationResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ThreadResponse(BaseModel):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    message_count: int

    class Config:
        from_attributes = True


class ThreadDetailResponse(ThreadResponse):
    messages: List[MessageResponse]


# Routes
@router.post("", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    thread_data: ThreadCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat thread with initial message"""
    # Create thread
    thread = Thread(
        user_id=current_user.id,
        metadata={"mode": thread_data.mode}
    )
    db.add(thread)
    await db.flush()

    # Create user message
    user_message = Message(
        thread_id=thread.id,
        role="user",
        content=thread_data.message
    )
    db.add(user_message)
    await db.flush()

    # Process with LangGraph orchestrator
    orchestrator = ChatOrchestrator(db)
    assistant_response = await orchestrator.process_message(
        thread_id=thread.id,
        user_id=current_user.id,
        message=thread_data.message,
        mode=thread_data.mode
    )

    # Create assistant message
    assistant_message = Message(
        thread_id=thread.id,
        role="assistant",
        content=assistant_response["content"],
        metadata={"citations": assistant_response.get("citations", [])}
    )
    db.add(assistant_message)

    await db.commit()
    await db.refresh(thread)

    # Count messages
    messages_result = await db.execute(
        select(Message).where(Message.thread_id == thread.id)
    )
    message_count = len(messages_result.scalars().all())

    return {
        "id": thread.id,
        "user_id": thread.user_id,
        "created_at": thread.created_at,
        "updated_at": thread.updated_at,
        "message_count": message_count
    }


@router.post("/{thread_id}/messages", response_model=MessageResponse)
async def add_message(
    thread_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a message to existing thread"""
    # Get thread
    result = await db.execute(
        select(Thread).where(
            Thread.id == thread_id,
            Thread.user_id == current_user.id
        )
    )
    thread = result.scalar_one_or_none()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )

    # Create user message
    user_message = Message(
        thread_id=thread.id,
        role="user",
        content=message_data.content
    )
    db.add(user_message)
    await db.flush()

    # Process with orchestrator
    orchestrator = ChatOrchestrator(db)
    assistant_response = await orchestrator.process_message(
        thread_id=thread.id,
        user_id=current_user.id,
        message=message_data.content,
        mode=thread.metadata.get("mode", "quick")
    )

    # Create assistant message
    assistant_message = Message(
        thread_id=thread.id,
        role="assistant",
        content=assistant_response["content"],
        metadata={"citations": assistant_response.get("citations", [])}
    )
    db.add(assistant_message)

    # Update thread
    thread.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(assistant_message)

    return assistant_message


@router.get("/{thread_id}", response_model=ThreadDetailResponse)
async def get_thread(
    thread_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get thread with all messages"""
    result = await db.execute(
        select(Thread).where(
            Thread.id == thread_id,
            Thread.user_id == current_user.id
        )
    )
    thread = result.scalar_one_or_none()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found"
        )

    # Get messages
    messages_result = await db.execute(
        select(Message)
        .where(Message.thread_id == thread.id)
        .order_by(Message.created_at)
    )
    messages = messages_result.scalars().all()

    return {
        **thread.__dict__,
        "messages": messages,
        "message_count": len(messages)
    }


@router.get("", response_model=List[ThreadResponse])
async def list_threads(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """List user's threads"""
    from sqlalchemy import func

    result = await db.execute(
        select(Thread)
        .where(Thread.user_id == current_user.id)
        .order_by(Thread.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    threads = result.scalars().all()

    # Add message count to each thread
    thread_responses = []
    for thread in threads:
        messages_result = await db.execute(
            select(func.count(Message.id)).where(Message.thread_id == thread.id)
        )
        message_count = messages_result.scalar() or 0

        thread_responses.append({
            "id": thread.id,
            "user_id": thread.user_id,
            "created_at": thread.created_at,
            "updated_at": thread.updated_at,
            "message_count": message_count
        })

    return thread_responses
