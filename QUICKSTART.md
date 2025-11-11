# Quick Start Guide

Get the AI Career Mentor running in minutes!

## Prerequisites

- Docker Desktop installed and running
- 16GB+ RAM
- (Optional) NVIDIA GPU for faster inference

## Start the Application

### 1. Copy Environment File

```bash
cp .env.simple .env
```

### 2. Start Services (CPU Mode - No GPU Required)

```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

**Or with GPU (Recommended if you have NVIDIA GPU):**

```bash
docker-compose -f docker-compose.simple.yml --profile gpu up -d
```

**Or with full observability stack:**

```bash
docker-compose -f docker-compose.simple.yml --profile full up -d
```

### 3. Watch the Logs

```bash
# Watch all services
docker-compose -f docker-compose.simple.yml logs -f

# Watch specific service
docker-compose -f docker-compose.simple.yml logs -f api-service
```

### 4. Wait for Services to Be Ready

**First run takes 5-10 minutes** to download models (~10GB for inference service).

Check status:
```bash
# Check if API is ready
curl http://localhost:8080/health

# Check if inference service is ready (takes longest)
curl http://localhost:8000/health
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8080/docs
- **Jaeger (Traces)**: http://localhost:16686 (if using --profile full)
- **MinIO Console**: http://localhost:9001 (career_mentor / dev_password)

## Test the API

### Register a User

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

Save the `access_token` from the response.

### Create a Chat Thread

```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:8080/threads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi! I need help planning my career transition to become a senior software engineer.",
    "mode": "quick"
  }'
```

## Common Issues

### Inference Service Won't Start

**Problem**: Out of memory or no GPU
**Solution**: Use CPU profile instead

```bash
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

### Database Connection Errors

**Problem**: PostgreSQL not ready
**Solution**: Wait for health checks to pass

```bash
docker-compose -f docker-compose.simple.yml ps
# Wait until postgres shows "healthy"
```

### Port Already in Use

**Problem**: Another service using port 8080, 3000, etc.
**Solution**: Change ports in docker-compose.simple.yml

```yaml
api-service:
  ports:
    - "8081:8080"  # Change host port
```

## Stop the Application

```bash
# Stop all services
docker-compose -f docker-compose.simple.yml down

# Stop and remove volumes (fresh start)
docker-compose -f docker-compose.simple.yml down -v
```

## Next Steps

1. ✅ Services are running
2. 📝 Implement additional features (CV parsing, learning plans)
3. 🎨 Enhance frontend UI
4. 🧪 Add tests
5. 🚀 Deploy to production

## Development

### API Service

```bash
cd services/api

# Install dependencies
pip install -r requirements.txt

# Run locally (outside Docker)
uvicorn main:app --reload --port 8080
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Knowledge Service

```bash
cd services/knowledge

pip install -r requirements.txt
uvicorn main:app --reload --port 8081
```

## Useful Commands

```bash
# Restart a specific service
docker-compose -f docker-compose.simple.yml restart api-service

# View service logs
docker-compose -f docker-compose.simple.yml logs -f api-service

# Execute command in container
docker-compose -f docker-compose.simple.yml exec api-service bash

# Check running containers
docker-compose -f docker-compose.simple.yml ps

# Check resource usage
docker stats
```

## Architecture Summary

```
┌─────────────┐
│  Frontend   │ :3000
│  (Next.js)  │
└──────┬──────┘
       │
┌──────▼──────────────────────────────────────┐
│         API Service (FastAPI)               │ :8080
│  • Auth, Chat, CV, Plans, Profile          │
└──┬────────────────┬────────────────────┬───┘
   │                │                    │
┌──▼──────────┐  ┌──▼──────────┐   ┌────▼────────┐
│  Knowledge  │  │  Inference  │   │   Workers   │
│   Service   │  │   Service   │   │  (Celery)   │
│   :8081     │  │   (vLLM)    │   │             │
│             │  │   :8000     │   │             │
└─────────────┘  └─────────────┘   └─────────────┘
       │                │                  │
       └────────────────┴──────────────────┘
                        │
       ┌────────────────▼─────────────────┐
       │   PostgreSQL + Redis + MinIO     │
       └──────────────────────────────────┘
```

## Need Help?

- Check [SIMPLIFIED_ARCHITECTURE.md](SIMPLIFIED_ARCHITECTURE.md) for detailed architecture
- Check [README.simple.md](README.simple.md) for comprehensive guide
- Check service logs: `docker-compose logs -f <service-name>`
- Open an issue on GitHub

Happy mentoring! 🚀
