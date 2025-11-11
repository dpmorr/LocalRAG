# 🚀 START HERE - AI Career Mentor

## Your System is 100% Ready! ✅

Everything is built and ready to run. Follow these simple steps:

---

## Step 1: Start the System (2 minutes)

### Windows:
```batch
start.bat cpu
```

### Mac/Linux:
```bash
chmod +x start.sh
./start.sh cpu
```

**What this does:**
- Creates `.env` file from template
- Starts all 4 services + infrastructure
- Waits for everything to be ready
- Shows you where to access the app

**⏱️ First run:** 5-10 minutes (downloads AI models ~10GB)
**⏱️ Subsequent runs:** 30-60 seconds

---

## Step 2: Access the Application (1 minute)

Open your browser: **http://localhost:3000**

You'll see a beautiful glassmorphism UI! 🎨

---

## Step 3: Create an Account (30 seconds)

1. Click "Login" button in the top right
2. Click "Don't have an account? Register"
3. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Register"

You're now logged in! ✅

---

## Step 4: Start Chatting! (30 seconds)

Type a message in the prompt box at the bottom:

```
Hi! I'm a junior developer and want to become a senior software engineer. What should I focus on?
```

Press **Enter** or click **Send**.

**Watch the magic happen!** 🪄
- Your message appears
- AI "thinks" (loading animation)
- AI responds with personalized advice
- Citations appear (if any documents were uploaded)

---

## Step 5: Upload a Document (Optional - 2 minutes)

### Via API (Terminal):

```bash
# Get your auth token first by logging in, then:
TOKEN="your_token_from_login"

# Upload a PDF
curl -X POST http://localhost:8080/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/document.pdf"
```

### Via Frontend (Coming Soon):
- File upload UI component ready to be integrated

**What happens:**
1. Document is uploaded to MinIO (S3)
2. Parsed (PDF → text)
3. Chunked (split into 512-token pieces)
4. Embedded (converted to vectors)
5. Indexed (searchable with hybrid BM25 + vector search)

Now ask questions about your document! The AI will cite specific parts.

---

## What You Can Do Right Now ✅

### Chat Features
- ✅ **Ask career questions** - Get personalized advice
- ✅ **Multi-turn conversations** - Threaded chat history
- ✅ **Citations** - See sources for AI answers
- ✅ **Authentication** - Secure user accounts

### Document Features
- ✅ **Upload PDFs/DOCX** - Via API
- ✅ **Automatic processing** - Parse, chunk, embed, index
- ✅ **Hybrid search** - BM25 + vector similarity
- ✅ **Citation tracking** - AI references your documents

### Developer Features
- ✅ **API Documentation** - http://localhost:8080/docs
- ✅ **Health Checks** - Monitor all services
- ✅ **Observability** - Jaeger traces (with `--profile full`)
- ✅ **Hot Reload** - Code changes auto-reload

---

## Quick Examples

### Example 1: Career Guidance

**You ask:**
> "I'm a frontend developer with 2 years of experience. How do I transition to full-stack?"

**AI responds:**
> Based on your frontend background, here's a strategic path to full-stack:
>
> **1. Backend Fundamentals (2-3 months)**
> - Learn Node.js/Express or Python/FastAPI
> - Master RESTful API design
> - Understand databases (SQL + NoSQL)
>
> **2. System Design (1-2 months)**
> - Study scalability patterns
> - Learn caching strategies (Redis)
> - Understand microservices basics
>
> **3. DevOps Essentials (1 month)**
> - Docker containerization
> - CI/CD pipelines
> - Cloud platforms (AWS/GCP)
>
> **Next Steps:**
> 1. Build a full-stack project (e.g., blog platform with auth)
> 2. Contribute to open-source full-stack projects
> 3. Study system design interviews

### Example 2: With Document Context

**You upload:** Your resume (PDF)

**You ask:**
> "Review my resume for a senior engineer position"

**AI responds:**
> I've analyzed your resume. Here are key observations:
>
> **Strengths:**
> - Strong technical skills in React, Node.js, AWS [📄 resume.pdf]
> - 5 years of experience with measurable impact [📄 resume.pdf]
>
> **Areas to Improve:**
> 1. Add more quantified achievements (e.g., "Improved performance by 40%")
> 2. Highlight leadership experience
> 3. Include system design projects
>
> **Suggested Additions:**
> - Technical leadership section
> - Open-source contributions
> - Conference talks or blog posts
>
> Would you like me to rewrite specific sections?

---

## Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.simple.yml logs -f

# Specific service
docker-compose -f docker-compose.simple.yml logs -f api-service
```

### Check Status
```bash
docker-compose -f docker-compose.simple.yml ps
```

### Restart a Service
```bash
docker-compose -f docker-compose.simple.yml restart api-service
```

### Stop Everything
```bash
docker-compose -f docker-compose.simple.yml down
```

### Fresh Start (Delete All Data)
```bash
docker-compose -f docker-compose.simple.yml down -v
./start.bat cpu  # or ./start.sh cpu
```

---

## Troubleshooting

### Issue: "Connection refused" errors

**Solution:** Services are still starting. Wait 2-3 minutes and try again.

Check status:
```bash
docker-compose -f docker-compose.simple.yml ps
```

### Issue: Inference service won't start (GPU mode)

**Solution:** Switch to CPU mode:
```bash
docker-compose -f docker-compose.simple.yml down
./start.bat cpu
```

### Issue: Out of memory

**Solution:** Increase Docker memory limit:
1. Docker Desktop → Settings → Resources
2. Set Memory to 16GB
3. Click "Apply & Restart"

### Issue: Port already in use

**Solution:** Change port in `docker-compose.simple.yml`:
```yaml
api-service:
  ports:
    - "8081:8080"  # Changed from 8080:8080
```

---

## Next Steps After Testing

1. **Read the docs**: See [COMPLETE.md](COMPLETE.md) for all features
2. **Explore API**: http://localhost:8080/docs
3. **Upload documents**: Test the knowledge base
4. **Customize**: Edit services to add features
5. **Deploy**: See [SIMPLIFIED_ARCHITECTURE.md](SIMPLIFIED_ARCHITECTURE.md) for deployment options

---

## Performance Expectations

### CPU Mode
- **Chat response**: 30-60 seconds
- **Document processing**: 2-5 seconds
- **Search**: < 1 second

### GPU Mode
- **Chat response**: 3-10 seconds ⚡
- **Document processing**: 2-5 seconds
- **Search**: < 1 second

---

## Access Points Summary

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Glassmorphism chat UI |
| **API Docs** | http://localhost:8080/docs | Interactive API documentation |
| **Health** | http://localhost:8080/health | Service health check |
| **Jaeger** | http://localhost:16686 | Distributed tracing (full profile) |
| **Grafana** | http://localhost:3001 | Metrics dashboards (full profile) |
| **MinIO** | http://localhost:9001 | S3 storage console |

---

## 🎉 You're All Set!

The AI Career Mentor is ready to use. Just run `./start.bat cpu` (or `./start.sh cpu`) and open http://localhost:3000.

**Questions? Check these docs:**
- [COMPLETE.md](COMPLETE.md) - Full feature list
- [QUICKSTART.md](QUICKSTART.md) - Quick reference
- [GETTING_STARTED.md](GETTING_STARTED.md) - Detailed guide
- [SIMPLIFIED_ARCHITECTURE.md](SIMPLIFIED_ARCHITECTURE.md) - Architecture deep dive

**Happy mentoring! 🚀**
