# CareerMentor - AI-Powered Career Guidance Platform

> **A fully local, privacy-first AI career mentoring platform powered by Ollama, RAG, and microservices architecture**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)

## 🌟 What Makes This Project Unique

CareerMentor is a production-ready AI career mentoring platform that demonstrates modern best practices for building **privacy-first, cost-effective AI applications**:

### Key Differentiators

1. **100% Local LLM Execution**
   - Runs entirely on your hardware using Ollama (CPU or GPU)
   - No API costs - one-time setup, unlimited usage
   - Complete data privacy - nothing leaves your infrastructure

2. **RAG-Powered Responses**
   - Retrieval-Augmented Generation for grounded, factual answers
   - Vector search with pgvector for semantic matching
   - Hybrid search combining dense vectors + BM25
   - Automatic citation and source tracking

3. **Production-Grade Architecture**
   - Microservices design with clear separation of concerns
   - Async message queuing with Celery + Redis
   - OpenTelemetry integration for observability
   - Horizontal scaling ready

4. **Developer-Friendly Setup**
   - Single-command deployment with Docker Compose
   - Multiple profiles (CPU/GPU/Full observability)
   - Hot-reload for rapid development
   - Comprehensive API documentation

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                     http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      API Service (FastAPI)                       │
│                     http://localhost:8080                        │
│  • Authentication & Authorization                                │
│  • Chat orchestration                                            │
│  • User profile management                                       │
└─────┬───────────────────────────────────────────────┬───────────┘
      │                                               │
      │                                               │
┌─────▼──────────────────────┐          ┌────────────▼────────────┐
│  Knowledge Service         │          │  Inference Service       │
│  http://localhost:8081     │          │  http://localhost:8000   │
│                            │          │                          │
│  • Document processing     │          │  • Ollama (Llama 3.2)    │
│  • Vector embeddings       │          │  • Text generation       │
│  • Semantic search         │          │  • OpenAI-compatible API │
│  • BM25 + vector hybrid    │          │                          │
└─────┬──────────────────────┘          └──────────────────────────┘
      │
┌─────▼──────────────────────┐
│  Worker Service (Celery)   │
│                            │
│  • Background jobs         │
│  • Document ingestion      │
│  • Async processing        │
└────────────────────────────┘

Infrastructure:
┌──────────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐
│  PostgreSQL  │  │   Redis   │  │  MinIO   │  │   Jaeger     │
│  (pgvector)  │  │  (Cache)  │  │  (S3)    │  │  (Tracing)   │
└──────────────┘  └───────────┘  └──────────┘  └──────────────┘
```

### How RAG Works in CareerMentor

1. **User asks a question** → "How do I become a software engineer?"
2. **Knowledge service** searches relevant documents using vector similarity + BM25
3. **Top chunks retrieved** with metadata and scores
4. **Context + question** sent to local Ollama LLM
5. **Grounded response** generated with citations to source documents
6. **Zero external API calls** - all processing happens locally

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (Windows/Mac) or Docker + Docker Compose (Linux)
- 8GB+ RAM (16GB recommended)
- 10GB free disk space

### One-Command Setup

**Windows:**
```bash
start.bat cpu
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh cpu
```

**Or using Docker Compose directly:**
```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

### First Run Setup (Model Download)

The first time you run CareerMentor, it will download the Llama 3.2 3B model (~2GB). This happens automatically and takes 2-5 minutes depending on your internet connection.

Monitor progress:
```bash
docker logs career-mentor-inference-cpu -f
```

### Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8080/docs
- **Health Check**: http://localhost:8080/health

### Default Credentials

- **Email**: admin@careermentor.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change these credentials in production!

## 📚 Deployment Profiles

CareerMentor supports three deployment profiles:

### 1. CPU Mode (Default)
Best for: Development, small teams, CPU-only systems

```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

- Uses Ollama with Llama 3.2 3B model
- Runs on any modern CPU
- ~4-8GB RAM usage
- Response time: 2-5 seconds

### 2. GPU Mode
Best for: Production, faster responses, larger models

```bash
docker-compose -f docker-compose.simple.yml --profile gpu up -d
```

- Requires NVIDIA GPU with CUDA support
- Uses vLLM with larger models (7B-14B)
- ~8-24GB VRAM required
- Response time: <1 second

### 3. Full Observability
Best for: Production monitoring, debugging

```bash
docker-compose -f docker-compose.simple.yml --profile full up -d
```

- Includes all CPU/GPU services
- Adds Jaeger, Prometheus, Grafana
- Full distributed tracing
- Metrics and dashboards

**Observability Access:**
- Jaeger UI: http://localhost:16686
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

**Key Configuration Options:**

```env
# Choose your model (CPU mode uses Ollama)
INFERENCE_MODEL=llama3.2:3b
# Options: llama3.2:1b (faster), llama3.2:3b (balanced), llama3.1:8b (better quality)

# RAG Configuration
RETRIEVAL_TOP_K=50          # Number of chunks to retrieve
RERANK_TOP_K=10            # Top chunks after reranking
CHUNK_SIZE=512             # Document chunk size
CHUNK_OVERLAP=64           # Overlap between chunks

