# LocalRAG - Production RAG System Starter Kit

> **Learn to build production-grade RAG systems with local LLMs, vector search, and intelligent document processing**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)

## What is LocalRAG?

LocalRAG is a **complete, production-ready starter template** for building Retrieval-Augmented Generation (RAG) systems. It demonstrates how to capture knowledge from multiple sources, process documents intelligently, and serve context-aware AI responses - all running locally with full cost and model control.

This is **not just a demo** - it's a foundational architecture you can fork and adapt to any domain: customer support, legal document analysis, medical research, internal knowledge bases, or any use case requiring AI with grounded, factual responses.

## Why LocalRAG?

### The Unique Approach

LocalRAG demonstrates **production RAG architecture patterns** that work regardless of your tech stack. The key differentiators are:

**1. Hybrid Search Architecture**
- Combines vector similarity (semantic) with BM25 (keyword) search
- Configurable weighting between the two approaches
- Addresses the "lexical gap" problem where pure vector search fails on exact terms
- See implementation: [`services/knowledge/services/search.py`](services/knowledge/services/search.py)

**2. Intelligent Document Processing Pipeline**
- Async worker-based architecture separates ingestion from serving
- Configurable chunking strategies (fixed-size, sentence-aware, section-based)
- Preserves context across chunk boundaries with overlap
- Batch embedding generation with caching
- See implementation: [`services/knowledge/services/chunker.py`](services/knowledge/services/chunker.py)

**3. Model and Provider Agnostic**
- OpenAI-compatible API interface means swap any provider
- Local Ollama, OpenAI, Anthropic, or your own hosted models
- Same codebase works with 3B parameter models or 70B+
- Embedding models are similarly swappable
- No vendor lock-in at any layer

**4. Observable and Measurable**
- Every request traced through the full pipeline
- Measure retrieval quality (precision@k, recall@k)
- Track inference costs per query
- A/B test chunking strategies or models
- See: Jaeger traces, Prometheus metrics

**5. Separation of Concerns**
- Knowledge Service: Document processing + search (plug into your existing API)
- Inference Service: LLM + embeddings (swap for your provider)
- API Service: Orchestration (integrate with your auth system)
- Workers: Async processing (scale independently)

Each service is independently deployable and replaceable.

### How to Integrate With Your Stack

You don't need to use everything. Pick what you need:

**Just need document processing?**
- Use Knowledge Service standalone
- Provides `/parse`, `/chunk`, `/embed`, `/search` endpoints
- Plug into your existing application

**Just need hybrid search?**
- Reuse the search implementation
- Works with any pgvector database
- Combine with your existing vector embeddings

**Just need Ollama integration?**
- Use the Inference Service setup
- OpenAI-compatible API for any client
- Includes model management and GPU optimization

**Need reference architecture?**
- Study the service boundaries and communication patterns
- Apply microservices design to your RAG system
- Adapt observability setup to your monitoring stack

### What Makes This Different

### vs LangChain/LlamaIndex Alone

| Feature | LocalRAG | LangChain/LlamaIndex |
|---------|----------|----------------------|
| Production Architecture | Full microservices, auth, API | Library only, infrastructure not included |
| Document Processing | Async pipeline with worker queues | Basic sync processing |
| Vector Database | Production pgvector configuration | Manual setup required |
| Hybrid Search | Vector + BM25 implemented | Typically vector only |
| Cost Visibility | Local + cloud with metrics | Usually cloud API dependent |
| Observability | Jaeger, Prometheus, Grafana | Not included |
| Authentication | JWT, user management | Not included |
| Async Processing | Celery workers, Redis queue | Not included |
| Deployment | Docker Compose ready | Manual configuration |

**Summary:** LocalRAG = RAG library + production infrastructure + deployment tooling

### vs Managed RAG Services (Pinecone, Weaviate Cloud, etc.)

