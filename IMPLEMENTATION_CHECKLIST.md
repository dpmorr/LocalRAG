# Implementation Checklist

Use this checklist to track your progress as you build out the AI Career Mentor.

---

## 🚀 Phase 0: Setup & Verification (Start Here!)

- [ ] **Read** [GETTING_STARTED.md](GETTING_STARTED.md)
- [ ] **Copy** `.env.simple` to `.env`
- [ ] **Start** services: `docker-compose -f docker-compose.simple.yml --profile cpu up -d`
- [ ] **Verify** all services are running: `docker-compose ps`
- [ ] **Test** API: `curl http://localhost:8080/health`
- [ ] **Open** frontend: http://localhost:3000
- [ ] **Check** API docs: http://localhost:8080/docs
- [ ] **Register** a test user via API
- [ ] **Login** and get access token
- [ ] **Create** a test chat thread

---

## 📦 Phase 1: Document Ingestion Pipeline (Week 1)

### Knowledge Service Implementation

- [ ] **Parse PDF files**
  - [ ] Install and configure `pypdf` or `unstructured`
  - [ ] Extract text from PDF
  - [ ] Handle multi-page documents
  - [ ] Extract metadata (title, author, date)

- [ ] **Parse DOCX files**
  - [ ] Use `python-docx`
  - [ ] Extract paragraphs and formatting
  - [ ] Extract tables if needed

- [ ] **Parse Markdown/Text**
  - [ ] Simple file reading
  - [ ] Parse frontmatter (YAML)

- [ ] **Normalize to Markdown**
  - [ ] Convert all formats to clean Markdown
  - [ ] Preserve headings hierarchy
  - [ ] Clean special characters

- [ ] **Store in S3/MinIO**
  - [ ] Upload raw files to `raw/` bucket
  - [ ] Upload processed files to `clean/` bucket
  - [ ] Generate signed URLs for downloads

### Chunking Logic

- [ ] **Implement text chunking**
  - [ ] Use `LangChain RecursiveCharacterTextSplitter`
  - [ ] Set chunk size (512-1024 tokens)
  - [ ] Set overlap (10-15%)
  - [ ] Preserve markdown structure

- [ ] **Extract chunk metadata**
  - [ ] Doc ID, chunk ID, position
  - [ ] Source file name
  - [ ] Heading hierarchy
  - [ ] Timestamps

- [ ] **Store chunks in database**
  - [ ] Create `knowledge.chunks` table
  - [ ] Store chunk text and metadata
  - [ ] Index by doc_id and user_id

### Embedding Generation

- [ ] **Call Inference Service**
  - [ ] Send chunks to `/v1/embeddings` endpoint
  - [ ] Batch requests (10-50 chunks at a time)
  - [ ] Handle rate limits and retries

- [ ] **Store embeddings**
  - [ ] Create `knowledge.embeddings` table with pgvector
  - [ ] Store vector + chunk_id
  - [ ] Create vector index for similarity search

### BM25 Index

- [ ] **Build BM25 index**
  - [ ] Use PostgreSQL `pg_trgm` extension
  - [ ] Create full-text search index
  - [ ] Store BM25 scores

### Workers Integration

- [ ] **Create Celery tasks**
  - [ ] `parse_document_task(doc_id, file_path)`
  - [ ] `chunk_document_task(doc_id)`
  - [ ] `embed_chunks_task(chunk_ids)`
  - [ ] `index_document_task(doc_id)`

- [ ] **Wire up the pipeline**
  - [ ] Upload → trigger `parse_document_task`
  - [ ] Parse complete → trigger `chunk_document_task`
  - [ ] Chunk complete → trigger `embed_chunks_task`
  - [ ] Embed complete → trigger `index_document_task`

- [ ] **Add status tracking**
  - [ ] Update document status in DB
  - [ ] Store progress percentage
  - [ ] Handle errors and retries

---

## 🔍 Phase 2: Hybrid Search (Week 2)

### Search Implementation

- [ ] **BM25 search**
  - [ ] Query PostgreSQL full-text search
  - [ ] Return top-k results (k=50)
  - [ ] Include BM25 scores

- [ ] **Vector search**
  - [ ] Generate query embedding
  - [ ] Cosine similarity search with pgvector
  - [ ] Return top-k results (k=50)
  - [ ] Include similarity scores

- [ ] **Merge results**
  - [ ] Combine BM25 and vector results
  - [ ] Weight scores (configurable BM25 weight)
  - [ ] Deduplicate chunks
  - [ ] Sort by combined score

