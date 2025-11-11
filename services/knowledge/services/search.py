"""
Hybrid search service (BM25 + Vector)
"""
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from pgvector.sqlalchemy import Vector

from models import Chunk, Embedding
from config import settings
from services.embedder import EmbeddingService

logger = logging.getLogger(__name__)


class SearchService:
    """Hybrid search combining BM25 and vector similarity"""

    def __init__(self):
        self.embedder = EmbeddingService()

    async def search(
        self,
        db: AsyncSession,
        query: str,
        user_id: str,
        top_k: int = None,
        filters: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search

        Returns:
            List of chunks with scores
        """
        if top_k is None:
            top_k = settings.RETRIEVAL_TOP_K

        try:
            # Step 1: Generate query embedding
            query_embedding = await self.embedder.embed_texts([query])
            query_vector = query_embedding[0]

            # Step 2: BM25 search
            bm25_results = await self._bm25_search(db, query, user_id, top_k)

            # Step 3: Vector search
            vector_results = await self._vector_search(db, query_vector, user_id, top_k)

            # Step 4: Merge and rank
            merged_results = self._merge_results(bm25_results, vector_results, top_k)

            # Step 5: Rerank (if needed)
            # For now, skip reranking - can add later

            return merged_results[:settings.RERANK_TOP_K]

        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise

    async def _bm25_search(
        self,
        db: AsyncSession,
        query: str,
        user_id: str,
        top_k: int
    ) -> List[Dict[str, Any]]:
        """BM25 full-text search using PostgreSQL"""
        try:
            # Use PostgreSQL full-text search with ts_rank
            sql = text("""
                SELECT
                    c.id,
                    c.doc_id,
                    c.text,
                    c.metadata,
                    ts_rank(to_tsvector('english', c.text), query) as score
                FROM knowledge.chunks c,
                     to_tsquery('english', :query_text) query
                WHERE c.user_id = :user_id
                  AND to_tsvector('english', c.text) @@ query
                ORDER BY score DESC
                LIMIT :top_k
            """)

            # Prepare query for ts_query (replace spaces with &)
            query_text = " & ".join(query.split())

            result = await db.execute(
                sql,
                {"query_text": query_text, "user_id": user_id, "top_k": top_k}
            )
            rows = result.fetchall()

            return [
                {
                    "chunk_id": row[0],
                    "doc_id": row[1],
                    "text": row[2],
                    "metadata": row[3],
                    "bm25_score": float(row[4])
                }
                for row in rows
            ]

        except Exception as e:
            logger.error(f"BM25 search failed: {e}")
            return []

    async def _vector_search(
        self,
        db: AsyncSession,
        query_vector: List[float],
        user_id: str,
        top_k: int
    ) -> List[Dict[str, Any]]:
        """Vector similarity search using pgvector"""
        try:
            # Use pgvector cosine similarity
            sql = text("""
                SELECT
                    e.chunk_id,
                    e.doc_id,
                    c.text,
                    c.metadata,
                    1 - (e.vector <=> :query_vector) as similarity
                FROM knowledge.embeddings e
                JOIN knowledge.chunks c ON c.id = e.chunk_id
                WHERE e.user_id = :user_id
                ORDER BY e.vector <=> :query_vector
                LIMIT :top_k
            """)

            result = await db.execute(
                sql,
                {"query_vector": str(query_vector), "user_id": user_id, "top_k": top_k}
            )
            rows = result.fetchall()

            return [
                {
                    "chunk_id": row[0],
                    "doc_id": row[1],
                    "text": row[2],
                    "metadata": row[3],
                    "vector_score": float(row[4])
                }
                for row in rows
            ]

        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []

    def _merge_results(
        self,
        bm25_results: List[Dict],
        vector_results: List[Dict],
        top_k: int
    ) -> List[Dict[str, Any]]:
        """Merge and rank BM25 and vector results"""
        # Combine results by chunk_id
        merged = {}

        # Add BM25 results
        for result in bm25_results:
            chunk_id = result["chunk_id"]
            merged[chunk_id] = {
                **result,
                "bm25_score": result.get("bm25_score", 0.0),
                "vector_score": 0.0
            }

        # Add/merge vector results
        for result in vector_results:
            chunk_id = result["chunk_id"]
            if chunk_id in merged:
                merged[chunk_id]["vector_score"] = result.get("vector_score", 0.0)
            else:
                merged[chunk_id] = {
                    **result,
                    "bm25_score": 0.0,
                    "vector_score": result.get("vector_score", 0.0)
                }

        # Calculate combined score
        bm25_weight = settings.BM25_WEIGHT
        vector_weight = 1 - bm25_weight

        for chunk_id, result in merged.items():
            result["score"] = (
                bm25_weight * result["bm25_score"] +
                vector_weight * result["vector_score"]
            )

        # Sort by combined score
        ranked = sorted(merged.values(), key=lambda x: x["score"], reverse=True)

        return ranked[:top_k]