| Aspect | LocalRAG | Managed Services |
|--------|----------|------------------|
| Cost Model | Fixed infrastructure cost | Per-vector + per-query pricing |
| Data Location | Your infrastructure | Vendor infrastructure |
| Vendor Lock-in | Portable (standard PostgreSQL + pgvector) | Proprietary APIs |
| Customization | Full source code access | API parameters only |
| Transparency | Complete control over implementation | Black box |
| Search Latency | Local network (<10ms typical) | Internet latency dependent |

### vs OpenAI Assistants API

| Feature | LocalRAG | OpenAI Assistants |
|---------|----------|-------------------|
| Model Selection | Any Ollama model or API provider | OpenAI models only |
| Cost Structure | Fixed infrastructure | Per-token pricing |
| Data Privacy | Remains on your infrastructure | Sent to OpenAI |
| Customization | Full control over chunking, search, prompts | Limited API parameters |
| Embedding Control | Use any embedding model | OpenAI embeddings only |
| Response Latency | Local GPU: sub-second | API network latency: 2-5s typical |

### vs RAG Frameworks (Haystack, txtai)

| Feature | LocalRAG | Haystack/txtai |
|---------|----------|----------------|
| Scope | Complete system (API, DB, UI, workers) | Backend library only |
| Production Features | Auth, observability, multi-tenancy | Manual implementation required |
| User Interface | Next.js frontend ([frontend/](frontend/)) | Not included |
| Multi-tenancy | User isolation built-in | Custom implementation |
| Document Support | PDF, DOCX, TXT, web scraping | Similar |
| Deployment | Single-command Docker Compose | Manual setup |

## Key Advantages

### Cost Control and Transparency

Self-hosted deployment provides:
- Predictable infrastructure costs vs per-token API pricing
- No vendor markup on LLM inference
- Ability to run on existing hardware
- Full visibility into resource usage and costs

Example cost comparison (100M tokens/month):
- Cloud API providers: 3,000-15,000 in token costs
- Self-hosted GPU server: Fixed hosting cost (~1,000/month or less)
- Self-hosted CPU server: Minimal incremental cost (~30-100/month)

### Privacy and Compliance

- Data never leaves your infrastructure (unless explicitly configured to use external APIs)
- Suitable for HIPAA, GDPR, and other regulatory requirements
- Complete audit trail of all queries and data access
- No third-party API dependencies for core functionality

### Model and Infrastructure Flexibility

Switch models without code changes:
```bash
INFERENCE_MODEL=llama3.2:3b      # 3B parameters, fast
INFERENCE_MODEL=qwen2.5:7b       # 7B parameters, higher quality
INFERENCE_MODEL=mistral:7b       # Alternative architecture
INFERENCE_MODEL=llama3.1:70b     # Large model (requires GPU)
```

Or use cloud APIs as fallback:
```bash
OPENAI_API_KEY=sk-...            # OpenAI
ANTHROPIC_API_KEY=sk-...         # Anthropic Claude
```

Infrastructure is similarly swappable:
- Vector DB: pgvector, Qdrant, Milvus, Weaviate
- Message queue: Redis, RabbitMQ, AWS SQS
- Object storage: MinIO, S3, GCS, Azure Blob
- Monitoring: Jaeger, Prometheus, or your existing stack

### Production-Ready Architecture

Includes components typically requiring weeks to implement:

- **Authentication**: JWT token-based auth with user management
- **Multi-tenancy**: User data isolation at database level
- **Async Processing**: Celery workers for document ingestion
- **Caching**: Redis for query results and embeddings
- **Monitoring**: OpenTelemetry traces, Prometheus metrics
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **Health Checks**: Service health endpoints for load balancers
- **Horizontal Scaling**: Stateless services, shared data layer

### Educational Foundation

Understand RAG implementation details:
- Document chunking strategies and their trade-offs
- Vector search performance characteristics
- Hybrid search (semantic + keyword) implementation
- Embedding model selection and fine-tuning
- Prompt engineering for retrieval-augmented generation
- System observability and debugging

