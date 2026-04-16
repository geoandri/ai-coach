# AI Coach

A personalized ultramarathon training platform. An AI agent acts as a running coach: it interviews the athlete, pulls their Strava history, generates a periodized training plan, and tracks week-by-week adherence.

The system has three components:

- **Backend** — Spring Boot 3 REST API (Kotlin, PostgreSQL, Liquibase)
- **Frontend** — React 18 + TypeScript SPA (Vite, Tailwind CSS)
- **MCP Server** — Exposes coaching tools to AI agents (Claude, etc.) over stdio

---

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start — Docker (recommended)](#quick-start--docker-recommended)
- [Strava Setup](#strava-setup)
- [Environment Variables](#environment-variables)
- [Local Development (bare-metal)](#local-development-bare-metal)
- [MCP Server Setup](#mcp-server-setup)
- [CI/CD](#cicd)
- [Project Structure](#project-structure)

---

## Architecture

```
Browser → http://localhost (port 80)
             │
         [frontend: nginx]
             │  /api/* → proxy_pass
             ↓
         [backend: Spring Boot :8080]   (internal, not exposed to host)
             │
             ↓
         [postgres :5432]              (also exposed on host for dev)
```

Data is persisted in `./data/postgres` via a bind-mount and survives container restarts.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- A [Strava API application](https://www.strava.com/settings/api) (free)

For local bare-metal development you also need:

- Java 21
- Node.js 20+

---

## Quick Start — Docker (recommended)

### Option A: Pull pre-built images (end users)

```bash
curl -O https://raw.githubusercontent.com/geoandri/ai-coach/main/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/geoandri/ai-coach/main/.env.example

cp .env.example .env
# Edit .env — see the Strava Setup section below
```

```bash
docker compose -f docker-compose.prod.yml up -d
```

Open **http://localhost**.

### Option B: Build from source (developers)

```bash
git clone https://github.com/geoandri/ai-coach.git
cd ai-coach

cp .env.example .env
# Edit .env — see the Strava Setup section below

docker compose up --build
```

Open **http://localhost**.

> **First run note:** The backend builds the Spring Boot JAR inside Docker (Gradle downloads dependencies) and runs Liquibase migrations. The frontend health check waits for the backend to be ready before nginx starts. Allow a couple of minutes on the first build.

### Stopping and restarting

```bash
docker compose down        # stop containers, keep data
docker compose up -d       # restart — postgres data survives
docker compose down -v     # stop and DELETE all data
```

---

## Strava Setup

1. Go to **https://www.strava.com/settings/api** and create an application.
2. Set **Authorization Callback Domain** to `localhost`.
3. Copy your **Client ID** and **Client Secret** into `.env`.
4. Set the redirect URI in `.env` to match your environment:

| Mode | `STRAVA_REDIRECT_URI` |
|---|---|
| Docker (`docker compose up`) | `http://localhost/api/auth/strava/callback` |
| Bare-metal dev | `http://localhost:8080/api/auth/strava/callback` |

The value in `.env` **must** match what Strava sends the callback to. If they differ, the OAuth flow will fail with an authorization error.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `POSTGRES_DB` | No | `ai_coach` | Database name |
| `POSTGRES_USER` | No | `ai_coach_user` | Database user |
| `POSTGRES_PASSWORD` | **Yes** | — | Database password — change this |
| `STRAVA_CLIENT_ID` | **Yes** | — | From https://www.strava.com/settings/api |
| `STRAVA_CLIENT_SECRET` | **Yes** | — | From https://www.strava.com/settings/api |
| `STRAVA_REDIRECT_URI` | No | `http://localhost/api/auth/strava/callback` | Must match Strava app settings |
| `ALLOWED_ORIGINS` | No | `http://localhost` | CORS allowed origins (comma-separated) |
| `FRONTEND_BASE_URL` | No | `http://localhost` | Used in OAuth redirect after Strava callback |

---

## Local Development (bare-metal)

Use this if you want hot-reload on both frontend and backend without rebuilding Docker images.

### 1. Start the database

```bash
docker compose up -d postgres
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env: set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
# Change STRAVA_REDIRECT_URI to http://localhost:8080/api/auth/strava/callback
```

### 3. Start the backend

The backend reads credentials from the environment. Export `.env` variables or set them in your shell:

```bash
export $(grep -v '^#' .env | xargs)
cd backend
./gradlew bootRun
```

The API starts on **http://localhost:8080**. Liquibase runs migrations automatically on startup.

Verify: `curl http://localhost:8080/actuator/health`

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI starts on **http://localhost:5173**. Vite proxies `/api/*` to `localhost:8080` automatically.

### Bare-metal ports

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Health check | http://localhost:8080/actuator/health |
| PostgreSQL | localhost:5432 |

---

## MCP Server Setup

The MCP server exposes coaching tools over stdio so AI agents (Claude Desktop, Claude Code, etc.) can manage athletes and training plans directly.

### Build

```bash
cd mcp
npm install
npm run build
```

### Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "ai-coach": {
      "command": "node",
      "args": ["/absolute/path/to/ai_coach/mcp/dist/index.js"],
      "env": {
        "BACKEND_URL": "http://localhost:8080/api"
      }
    }
  }
}
```

Replace `/absolute/path/to/ai_coach` with the actual path on your machine.

### Configure Claude Code

```bash
claude mcp add ai-coach -- node /absolute/path/to/ai_coach/mcp/dist/index.js
```

### Available tools

| Tool | Description |
|---|---|
| `list_athletes` | List all athletes |
| `get_athlete` | Get athlete profile by ID |
| `create_athlete` | Create a new athlete |
| `update_athlete` | Update athlete profile fields |
| `add_coach_note` | Append a coaching note |
| `get_training_plan` | Get full training plan with all weeks |
| `get_week_detail` | Get daily workouts for a specific week |
| `create_training_plan` | Create a complete plan with weeks and workouts |
| `update_training_plan` | Update a weekly block |
| `delete_training_plan` | Delete a plan (required before creating a new one) |
| `sync_activities` | Pull latest runs from Strava |
| `get_dashboard_summary` | Week-by-week adherence summary |
| `get_plan_vs_actual` | Compare planned vs actual km/elevation over a date range |

---

## CI/CD

Pushing to `main` triggers a GitHub Actions workflow that builds both Docker images and publishes them to GitHub Container Registry:

```
ghcr.io/geoandri/ai-coach/backend:latest
ghcr.io/geoandri/ai-coach/backend:<git-sha>

ghcr.io/geoandri/ai-coach/frontend:latest
ghcr.io/geoandri/ai-coach/frontend:<git-sha>
```

No secrets need to be configured — the workflow uses the automatic `GITHUB_TOKEN`. Images are public because the repository is public.

Monitor builds at: **https://github.com/geoandri/ai-coach/actions**

---

## Project Structure

```
ai_coach/
├── backend/                    # Spring Boot 3 / Kotlin REST API
│   ├── src/main/kotlin/com/aicoach/
│   │   ├── config/             # Security, CORS, Strava OAuth config
│   │   ├── controller/         # REST controllers
│   │   ├── service/            # Business logic + Strava integration
│   │   ├── repository/         # Spring Data JPA repositories
│   │   └── domain/             # JPA entities and DTOs
│   ├── src/main/resources/
│   │   ├── application.yml     # Spring configuration
│   │   └── db/changelog/       # Liquibase migrations
│   └── Dockerfile
│
├── frontend/                   # React 18 + TypeScript SPA
│   ├── src/
│   │   ├── api/                # Axios API clients
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript interfaces
│   ├── nginx.conf              # Production nginx config
│   └── Dockerfile
│
├── mcp/                        # MCP server (TypeScript / stdio)
│   └── src/
│       ├── index.ts            # Server entry point
│       ├── client.ts           # Backend API client
│       └── tools/              # Tool definitions per domain
│
├── data/postgres/              # PostgreSQL bind-mount (gitignored)
├── .github/workflows/
│   └── publish.yml             # Build & publish Docker images
├── docker-compose.yml          # Local dev (build from source)
├── docker-compose.prod.yml     # Production (pull pre-built images)
└── .env.example                # Environment variables template
```