### Reranking

- [ ] **Call reranker model**
  - [ ] Send query + top-k chunks to Inference Service
  - [ ] Use BGE-reranker or similar
  - [ ] Get refined scores

- [ ] **Return final results**
  - [ ] Top-N chunks (N=8-12)
  - [ ] Include chunk text, metadata, scores
  - [ ] Include source document info

### Caching

- [ ] **Implement Redis cache**
  - [ ] Cache embedding results (query → vector)
  - [ ] Cache search results (query → chunks) with TTL
  - [ ] Cache-aside pattern

---

## 💬 Phase 3: Chat Integration (Week 3)

### API Service Updates

- [ ] **Update chat orchestrator**
  - [ ] Call Knowledge Service search
  - [ ] Extract top chunks
  - [ ] Build context for LLM prompt

- [ ] **Build prompts**
  - [ ] System prompt with role/guidelines
  - [ ] User prompt with context chunks
  - [ ] Add citation instructions

- [ ] **Call Inference Service**
  - [ ] Send messages to `/v1/chat/completions`
  - [ ] Handle streaming responses (optional)
  - [ ] Parse LLM output

- [ ] **Extract citations**
  - [ ] Parse citation markers from LLM response
  - [ ] Match to source chunks
  - [ ] Return citation metadata

- [ ] **Store conversation**
  - [ ] Save messages to database
  - [ ] Store citations in message metadata
  - [ ] Update thread timestamp

### Testing

- [ ] **End-to-end test**
  - [ ] Upload a document
  - [ ] Wait for processing
  - [ ] Ask question about document
  - [ ] Verify relevant chunks retrieved
  - [ ] Verify AI response includes citations

---

## 🎨 Phase 4: Frontend Integration (Week 4)

### API Client

- [ ] **Create API client**
  - [ ] Axios instance with base URL
  - [ ] Add auth token to headers
  - [ ] Error handling and retries

- [ ] **Auth pages**
  - [ ] Login page
  - [ ] Register page
  - [ ] Store token in localStorage/cookies

### Chat UI

- [ ] **Connect to backend**
  - [ ] Send message → `POST /threads`
  - [ ] Display response
  - [ ] Show loading states

- [ ] **Display messages**
  - [ ] User messages (right-aligned)
  - [ ] Assistant messages (left-aligned)
  - [ ] Glassmorphism cards
  - [ ] Markdown rendering

- [ ] **Citations**
  - [ ] Show citation pills inline
  - [ ] Hover to preview chunk
  - [ ] Click to open source document

### Document Upload

- [ ] **Upload UI**
  - [ ] Drag-and-drop zone
  - [ ] File picker
  - [ ] Upload progress bar

- [ ] **Status tracking**
  - [ ] Poll `/upload/{doc_id}/status`
  - [ ] Show processing status
  - [ ] Notify when ready

### Polish

- [ ] **Improve glassmorphism**
  - [ ] Blur effects
  - [ ] Translucent backgrounds
  - [ ] Smooth transitions
  - [ ] Dark mode support

- [ ] **Responsive design**
  - [ ] Mobile layout
  - [ ] Tablet layout
  - [ ] Desktop layout

---

## 🧾 Phase 5: CV Features (Week 5)

### CV Parsing

- [ ] **Extract structured data**
  - [ ] Parse PDF/DOCX CV
  - [ ] Extract contact info (name, email, phone)
  - [ ] Extract work experience
  - [ ] Extract education
  - [ ] Extract skills

- [ ] **Return JSON**
  - [ ] Structured schema (see `routers/cv.py`)
  - [ ] Validate with Pydantic

### CV Critique

- [ ] **Build critique prompt**
  - [ ] Include parsed CV data
  - [ ] Include target role
  - [ ] Request structured critique

- [ ] **Call LLM**
  - [ ] Send to Inference Service
  - [ ] Parse response (issues, strengths, suggestions)

- [ ] **Return critique**
  - [ ] Overall score
  - [ ] List of issues (categorized)
  - [ ] Suggested improvements

### CV Generation

- [ ] **Create templates**
  - [ ] Modern template (HTML/CSS)
  - [ ] Classic template
  - [ ] ATS-friendly template

- [ ] **Render PDF**
  - [ ] Fill template with parsed data
  - [ ] Use Puppeteer or ReportLab
  - [ ] Save to S3
  - [ ] Return download URL

---

## 📚 Phase 6: Learning Plans (Week 6)

### Plan Generation

