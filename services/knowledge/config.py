"""
Configuration for Knowledge Service
"""
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # S3/MinIO
    S3_ENDPOINT: str = ""
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_REGION: str = "us-east-1"

    # Inference Service
    INFERENCE_SERVICE_URL: str

    # Retrieval config
    RETRIEVAL_TOP_K: int = 50
    RERANK_TOP_K: int = 10
    BM25_WEIGHT: float = 0.5
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64

    # Observability
    OTLP_ENDPOINT: str = ""
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