Not a black box - every component is accessible and modifiable.

### Deployment Options

**Local development** (no GPU required):
```bash
./start.sh cpu
```

**Production** (single GPU server):
```bash
./start.sh gpu
```

**Kubernetes** (multi-region, auto-scaling):
```bash
kubectl apply -f k8s/
```

**Hybrid** (local LLM + managed infrastructure):
- Run Ollama locally for inference
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Use managed Redis (ElastiCache, MemoryStore)
- Use cloud object storage (S3, GCS, Azure Blob)

### Technology Independence

- **Model agnostic**: Any OpenAI-compatible API endpoint
- **Database agnostic**: PostgreSQL, but vector DBs are swappable
- **Framework optional**: Use LangChain or implement directly
- **Cloud portable**: No vendor-specific services required
- **Local or hosted**: Run anywhere Docker runs

## 🎯 What You'll Learn

### Core RAG Concepts
- **Document ingestion pipeline**: Multi-format processing (PDF, DOCX, TXT, Markdown, web scraping)
- **Intelligent chunking**: Context-preserving document segmentation with configurable overlap
- **Hybrid search**: Combining semantic (vector) + keyword (BM25) search for better retrieval
- **Vector embeddings**: Local embedding generation with any model
- **Prompt engineering**: Building effective prompts with retrieved context
- **Citation tracking**: Source attribution for AI responses

### Production Infrastructure
- **Microservices architecture**: Separation of concerns for scalability
- **Local LLM serving**: Ollama integration with OpenAI-compatible API
- **Vector database**: pgvector for similarity search at scale
- **Message queue**: Async document processing with Celery + Redis
- **Observability**: OpenTelemetry, Jaeger, Prometheus integration
- **Cost control**: Run everything locally or swap to cloud APIs

### Why This Matters
- **Zero vendor lock-in**: Switch between Ollama, OpenAI, Anthropic, or any LLM
- **Privacy control**: Keep sensitive data local or deploy to your infrastructure
- **Cost transparency**: Measure exactly what you're spending on inference
- **Learning foundation**: Understand RAG internals before using frameworks
- **Production ready**: Real database, auth, API design, not toy examples

## 🏗️ Architecture Deep Dive

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js + TypeScript)               │
│                         http://localhost:3000                    │
│  • User interface for document upload & chat                    │
│  • Real-time streaming responses                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    API Gateway (FastAPI)                         │
│                    http://localhost:8080                         │
│  • REST API for all operations                                  │
│  • JWT authentication & user management                         │
│  • Request orchestration & response streaming                   │
└─────┬─────────────────────┬────────────────────────┬───────────┘
      │                     │                        │
      │                     │                        │
┌─────▼──────────────┐ ┌────▼─────────────┐  ┌──────▼────────────┐
│  Knowledge Service │ │ Inference Service│  │  Worker Service   │
│  (Port 8081)       │ │  (Port 8000)     │  │  (Background)     │
│                    │ │                  │  │                   │
│ • Document parsing │ │ • Ollama LLM     │  │ • Async jobs      │
│ • Chunking logic   │ │ • Embeddings     │  │ • Batch processing│
│ • Embedding gen    │ │ • OpenAI API     │  │ • Document queue  │
│ • Hybrid search    │ │   compatible     │  │ • Celery workers  │
│ • BM25 + vectors   │ │                  │  │                   │
└─────┬──────────────┘ └──────────────────┘  └───────────────────┘
      │
      │
