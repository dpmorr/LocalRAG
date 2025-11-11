# Getting Started - AI Career Mentor

Welcome! This guide will get you from zero to running in **under 10 minutes**.

## Prerequisites

Make sure you have:
- ✅ **Docker Desktop** installed and running ([Download](https://www.docker.com/products/docker-desktop))
- ✅ **16GB+ RAM** available
- ✅ **20GB+ disk space** (for model downloads)
- ⚠️ **NVIDIA GPU** (optional, but recommended for production)

## Step-by-Step Setup

### 1. Get the Code

```bash
# If you have the code already
cd CareerMentor

# Or clone from git
git clone <your-repo-url>
cd CareerMentor
```

### 2. Configure Environment

```bash
# Copy the simplified environment template
cp .env.simple .env

# (Optional) Edit .env to add API keys
# nano .env or open in your editor
```

**Optional API Keys** (for advanced features):
- `ANTHROPIC_API_KEY` - For Claude fallback (long context)
- `LANGSMITH_API_KEY` - For LangChain tracing/debugging

### 3. Choose Your Profile

**For Development (No GPU)**:
```bash
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

**For Production (With GPU)**:
```bash
docker-compose -f docker-compose.simple.yml --profile gpu up -d
```

**With Full Observability** (Jaeger, Prometheus, Grafana):
```bash
docker-compose -f docker-compose.simple.yml --profile full up -d
```

### 4. Wait for Services to Start

**First run downloads ~10GB of models**. This takes 5-10 minutes.

Watch the logs:
```bash
docker-compose -f docker-compose.simple.yml logs -f
```

Look for these messages:
```
api-service         | INFO:     Application startup complete.
knowledge-service   | INFO:     Application startup complete.
inference-service   | INFO:     Uvicorn running on http://0.0.0.0:8000
frontend            | ✓ Ready in 2.3s
```

### 5. Verify Services Are Running

```bash
# Check all services are healthy
curl http://localhost:8080/health   # API Service
curl http://localhost:8081/health   # Knowledge Service
curl http://localhost:8000/health   # Inference Service (may take longer)
curl http://localhost:3000          # Frontend
```

Expected response:
```json
{"status":"healthy","service":"api-service","timestamp":"..."}
```

## Your First API Calls

### 1. Register a User

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "securepassword123",
    "full_name": "Demo User"
  }'
```

Response:
```json
{
  "id": "uuid-here",
  "email": "demo@example.com",
  "full_name": "Demo User",
  "created_at": "2025-01-15T10:30:00"
}
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@example.com&password=securepassword123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Save the `access_token`** - you'll need it for authenticated requests.

### 3. Create a Chat Thread

```bash
# Replace YOUR_TOKEN with the access_token from login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:8080/threads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi! I want to transition from a junior developer to a senior software engineer role. What should I focus on?",
    "mode": "quick"
  }'
```

Response:
```json
{
  "id": "thread-uuid",
  "user_id": "user-uuid",
  "created_at": "2025-01-15T10:35:00",
  "updated_at": "2025-01-15T10:35:00",
  "message_count": 2
}
```

### 4. Get Thread Messages

```bash
curl -X GET http://localhost:8080/threads/thread-uuid \
  -H "Authorization: Bearer $TOKEN"
```

## Access the Frontend

Open your browser: **http://localhost:3000**

You'll see a glassmorphism-styled chat interface!

## Explore the API

Interactive API documentation: **http://localhost:8080/docs**

This shows all available endpoints with:
- Try it out directly in browser
- Request/response schemas
- Example payloads

## Monitoring & Debugging

### View Logs

```bash
# All services
docker-compose -f docker-compose.simple.yml logs -f

# Specific service
docker-compose -f docker-compose.simple.yml logs -f api-service
docker-compose -f docker-compose.simple.yml logs -f inference-service
```

### Check Container Status

```bash
docker-compose -f docker-compose.simple.yml ps
```

Expected output:
```
NAME                    STATUS                 PORTS
career-mentor-api       Up (healthy)           0.0.0.0:8080->8080/tcp
career-mentor-db        Up (healthy)           0.0.0.0:5432->5432/tcp
career-mentor-redis     Up (healthy)           0.0.0.0:6379->6379/tcp
...
```

### Access Observability Tools

(Only available with `--profile full`)

- **Jaeger** (Distributed Tracing): http://localhost:16686
- **Prometheus** (Metrics): http://localhost:9090
- **Grafana** (Dashboards): http://localhost:3001
  - Username: `admin`
  - Password: `admin` (or from .env)

### MinIO Console

Access storage console: **http://localhost:9001**
- Username: `career_mentor`
- Password: `dev_password`

## Common Issues & Solutions

### Issue: Port Already in Use

**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**: Another service is using that port. Either:
1. Stop the conflicting service
2. Change the port in `docker-compose.simple.yml`:
   ```yaml
   api-service:
     ports:
       - "8081:8080"  # Use 8081 on host instead
   ```

### Issue: Inference Service Won't Start

**Error**: `RuntimeError: No GPU available`

**Solution**: You're using GPU profile without a GPU. Use CPU profile:
```bash
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml --profile cpu up -d
```

### Issue: Database Connection Failed

**Error**: `could not connect to server: Connection refused`

**Solution**: PostgreSQL isn't ready yet. Wait 30 seconds and try again:
```bash
# Check if postgres is healthy
docker-compose -f docker-compose.simple.yml ps postgres
```

### Issue: Out of Memory

**Error**: Container keeps restarting or `Killed`

**Solution**: Increase Docker Desktop memory limit:
1. Open Docker Desktop → Settings → Resources
2. Set Memory to at least **16GB**
3. Click "Apply & Restart"

### Issue: Model Download Taking Forever

**First run downloads 8-12GB of ML models**. This is normal.

**Solution**: Be patient. Check progress:
```bash
docker-compose -f docker-compose.simple.yml logs -f inference-service
```

You'll see:
```
Downloading model: Qwen/Qwen2.5-7B-Instruct
Download progress: 4.2GB / 8.5GB
```

## Next Steps

✅ **You're all set!** Now you can:

1. **Explore the API**: http://localhost:8080/docs
2. **Use the Frontend**: http://localhost:3000
3. **Read the Architecture**: [SIMPLIFIED_ARCHITECTURE.md](SIMPLIFIED_ARCHITECTURE.md)
4. **Check Build Status**: [BUILD_STATUS.md](BUILD_STATUS.md)
5. **Start Coding**: Implement the TODOs in service code

## Development Workflow

### Making Changes

1. **Edit code** in `services/api/`, `services/knowledge/`, or `frontend/`
2. **Changes auto-reload** (hot reload enabled in dev mode)
3. **Check logs** for errors: `docker-compose logs -f <service-name>`

### Adding Dependencies

**Python** (API/Knowledge/Workers):
```bash
# Add to requirements.txt
echo "new-package==1.0.0" >> services/api/requirements.txt

# Rebuild container
docker-compose -f docker-compose.simple.yml up -d --build api-service
```

**Node** (Frontend):
```bash
# Add to package.json
cd frontend
npm install new-package

# Restart frontend
docker-compose -f docker-compose.simple.yml restart frontend
```

### Running Tests

```bash
# API tests
docker-compose -f docker-compose.simple.yml exec api-service pytest

# Frontend tests
docker-compose -f docker-compose.simple.yml exec frontend npm test
```

## Stopping the Application

```bash
# Stop all services (preserves data)
docker-compose -f docker-compose.simple.yml down

# Stop and remove volumes (fresh start)
docker-compose -f docker-compose.simple.yml down -v
```

## Need Help?

- 📖 **Documentation**: See `/docs` folder
- 🐛 **Issues**: Check container logs
- 💬 **Questions**: Open a GitHub issue
- 📚 **Learn More**:
  - [SIMPLIFIED_ARCHITECTURE.md](SIMPLIFIED_ARCHITECTURE.md)
  - [BUILD_STATUS.md](BUILD_STATUS.md)
  - [QUICKSTART.md](QUICKSTART.md)

---

**Happy coding! 🚀**
