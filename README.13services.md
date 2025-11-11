# AI Career Mentor – Microservices Architecture

A production-ready AI career mentor system built with microservices architecture, featuring knowledge-grounded career guidance, CV/portfolio assessment, and personalized learning paths.

## 🏗️ Architecture Overview

This system is decomposed into **13 independent microservices** plus background workers, following best practices for scalability, resilience, and independent deployment.

### Core Services

| Service | Port | Responsibility |
|---------|------|----------------|
| **Gateway** | 8080 | API routing, auth, rate limiting, WebSocket |
| **Auth** | 8081 | User authentication, JWT, session management |
| **Chat Orchestrator** | 8082 | LangGraph state machine, thread management, tool dispatch |
| **Ingestion** | 8083 | Document upload, parsing, normalization, chunking |
| **Embedding** | 8084 | Generate embeddings (BGE-M3) |
| **Vector Store** | 8085 | Hybrid search (BM25 + vector), reranking |
| **Inference** | 8086 | LLM inference (Qwen2.5/Llama + Claude/Gemini fallback) |
| **CV Processing** | 8087 | CV parse, critique, generation, templates |
| **Learning Plan** | 8088 | Skills gap analysis, roadmap generation |
| **Rendering** | 8089 | PDF/HTML generation, diagrams (Mermaid) |
| **Profile & Memory** | 8090 | User profiles, episodic/semantic memory |
| **Web Retrieval** | 8091 | Constrained web search, scraping |
| **Notification** | 8092 | Email, Slack, in-app notifications |

### Infrastructure Components

- **PostgreSQL 15** (with pgvector): Primary data store
- **Redis 7**: Caching, session storage, Celery broker
- **RabbitMQ**: Message queue for async pipelines
- **MinIO/S3**: Object storage for documents, artifacts
- **Jaeger**: Distributed tracing
- **Prometheus + Grafana**: Metrics and dashboards

## 📋 Prerequisites

### Development (Docker Compose)
- Docker 24+ with Docker Compose
- NVIDIA GPU (optional for local inference/embedding services)
- 16GB+ RAM recommended
- 50GB+ disk space

### Production (EKS)
- AWS account with EKS, RDS, ElastiCache, S3 access
- Terraform 1.5+
- kubectl + Helm 3
- GPU node groups (g5.2xlarge or p3.2xlarge for inference)

## 🚀 Quick Start (Local Development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd CareerMentor
cp .env.example .env
# Edit .env with your API keys (optional: ANTHROPIC_API_KEY, GOOGLE_API_KEY, LANGSMITH_API_KEY)
```

### 2. Initialize Infrastructure

```bash
# Start core infrastructure
docker-compose up -d postgres redis rabbitmq minio jaeger prometheus grafana

# Wait for health checks
docker-compose ps

# Initialize MinIO buckets
./scripts/init-minio.sh

# Run database migrations
docker-compose run --rm gateway-service alembic upgrade head
```

### 3. Start Services

```bash
# Start all services (without GPU services if no GPU available)
docker-compose up -d

# Or start specific services
docker-compose up -d gateway-service auth-service chat-orchestrator-service

# View logs
docker-compose logs -f chat-orchestrator-service
```

### 4. Access UIs

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Jaeger (Tracing)**: http://localhost:16686
- **Grafana (Metrics)**: http://localhost:3001 (admin/admin)
- **RabbitMQ**: http://localhost:15672 (career_mentor/dev_password)
- **MinIO**: http://localhost:9001 (career_mentor/dev_password)

### 5. Test the System

```bash
# Health check all services
./scripts/health-check.sh

# Upload a test document
curl -X POST http://localhost:8080/upload \
  -F "file=@./tests/fixtures/sample-cv.pdf" \
  -H "Authorization: Bearer <token>"

# Start a chat thread
curl -X POST http://localhost:8080/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "user_id": "test-user",
    "message": "Help me critique my CV for a senior software engineer role",
    "mode": "quick"
  }'
```

## 🏭 Production Deployment (EKS)

### 1. Provision Infrastructure

```bash
cd terraform/environments/prod

# Initialize Terraform
terraform init

# Review plan
terraform plan -out=tfplan

# Apply (creates VPC, EKS, RDS, ElastiCache, S3, etc.)
terraform apply tfplan
```

### 2. Configure kubectl

```bash
aws eks update-kubeconfig --region us-west-2 --name career-mentor-prod
kubectl get nodes
```

### 3. Deploy Services with Helm

```bash
# Add Helm repo (if using external charts)
helm repo add career-mentor ./charts
helm repo update

# Install services by namespace
helm install gateway charts/gateway-service \
  --namespace gateway \
  --create-namespace \
  --values charts/gateway-service/values-prod.yaml

helm install chat-orchestrator charts/chat-orchestrator-service \
  --namespace chat \
  --create-namespace \
  --values charts/chat-orchestrator-service/values-prod.yaml

# Or use ArgoCD for GitOps
kubectl apply -f argocd/applications/
```

### 4. Verify Deployment

```bash
# Check all pods
kubectl get pods --all-namespaces

# Check ingress
kubectl get ingress -n gateway

# View logs
kubectl logs -n chat deployment/chat-orchestrator -f