┌─────▼──────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
│                                                                 │
│  PostgreSQL + pgvector    Redis Cache    MinIO (S3)   Jaeger   │
│  • Vector storage         • Session      • File       • Tracing │
│  • Full-text search       • Queue        • Storage    • Metrics │
│  • User data              • Cache        • Objects              │
└─────────────────────────────────────────────────────────────────┘
```

### Document Processing Pipeline (Knowledge Service)

```
User Upload → Parser → Chunker → Embedder → Vector DB → Search Index
                ↓          ↓         ↓          ↓           ↓
             Extract    Split    Generate   Store in    Build BM25
              text    into 512   vectors   pgvector     index
                      chunks
```

**1. Parser** ([`services/knowledge/services/parser.py`](services/knowledge/services/parser.py))
   - Handles PDF, DOCX, TXT, MD, HTML, JSON
   - Extracts text + metadata (title, author, date)
   - Preserves document structure where possible

**2. Chunker** ([`services/knowledge/services/chunker.py`](services/knowledge/services/chunker.py))
   - Splits documents into semantic chunks
   - Default: 512 tokens with 64 token overlap
   - Preserves context across chunk boundaries
   - Configurable chunk size and overlap

**3. Embedder** ([`services/knowledge/services/embedder.py`](services/knowledge/services/embedder.py))
   - Generates vector embeddings locally
   - Uses inference service (Ollama or API)
   - Batch processing for efficiency
   - Caches embeddings to avoid recomputation

**4. Search** ([`services/knowledge/services/search.py`](services/knowledge/services/search.py))
   - **Hybrid search**: Combines semantic + keyword
   - Vector similarity (pgvector cosine distance)
   - BM25 full-text search for exact matches
   - Configurable weighting (default 50/50)
   - Returns top-k chunks with scores and metadata

### RAG Query Flow

```
User Question
    ↓
[1] Embed query → vector
    ↓
[2] Hybrid Search (Vector + BM25)
    ↓
[3] Retrieve top 10 chunks
    ↓
[4] Build context prompt
    ↓
[5] Send to LLM (Ollama/OpenAI/Claude)
    ↓
[6] Stream response with citations
    ↓
User sees answer + sources
```

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker + Docker Compose** (Linux)
- **8GB+ RAM** (16GB recommended for better performance)
- **10GB free disk space** (for model storage)

### One-Command Deployment

**Windows:**
```bash
start.bat cpu
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh cpu
```

**Manual start:**
```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

### First Run (Model Download)

On first startup, Ollama downloads **Llama 3.2 3B** (~2GB). This takes 2-5 minutes.

**Monitor progress:**
```bash
docker logs localrag-inference-cpu -f
```

### Access the System

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8080/docs (interactive Swagger UI)
- **Health Check**: http://localhost:8080/health

**Default login:**
- Email: `admin@example.com`
- Password: `admin123`

## 📦 What's Included

### Core Services

| Service | Port | Purpose | Technology |
|---------|------|---------|------------|
| **Frontend** | 3000 | Web UI | Next.js 15, React 19, TypeScript |
| **API Gateway** | 8080 | REST API | FastAPI, Pydantic, SQLAlchemy |
| **Knowledge Service** | 8081 | RAG pipeline | Document parsing, chunking, search |
| **Inference** | 8000/11434 | LLM + embeddings | Ollama, LiteLLM proxy |
| **Workers** | - | Background jobs | Celery, async processing |

### Infrastructure

| Component | Purpose | Why It Matters |
|-----------|---------|----------------|
| **PostgreSQL + pgvector** | Vector storage & search | Production-grade vector DB, scales to billions of vectors |
| **Redis** | Cache + message queue | Fast session storage, Celery broker |
| **MinIO** | Object storage | S3-compatible file storage (dev), swap to real S3 in prod |
| **Jaeger** | Distributed tracing | Debug RAG pipeline, find bottlenecks |
| **Prometheus** | Metrics collection | Monitor performance, cost per query |
| **Grafana** | Visualization | Custom dashboards for RAG metrics |

## 🔧 Configuration & Customization

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

**Key configurations:**

