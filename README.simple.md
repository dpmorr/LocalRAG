# AI Career Mentor – Simplified Architecture

A pragmatic AI career mentor with **just 4 microservices** that's actually easy to deploy and maintain.

## 🎯 Why This Architecture?

**Problem with 13 services**: Complex deployment, excessive network overhead, debugging nightmares.

**Solution**: Split only where it matters for **resource isolation** and **scaling**.

## 🏗️ The 4 Services

| Service | What It Does | Why Separate |
|---------|-------------|--------------|
| **API** | Auth, chat, CV tools, plans, profiles | Business logic hub |
| **Knowledge** | Document upload, parsing, search | Heavy I/O operations |
| **Inference** | LLM + embeddings (GPU) | Expensive GPU resources |
| **Workers** | Background jobs (async) | Long-running tasks |

Plus **Frontend** (Next.js) for UI.

## 🚀 Quick Start

### Prerequisites
- Docker 24+ with Docker Compose
- 16GB RAM (32GB recommended)
- NVIDIA GPU (optional, works on CPU too)

### 1. Clone and Configure

```bash
git clone <repo-url>
cd CareerMentor

# Copy environment file
cp .env.example .env

# Edit .env (optional: add ANTHROPIC_API_KEY, LANGSMITH_API_KEY)
nano .env
```

### 2. Start Everything

**With GPU** (recommended):
```bash
docker-compose -f docker-compose.simple.yml --profile gpu up -d
```

**Without GPU** (slower inference):
```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

**With observability** (Jaeger, Prometheus, Grafana):
```bash
docker-compose -f docker-compose.simple.yml --profile full up -d
```

### 3. Wait for Services

First run downloads models (~10GB). Monitor progress:
```bash
# Watch all services
docker-compose -f docker-compose.simple.yml logs -f

