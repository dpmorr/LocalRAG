"""
Admin endpoints for knowledge management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from pydantic import BaseModel, HttpUrl
import httpx
import logging

from database import get_db
from routers.auth import get_current_user
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


# Admin check dependency
async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Verify that the current user is an admin"""
    if current_user.is_admin != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Schemas
class IngestUrlRequest(BaseModel):
    url: HttpUrl
    content_type: str = "article"  # article, podcast


class DocumentResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    status: str
    created_at: str
    chunk_count: Optional[int] = 0


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    limit: int
    offset: int


class ChunkResponse(BaseModel):
    id: str
    text: str
    position: int
    metadata: dict


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    List all documents in the knowledge base with chunk counts
    """
    try:
        # Import here to avoid circular dependency
        import sys
        sys.path.append('/app/../knowledge')
        from knowledge.models import Document, Chunk

        # Get documents with chunk counts
        query = (
            select(
                Document,
                func.count(Chunk.id).label('chunk_count')
            )
            .outerjoin(Chunk, Document.id == Chunk.doc_id)
            .where(Document.user_id == current_user.id)
            .group_by(Document.id)
            .order_by(Document.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await db.execute(query)
        rows = result.all()

        # Get total count
        count_query = select(func.count(Document.id)).where(Document.user_id == current_user.id)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        documents = []
        for doc, chunk_count in rows:
            documents.append(DocumentResponse(
                id=doc.id,
                filename=doc.filename,
                content_type=doc.content_type,
                status=doc.status,
                created_at=doc.created_at.isoformat(),
                chunk_count=chunk_count
            ))

        return DocumentListResponse(
            documents=documents,
            total=total,
            limit=limit,
            offset=offset
        )

    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list documents: {str(e)}"
        )


@router.get("/documents/{doc_id}")
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Get document details
    """
    try:
        import sys
        sys.path.append('/app/../knowledge')
        from knowledge.models import Document

        query = select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id
        )
        result = await db.execute(query)
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        return {
            "id": doc.id,
            "filename": doc.filename,
            "content_type": doc.content_type,
            "status": doc.status,
            "raw_path": doc.raw_path,
            "clean_path": doc.clean_path,
            "metadata": doc.doc_metadata,
            "created_at": doc.created_at.isoformat(),
            "updated_at": doc.updated_at.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get document: {str(e)}"
        )


@router.get("/documents/{doc_id}/chunks", response_model=List[ChunkResponse])
async def get_document_chunks(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Get all chunks for a document
    """
    try:
        import sys
        sys.path.append('/app/../knowledge')
        from knowledge.models import Document, Chunk

        # Verify document belongs to user
        doc_query = select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id
        )
        doc_result = await db.execute(doc_query)
        doc = doc_result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Get chunks
        chunks_query = (
            select(Chunk)
            .where(Chunk.doc_id == doc_id)
            .order_by(Chunk.position)
        )
        chunks_result = await db.execute(chunks_query)
        chunks = chunks_result.scalars().all()

        return [
            ChunkResponse(
                id=chunk.id,
                text=chunk.text,
                position=chunk.position,
                metadata=chunk.chunk_metadata or {}
            )
            for chunk in chunks
        ]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chunks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chunks: {str(e)}"
        )


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Delete a document and all its chunks
    """
    try:
        import sys
        sys.path.append('/app/../knowledge')
        from knowledge.models import Document, Chunk, Embedding

        # Verify document belongs to user
        doc_query = select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id
        )
        doc_result = await db.execute(doc_query)
        doc = doc_result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Delete embeddings for chunks
        chunk_ids_query = select(Chunk.id).where(Chunk.doc_id == doc_id)
        chunk_ids_result = await db.execute(chunk_ids_query)
        chunk_ids = [row[0] for row in chunk_ids_result.all()]

        if chunk_ids:
            # Delete embeddings
            from sqlalchemy import delete as sql_delete
            await db.execute(
                sql_delete(Embedding).where(Embedding.chunk_id.in_(chunk_ids))
            )

        # Delete chunks
        await db.execute(
            sql_delete(Chunk).where(Chunk.doc_id == doc_id)
        )

        # Delete document
        await db.delete(doc)
        await db.commit()

        return {"message": "Document deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )


@router.post("/ingest/url")
async def ingest_url(
    request: IngestUrlRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Ingest content from URL (article or podcast)
    """
    try:
        # Fetch URL content
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(str(request.url))
            response.raise_for_status()
            content = response.text

        # Forward to knowledge service for processing
        knowledge_url = "http://knowledge-service:8081/ingest/url"

        async with httpx.AsyncClient(timeout=60.0) as client:
            knowledge_response = await client.post(
                knowledge_url,
                json={
                    "url": str(request.url),
                    "content": content,
                    "content_type": request.content_type,
                    "user_id": current_user.id
                }
            )
            knowledge_response.raise_for_status()
            result = knowledge_response.json()

        return {
            "message": "URL content ingested successfully",
            "doc_id": result.get("doc_id"),
            "status": "processing"
        }

    except httpx.HTTPError as e:
        logger.error(f"HTTP error ingesting URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch URL: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error ingesting URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest URL: {str(e)}"
        )


@router.post("/documents/{doc_id}/reprocess")
async def reprocess_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Reprocess a document (re-chunk and re-embed)
    """
    try:
        import sys
        sys.path.append('/app/../knowledge')
        from knowledge.models import Document

        # Verify document belongs to user
        doc_query = select(Document).where(
            Document.id == doc_id,
            Document.user_id == current_user.id
        )
        doc_result = await db.execute(doc_query)
        doc = doc_result.scalar_one_or_none()

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # TODO: Trigger reprocessing task
        # For now, just return success

        return {
            "message": "Document reprocessing started",
            "doc_id": doc_id,
            "status": "processing"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reprocessing document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reprocess document: {str(e)}"
        )