```env
# LLM Model (Ollama format)
INFERENCE_MODEL=llama3.2:3b
# Options: llama3.2:1b (fast), llama3.2:3b (balanced),
#          llama3.1:8b (quality), qwen2.5:7b (multilingual)

# Chunking Strategy
CHUNK_SIZE=512              # Tokens per chunk
CHUNK_OVERLAP=64            # Overlap between chunks

# Retrieval Configuration
RETRIEVAL_TOP_K=50          # Chunks to retrieve
RERANK_TOP_K=10            # Top chunks after reranking
BM25_WEIGHT=0.5            # Balance between vector (0.5) and keyword (0.5)

# Optional: External LLM APIs (if not using local)
OPENAI_API_KEY=            # OpenAI
ANTHROPIC_API_KEY=         # Claude
GOOGLE_API_KEY=            # Gemini
```

### Swap LLM Models

**Local (Ollama):**
```bash
# Pull different model
docker exec localrag-inference-cpu ollama pull mistral:7b

# Update .env
INFERENCE_MODEL=mistral:7b

# Restart services
docker-compose -f docker-compose.simple.yml --profile cpu restart
```

**Cloud API (OpenAI/Anthropic):**
```env
# Set API key in .env
OPENAI_API_KEY=sk-...

# API service automatically falls back to OpenAI if local unavailable
```

### Adjust Chunking Strategy

Edit `services/knowledge/services/chunker.py`:

```python
# Current: Fixed-size chunks
def chunk_document(text: str, chunk_size=512, overlap=64):
    # ...

# Custom: Sentence-aware chunking
def chunk_by_sentences(text: str, min_chunk=256, max_chunk=1024):
    sentences = sent_tokenize(text)
    # Group sentences intelligently

# Custom: Section-based chunking (for structured docs)
def chunk_by_headers(text: str):
    # Split on markdown headers, preserve hierarchy
```

## 📚 Deployment Profiles

### 1. CPU Mode (Default - No GPU Required)

```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

**Best for:**
- Development & learning
- Small-scale deployments (< 50 users)
- Budget constraints

**Performance:**
- Response time: 2-5 seconds
- RAM: 8GB minimum
- Model: Llama 3.2 3B (2GB download)

### 2. GPU Mode (NVIDIA Required)

```bash
docker-compose -f docker-compose.simple.yml --profile gpu up -d
```

**Best for:**
- Production deployments
- Real-time responses
- Larger models (7B-14B parameters)

**Performance:**
- Response time: < 1 second
- VRAM: 8GB+ (3B), 24GB+ (7B)
- Model: Any size supported by your GPU

### 3. Full Observability (Monitoring Enabled)

```bash
docker-compose -f docker-compose.simple.yml --profile full up -d
```

**Includes:**
- Jaeger UI: http://localhost:16686 (trace requests)
- Grafana: http://localhost:3001 (dashboards)
- Prometheus: http://localhost:9090 (metrics)

**Best for:**
- Debugging RAG pipeline
- Performance optimization
- Production monitoring

## 🧪 Using the System

### Upload Documents (Build Knowledge Base)

**Via API:**
```bash
curl -X POST http://localhost:8080/admin/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "title=My Document" \
  -F "metadata={\"category\":\"research\"}"
```

**What happens:**
1. Document queued for processing
2. Worker extracts text (async)
3. Text chunked into 512-token segments
4. Each chunk embedded into vectors
5. Stored in PostgreSQL + pgvector
6. BM25 index updated
7. Available for RAG queries immediately

**Supported formats:**
- PDF (`.pdf`)
- Word (`.docx`)
- Text (`.txt`, `.md`)
- Web pages (URL scraping)

### Query the System (RAG)

**Via API:**
```bash
curl -X POST http://localhost:8080/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key findings?",
    "thread_id": "optional-thread-id"
  }'