- [ ] **Skills gap analysis**
  - [ ] Compare current skills to target role
  - [ ] Identify missing skills
  - [ ] Prioritize by importance

- [ ] **Roadmap generation**
  - [ ] Break into milestones (3-6 months)
  - [ ] Assign resources to each milestone
  - [ ] Estimate durations

- [ ] **Search knowledge base**
  - [ ] Find relevant courses/tutorials
  - [ ] Find project ideas
  - [ ] Include from founder knowledge base

- [ ] **Return plan**
  - [ ] Milestones with deliverables
  - [ ] Resource links
  - [ ] Timeline with checkpoints

### Plan Tracking

- [ ] **Store plans**
  - [ ] Create `profiles.learning_plans` table
  - [ ] Store milestones and progress

- [ ] **Update progress**
  - [ ] Mark milestones complete
  - [ ] Track time spent
  - [ ] Adjust timeline

---

## 🧠 Phase 7: Memory & Profiles (Week 7)

### Episodic Memory

- [ ] **Summarize conversations**
  - [ ] After N messages, summarize thread
  - [ ] Extract key facts (goals, preferences)
  - [ ] Store in `profiles.memories` table

- [ ] **Retrieve context**
  - [ ] Load recent memories for thread
  - [ ] Include in LLM context

### User Profiles

- [ ] **CRUD operations**
  - [ ] Create/update/get profile
  - [ ] Store skills, goals, preferences
  - [ ] Store current role, experience level

- [ ] **Profile enrichment**
  - [ ] Extract info from conversations
  - [ ] Auto-update skills based on projects
  - [ ] Suggest goals

---

## 🧪 Phase 8: Testing (Week 8)

### Unit Tests

- [ ] **API Service**
  - [ ] Test auth endpoints
  - [ ] Test chat orchestrator
  - [ ] Test database models

- [ ] **Knowledge Service**
  - [ ] Test document parsing
  - [ ] Test chunking
  - [ ] Test search

- [ ] **Workers**
  - [ ] Test Celery tasks
  - [ ] Mock external services

### Integration Tests

- [ ] **Document pipeline**
  - [ ] Upload → parse → chunk → embed → index
  - [ ] Verify end-to-end

- [ ] **Chat flow**
  - [ ] User message → retrieve → generate → respond
  - [ ] Verify citations

### E2E Tests

- [ ] **Full user journey**
  - [ ] Register → Login → Upload → Chat → Get CV critique → Get learning plan

- [ ] **Use Playwright or Cypress**
  - [ ] Automate frontend interactions
  - [ ] Test against running stack

---

## 🚀 Phase 9: Deployment (Week 9-10)

### CI/CD

- [ ] **GitHub Actions**
  - [ ] Lint (ruff, eslint)
  - [ ] Run tests
  - [ ] Build Docker images
  - [ ] Push to registry (GHCR, ECR)

- [ ] **Staging environment**
  - [ ] Deploy to staging on merge to `main`
  - [ ] Run smoke tests

### Production Deployment

- [ ] **Choose platform**
  - [ ] Single VPS (cheapest)
  - [ ] AWS ECS/Fargate
  - [ ] Kubernetes (EKS/GKE)

- [ ] **Provision infrastructure**
  - [ ] Database (RDS/managed PostgreSQL)
  - [ ] Cache (ElastiCache/managed Redis)
  - [ ] Storage (S3)
  - [ ] DNS, SSL certificates

- [ ] **Deploy services**
  - [ ] Use Docker Compose or Helm
  - [ ] Set production env vars
  - [ ] Enable observability

### Monitoring

- [ ] **Set up alerts**
  - [ ] High latency
  - [ ] Error rates
  - [ ] Inference queue depth
  - [ ] Disk/memory usage

- [ ] **Dashboards**
  - [ ] Grafana dashboards for key metrics
  - [ ] Jaeger for tracing
  - [ ] Centralized logging (CloudWatch/Loki)

---

## 🎉 Phase 10: Launch!

- [ ] **Load testing**
  - [ ] Test with 100 concurrent users
  - [ ] Verify autoscaling works

- [ ] **Security audit**
  - [ ] Check for SQL injection
  - [ ] Verify auth tokens expire
  - [ ] Check rate limits

- [ ] **Documentation**
  - [ ] User guide
  - [ ] API documentation
  - [ ] Deployment runbook

- [ ] **Go live!** 🚀

---

## 📝 Notes

- Check off items as you complete them
- Feel free to reorder based on priorities
- Add more items as needed
- Celebrate small wins! 🎉

**Good luck building! 💪**
