# AI Career Mentor – Microservices Architecture

## Service Decomposition Strategy

### 1. Core Services (Independent Deployments)

#### 1.1 **API Gateway Service** (`gateway-service`)
- **Responsibility**: Entry point, routing, auth, rate limiting
- **Tech**: FastAPI + Kong/Envoy
- **Ports**: 8080 (HTTP), 8443 (HTTPS)
- **Dependencies**: Auth Service, Rate Limiter (Redis)
- **Endpoints**:
  - Route to all downstream services
  - Handle WebSocket upgrades for real-time chat
  - API versioning (/v1/*, /v2/*)

#### 1.2 **Authentication Service** (`auth-service`)
- **Responsibility**: User auth, JWT issuance, session management
- **Tech**: FastAPI + Cognito SDK
- **Ports**: 8081
- **Data**: PostgreSQL (users, sessions, refresh_tokens)
- **APIs**:
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/verify` (internal)

#### 1.3 **Chat Orchestrator Service** (`chat-orchestrator-service`)
- **Responsibility**: LangGraph state machine, thread management, tool dispatch
- **Tech**: FastAPI + LangGraph + LangSmith
- **Ports**: 8082
- **Data**: PostgreSQL (threads, runs, checkpoints, messages)
- **Message Queue**: RabbitMQ/SQS for async tool invocations
- **APIs**:
  - `POST /threads`
  - `POST /threads/{id}/messages`
  - `GET /threads/{id}`
  - `POST /threads/{id}/rewind` (operator)
  - `POST /threads/{id}/fork` (operator)

#### 1.4 **Document Ingestion Service** (`ingestion-service`)
- **Responsibility**: File upload, parsing, normalization, chunking
- **Tech**: FastAPI + Apache Tika/Unstructured + Celery workers
- **Ports**: 8083
- **Data**: S3 (raw, clean, chunks), PostgreSQL (doc metadata)
- **Queue**: Celery + Redis (task queue)
- **APIs**:
  - `POST /upload` (multipart/form-data or URL)
  - `GET /upload/{job_id}/status`
  - `POST /ingest/reprocess/{doc_id}` (operator)

#### 1.5 **Embedding Service** (`embedding-service`)
- **Responsibility**: Generate embeddings, batch processing
- **Tech**: FastAPI + vLLM (BGE-M3 model)
- **Ports**: 8084
- **GPU**: Required (T4/A10/A100)
- **APIs**:
  - `POST /embed` (sync for small batches)
  - `POST /embed/batch` (async for large batches)
  - `GET /embed/batch/{job_id}`

#### 1.6 **Vector Store Service** (`vector-store-service`)
- **Responsibility**: Hybrid search (BM25 + vector), reranking
- **Tech**: FastAPI + pgvector + PostgreSQL
- **Ports**: 8085
- **Data**: PostgreSQL (chunks, embeddings, BM25 indices)
- **APIs**:
  - `POST /search` (hybrid retrieval)
  - `POST /rerank` (BGE-v2-m3 reranker)
  - `POST /index` (internal from ingestion)

#### 1.7 **Inference Service** (`inference-service`)
- **Responsibility**: LLM inference (Qwen2.5, Llama, fallback to Claude/Gemini)
- **Tech**: vLLM serving + OpenAI-compatible API
- **Ports**: 8086
- **GPU**: Required (A10/A100 for 14B-70B models)
- **APIs**:
  - `POST /v1/chat/completions` (OpenAI-compatible)
  - `POST /v1/completions`
  - `GET /v1/models`

#### 1.8 **CV Processing Service** (`cv-service`)
- **Responsibility**: CV parsing, critique, generation, templates
- **Tech**: FastAPI + Spacy + Custom parsers
- **Ports**: 8087
- **Data**: S3 (templates), PostgreSQL (parsed CVs)
- **APIs**:
  - `POST /cv/parse`
  - `POST /cv/critique`
  - `POST /cv/generate`
  - `GET /cv/templates`

#### 1.9 **Learning Plan Service** (`plan-service`)
- **Responsibility**: Skills gap analysis, roadmap generation, resource mapping
- **Tech**: FastAPI + Graph DB (Neo4j optional) or PostgreSQL
- **Ports**: 8088
- **Data**: PostgreSQL (skills taxonomy, resources, certifications)
- **APIs**:
  - `POST /plan/build`
  - `GET /plan/{id}`
  - `PATCH /plan/{id}/checkpoint/{checkpoint_id}` (mark complete)

#### 1.10 **Rendering Service** (`render-service`)
- **Responsibility**: PDF/HTML generation, diagrams (Mermaid/Graphviz)
- **Tech**: FastAPI + Puppeteer + Mermaid CLI
- **Ports**: 8089
- **APIs**:
  - `POST /render/pdf`
  - `POST /render/diagram`
  - `GET /render/{artifact_id}` (download)

#### 1.11 **Profile & Memory Service** (`profile-service`)
- **Responsibility**: User profiles, preferences, episodic memory, semantic memory
- **Tech**: FastAPI + PostgreSQL + Redis (hot cache)
- **Ports**: 8090
- **Data**: PostgreSQL (profiles, goals, memories), Redis (session state)
- **APIs**:
  - `GET /profiles/{user_id}`
  - `PATCH /profiles/{user_id}`
  - `POST /memories/{user_id}` (episodic updates)
  - `GET /memories/{user_id}/recent`

#### 1.12 **Web Retrieval Service** (`web-retrieval-service`)
- **Responsibility**: Constrained web search (allowed domains), scraping, parsing
- **Tech**: FastAPI + BeautifulSoup + Scrapy
- **Ports**: 8091
- **Data**: Redis (cache), S3 (scraped content)
- **APIs**:
  - `POST /search/web` (query + domain whitelist)
  - `POST /scrape` (URL → markdown)

#### 1.13 **Observability Service** (`observability-service`)
- **Responsibility**: Centralized logging, metrics aggregation, tracing
- **Tech**: OpenTelemetry Collector + Jaeger + Prometheus + Grafana
- **Ports**: 4317 (OTLP gRPC), 4318 (OTLP HTTP), 9090 (Prometheus), 3000 (Grafana)
- **Data**: Time-series DB (Prometheus), Jaeger backend

#### 1.14 **Notification Service** (`notification-service`)
- **Responsibility**: Email, Slack alerts, in-app notifications
- **Tech**: FastAPI + SES/SendGrid + WebSocket
- **Ports**: 8092
- **Queue**: SQS/RabbitMQ
- **APIs**:
  - `POST /notify` (internal event-driven)
  - `GET /notifications/{user_id}` (for frontend)

---

### 2. Frontend Service (Next.js)

#### 2.1 **Web Application** (`frontend-web`)
- **Tech**: Next.js 14+ (App Router) + React + Tailwind + Framer Motion
- **Ports**: 3000 (dev), served via CloudFront (prod)
- **Features**:
  - Glassmorphism UI components
  - Fixed prompt box with slash commands
  - Real-time chat (WebSocket to gateway)
  - Citation viewer with right-rail doc panel
  - CV/Portfolio editor (rich text)
  - Learning plan kanban
  - File upload with progress
- **API Client**: Generated from OpenAPI specs (using openapi-generator)

---

### 3. Background Workers

#### 3.1 **Ingestion Workers** (`ingestion-workers`)
- **Tech**: Celery + Python
- **Tasks**:
  - Parse uploaded documents
  - OCR if needed
  - Chunk and extract metadata
  - Enqueue embedding jobs

#### 3.2 **Embedding Workers** (`embedding-workers`)
- **Tech**: Celery + Python + vLLM client
- **Tasks**:
  - Batch embed chunks
  - Update vector store
  - Build BM25 indices

#### 3.3 **Memory Consolidation Worker** (`memory-worker`)
- **Tech**: Celery + Python
- **Tasks**:
  - Periodic episodic memory summarization
  - Semantic memory decay
  - Profile enrichment from thread history

---

### 4. Data Layer

#### 4.1 **PostgreSQL Clusters**
- **Primary DB** (threads, runs, checkpoints, documents, chunks, embeddings, citations, profiles, memories)
  - Schemas: `auth`, `chat`, `documents`, `knowledge`, `profiles`
  - Extensions: `pgvector`, `pg_trgm`, `uuid-ossp`
  - Replication: 1 primary + 2 read replicas

#### 4.2 **Redis Clusters**
- **Cache**: Embedding cache, search cache, session cache
- **Queues**: Celery broker, BullMQ (if Node workers)

#### 4.3 **S3 Buckets**
- `raw-docs/` (uploaded files)
- `clean-docs/` (normalized markdown)
- `chunks/` (parquet with metadata)
- `templates/` (CV/plan templates)
- `artifacts/` (rendered PDFs, diagrams)
- `backups/` (DB backups, versioned manifests)

#### 4.4 **Message Queues**
- **RabbitMQ** or **AWS SQS** for inter-service events
  - Exchanges: `ingestion.events`, `chat.events`, `notification.events`
  - Queues: `ingestion.parse`, `ingestion.embed`, `notification.email`, etc.

---

## Service Communication Patterns

### Synchronous (REST/gRPC)
- **Gateway → Services**: REST (FastAPI)
- **Inter-service queries**: gRPC for low-latency (optional; start with REST)
- **Chat Orchestrator → Tools**: Synchronous HTTP POST with timeout

### Asynchronous (Event-Driven)
- **Document Upload → Ingestion Pipeline**: SQS/RabbitMQ
  - Event: `document.uploaded` → `parse` → `chunk` → `embed` → `index`
- **Chat Message → Memory Update**: Event `thread.message.completed` → Memory Worker
- **Evaluation Triggers**: Periodic events to eval worker

### Pub/Sub (Optional for Real-Time)
- WebSocket via Gateway for live chat updates
- Server-Sent Events (SSE) for progress notifications

---

## API Contract Example (OpenAPI)

Each service exposes `/openapi.json`:

```yaml
# chat-orchestrator-service/openapi.yaml
openapi: 3.1.0
info:
  title: Chat Orchestrator API
  version: 1.0.0
paths:
  /threads:
    post:
      summary: Create new thread
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id: {type: string}
                message: {type: string}
                mode: {type: string, enum: [quick, deep]}
      responses:
        201:
          content:
            application/json:
              schema:
                type: object
                properties:
                  thread_id: {type: string}
                  run_id: {type: string}
```

---

## Security & Multi-Tenancy

### Row-Level Security (RLS)
- PostgreSQL policies enforce `user_id` isolation
- Every table has `user_id` or `tenant_id` column
- Service accounts use JWTs with `service_role` claim

### Secrets Management
- **AWS KMS** for encryption keys
- **AWS Secrets Manager** or **Vault** for DB credentials, API keys
- Services pull secrets at boot via IAM roles (EKS IRSA)

### Network Policies
- Services in private subnets; only Gateway in public
- Security groups: each service has dedicated SG
- mTLS between services (Istio/Linkerd optional)

---

## Deployment Architecture (EKS)

### Kubernetes Namespaces
- `gateway` (API Gateway, Auth)
- `chat` (Orchestrator, Profile, Memory)
- `knowledge` (Ingestion, Embedding, Vector Store)
- `inference` (vLLM pods with GPU node affinity)
- `tools` (CV, Plan, Render, Web Retrieval)
- `observability` (OTLP Collector, Prometheus, Grafana)
- `workers` (Celery workers, cron jobs)

### Node Groups
- **General** (c6i.2xlarge): Gateway, Auth, Orchestrator, Profile, CV, Plan, Render
- **GPU** (g5.2xlarge or p3.2xlarge): Inference, Embedding
- **Workers** (c6i.xlarge): Celery workers with horizontal autoscaling

### Helm Charts (per service)
```
charts/
├── gateway-service/
├── auth-service/
├── chat-orchestrator-service/
├── ingestion-service/
├── embedding-service/
├── vector-store-service/
├── inference-service/
├── cv-service/
├── plan-service/
├── render-service/
├── profile-service/
├── web-retrieval-service/
├── notification-service/
└── observability/
```

### GitOps (ArgoCD/Flux)
- Each service has a Helm chart
- `values-dev.yaml`, `values-staging.yaml`, `values-prod.yaml`
- Auto-sync from main branch

---

## Data Flow Examples

### 1. Document Upload Flow
```
User (Frontend)
  → [Gateway] POST /upload
    → [Ingestion Service] store S3 raw/ + emit event {doc.uploaded}
      → [Worker] parse → store S3 clean/ + emit {doc.parsed}
        → [Worker] chunk → store S3 chunks/ + DB + emit {doc.chunked}
          → [Embedding Service] embed → store pgvector + emit {doc.indexed}
            → [Notification Service] → notify user "Ready"
```

### 2. Chat Message Flow
```
User (Frontend WebSocket)
  → [Gateway] POST /threads/{id}/messages
    → [Chat Orchestrator]
      → retrieve user profile [Profile Service]
      → LangGraph run:
        1. retrieve → [Vector Store Service] hybrid search
        2. rerank → [Vector Store Service] rerank top-k
        3. plan → decide tools
        4. answer → [Inference Service] generate with citations
        5. act → [CV Service] if /cv command
        6. summarize → [Profile Service] update memory
      → return message + citations
    → [Frontend] render message + citation pills
```

### 3. CV Critique Flow
```
User uploads CV
  → [Gateway] POST /cv/parse
    → [CV Service] parse → JSON {work_history, skills, ...}
  → [Gateway] POST /cv/critique
    → [CV Service]
      → [Inference Service] generate critique
      → [Render Service] generate rewritten CV PDF
    → return {issues: [...], rewritten_cv_url: "..."}
```

---

## Observability Strategy

### Distributed Tracing
- Every service instruments with OpenTelemetry SDK
- Trace context propagated via HTTP headers (W3C Trace Context)
- Spans: `gateway.request` → `orchestrator.run` → `vectorstore.search` → `inference.generate`
- Jaeger UI for debugging

### Metrics (Prometheus)
- **Gateway**: requests/sec, p50/p99 latency, 4xx/5xx rates
- **Orchestrator**: threads created, runs completed, avg run time, tool invocation counts
- **Inference**: tokens/sec, GPU utilization, queue depth
- **Vector Store**: search latency, cache hit rate
- **Cost**: tokens consumed per user, inference cost per session

### Logging (Structured JSON)
- All services log to stdout in JSON
- FluentBit DaemonSet → CloudWatch Logs or Loki
- Fields: `service`, `trace_id`, `user_id`, `level`, `message`, `context`

### Alerts (Prometheus Alertmanager → Slack)
- P99 latency > 5s for gateway
- Inference queue depth > 100
- Hallucination canary failed
- Disk usage > 80%
- Pod crash loop

---

## Cost Controls

### Caching Layers
- **Redis**: Embedding cache (TTL 7d), search results (TTL 1h)
- **CloudFront**: Frontend assets, public artifacts

### Auto-Scaling
- **HPA**: CPU/memory-based for stateless services
- **KEDA**: Queue depth for workers, custom metrics for inference
- **Cluster Autoscaler**: scale GPU node group 0→N on demand

### Budget Policies
- **Token caps**: Orchestrator enforces max tokens per run
- **Model routing**: Small model default; escalate to large only if confidence < 0.7
- **Scale-to-zero**: Non-essential workers (memory consolidation) scale to 0 at night

---

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Service CI/CD

on:
  push:
    branches: [main, staging]
    paths:
      - 'services/chat-orchestrator-service/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: poetry install
      - run: pytest --cov
      - run: ruff check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: docker/build-push-action@v5
        with:
          context: services/chat-orchestrator-service
          tags: ${{ secrets.ECR }}/chat-orchestrator:${{ github.sha }}
          push: true

  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    steps:
      - run: helm upgrade chat-orchestrator ./charts/chat-orchestrator-service \
             --set image.tag=${{ github.sha }} \
             --namespace chat
```

### Database Migrations
- **Alembic** for schema changes
- Migration job runs as Kubernetes Job before service upgrade
- Rollback plan: keep N-1 schema compatible

---

## Infrastructure as Code (Terraform Modules)

```
terraform/
├── modules/
│   ├── vpc/
│   ├── eks/
│   ├── rds-postgres/
│   ├── elasticache-redis/
│   ├── s3-buckets/
│   ├── cognito/
│   ├── cloudfront/
│   ├── iam-roles/
│   └── kms/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── main.tf
```

### Key Resources
- **VPC**: 3 AZs, public + private subnets, NAT gateways
- **EKS**: v1.28+, managed node groups (general + GPU)
- **RDS**: PostgreSQL 15, Multi-AZ, encrypted, automated backups
- **ElastiCache**: Redis 7, cluster mode, encryption in-transit
- **S3**: Versioned, encrypted (SSE-KMS), lifecycle policies
- **Cognito**: User pool, app clients, MFA enforcement
- **CloudFront**: CDN for frontend + S3 artifacts, signed URLs
- **IAM**: IRSA (EKS service accounts → AWS resources)
- **KMS**: Keys for RDS, S3, secrets

---

## Repository Structure

```
career-mentor/
├── services/
│   ├── gateway-service/
│   ├── auth-service/
│   ├── chat-orchestrator-service/
│   ├── ingestion-service/
│   ├── embedding-service/
│   ├── vector-store-service/
│   ├── inference-service/
│   ├── cv-service/
│   ├── plan-service/
│   ├── render-service/
│   ├── profile-service/
│   ├── web-retrieval-service/
│   └── notification-service/
├── frontend/
│   └── web/
├── workers/
│   ├── ingestion-workers/
│   ├── embedding-workers/
│   └── memory-worker/
├── charts/ (Helm)
├── terraform/
├── docs/
│   ├── api-specs/ (OpenAPI)
│   ├── architecture/
│   └── runbooks/
├── tests/
│   ├── integration/
│   └── e2e/
└── scripts/
    ├── seed-data/
    └── migrations/
```

---

## Acceptance Criteria (Microservices)

- ✅ Each service deployable independently
- ✅ Each service has OpenAPI spec + generated client
- ✅ All services instrumented with OTLP (traces, metrics, logs)
- ✅ All inter-service calls timeout + retry with exponential backoff
- ✅ All services have health (`/health`) and readiness (`/ready`) endpoints
- ✅ All secrets pulled from Secrets Manager/KMS
- ✅ All DB queries use connection pooling + read replicas where applicable
- ✅ All S3 operations use signed URLs with expiration
- ✅ All services pass contract tests (Pact or similar)
- ✅ All services have 80%+ code coverage
- ✅ Helm charts support multiple environments (dev/staging/prod)
- ✅ Terraform plan succeeds for all environments
- ✅ Blue/green deployment tested in staging
- ✅ Chaos engineering (kill pods) validates resilience

---

## Migration Path (Monolith → Microservices)

If starting from monolith:

1. **Strangler Fig Pattern**: Build new features as microservices
2. **Extract Services by Domain**:
   - Week 1-2: Auth + Profile (stateless, clear boundary)
   - Week 3-4: Document Ingestion (async, event-driven)
   - Week 5-6: Vector Store (isolate heavy DB queries)
   - Week 7-8: Inference (GPU isolation)
3. **Shared Data Transition**:
   - Phase 1: Services share DB (different schemas)
   - Phase 2: API-only cross-service access (no direct DB queries)
   - Phase 3: Database-per-service (replicate via CDC/events)

---

## Next Steps

1. **Bootstrap repos** for each service (cookiecutter templates)
2. **Define OpenAPI contracts** (design-first)
3. **Provision infrastructure** (Terraform apply for dev)
4. **Implement Gateway + Auth** (M0 - Week 1)
5. **Implement Ingestion + Vector Store** (M1 - Week 2-3)
6. **Implement Chat Orchestrator + Inference** (M1 - Week 2-3)
7. **Implement CV + Plan services** (M2 - Week 4)
8. **Add Observability + Operator Console** (M3 - Week 5)
9. **Run Evals + Harden** (M4 - Week 6)

---

## Key Microservices Principles Applied

✅ **Single Responsibility**: Each service owns one domain
✅ **Loose Coupling**: Services communicate via well-defined APIs/events
✅ **High Cohesion**: Related functionality grouped in same service
✅ **Database per Service**: No shared DB writes across services
✅ **Decentralized Data**: Each service manages its own data
✅ **Independently Deployable**: Blue/green per service
✅ **Failure Isolation**: Circuit breakers, retries, timeouts
✅ **Observability**: Distributed tracing across all services
✅ **API Gateway Pattern**: Single entry point with routing
✅ **Event-Driven**: Async pipelines via message queues

---

**This architecture is production-ready, scalable, and agent-friendly for incremental implementation.**
