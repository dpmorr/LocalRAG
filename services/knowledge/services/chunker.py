"""
Text chunking service
"""
import logging
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import settings

logger = logging.getLogger(__name__)


class TextChunker:
    """Chunk text into smaller pieces for embedding"""

    def __init__(self):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    async def chunk(self, text: str, doc_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Chunk text into smaller pieces

        Returns:
            List of chunks with metadata:
            [
                {
                    "text": str,
                    "position": int,
                    "metadata": dict
                },
                ...
            ]
        """
        try:
            # Split text
            chunks = self.splitter.split_text(text)

            # Add metadata to each chunk
            result = []
            for i, chunk_text in enumerate(chunks):
                result.append({
                    "text": chunk_text,
                    "position": i,
                    "metadata": {
                        **doc_metadata,
                        "chunk_index": i,
                        "total_chunks": len(chunks)
                    }
                })

            logger.info(f"Created {len(result)} chunks")
            return result

        except Exception as e:
            logger.error(f"Failed to chunk text: {e}")
            raise
