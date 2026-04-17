# AI Coach

A personalized ultramarathon training platform. An AI agent acts as a running coach: it interviews the athlete, pulls their Strava history, generates a periodized training plan, and tracks week-by-week adherence.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- A [Strava API application](https://www.strava.com/settings/api) (free)

---

## Strava Setup

1. Go to **https://www.strava.com/settings/api** and create an application.
2. Set **Authorization Callback Domain** to `localhost`.
3. Note your **Client ID** and **Client Secret**.

---

## Quick Start

```bash
curl -O https://raw.githubusercontent.com/geoandri/ai-coach/main/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/geoandri/ai-coach/main/.env.example

cp .env.example .env
```

Edit `.env` and set your credentials:

```
POSTGRES_PASSWORD=change_me
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
```

```bash
docker compose -f docker-compose.prod.yml up -d
```

Open **http://localhost**.

### Stopping and restarting

```bash
docker compose -f docker-compose.prod.yml down      # stop, keep data
docker compose -f docker-compose.prod.yml up -d     # restart
docker compose -f docker-compose.prod.yml down -v   # stop and delete data
```

---

## Documentation

- [Architecture & project structure](docs/architecture.md)
- [Environment variables](docs/configuration.md)
- [Local development (bare-metal)](docs/development.md)
- [MCP server setup](docs/mcp.md)
- [CI/CD pipeline](docs/ci-cd.md)