```

**Response includes:**
```json
{
  "response": "Based on the documents, the key findings are...",
  "citations": [
    {
      "doc_id": "uuid",
      "chunk_id": "uuid",
      "text": "...relevant excerpt...",
      "score": 0.89,
      "source": "document.pdf"
    }
  ],
  "metadata": {
    "chunks_retrieved": 10,
    "search_time_ms": 45,
    "llm_time_ms": 1250
  }
}
```

## 💡 Real-World Use Cases

### 1. Customer Support Knowledgebase
- Upload: Support docs, FAQs, troubleshooting guides
- Use case: AI assistant for support agents
- Benefit: Consistent, cited answers

### 2. Legal Document Analysis
- Upload: Contracts, case law, regulations
- Use case: Legal research assistant
- Benefit: Find relevant precedents quickly

### 3. Internal Company Wiki
- Upload: Policies, procedures, onboarding docs
- Use case: Employee self-service
- Benefit: Reduce HR/IT support load

### 4. Academic Research
- Upload: Papers, textbooks, lecture notes
- Use case: Study assistant
- Benefit: Synthesize information across sources

### 5. Medical Documentation
- Upload: Clinical guidelines, research papers
- Use case: Clinical decision support
- Benefit: Evidence-based recommendations

**The included "Career Mentor" is just one example** - the architecture works for any domain.

## 🎓 Learning Path

### Beginner: Understand the Basics
1. Deploy with `start.bat cpu`
2. Upload a PDF document
3. Ask questions and see citations
4. Review `services/knowledge/services/search.py` - see hybrid search
5. Check `docker-compose.simple.yml` - understand service connections

### Intermediate: Customize RAG
1. Modify chunk size in `.env` (try 256, 512, 1024)
2. Adjust BM25_WEIGHT (try 0.3, 0.5, 0.7)
3. Swap Ollama model (llama vs qwen vs mistral)
4. Add new document parser (Excel, CSV)
5. Implement custom reranking logic

### Advanced: Production Deployment
1. Enable GPU mode for performance
2. Set up observability (Jaeger + Prometheus)
3. Implement fine-tuning pipeline for embeddings
4. Add custom evaluation metrics
5. Deploy to Kubernetes with autoscaling

## 🔬 Fine-Tuning & Customization

### Why This is a Great Fine-Tuning Starter

**1. Data Collection Built-In**
- User queries logged with retrieved chunks
- Track which chunks lead to good answers
- Export for fine-tuning dataset

**2. Evaluation Framework Ready**
- Measure retrieval accuracy (top-k)
- Track answer quality (user feedback)
- A/B test different models/prompts

**3. Model Flexibility**
- Swap embedding models easily
- Test different LLMs side-by-side
- Measure cost vs quality tradeoffs

**4. Production Pipeline**
- Same code from dev → staging → prod
- Database migrations included
- Monitoring built-in

### Example: Fine-Tune Embeddings

```python
# 1. Collect training data (queries + relevant docs)
# services/knowledge/services/embedder.py

# 2. Export to training format
SELECT query, relevant_chunk, user_feedback
FROM query_logs WHERE feedback > 4;

# 3. Fine-tune embedding model (sentence-transformers)
from sentence_transformers import SentenceTransformer, losses

model = SentenceTransformer('base-model')
# Train on your domain-specific data
model.fit(train_data)

# 4. Deploy custom model
# Update embedder.py to use your model
```

## 📊 Performance & Scaling

### Single Server Limits
- **CPU mode**: 10-50 concurrent users, 2-5s response time
- **GPU mode**: 100+ concurrent users, <1s response time

### Scaling Horizontally
```yaml
# Add more workers
docker-compose up --scale worker=5

# Load balance API instances
# (nginx/Caddy in front of multiple API containers)

