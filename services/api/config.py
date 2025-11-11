"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Core
    ENVIRONMENT: str = "development"
    PORT: int = 8080

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str

    # S3/MinIO
    S3_ENDPOINT: str = ""
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_REGION: str = "us-east-1"

    # Service URLs
    KNOWLEDGE_SERVICE_URL: str
    INFERENCE_SERVICE_URL: str

    # Authentication
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60

    # LangSmith (optional)
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "career-mentor-dev"

    # External APIs (optional)
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # Observability
    OTLP_ENDPOINT: str = ""
    LOG_LEVEL: str = "INFO"

    # Feature flags
    ENABLE_WEB_RETRIEVAL: bool = True
    ALLOWED_WEB_DOMAINS: str = "wikipedia.org,arxiv.org,github.com,stackoverflow.com"
    ENABLE_API_DOCS: bool = True

    # Development
    DEBUG: bool = False
    HOT_RELOAD: bool = True

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
