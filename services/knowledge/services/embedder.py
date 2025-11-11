"""
Embedding service - calls Inference Service
"""
import logging
import httpx
from typing import List
import asyncio

from config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Generate embeddings via Inference Service"""

    def __init__(self):
        self.inference_url = settings.INFERENCE_SERVICE_URL
        self.batch_size = 10  # Process 10 chunks at a time

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for list of texts

        Returns:
            List of embedding vectors
        """
        try:
            # Process in batches
            all_embeddings = []

            for i in range(0, len(texts), self.batch_size):
                batch = texts[i:i + self.batch_size]
                embeddings = await self._embed_batch(batch)
                all_embeddings.extend(embeddings)

            return all_embeddings

        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise

    async def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.inference_url}/v1/embeddings",
                    json={
                        "model": "main",
                        "input": texts
                    },
                    timeout=60.0
                )

                if response.status_code != 200:
                    raise Exception(f"Embedding service returned {response.status_code}: {response.text}")

                result = response.json()
                # Extract vectors from response
                embeddings = [item["embedding"] for item in result["data"]]

                return embeddings

        except Exception as e:
            logger.error(f"Failed to embed batch: {e}")
            raise
