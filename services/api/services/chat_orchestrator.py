"""
Chat orchestrator using LangGraph
Coordinates retrieval, inference, and tool execution
"""
from typing import Dict, Any, List
import httpx
import logging

from config import settings

logger = logging.getLogger(__name__)


class ChatOrchestrator:
    """
    Orchestrates chat flow:
    1. Retrieve relevant context from Knowledge Service
    2. Call Inference Service for generation
    3. Format response with citations
    """

    def __init__(self, db_session):
        self.db = db_session

    async def process_message(
        self,
        thread_id: str,
        user_id: str,
        message: str,
        mode: str = "quick"
    ) -> Dict[str, Any]:
        """Process user message and generate response"""

        # Step 1: Retrieve context
        context_chunks = await self._retrieve_context(user_id, message)

        # Step 2: Build prompt with context
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(message, context_chunks)

        # Step 3: Generate response
        response = await self._generate_response(system_prompt, user_prompt, mode)

        # Step 4: Format citations
        citations = self._extract_citations(context_chunks)

        return {
            "content": response,
            "citations": citations
        }

    async def _retrieve_context(self, user_id: str, query: str) -> List[Dict]:
        """Retrieve relevant chunks from Knowledge Service"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.KNOWLEDGE_SERVICE_URL}/search",
                    json={
                        "query": query,
                        "user_id": user_id,
                        "top_k": 10
                    },
                    timeout=10.0
                )

                if response.status_code == 200:
                    result = response.json()
                    return result.get("chunks", [])
                else:
                    logger.warning(f"Knowledge service search failed: {response.status_code}")
                    return []

        except Exception as e:
            logger.error(f"Failed to retrieve context: {e}")
            return []

    def _build_system_prompt(self) -> str:
        """Build system prompt for the AI"""
        return """You are an AI Career Mentor with deep knowledge in career development, skills assessment, and professional growth.

Your role:
- Provide personalized, actionable career guidance
- Ground recommendations in provided knowledge base
- Be specific with timelines, resources, and next steps
- Always cite sources when making recommendations
- Ask clarifying questions when user intent is unclear

Guidelines:
- Use bullet points for clarity
- Include "Why this matters" explanations
- Suggest 1-2 concrete next actions
- Reference specific documents/resources when available"""

    def _build_user_prompt(self, message: str, context_chunks: List[Dict]) -> str:
        """Build user prompt with context"""
        if not context_chunks:
            return f"User question: {message}"

        context_text = "\n\n".join([
            f"[Source: {chunk.get('source', 'Unknown')}]\n{chunk.get('text', '')}"
            for chunk in context_chunks[:5]  # Top 5 most relevant
        ])

        return f"""Context from knowledge base:
{context_text}

User question: {message}

Provide a helpful answer based on the context above. Include citations to specific sources."""

    async def _generate_response(self, system_prompt: str, user_prompt: str, mode: str) -> str:
        """Generate response using Inference Service"""
        try:
            async with httpx.AsyncClient() as client:
                # Call OpenAI-compatible API
                response = await client.post(
                    f"{settings.INFERENCE_SERVICE_URL}/v1/chat/completions",
                    json={
                        "model": "main",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7 if mode == "quick" else 0.3,
                        "max_tokens": 1000
                    },
                    timeout=60.0
                )

                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    logger.error(f"Inference service failed: {response.status_code}")
                    return "I'm sorry, I'm having trouble generating a response right now. Please try again."

        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return "I apologize, but I encountered an error. Please try again."

    def _extract_citations(self, context_chunks: List[Dict]) -> List[Dict]:
        """Extract citations from context chunks"""
        citations = []
        for chunk in context_chunks:
            citations.append({
                "doc_id": chunk.get("doc_id", ""),
                "chunk_id": chunk.get("chunk_id", ""),
                "text": chunk.get("text", "")[:200] + "...",  # Truncate
                "source": chunk.get("source", "Unknown"),
                "score": chunk.get("score", 0.0)
            })
        return citations
