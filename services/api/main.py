"""
AI Career Mentor - API Service
Main FastAPI application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os

from config import settings
from database import init_db
from routers import auth, chat, cv, plan, profile, upload, health, admin

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting API Service...")
    await init_db()
    logger.info(f"API Service started on port {settings.PORT}")

    yield

    # Shutdown
    logger.info("Shutting down API Service...")


# Create FastAPI app
app = FastAPI(
    title="AI Career Mentor API",
    description="Backend API for AI Career Mentor - personalized career guidance powered by AI",
    version="1.0.0",
    docs_url="/docs" if settings.ENABLE_API_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_API_DOCS else None,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/threads", tags=["Chat"])
app.include_router(cv.router, prefix="/cv", tags=["CV"])
app.include_router(plan.router, prefix="/plan", tags=["Learning Plans"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(admin.router, tags=["Admin"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Career Mentor API",
        "version": "1.0.0",
        "status": "running"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": "internal_error"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.HOT_RELOAD
    )
