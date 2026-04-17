# Local Development

Use this setup for hot-reload on frontend and backend without rebuilding Docker images.

## Prerequisites

- Java 21
- Node.js 20+
- Docker (for the database)

## Setup

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

```bash
export $(grep -v '^#' .env | xargs)
cd backend
./gradlew bootRun
```

Liquibase runs migrations automatically on startup.

Verify: `curl http://localhost:8080/actuator/health`

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api/*` to `localhost:8080` automatically.

## Ports

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Health check | http://localhost:8080/actuator/health |
| PostgreSQL | localhost:5432 |
