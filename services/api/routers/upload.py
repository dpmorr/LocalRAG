"""
Document upload endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
import httpx

from models.user import User
from routers.auth import get_current_user
from config import settings

router = APIRouter()


# Schemas
class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    status: str  # "processing", "ready", "failed"
    message: str


# Routes
@router.post("", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload document for processing"""
    # Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Generate doc ID
    doc_id = str(uuid.uuid4())

    # Read file content
    content = await file.read()

    # Forward to Knowledge Service
    try:
        async with httpx.AsyncClient() as client:
            files = {"file": (file.filename, content, file.content_type)}
            data = {"user_id": current_user.id, "doc_id": doc_id}

            response = await client.post(
                f"{settings.KNOWLEDGE_SERVICE_URL}/ingest",
                files=files,
                data=data,
                timeout=60.0
            )

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Upload to knowledge service failed")

            result = response.json()

            return {
                "doc_id": doc_id,
                "filename": file.filename,
                "status": result.get("status", "processing"),
                "message": "Document uploaded successfully and queued for processing"
            }

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")


@router.get("/{doc_id}/status")
async def get_upload_status(
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get document processing status"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.KNOWLEDGE_SERVICE_URL}/documents/{doc_id}/status",
                params={"user_id": current_user.id},
                timeout=10.0
            )

            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Document not found")

            return response.json()

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")