# Optional: External APIs (not needed for local mode)
OPENAI_API_KEY=            # Leave empty to use local models
ANTHROPIC_API_KEY=         # Optional fallback
```

## 💻 Development

### Project Structure

```
CareerMentor/
├── services/
│   ├── api/              # FastAPI backend
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   └── models/       # Database models
│   ├── knowledge/        # Document processing & search
│   └── workers/          # Background job processing
├── frontend/             # Next.js React frontend
├── infrastructure/       # Database schemas, configs
├── docker-compose.simple.yml  # Main deployment file
└── .env.example         # Configuration template
```

### Running Services Individually

**API Service:**
```bash
cd services/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Hot Reload Development

All services support hot reload in development mode. Changes to code will automatically restart the services.

## 📖 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

### Example: Chat API

```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "How do I transition to a tech career?",
    "thread_id": "uuid-here"
  }'
```

Response includes:
- AI-generated answer
- Source citations
- Relevance scores
- Processing metadata

## 🧪 Adding Your Own Documents

1. **Upload via API:**
```bash
curl -X POST http://localhost:8080/admin/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@career-guide.pdf" \
  -F "title=Career Development Guide"
```

2. **Automatic Processing:**
   - Document chunked intelligently
   - Embeddings generated locally
   - Indexed in vector database
   - Available for RAG immediately

3. **Supported Formats:**
   - PDF, DOCX, TXT, MD
   - JSON, CSV (structured data)
   - Web scraping (URLs)

## 🔒 Security & Privacy

### Security Features

- **Local-first**: All AI processing happens on your infrastructure
- **No telemetry**: No data sent to external services (unless you configure external APIs)
- **JWT authentication**: Secure API access
- **Role-based access**: Admin/user permissions
- **Environment-based secrets**: All sensitive config in `.env`
- **`.gitignore` protection**: `.env` files never committed to version control

### Before Deploying to Production

1. **Change default passwords**:
   ```env
   POSTGRES_PASSWORD=your-strong-password-here
   MINIO_PASSWORD=another-strong-password
   JWT_SECRET=generate-a-long-random-string
   ```

2. **Generate strong JWT secret**:
   ```bash
   openssl rand -hex 32
   ```

3. **Enable HTTPS**: Use reverse proxy (nginx/Caddy) with SSL certificates

4. **Rotate API keys**: If using external APIs, rotate keys regularly

5. **Database backups**: Set up automated PostgreSQL backups

6. **Monitor logs**: Review application logs for suspicious activity

### What's Safe to Commit

✅ **Safe**:
- `.env.example` (template without real values)
- Docker Compose files
- Application code
- Documentation

❌ **Never Commit**:
- `.env` (already in .gitignore)
- API keys (OpenAI, Anthropic, etc.)
- Database backups
- User data
- SSL certificates

## 🎯 Use Cases

- **Career Counseling Centers**: Privacy-compliant AI guidance
- **Educational Institutions**: Student career support
- **HR Departments**: Internal career development
- **Coaching Businesses**: Scalable AI assistant
- **Personal Use**: Your own AI career mentor

## 🐳 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | Next.js UI |
| API | 8080 | FastAPI backend |
| Knowledge | 8081 | Search & embeddings |
| Inference (Ollama) | 11434 | Local LLM |
| Inference Proxy | 8000 | OpenAI-compatible API |
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache & queue |
| MinIO | 9000 | Object storage |
| Jaeger | 16686 | Tracing (full mode) |

## 📊 Performance & Scaling

### Single Server (CPU Mode)
- Handles: 10-50 concurrent users
- Response time: 2-5 seconds
- RAM: 8GB minimum, 16GB recommended
- Storage: 10GB base + documents

### GPU Acceleration
- Handles: 100+ concurrent users
- Response time: <1 second
- VRAM: 8GB+ (3B models), 24GB+ (7B+ models)
- 5-10x faster than CPU

### Horizontal Scaling
- Add more worker nodes for document processing
- Load balance API/Knowledge services
- Shared PostgreSQL/Redis/MinIO infrastructure
- Kubernetes-ready architecture

## 🤝 Contributing

Contributions welcome! This project demonstrates:
- Modern Python async patterns (FastAPI + asyncio)
- React best practices with Next.js
- Microservices architecture
- RAG implementation from scratch
- Production Docker setup

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

Free for commercial and personal use.

## 🙏 Acknowledgments

Built with:
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [LangChain](https://langchain.com/) - LLM application framework
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search
- [Next.js](https://nextjs.org/) - React framework
- [vLLM](https://github.com/vllm-project/vllm) - High-performance LLM serving

## 📧 Support

- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Documentation**: Check `/docs` folder for detailed guides

## ❓ FAQ

**Q: Do I need a GPU?**
A: No! Use `--profile cpu` for CPU-only mode with Ollama. GPU is optional for better performance.

**Q: How much does it cost to run?**
A: **Development**: $0 (runs locally). **Production**: Self-hosted = server costs only (~$50-500/month depending on scale).

**Q: Can I use different LLMs?**
A: Yes! Change `INFERENCE_MODEL` in `.env` to any Ollama model (llama3.2, qwen2.5, mistral, etc.)

**Q: Is my data private?**
A: **Completely**. All processing happens locally. No data leaves your infrastructure (unless you explicitly configure external APIs).

**Q: Can I use OpenAI instead?**
A: Yes, but you'll lose the cost and privacy benefits. Just set `OPENAI_API_KEY` in `.env`.

**Q: How does RAG work here?**
A: Documents are chunked and embedded locally. When you ask a question, relevant chunks are retrieved and sent to the LLM for context-aware responses.

---

**Built with ❤️ to demonstrate modern AI application development**

*Star ⭐ this repo if you find it useful!*
