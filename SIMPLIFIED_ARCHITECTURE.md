# AI Career Mentor – Simplified Microservices Architecture

> Pragmatic microservices approach: Split only where it makes sense for scaling, deployment, and team autonomy.

---

## 🎯 Core Principle

**Split services by resource requirements and scaling needs, not by every domain boundary.**

---

## 🏗️ Architecture (4 Core Services)

### Service Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│                   Glassmorphism UI + Chat                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Service (FastAPI)                    │
│  • Auth (JWT)                    • CV parse/critique/gen   │
│  • Rate limiting                 • Learning plans           │
│  • Thread/message management     • Profile & memory         │
│  • Document upload               • PDF rendering            │
│  • Web retrieval (constrained)   • Notifications            │
└─────────┬───────────────────┬──────────────────┬────────────┘
          │                   │                  │
          ▼                   ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Knowledge Svc   │  │  Inference Svc   │  │  Worker Service  │
│   (FastAPI)      │  │    (vLLM)        │  │    (Celery)      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│• Upload/parse    │  │• LLM inference   │  │• Doc processing  │
│• Chunk/embed     │  │  (Qwen/Llama)    │  │• Embeddings      │
│• Vector search   │  │• Embeddings      │  │• Memory consolidn│
│• BM25 + pgvector │  │  (BGE-M3)        │  │• Scheduled tasks │
│• Reranking       │  │• Reranker        │  │                  │
│                  │  │• Claude fallback │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                      │
         └─────────────────────┴──────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────────┐
         │         Shared Infrastructure              │
         ├────────────────────────────────────────────┤
         │ • PostgreSQL (+ pgvector)                  │
         │ • Redis (cache + Celery broker)            │
         │ • S3/MinIO (documents, artifacts)          │
         │ • Jaeger (tracing)                         │
         │ • Prometheus + Grafana (metrics)           │
         └────────────────────────────────────────────┘
```

---

## 📦 Service Details

### 1. **Frontend Service** (Next.js)
**Port**: 3000
**Tech**: Next.js 14, React, Tailwind, Framer Motion
**Responsibility**: UI only, no business logic

**Why separate**:
- Independent frontend deploys
- CDN distribution (CloudFront)
- Different scaling needs (CPU vs GPU)

---

### 2. **API Service** (FastAPI)
**Port**: 8080
**Tech**: FastAPI, LangGraph, SQLAlchemy, Celery client
**Responsibility**: All business logic, orchestration, tools

**Modules**:
```
api-service/
├── auth/           # JWT, session management
├── chat/           # LangGraph orchestrator, threads
├── cv/             # CV parsing, critique, generation
├── plan/           # Learning path builder
├── profile/        # User profiles, memory
├── upload/         # File upload handling
├── render/         # PDF/diagram generation (Puppeteer)
├── web/            # Constrained web scraping
└── notifications/  # Email, in-app alerts
```

**Why keep together**:
- Shares same database (easy transactions)
- Tool coordination is simpler
- No network overhead between tools
- Single deployment for business logic

---

### 3. **Knowledge Service** (FastAPI)
**Port**: 8081
**Tech**: FastAPI, pgvector, BM25 indexing
**Responsibility**: Document pipeline + retrieval

**Functions**:
- Document upload → parse → normalize
- Chunking (512-1024 tokens)
- Coordinate with Inference Service for embeddings
- Hybrid search (BM25 + vector)
- Reranking

**Why separate**:
- Heavy I/O (file processing, DB writes)
- Independent scaling (more uploads = more instances)
- Can queue work to Workers without blocking API

---

### 4. **Inference Service** (vLLM)
**Port**: 8000 (OpenAI-compatible)
**Tech**: vLLM serving
**Responsibility**: GPU inference only

**Models**:
- Primary: Qwen2.5-14B (or Llama 3.1-8B)
- Embeddings: BGE-M3
- Reranker: BGE-reranker-v2-m3
- Fallback: Claude/Gemini via API (in API Service)

**Why separate**:
- **GPU resources** (expensive, needs dedicated nodes)
- **Independent scaling** (GPU autoscaling)
- **Stateless** (easy horizontal scaling)
- **Upgradeable** (swap models without touching business logic)

---

### 5. **Worker Service** (Celery)
**Port**: N/A (background)
**Tech**: Celery + Redis broker
**Responsibility**: Async/scheduled jobs

**Tasks**:
- Parse uploaded documents
- Generate embeddings (calls Inference Service)
- Index to vector DB (calls Knowledge Service)
- Memory consolidation (nightly)
- Evaluation runs (scheduled)

**Why separate**:
- Long-running tasks (don't block API)
- Independent scaling (queue depth-based)
- Retry/failure handling

---

## 🗄️ Data Architecture

### PostgreSQL Schemas
```sql
-- Single database, multiple schemas for organization
career_mentor/
  ├── auth          # users, sessions, tokens
  ├── chat          # threads, messages, runs, checkpoints
  ├── knowledge     # documents, chunks, embeddings, citations
  ├── profiles      # user_profiles, memories, preferences
  └── artifacts     # generated_cvs, plans, exports
