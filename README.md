# VedaAI – AI Assessment Creator

Full-stack application for teachers to create assignments, generate structured question papers with AI, and view exam-style output. Built per the [VedaAI Figma designs](https://www.figma.com/design/nB2HMm1BhTpmHcHrmEslGB/VedaAI---Hiring-Assignment).

## Features

- **Assignment creation** – File upload (optional), due date, dynamic question types with steppers, validation, additional instructions
- **AI generation** – Structured prompt → JSON question paper (sections, difficulty, marks, answer key)
- **Background jobs** – BullMQ worker with Redis job state caching
- **Real-time updates** – Socket.IO + Redis pub/sub for generation progress
- **Output page** – Exam-style layout with student info fields, sections, difficulty tags, answer key
- **PDF export** – Server-side PDFKit generation
- **Regenerate** – Re-queue generation from output page

## Architecture

```
┌─────────────┐     REST API      ┌──────────────┐
│  Next.js    │◄─────────────────►│ Express API  │
│  (Zustand)  │                   │  + Socket.IO │
└──────┬──────┘                   └──────┬───────┘
       │ WebSocket                       │
       │                          ┌──────▼───────┐
       │                          │   BullMQ     │
       │                          │    Queue     │
       │                          └──────┬───────┘
       │                                 │
       │                          ┌──────▼───────┐
       │                          │   Worker     │
       │                          │  (AI + DB)   │
       │                          └──────┬───────┘
       │                                 │
       │         Redis pub/sub ◄─────────┘
       └──────────────────────────────────►
```

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Zustand, Socket.IO client |
| Backend | Express, TypeScript, Mongoose, BullMQ, ioredis, Socket.IO |
| Data | MongoDB (assignments), Redis (cache + pub/sub + queue) |
| AI | OpenAI (optional) with structured JSON output; mock generator fallback |

### Generation flow

1. Teacher submits the create-assignment form → `POST /api/assignments`
2. Frontend calls `POST /api/assignments/:id/generate`
3. Job is added to BullMQ → worker picks it up
4. Worker builds a structured prompt, calls LLM (or mock), validates JSON
5. Result saved to MongoDB; progress events published via Redis
6. API server broadcasts to subscribed WebSocket clients
7. Frontend renders structured `QuestionPaper` (never raw LLM text)

## Prerequisites

- Node.js 18+
- Docker (for MongoDB & Redis)

## Quick Start

```bash
# 1. Start databases
docker compose up -d

# 2. Install dependencies
npm run install:all

# 3. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Optional: add OpenAI key to backend/.env for real AI generation
# OPENAI_API_KEY=sk-...

# 4. Run everything (API + worker + frontend)
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |

## Project Structure

```
VedaAI/
├── frontend/          # Next.js app
│   ├── app/           # Pages (assignments, create, output)
│   ├── components/    # UI matching Figma
│   ├── store/         # Zustand state
│   └── lib/           # API + WebSocket clients
├── backend/
│   ├── src/
│   │   ├── routes/    # REST endpoints
│   │   ├── workers/   # BullMQ generation worker
│   │   ├── services/  # AI, PDF, prompts
│   │   └── websocket/ # Socket.IO
│   └── ...
└── docker-compose.yml
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/assignments` | List assignments |
| GET | `/api/assignments/:id` | Get assignment + question paper |
| POST | `/api/assignments` | Create assignment (multipart) |
| POST | `/api/assignments/:id/generate` | Queue AI generation |
| POST | `/api/assignments/:id/regenerate` | Re-generate question paper |
| GET | `/api/assignments/:id/pdf` | Download PDF |
| DELETE | `/api/assignments/:id` | Delete assignment |
| GET | `/api/groups` | List class groups |
| POST | `/api/groups` | Create class group |
| DELETE | `/api/groups/:id` | Delete class group |
| GET | `/api/library` | List saved papers (search/subject filters) |
| POST | `/api/library/from-assignment/:id` | Save paper to library |
| POST | `/api/library/sync-completed` | Import all completed assignments |
| DELETE | `/api/library/:id` | Remove library item |

## WebSocket Events

- **Client → Server:** `subscribe:assignment` / `unsubscribe:assignment` (assignment ID)
- **Server → Client:** `assignment:progress` with `{ assignmentId, status, progress, message, questionPaper? }`

## Approach & Design Decisions

1. **Structured output only** – AI returns JSON matching a strict schema; the UI never renders raw LLM responses.
2. **Job queue** – Generation is async via BullMQ so the API stays responsive and retries are supported.
3. **Redis pub/sub** – Worker and API run as separate processes; events cross process boundaries reliably.
4. **Mock AI fallback** – Works without an API key for demo/review; set `OPENAI_API_KEY` for real generation.
5. **Zustand** – Lightweight global state for form, list, and generation progress.
6. **PDF via PDFKit** – Proper document layout instead of browser print-to-PDF.

## Screens Implemented (Figma)

- **Home** – Dashboard with stats, recent assignments, quick actions
- **My Groups** – Create/manage class groups (MongoDB-backed)
- **My Library** – Saved question papers, search, subject filters, sync from completed assignments
- Assignments dashboard (empty + filled states)
- Create Assignment form with validation & totals
- Assignment Output with AI banner, structured paper, PDF download, regenerate, save to library

## Deployment & GitHub

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:

- Pushing the project to GitHub (without committing secrets)
- Deploying frontend (Vercel), backend + worker (Railway/Render), MongoDB Atlas, Upstash Redis

## License

MIT – for evaluation purposes.
