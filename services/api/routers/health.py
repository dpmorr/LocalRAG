"""
Health check endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import redis.asyncio as redis
import httpx
from datetime import datetime

from database import get_db
from config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "api-service",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check with dependencies"""
    health_status = {
        "status": "healthy",
        "service": "api-service",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }

    # Check database
    try:
        await db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL)
        await r.ping()
        await r.close()
        health_status["checks"]["redis"] = "healthy"
    except Exception as e:
        health_status["checks"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    # Check Knowledge Service
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.KNOWLEDGE_SERVICE_URL}/health",
                timeout=5.0
            )
            health_status["checks"]["knowledge_service"] = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception as e:
        health_status["checks"]["knowledge_service"] = f"unhealthy: {str(e)}"

    # Check Inference Service
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.INFERENCE_SERVICE_URL}/health",
                timeout=5.0
            )
            health_status["checks"]["inference_service"] = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception as e:
        health_status["checks"]["inference_service"] = f"unhealthy: {str(e)}"

    return health_status


@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Kubernetes readiness probe"""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        return {"status": "not ready"}, 503
