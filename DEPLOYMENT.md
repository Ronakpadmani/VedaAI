# VedaAI – GitHub & Deployment Guide

## Part 1: Push code to GitHub

### Before you push (important)

- `backend/.env` and `frontend/.env.local` contain secrets — they are in `.gitignore` and must **never** be committed.
- If you ever pasted your OpenAI key in chat or committed `.env`, **rotate the key** at https://platform.openai.com/api-keys

### Step 1: Create a GitHub repository

1. Go to https://github.com/new
2. Repository name: `vedaai-assessment` (or any name)
3. Choose **Public** (for hiring submission) or Private
4. Do **not** add README, .gitignore, or license (you already have them locally)
5. Click **Create repository**

### Step 2: Push from your computer

Open terminal in `D:\VedaAI` and run:

```powershell
cd D:\VedaAI

git init
git add .
git status
```

Confirm you do **not** see `backend/.env` or `frontend/.env.local` in the list. If you do, stop and fix `.gitignore`.

```powershell
git commit -m "VedaAI: AI Assessment Creator - full stack assignment"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub details.

**If Git asks for login:** use GitHub CLI (`gh auth login`) or a [Personal Access Token](https://github.com/settings/tokens) as the password (not your GitHub password).

### Step 3: Submit assignment

Use your repo URL in the [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSeL19GVvVT8vZrTx67hMWKTXLyJSyhkW5XGyzh7Ppt5w8P1jw/viewform).

---

## Part 2: Deploy the application

VedaAI needs **5 parts** running:

| Service | Role |
|---------|------|
| MongoDB | Database |
| Redis | Queue + cache + WebSocket pub/sub |
| API server | Express on port 4000 |
| Worker | BullMQ generation jobs |
| Frontend | Next.js on port 3000 |

### Recommended free-tier stack

| Component | Platform |
|-----------|----------|
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free M0) |
| Redis | [Upstash](https://upstash.com/) (free Redis) |
| Backend + Worker | [Railway](https://railway.app/) or [Render](https://render.com/) |
| Frontend | [Vercel](https://vercel.com/) |

---

## A. MongoDB Atlas (database)

1. Create account → **Build a Database** → free M0 cluster
2. **Database Access** → add user + password
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere for cloud deploy)
4. **Connect** → **Drivers** → **Node.js** → copy connection string:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/vedaai?retryWrites=true&w=majority
```

Save as `MONGODB_URI` for the backend (Render/Railway).

**Do not use:**

- **SQL Interface** / JDBC URLs (`…query.mongodb.net` or `atlas-sql-…`) — read-only; causes `command insert not found`
- Database name `admin` in the path — use `vedaai` (or your app DB name) instead

---

## B. Upstash Redis

1. Create database at https://console.upstash.com/
2. Copy the **Redis URL** (starts with `rediss://` or `redis://`)
3. Save as `REDIS_URL` for the backend

---

## C. Deploy backend + worker (Railway example)

### Option 1: Two services on Railway (recommended)

1. Push code to GitHub (Part 1)
2. Go to https://railway.app/ → **New Project** → **Deploy from GitHub repo**
3. Select your repo

**Service 1 – API**

- Root directory: `backend`
- Start command: `npm run build && npm start`
- Or for dev-style: `npx tsx src/index.ts` (set in Railway settings)

**Variables** (Settings → Variables):

```
PORT=4000
MONGODB_URI=mongodb+srv://...
REDIS_URL=rediss://...
CORS_ORIGIN=https://your-app.vercel.app
OPENAI_API_KEY=sk-...   (optional)
OPENAI_MODEL=gpt-4o-mini
```

- Generate a public domain → note URL e.g. `https://vedaai-api.up.railway.app`

**Option A — one Render web service (simplest)**

On the API service only, add:

```
START_INLINE_WORKER=true
```

The API process will run the BullMQ worker in the same container. No second service required.

**Option B — separate worker service**

- Root directory: `backend`
- Start command: `npm run start:worker`
- Same env vars as API (`MONGODB_URI`, `REDIS_URL`, etc.; do **not** set `START_INLINE_WORKER` on the worker)

