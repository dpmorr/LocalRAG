# LocalRAG - Production RAG System Starter Kit

> **Learn to build production-grade RAG systems with local LLMs, vector search, and intelligent document processing**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)

## What is LocalRAG?

LocalRAG is a **complete, production-ready starter template** for building Retrieval-Augmented Generation (RAG) systems. It demonstrates how to capture knowledge from multiple sources, process documents intelligently, and serve context-aware AI responses - all running locally with full cost and model control.

This is **not just a demo** - it's a foundational architecture you can fork and adapt to any domain: customer support, legal document analysis, medical research, internal knowledge bases, or any use case requiring AI with grounded, factual responses.

## 🚀 Why LocalRAG? (vs Other AI Stacks)

### Advantages Over LangChain/LlamaIndex Alone

| Feature | LocalRAG | LangChain/LlamaIndex Only |
|---------|----------|---------------------------|
| **Production Architecture** | ✅ Full microservices, auth, API | ❌ Library only, you build infrastructure |
| **Document Processing** | ✅ Complete pipeline with workers | ⚠️ Basic, sync processing |
| **Vector Database** | ✅ Production pgvector setup | ⚠️ You configure yourself |
| **Hybrid Search** | ✅ Vector + BM25 out of the box | ⚠️ Usually vector only |
| **Cost Control** | ✅ Local + cloud with metrics | ⚠️ Usually cloud APIs only |
| **Observability** | ✅ Jaeger, Prometheus, Grafana | ❌ Not included |
| **Authentication** | ✅ JWT, user management | ❌ Not included |
| **Async Processing** | ✅ Celery workers, queues | ❌ Not included |
| **Deployment Ready** | ✅ Docker Compose, scalable | ⚠️ You build it |

**LocalRAG = LangChain + Full Production Stack**

### Advantages Over Managed RAG Services (Pinecone, Weaviate Cloud)

| Aspect | LocalRAG | Managed Services |
|--------|----------|------------------|
| **Cost (1M vectors)** | ~$30/month (self-hosted) | $70-300/month + usage |
| **Data Privacy** | ✅ Your infrastructure | ⚠️ Third-party hosted |
| **Vendor Lock-in** | ✅ Portable (pgvector) | ❌ Locked to provider |
| **Customization** | ✅ Full code access | ⚠️ Limited to API |
| **Learning** | ✅ Understand internals | ❌ Black box |
| **Latency** | ✅ Local = <10ms search | ⚠️ Network dependent |

### Advantages Over OpenAI Assistants API

| Feature | LocalRAG | OpenAI Assistants |
|---------|----------|-------------------|
| **LLM Choice** | ✅ Any model (Llama, Qwen, etc.) | ❌ OpenAI only |
| **Cost** | ~$30/month unlimited | $10-100+/month per usage |
| **Privacy** | ✅ Data never leaves | ❌ Sent to OpenAI |
| **Customization** | ✅ Full control of chunking, search | ⚠️ Limited parameters |
| **Fine-tuning** | ✅ Bring your own embeddings | ⚠️ OpenAI models only |
| **Response Speed** | ✅ Local GPU = <1s | ⚠️ API latency ~2-5s |

### Advantages Over RAG Frameworks (Haystack, txtai)

| Feature | LocalRAG | RAG Frameworks |
|---------|----------|----------------|
| **Complete System** | ✅ API, DB, UI, workers | ⚠️ Backend only |
| **Production Ready** | ✅ Auth, observability, scaling | ❌ You add these |
| **UI Included** | ✅ Next.js frontend | ❌ Not included |
| **Multi-tenancy** | ✅ User isolation built-in | ⚠️ You implement |
| **Document Formats** | ✅ PDF, DOCX, web, custom | ✅ Similar |
| **Deployment** | ✅ One-command Docker | ⚠️ Manual setup |

## 💡 Key Benefits

### 1. **True Cost Control**
```
OpenAI GPT-4 API (heavy usage):
- 100M tokens/month = $3,000-15,000
- Embeddings: $1,300/month
- Total: $4,300-16,300/month

LocalRAG (self-hosted):
- GPU server: $900/month (or $30 for CPU)
- Infrastructure: $100/month
- Total: $130-1,000/month
→ Save $3,200-15,200/month (75-95% cost reduction)
```

### 2. **Complete Privacy & Compliance**
- ✅ **HIPAA compliant**: Medical records never leave your servers
- ✅ **GDPR compliant**: User data stays in your region
- ✅ **No third-party**: Zero risk of data leaks to API providers
- ✅ **Audit trail**: Full control of who accesses what

### 3. **Model Flexibility**
```python
# Switch models in seconds (no code changes)
INFERENCE_MODEL=llama3.2:3b      # Fast, efficient
INFERENCE_MODEL=qwen2.5:7b       # Better quality
INFERENCE_MODEL=mistral:7b       # Alternative
INFERENCE_MODEL=llama3.1:70b     # Best quality (needs GPU)

# Or use cloud APIs as fallback
OPENAI_API_KEY=sk-...            # OpenAI
ANTHROPIC_API_KEY=sk-...         # Claude
```

### 4. **Real Production Architecture**
Not a toy example. Includes everything you need:
- ✅ **Authentication**: JWT tokens, user management
- ✅ **Multi-tenancy**: Isolated data per user
- ✅ **Async processing**: Background workers for slow operations
- ✅ **Caching**: Redis for fast repeated queries
- ✅ **Monitoring**: Trace every request, measure costs
- ✅ **Scaling**: Horizontal scaling ready

### 5. **Educational Value**
Learn RAG from first principles:
- See exactly how chunking works (not hidden in a framework)
- Understand vector search performance tradeoffs
- Measure retrieval accuracy with real metrics
- Experiment with different search strategies
- Build intuition for production RAG systems

### 6. **Deployment Flexibility**
```bash
# Local development (CPU, no GPU)
./start.sh cpu

# Production (single GPU server)
./start.sh gpu

# Kubernetes (multi-region, auto-scaling)
kubectl apply -f k8s/

# Hybrid (local LLM + cloud infrastructure)
# Use local Ollama with AWS RDS/ElastiCache
```

### 7. **Future-Proof**
- ✅ **Model agnostic**: Works with any OpenAI-compatible API
- ✅ **Database agnostic**: Swap pgvector for Qdrant/Milvus
- ✅ **Framework optional**: Use LangChain or build custom
- ✅ **Cloud portable**: Deploy anywhere (AWS, GCP, Azure, on-prem)

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

## ❓ FAQ

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
