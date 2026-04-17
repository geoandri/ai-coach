# Architecture

## Overview

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

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Spring Boot 3.3, Kotlin, Spring Data JPA |
| Database | PostgreSQL 16, Liquibase migrations |
| Serving | nginx (reverse proxy + SPA routing) |
| AI integration | MCP server (TypeScript, stdio) |

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
├── docs/                       # Developer documentation
├── data/postgres/              # PostgreSQL bind-mount (gitignored)
├── .github/workflows/
│   └── publish.yml             # Build & publish Docker images
├── docker-compose.yml          # Local dev (build from source)
├── docker-compose.prod.yml     # Production (pull pre-built images)
└── .env.example                # Environment variables template
```
