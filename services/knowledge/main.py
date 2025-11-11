"""
AI Career Mentor - Knowledge Service
Document ingestion, processing, and retrieval
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
import uuid
import boto3
from botocore.client import Config

from config import settings
from database import get_db, init_db
from models import Document, Chunk, Embedding
from services.parser import DocumentParser
from services.chunker import TextChunker
from services.embedder import EmbeddingService
from services.search import SearchService

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


# Initialize S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=settings.S3_ENDPOINT if settings.S3_ENDPOINT else None,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
    region_name=settings.S3_REGION,
    config=Config(signature_version="s3v4")
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan"""
    logger.info("Starting Knowledge Service...")
    await init_db()
    logger.info("Knowledge Service started")
    yield
    logger.info("Shutting down Knowledge Service...")


app = FastAPI(
    title="Knowledge Service",
    description="Document processing and retrieval service",
    version="1.0.0",
    lifespan=lifespan
)


# Schemas
class SearchRequest(BaseModel):
    query: str
    user_id: str
    top_k: int = 10
    filters: Optional[dict] = None


class ChunkResponse(BaseModel):
    doc_id: str
    chunk_id: str
    text: str
    source: str
    score: float


class SearchResponse(BaseModel):
    chunks: List[ChunkResponse]
    total: int


class IngestUrlRequest(BaseModel):
    url: str
    content: str
    content_type: str
    user_id: str


@app.get("/health")
async def health_check():
    """Health check"""
    return {"status": "healthy", "service": "knowledge-service"}