```

**Why single DB**:
- Easier transactions (e.g., create thread + update profile)
- Simpler migrations
- Lower operational overhead
- Can split later if needed (start simple)

### Redis Usage
```
redis/
  ├── cache:*           # Search results, embeddings (TTL)
  ├── session:*         # User sessions (TTL)
  ├── ratelimit:*       # Rate limit counters (TTL)
  └── celery:*          # Task queue
```

### S3 Buckets
```
s3://career-mentor/
  ├── raw/              # Uploaded docs
  ├── clean/            # Normalized markdown
  ├── chunks/           # Parquet chunks with metadata
  ├── artifacts/        # PDFs, diagrams
  └── templates/        # CV/plan templates
```

---

## 🔄 Communication Patterns

### Synchronous (REST)
```
Frontend → API Service → Knowledge Service (search)
                      → Inference Service (generate)
```

### Asynchronous (Celery + Redis)
```
API Service → enqueue task → Worker → calls Knowledge/Inference
```

### Example Flow: Upload Document
```
1. User uploads PDF → API Service
2. API Service:
   - Saves to S3 (raw/)
   - Enqueues: parse_document_task(doc_id)
   - Returns: {doc_id, status: "processing"}
3. Worker picks up task:
   - Downloads from S3
   - Parses to markdown
   - Chunks text
   - Calls Inference Service (embed)
   - Calls Knowledge Service (index)
   - Updates DB status: "ready"
4. API Service notifies user (WebSocket or polling)
```

### Example Flow: Chat Message
```
1. User sends message → API Service
2. API Service (LangGraph):
   a. Retrieve context → Knowledge Service.search()
   b. Generate answer → Inference Service (POST /v1/chat/completions)
   c. Update memory → local DB write
   d. Return message + citations
3. Frontend renders message
```

---

## 🚀 Deployment

### Development (Docker Compose)
```bash
docker-compose up
# Starts: postgres, redis, api-service, knowledge-service,
#         inference-service, worker, jaeger, grafana
```

### Production (Simple)

**Option A: Single VPS/EC2** (cheapest, easiest)
```
- 1x Large Instance (e.g., g5.2xlarge with GPU)
- Docker Compose or K3s (lightweight Kubernetes)
- Nginx reverse proxy
- Managed Postgres (RDS) + Redis (ElastiCache)
```

**Option B: Kubernetes (EKS/GKE)** (if scaling needed)
```
Namespaces:
  - app (api-service, knowledge-service)
  - inference (inference-service on GPU nodes)
  - workers (worker pods, CPU autoscaling)

Node Pools:
  - General (c6i.2xlarge): API, Knowledge, Workers
  - GPU (g5.2xlarge): Inference Service only