# Shared infrastructure
# PostgreSQL, Redis, MinIO can be managed services (AWS RDS, ElastiCache, S3)
```

### Cost Analysis

**Local deployment (CPU):**
- Hardware: $0 (use existing)
- Electricity: ~$10-30/month
- Total: **~$30/month**

**Cloud deployment (AWS example):**
- EC2 g5.2xlarge (GPU): ~$1.20/hr = ~$864/month
- RDS PostgreSQL: ~$50/month
- Total: **~$900/month**

**Hybrid (local LLM + cloud infrastructure):**
- Local GPU server: ~$30/month electricity
- Cloud DB/storage: ~$100/month
- Total: **~$130/month**

**Compare to:**
- OpenAI API (1M tokens): ~$30-60
- Anthropic Claude (1M tokens): ~$15-75
- Heavy usage (100M tokens/month): **$1,500-7,500/month**

## 🔒 Security & Privacy

### Data Privacy
- **Local-first**: Documents never leave your infrastructure (unless you configure external APIs)
- **No telemetry**: Zero tracking or phone-home
- **Audit trail**: All queries logged locally

### Production Checklist
- [ ] Change default passwords (`POSTGRES_PASSWORD`, `MINIO_PASSWORD`)
- [ ] Generate strong JWT secret: `openssl rand -hex 32`
- [ ] Enable HTTPS (nginx/Caddy reverse proxy)
- [ ] Set up database backups (pg_dump automation)
- [ ] Configure firewall rules
- [ ] Enable rate limiting on API
- [ ] Review CORS settings
- [ ] Set up monitoring alerts

### What's Safe to Commit
✅ `.env.example`, code, configs with env var substitution
❌ `.env`, API keys, database backups, user data

## 🤝 Contributing

This is a **learning resource and starter template**. Contributions welcome:

- **Document format parsers**: Add support for new file types
- **Search algorithms**: Implement MMR, ColBERT, etc.
- **Evaluation tools**: Add RAG metrics (faithfulness, relevance)
- **Deployment guides**: Kubernetes, AWS, GCP examples
- **Fine-tuning examples**: Show domain adaptation

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - free for commercial and personal use. See [LICENSE](LICENSE).

## 🙏 Built With

**Core RAG Stack:**
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [pgvector](https://github.com/pgvector/pgvector) - PostgreSQL vector extension
- [LangChain](https://langchain.com/) - LLM orchestration (optional, not required)

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM & database toolkit
- [Celery](https://docs.celeryq.dev/) - Distributed task queue

**Frontend:**
- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Infrastructure:**
- [PostgreSQL](https://www.postgresql.org/) - Primary database
- [Redis](https://redis.io/) - Cache & queue
- [MinIO](https://min.io/) - S3-compatible storage
- [Jaeger](https://www.jaegertracing.io/) - Distributed tracing

## FAQ

**Q: Do I need a GPU?**
A: No. CPU mode works fine for learning and development. GPU recommended for production.

**Q: Can I use this commercially?**
A: Yes, MIT license allows commercial use.

**Q: How do I add support for [file format]?**
A: Add parser in `services/knowledge/services/parser.py`, see existing PDF/DOCX parsers.

**Q: Can I use OpenAI instead of Ollama?**
A: Yes, set `OPENAI_API_KEY` in `.env`. System falls back automatically.

**Q: How accurate is the RAG system?**
A: Depends on your documents, chunk size, and model. Start with defaults, measure, iterate.

**Q: Can I deploy this to Kubernetes?**
A: Yes, services are containerized. Create k8s manifests or Helm chart.

**Q: What's the vector database performance?**
A: pgvector handles millions of vectors. For billions, consider Qdrant, Milvus, or Weaviate.

**Q: How do I evaluate RAG quality?**
A: Track metrics: retrieval accuracy (top-k), answer faithfulness, user feedback. Build eval set.

---

**Ready to learn RAG?** Start with `./start.sh cpu` and build your first knowledge system in 5 minutes.

**Questions?** Open an issue or discussion on GitHub.

**Built something cool?** Share it! Tag your fork with `#LocalRAG`.