### Option 2: Render

**Web Service (API)**

- Build: `cd backend && npm install --include=dev && npm run build`
- Start: `cd backend && npm start`
- Environment (minimum):

```
MONGODB_URI=mongodb+srv://...@cluster0....mongodb.net/vedaai?...
REDIS_URL=rediss://...@....upstash.io:6379
CORS_ORIGIN=https://veda-ai-gamma.vercel.app
START_INLINE_WORKER=true
```

`START_INLINE_WORKER=true` runs the generation worker inside the API process (required if you do not deploy a separate worker).

**Background Worker (optional instead of inline)**

- Start: `cd backend && npm run start:worker`
- Same `MONGODB_URI` and `REDIS_URL`; omit `START_INLINE_WORKER`

---

## D. Deploy frontend (Vercel)

1. https://vercel.com/ → **Add New Project** → import GitHub repo
2. **Root Directory:** `frontend`
3. Framework: Next.js (auto-detected)

**Environment variables (choose one approach):**

**Option A — direct API URL (simplest)**

```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_WS_URL=https://your-api.railway.app
```

**Option B — proxy REST through Vercel (avoids CORS for fetch; WebSocket still needs backend URL)**

```
API_PROXY_URL=https://your-api.railway.app
NEXT_PUBLIC_WS_URL=https://your-api.railway.app
```

Do **not** leave env vars unset on Vercel — the app will try `http://localhost:4000` at build time or show **Failed to fetch** when creating assignments.

4. Deploy
5. Copy Vercel URL → update backend `CORS_ORIGIN` to that URL (comma-separate preview URLs if needed) → redeploy API

---

## E. Local Docker (production-like on one machine)

If you only need a demo server with Docker installed:

```powershell
cd D:\VedaAI
docker compose up -d
# Set backend/.env with local MongoDB/Redis
npm run dev
```

For real internet access, use a VPS (DigitalOcean, AWS EC2) and run the same with a reverse proxy (nginx).

---

## Environment variables checklist

### Backend (`backend/.env` or cloud variables)

| Variable | Example |
|----------|---------|
| `PORT` | `4000` |
| `MONGODB_URI` | Atlas connection string |
| `REDIS_URL` | Upstash URL |
| `CORS_ORIGIN` | `https://your-app.vercel.app` |
| `OPENAI_API_KEY` | Optional |
| `OPENAI_MODEL` | `gpt-4o-mini` |

### Frontend (`frontend/.env.local` or Vercel env)

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.railway.app` |
| `NEXT_PUBLIC_WS_URL` | `https://your-api.railway.app` |

---

## Verify deployment

1. Open `https://your-api.../health` → should return `{"status":"ok"}`
2. Open Vercel frontend → Home page loads
3. Create assignment → generation progress updates (WebSocket)
4. Question paper appears

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **Failed to fetch** on Create | Set `NEXT_PUBLIC_API_URL` or `API_PROXY_URL` on Vercel; redeploy. Verify `https://your-api/health` returns `ok` |
| **`command insert not found`** | Wrong `MONGODB_URI`: use Atlas **Drivers** URI (`cluster….mongodb.net/vedaai`), not SQL Interface (`query.mongodb.net`) |
| CORS error | Set `CORS_ORIGIN` exactly to frontend URL (no trailing slash); multiple origins: `https://app.vercel.app,https://preview.vercel.app` |
| WebSocket fails | Use same URL for `NEXT_PUBLIC_WS_URL`; ensure host supports WebSockets (Railway/Render do) |
| Stuck at **0%** / no paper | Set `START_INLINE_WORKER=true` on Render API **or** run `npm run start:worker`; set valid `REDIS_URL` (Upstash) |
| Generation stuck | Worker must run with same `MONGODB_URI` and `REDIS_URL` as the API |
| 429 OpenAI | Remove key or add billing; mock fallback runs automatically |

---

## Quick reference: commands

```powershell
# GitHub first push
git init
git add .
git commit -m "Initial commit: VedaAI Assessment Creator"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main

# Local run
docker compose up -d
npm run dev
```