# Port-forward for testing
kubectl port-forward -n gateway svc/gateway-service 8080:8080
```

## 📦 Repository Structure

```
CareerMentor/
├── services/               # Microservices (13 services)
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
│   └── web/               # Next.js frontend
├── workers/               # Background workers
│   ├── ingestion-workers/
│   ├── embedding-workers/
│   └── memory-worker/
├── charts/                # Helm charts (per service)
├── terraform/             # Infrastructure as Code
│   ├── modules/
│   └── environments/
├── observability/         # Prometheus, Grafana configs
├── docs/
│   ├── api-specs/        # OpenAPI specs
│   ├── architecture/
│   └── runbooks/
├── scripts/              # Utility scripts
├── tests/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml    # Local development
├── MICROSERVICES_ARCHITECTURE.md  # Detailed architecture
└── README.md
```

## 🔧 Development Workflow

### Adding a New Service

1. **Create service directory**:
   ```bash
   mkdir -p services/my-new-service
   cd services/my-new-service
   ```

2. **Bootstrap with template**:
   ```bash
   cookiecutter ../service-template
   ```

3. **Define OpenAPI spec**:
   ```bash
   # services/my-new-service/openapi.yaml
   openapi: 3.1.0
   info:
     title: My New Service
   ...
   ```

4. **Add to docker-compose.yml**:
   ```yaml
   my-new-service:
     build:
       context: ./services/my-new-service
     ports:
       - "8093:8093"
     environment:
       - DATABASE_URL=...
   ```

5. **Create Helm chart**:
   ```bash
   helm create charts/my-new-service
   ```

### Running Tests

```bash
# Unit tests (per service)
cd services/chat-orchestrator-service
pytest tests/ --cov

# Integration tests
cd tests/integration
pytest test_ingestion_pipeline.py

# E2E tests
cd tests/e2e
pytest test_full_chat_flow.py
```

### Database Migrations

```bash
# Create migration
cd services/chat-orchestrator-service
alembic revision --autogenerate -m "Add new table"

# Apply locally
alembic upgrade head

# Apply in production (via K8s job)
kubectl apply -f k8s/migrations/job-migrate-chat.yaml
```

## 📊 Observability

### Distributed Tracing (Jaeger)

All services are instrumented with OpenTelemetry. View traces at http://localhost:16686

Example trace: `User request → Gateway → Chat Orchestrator → Vector Store → Inference`

### Metrics (Prometheus + Grafana)

Key dashboards:
- **Service Health**: Latency (p50/p99), error rates, throughput
- **Inference**: Tokens/sec, GPU utilization, queue depth
- **Cost**: Tokens per user, inference cost per session
- **Retrieval**: Search latency, cache hit rate

Access Grafana at http://localhost:3001

### Logs (Structured JSON)

All services log structured JSON to stdout:
```json
{
  "service": "chat-orchestrator",
  "trace_id": "abc123",
  "user_id": "user-456",
  "level": "info",
  "message": "Thread created",
  "context": {"thread_id": "thread-789"}
}
```

View logs:
```bash
docker-compose logs -f chat-orchestrator-service
# Or in production
kubectl logs -n chat deployment/chat-orchestrator -f
```

## 🔐 Security

### Authentication Flow
1. User logs in → Auth Service issues JWT
2. JWT passed in `Authorization: Bearer <token>` header
3. Gateway validates JWT with Auth Service
4. User ID extracted and passed to downstream services

### Secrets Management
- **Local**: `.env` file (not committed)
- **Production**: AWS Secrets Manager + KMS
- Services pull secrets at boot via IAM roles (EKS IRSA)

### Network Security
- Services in private subnets; only Gateway public
- Security groups per service
- Optional mTLS with Istio/Linkerd

### Data Security
- PostgreSQL RLS (row-level security) enforces `user_id` isolation
- S3 buckets encrypted (SSE-KMS)
- PII redaction at ingestion

## 💰 Cost Optimization

### Caching
- **Redis**: Embedding cache (7d TTL), search results (1h TTL)
- **CloudFront**: Frontend assets, public artifacts

### Auto-Scaling
- **HPA**: CPU/memory-based for stateless services
- **KEDA**: Queue depth for workers
- **Cluster Autoscaler**: GPU nodes scale 0→N on demand

### Budget Controls
- Token caps per chat run
- Model routing (small → large based on confidence)
- Scale-to-zero for non-essential workers at night

## 📈 Milestones

- [x] **M0 – Bootstrap** (Week 1): Repo, Terraform, hello-world
- [ ] **M1 – Ingestion & RAG** (Week 2-3): Upload → parse → chunk → embed → search
- [ ] **M2 – CV/Plan Tools** (Week 4): CV parse/critique/generate, plan builder
- [ ] **M3 – Operator Console** (Week 5): Rewind/fork runs, audit logs
- [ ] **M4 – Evals & Hardening** (Week 6): RAGAS, guardrails, monitoring

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes, add tests
4. Run linters: `ruff check`, `black .`
5. Commit: `git commit -m "Add feature X"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

## 📝 License

[Your License]

## 🆘 Support

- **Documentation**: [./docs/](./docs/)
- **Runbooks**: [./docs/runbooks/](./docs/runbooks/)
- **Issues**: GitHub Issues
- **Slack**: #career-mentor-dev

---

**Built with ❤️ using microservices architecture for scalability, resilience, and independent deployment.**