@app.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    doc_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest document:
    1. Parse document
    2. Save to S3
    3. Chunk text
    4. Generate embeddings
    5. Store in database
    """
    logger.info(f"Ingesting document {doc_id} for user {user_id}")

    try:
        # Read file content
        content = await file.read()

        # Parse document
        parser = DocumentParser()
        parsed = await parser.parse(content, file.content_type, file.filename)

        # Save raw file to S3
        raw_path = f"raw/{user_id}/{doc_id}/{file.filename}"
        s3_client.put_object(
            Bucket="career-mentor",
            Key=raw_path,
            Body=content,
            ContentType=file.content_type
        )

        # Save processed text to S3
        clean_path = f"clean/{user_id}/{doc_id}/content.md"
        s3_client.put_object(
            Bucket="career-mentor",
            Key=clean_path,
            Body=parsed["text"].encode("utf-8"),
            ContentType="text/markdown"
        )

        # Create document record
        doc = Document(
            id=doc_id,
            user_id=user_id,
            filename=file.filename,
            content_type=file.content_type,
            raw_path=raw_path,
            clean_path=clean_path,
            status="processing",
            doc_metadata=parsed["metadata"]
        )
        db.add(doc)
        await db.flush()

        # Chunk text
        chunker = TextChunker()
        chunks = await chunker.chunk(parsed["text"], parsed["metadata"])

        # Store chunks
        chunk_records = []
        for chunk_data in chunks:
            chunk = Chunk(
                doc_id=doc_id,
                user_id=user_id,
                text=chunk_data["text"],
                position=chunk_data["position"],
                chunk_metadata=chunk_data["metadata"]
            )
            db.add(chunk)
            chunk_records.append(chunk)

        await db.flush()

        # Generate embeddings
        embedder = EmbeddingService()
        chunk_texts = [c.text for c in chunk_records]
        embeddings = await embedder.embed_texts(chunk_texts)

        # Store embeddings
        for chunk, embedding_vector in zip(chunk_records, embeddings):
            embedding = Embedding(
                chunk_id=chunk.id,
                vector=embedding_vector,
                doc_id=doc_id,
                user_id=user_id
            )
            db.add(embedding)

        # Update document status
        doc.status = "ready"
        doc.progress = 100

        await db.commit()

        logger.info(f"Document {doc_id} processed successfully: {len(chunk_records)} chunks")

        return {
            "doc_id": doc_id,
            "filename": file.filename,
            "status": "ready",
            "chunks": len(chunk_records),
            "message": "Document processed successfully"
        }

    except Exception as e:
        logger.error(f"Failed to ingest document {doc_id}: {e}")
        await db.rollback()

        # Update document with error
        try:
            result = await db.execute(select(Document).where(Document.id == doc_id))
            doc = result.scalar_one_or_none()
            if doc:
                doc.status = "failed"
                doc.error_message = str(e)
                await db.commit()
        except:
            pass

        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents/list")
async def list_documents(
    limit: int = 50,
    offset: int = 0,
    user_id: str = "all",
    db: AsyncSession = Depends(get_db)
):
    """List all documents with chunk counts"""
    try:
        # Build query - if user_id is "all" or "admin", get all documents
        if user_id in ["all", "admin"]:
            query = (
                select(
                    Document,
                    func.count(Chunk.id).label('chunk_count')
                )
                .outerjoin(Chunk, Document.id == Chunk.doc_id)
                .group_by(Document.id)
                .order_by(Document.created_at.desc())
                .limit(limit)
                .offset(offset)
            )
            count_query = select(func.count(Document.id))
        else:
            query = (
                select(
                    Document,
                    func.count(Chunk.id).label('chunk_count')
                )
                .outerjoin(Chunk, Document.id == Chunk.doc_id)
                .where(Document.user_id == user_id)
                .group_by(Document.id)
                .order_by(Document.created_at.desc())
                .limit(limit)
                .offset(offset)
            )
            count_query = select(func.count(Document.id)).where(Document.user_id == user_id)

        result = await db.execute(query)
        rows = result.all()

        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        documents = []
        for doc, chunk_count in rows:
            documents.append({
                "id": doc.id,
                "filename": doc.filename,
                "content_type": doc.content_type,
                "status": doc.status,
                "created_at": doc.created_at.isoformat(),
                "chunk_count": chunk_count or 0
            })

        return {
            "documents": documents,
            "total": total,
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents/{doc_id}/status")
async def get_document_status(
    doc_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get document processing status"""
    try:
        result = await db.execute(
            select(Document).where(
                Document.id == doc_id,
                Document.user_id == user_id
            )
        )
        doc = result.scalar_one_or_none()

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        return {
            "doc_id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "progress": doc.progress,
            "error_message": doc.error_message
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest/url")
async def ingest_url(
    request: IngestUrlRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest content from URL (article or podcast):
    1. Parse HTML/content
    2. Save to S3
    3. Chunk text
    4. Generate embeddings
    5. Store in database
    """
    logger.info(f"Ingesting URL content for user {request.user_id}: {request.url}")

    doc_id = str(uuid.uuid4())

    try:
        # Parse HTML content
        parser = DocumentParser()
        parsed = await parser.parse_html(request.content, request.url)

        # Save processed text to S3
        clean_path = f"clean/{request.user_id}/{doc_id}/content.md"
        s3_client.put_object(
            Bucket="career-mentor",
            Key=clean_path,
            Body=parsed["text"].encode("utf-8"),
            ContentType="text/markdown"
        )

        # Create document record
        filename = parsed["metadata"].get("title", request.url.split("/")[-1])
        doc = Document(
            id=doc_id,
            user_id=request.user_id,
            filename=filename,
            content_type=request.content_type,
            raw_path=request.url,  # Store original URL
            clean_path=clean_path,
            status="processing",
            doc_metadata=parsed["metadata"]
        )
        db.add(doc)
        await db.flush()

        # Chunk text
        chunker = TextChunker()
        chunks = await chunker.chunk(parsed["text"], parsed["metadata"])

        # Store chunks
        chunk_records = []
        for chunk_data in chunks:
            chunk = Chunk(
                doc_id=doc_id,
                user_id=request.user_id,
                text=chunk_data["text"],
                position=chunk_data["position"],
                chunk_metadata=chunk_data["metadata"]
            )
            db.add(chunk)
            chunk_records.append(chunk)

        await db.flush()

        # Generate embeddings
        embedder = EmbeddingService()
        chunk_texts = [c.text for c in chunk_records]
        embeddings = await embedder.embed_texts(chunk_texts)

        # Store embeddings
        for chunk, embedding_vector in zip(chunk_records, embeddings):
            embedding = Embedding(
                chunk_id=chunk.id,
                vector=embedding_vector,
                doc_id=doc_id,
                user_id=request.user_id
            )
            db.add(embedding)

        # Update document status
        doc.status = "ready"
        doc.progress = 100

        await db.commit()

        logger.info(f"URL content {doc_id} processed successfully: {len(chunk_records)} chunks")

        return {
            "doc_id": doc_id,
            "filename": filename,
            "status": "ready",
            "chunks": len(chunk_records),
            "message": "URL content processed successfully"
        }

    except Exception as e:
        logger.error(f"Failed to ingest URL content: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Hybrid search:
    1. BM25 keyword search
    2. Vector similarity search
    3. Merge and rank results
    """
    logger.info(f"Searching for: {request.query}")

    try:
        search_service = SearchService()
        results = await search_service.search(
            db=db,
            query=request.query,
            user_id=request.user_id,
            top_k=request.top_k,
            filters=request.filters
        )

        # Format response
        chunks = [
            ChunkResponse(
                doc_id=result["doc_id"],
                chunk_id=result["chunk_id"],
                text=result["text"],
                source=result["metadata"].get("source", "Unknown"),
                score=result["score"]
            )
            for result in results
        ]

        return SearchResponse(
            chunks=chunks,
            total=len(chunks)
        )

    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8081, reload=True)