```

---

## 📊 Why This Split Works

| Service | Scaling Need | Resource Type | Deploy Frequency |
|---------|--------------|---------------|------------------|
| **Frontend** | High (traffic) | CPU, CDN | Often (UI changes) |
| **API Service** | Medium | CPU, Memory | Often (features) |
| **Knowledge** | Medium | I/O, CPU | Medium (indexing) |
| **Inference** | Low-Medium | GPU | Rare (model updates) |
| **Workers** | Elastic | CPU | Medium (tasks) |

✅ **Easy to deploy**: 4 services vs 13
✅ **Easy to develop**: Less inter-service coordination
✅ **Easy to debug**: Fewer network hops
✅ **Cost effective**: Share resources where possible
✅ **Still scalable**: Split the bottlenecks (GPU, I/O, compute)

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, Tailwind, Framer Motion |
| **API** | FastAPI, LangGraph, LangChain, SQLAlchemy |
| **Knowledge** | FastAPI, pgvector, BM25 (pg_trgm) |
| **Inference** | vLLM (Qwen2.5/Llama), BGE-M3 |
| **Workers** | Celery, Python |
| **Database** | PostgreSQL 15 + pgvector |
| **Cache/Queue** | Redis 7 |
| **Storage** | MinIO (dev), S3 (prod) |
| **Tracing** | OpenTelemetry + Jaeger |
| **Metrics** | Prometheus + Grafana |
| **IaC** | Terraform (optional) or Docker Compose |

---

## 📂 Simplified Repository Structure

```
career-mentor/
├── frontend/                   # Next.js app
│   ├── app/
│   ├── components/
│   └── package.json
├── services/
│   ├── api/                    # Main API service
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── cv/
│   │   ├── plan/
│   │   ├── profile/
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── knowledge/              # Knowledge service
│   │   ├── ingestion/
│   │   ├── retrieval/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── workers/                # Celery workers
│       ├── tasks/
│       ├── celery_app.py
│       └── requirements.txt
├── infrastructure/
│   ├── docker-compose.yml      # Local dev
│   ├── k8s/                    # Kubernetes manifests (optional)
│   └── terraform/              # IaC (optional)
├── docs/
├── tests/
└── README.md
```

**Note**: Inference service uses pre-built vLLM Docker image (no custom code needed).

---

## 🎯 Migration Path

### Start (MVP)
```
Everything in API Service (monolith)
↓
Extract GPU inference → Inference Service
↓
Extract heavy I/O → Knowledge Service
↓
Add background jobs → Workers
```

### If Growth Requires
```
Split API Service:
  → Auth Service (if multi-tenancy/SSO needed)
  → Chat Service (if chat scaling is bottleneck)
```

**Start simple, split only when needed.**

---

## ✅ Acceptance Criteria (Simplified)

- [ ] 4 services deployable with `docker-compose up`
- [ ] Frontend accessible at `localhost:3000`
- [ ] API docs at `localhost:8080/docs`
- [ ] Upload doc → searchable in <2 min
- [ ] Chat returns answer with citations in <5s
- [ ] CV critique completes in <30s
- [ ] All services instrumented (traces in Jaeger)
- [ ] Health checks pass (`/health` endpoints)
- [ ] Can deploy to single GPU instance or K8s

---

## 📝 Next Steps

1. **Bootstrap repos** (mono-repo or multi-repo)
2. **Set up dev environment** (`docker-compose up`)
3. **Implement API Service** (auth, chat, tools)
4. **Implement Knowledge Service** (upload, search)
5. **Configure vLLM** (download model, test inference)
6. **Add Workers** (async doc processing)
7. **Build Frontend** (glassmorphism UI)
8. **Add observability** (Jaeger, Prometheus)
9. **Write tests** (integration, e2e)
10. **Deploy** (VPS or K8s)

---

**This is a pragmatic, production-ready architecture that's actually deployable without a DevOps team.**