# Check health
curl http://localhost:8080/health  # API
curl http://localhost:8081/health  # Knowledge
curl http://localhost:8000/v1/models  # Inference
```

### 4. Access the App

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8080/docs
- **Jaeger (Traces)**: http://localhost:16686
- **MinIO (Storage)**: http://localhost:9001

### 5. Create Test User & Upload Doc

```bash
# Register user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login (get token)
TOKEN=$(curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Upload a document
curl -X POST http://localhost:8080/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./tests/sample-cv.pdf"

# Start a chat
curl -X POST http://localhost:8080/threads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Help me improve my CV for a senior role"}'
```

## 📦 What Each Service Does

### API Service (Port 8080)
**All business logic in one place**:
- `/auth/*` - Login, JWT tokens, sessions
- `/threads/*` - Chat threads with LangGraph orchestrator
- `/upload` - File uploads (delegates to Knowledge Service)
- `/cv/*` - CV parsing, critique, generation
- `/plan/*` - Learning path builder
- `/profile/*` - User profiles, memory
- `/search/*` - Search knowledge base (calls Knowledge Service)

**Tech**: FastAPI, LangGraph, SQLAlchemy, Celery client

**Why monolithic**: Most features share the same database and benefit from local transactions. No network overhead between tools.

### Knowledge Service (Port 8081)
**Document pipeline + retrieval**:
- Parse uploads (PDF, DOCX, etc.) → Markdown
- Chunk text (512-1024 tokens)
- Call Inference Service for embeddings
- Store in pgvector + BM25 index
- Hybrid search + reranking

**Tech**: FastAPI, pgvector, BM25, Apache Tika

**Why separate**: Heavy I/O (file processing, DB writes) shouldn't block the API. Can scale independently based on upload volume.

### Inference Service (Port 8000)
**GPU-accelerated inference**:
- LLM generation (Qwen/Llama)
- Text embeddings (BGE-M3)
- Reranking (BGE-reranker)
- OpenAI-compatible API (`/v1/chat/completions`)

**Tech**: vLLM (or Hugging Face TGI for CPU)

**Why separate**:
- **GPU isolation** (expensive, needs dedicated hardware)
- **Stateless** (easy horizontal scaling)
- **Model swapping** (update without touching business logic)
- **Cost control** (scale GPU nodes independently)

### Worker Service
**Background async tasks**:
- Parse uploaded documents
- Generate embeddings (batch)
- Index to vector DB
- Nightly memory consolidation
- Scheduled evaluations

**Tech**: Celery + Redis

**Why separate**: Long-running tasks (parsing large PDFs, batch embeddings) shouldn't block API responses. Queue-based autoscaling.

### Frontend (Port 3000)
**Glassmorphism UI**:
- Chat interface with citations
- CV/Portfolio editor
- Learning plan kanban
- Document viewer
- Drag-drop uploads

**Tech**: Next.js 14, React, Tailwind CSS, Framer Motion

## 🗄️ Data Architecture

**Single PostgreSQL database** with schemas:
```
career_mentor/
  ├── auth (users, sessions)
  ├── chat (threads, messages, checkpoints)
  ├── knowledge (documents, chunks, embeddings)
  ├── profiles (user_profiles, memories)
  └── artifacts (cvs, plans, exports)
```

**Why single DB?**: Easier transactions, simpler migrations, lower ops overhead. Can split later if needed.

**Redis**: Cache + Celery broker
**S3/MinIO**: Documents, artifacts

## 🔄 How It Works

### Example: User Uploads CV and Asks for Critique

```
1. User uploads CV.pdf → Frontend
2. Frontend → API Service (/upload)
3. API Service:
   - Saves to S3
   - Enqueues: parse_document_task(doc_id)
   - Returns: {doc_id, status: "processing"}

4. Worker picks up task:
   - Downloads from S3
   - Parses PDF → text
   - Chunks text
   - Calls Inference Service (embed chunks)
   - Calls Knowledge Service (index chunks)
   - Updates DB: status = "ready"

5. User asks: "Critique my CV for senior engineer role"
6. Frontend → API Service (/threads + message)
7. API Service (LangGraph):
   a. Retrieve CV chunks → Knowledge Service.search("user CV")
   b. Generate critique → Inference Service (LLM)
   c. Optionally generate rewritten CV → /cv/generate
   d. Return message with citations

8. Frontend renders critique with citation pills
```

## 📊 Scaling Strategy

### Development (1 Machine)
```
Docker Compose on laptop/workstation
All services on same machine
```

### Production Small (1 GPU Instance)
```
Single g5.2xlarge EC2 instance
Docker Compose or K3s
Managed Postgres (RDS) + Redis (ElastiCache)
~$500-800/month
```

### Production Medium (Kubernetes)
```
EKS/GKE with 2 node pools:
- General (c6i.xlarge): API, Knowledge, Workers (2-5 nodes)
- GPU (g5.2xlarge): Inference only (1-3 nodes)

Auto-scaling:
- API/Knowledge: CPU-based (HPA)
- Workers: Queue depth (KEDA)
- Inference: GPU utilization
~$1500-3000/month
```

### When to Split Further
Only if you hit these bottlenecks:
- **Auth**: Multi-tenancy, SSO, 10K+ users → Extract Auth Service
- **Chat**: Thread rate > 100/sec → Extract Chat Service
- **CV Processing**: CPU bottleneck → Extract CV Service

**Rule**: Start simple. Split when monitoring shows a clear bottleneck.

## 🛠️ Development

### Directory Structure
```
CareerMentor/
├── services/
│   ├── api/              # FastAPI service
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── cv/
│   │   ├── plan/
│   │   ├── main.py
│   │   └── Dockerfile
│   ├── knowledge/        # FastAPI service
│   │   ├── ingestion/
│   │   ├── retrieval/
│   │   ├── main.py
│   │   └── Dockerfile
│   └── workers/          # Celery workers
│       ├── tasks/
│       ├── celery_app.py
│       └── Dockerfile
├── frontend/             # Next.js
│   ├── app/
│   ├── components/
│   └── Dockerfile
├── infrastructure/
│   ├── init-db.sql
│   ├── prometheus.yml
│   └── k8s/ (optional)
├── tests/
├── docker-compose.simple.yml
└── README.simple.md
```

### Running Tests
```bash
# Unit tests (per service)
docker-compose -f docker-compose.simple.yml run api-service pytest
docker-compose -f docker-compose.simple.yml run knowledge-service pytest

# Integration tests
docker-compose -f docker-compose.simple.yml run api-service pytest tests/integration

# Watch logs
docker-compose -f docker-compose.simple.yml logs -f api-service
```

### Database Migrations
```bash
# Create migration
docker-compose -f docker-compose.simple.yml run api-service \
  alembic revision --autogenerate -m "Add users table"

# Apply
docker-compose -f docker-compose.simple.yml run api-service \
  alembic upgrade head
```

### Updating Models
```bash
# Change model in .env
INFERENCE_MODEL=meta-llama/Llama-3.1-8B-Instruct

# Restart inference service
docker-compose -f docker-compose.simple.yml restart inference-service

# Models auto-download on first run
docker-compose -f docker-compose.simple.yml logs -f inference-service
```

## 🔐 Security

### Authentication
- JWT tokens (HS256 or RS256)
- Refresh tokens in Redis
- Optional: Integrate AWS Cognito for production

### Data Security
- PostgreSQL row-level security (RLS)
- S3 bucket encryption (SSE-KMS in prod)
- PII redaction at ingestion
- Secrets in environment variables (K8s secrets in prod)

### Network
- All services in private network (Docker bridge)
- Only API Service + Frontend exposed
- Optional: Add Nginx reverse proxy with SSL

## 💰 Cost Estimates

### Development (Local)
- **Cost**: $0
- **Hardware**: Laptop/workstation with optional GPU

### Production (AWS - Small)
| Component | Instance/Service | Monthly Cost |
|-----------|-----------------|--------------|
| **Compute** | 1x g5.2xlarge (GPU) | ~$500 |
| **Database** | RDS PostgreSQL (db.t4g.medium) | ~$60 |
| **Cache** | ElastiCache Redis (cache.t4g.small) | ~$30 |
| **Storage** | S3 (100GB) | ~$3 |
| **Data Transfer** | 500GB out | ~$45 |
| **Total** | | **~$640/month** |

### Production (AWS - Medium with K8s)
| Component | Instance/Service | Monthly Cost |
|-----------|-----------------|--------------|
| **EKS Control Plane** | Managed K8s | $75 |
| **General Nodes** | 3x c6i.xlarge | ~$180 |
| **GPU Nodes** | 2x g5.2xlarge | ~$1000 |
| **Database** | RDS PostgreSQL (db.r6g.large) | ~$180 |
| **Cache** | ElastiCache Redis (cache.r6g.large) | ~$150 |
| **Storage** | S3 (500GB) | ~$12 |
| **Data Transfer** | 2TB out | ~$180 |
| **Load Balancer** | ALB | ~$20 |
| **Total** | | **~$1800/month** |

**Cost Optimization**:
- Use spot instances for workers (~70% savings)
- Scale GPU nodes to 0 at night (if traffic allows)
- Use CloudFront CDN (reduce data transfer)
- Reserved instances for always-on services (30-50% savings)

## 📈 Observability

### Traces (Jaeger)
Every request traced through all services:
```
User Request
  → API Service (auth check)
    → Knowledge Service (search)
    → Inference Service (generate)
  ← API Service (format response)
← User receives answer
```

View at http://localhost:16686

### Metrics (Prometheus)
Key metrics:
- Request rate, latency (p50/p99), errors
- Token usage (cost tracking)
- GPU utilization
- Queue depth (workers)
- Cache hit rate

### Logs
Structured JSON logs to stdout:
```bash
docker-compose -f docker-compose.simple.yml logs -f api-service | jq
```

## ❓ FAQ

**Q: Do I need a GPU?**
A: No. Run with `--profile cpu` for development. Production should use GPU for acceptable speed.

**Q: Can I use a different LLM?**
A: Yes! Change `INFERENCE_MODEL` in `.env` to any Hugging Face model (Llama, Mistral, etc.)

**Q: How do I deploy to production?**
A: Three options:
1. **Easiest**: Single VPS with Docker Compose
2. **Scalable**: Kubernetes (EKS/GKE) using provided manifests
3. **Managed**: Use managed services (AWS Bedrock for LLM, etc.)

**Q: Can I add more services later?**
A: Absolutely. Start with 4, extract new services as bottlenecks appear.

**Q: What about the 13-service architecture?**
A: See [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) for the full enterprise version. Use that if you need:
- Team autonomy (10+ developers)
- Extreme scale (1M+ users)
- Complex compliance requirements

## 🚦 Next Steps

1. ✅ Review architecture (you are here)
2. [ ] Run `docker-compose up` and test locally
3. [ ] Implement API Service (auth, chat orchestrator)
4. [ ] Implement Knowledge Service (upload, search)
5. [ ] Build Frontend (glassmorphism UI)
6. [ ] Add observability (traces, metrics)
7. [ ] Write tests
8. [ ] Deploy to staging
9. [ ] Run evals (RAGAS)
10. [ ] Production deploy

## 📝 License

[Your License]

---

**Built for developers who value pragmatism over complexity.** 🚀
