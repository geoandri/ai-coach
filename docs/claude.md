# AI Coach — Claude Context

AI-assisted coaching platform. An AI agent acts as a personal coach: gathers athlete info via conversation, generates personalised training plans, and tracks adherence by syncing Strava activities.

For platform-level agent behaviour (MCP rules, tool usage, check-in workflow) see @docs/personas/_base.md.
For the trail running coach persona see @docs/personas/trail-running-coach.md.
For adding a new coach persona see @docs/personas/_template.md.
For platform setup and schemas see @PLATFORM.md.
For Strava integration setup see @SETUP.md.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.3.4 (Kotlin), PostgreSQL 16, Liquibase |
| Frontend | React 18 (TypeScript), Vite, Tailwind CSS |
| MCP Server | TypeScript, `@modelcontextprotocol/sdk` |

---

## Key Commands

```bash
# Start full stack (backend, frontend, MCP server, database)
docker compose -f docker-compose.prod.yml up -d
```

- UI: `http://localhost`
- MCP server: `http://localhost:3001/mcp`

---

## Architecture

```
frontend/        React SPA — athlete profiles, training plans, activity dashboard
backend/         Spring Boot REST API — business logic, DB, Strava OAuth + sync
mcp/             MCP server — wraps backend API as tools for AI agents
```

The MCP server uses **Streamable HTTP transport** (port 3001). It exposes tools dynamically — no static tool configuration needed. Agents discover tools at runtime via `tools/list`.

---

## Environment Variables

**Backend** (`backend/src/main/resources/application.yml`):

| Variable | Default | Notes |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/ai_coach` | |
| `SPRING_DATASOURCE_USERNAME` | `ai_coach_user` | |
| `SPRING_DATASOURCE_PASSWORD` | `ai_coach_pass` | |
| `STRAVA_CLIENT_ID` | — | Required for Strava OAuth |
| `STRAVA_CLIENT_SECRET` | — | Required for Strava OAuth |
| `STRAVA_REDIRECT_URI` | `http://localhost/api/auth/strava/callback` | Optional override |

**MCP server:**

| Variable | Default |
|---|---|
| `BACKEND_URL` | `http://localhost:8080/api` |

---

## Data Model (Key Entities)

- **Athlete** — profile with fitness level, goals, injuries, coach notes, AI-generated athlete summary, and goal race details (name, date, distance, elevation)
- **TrainingPlan** — one per athlete; weeks → daily workouts
- **StravaToken** — OAuth tokens per athlete, auto-refreshed
- **StravaActivity** — synced runs/trail runs from Strava

One plan per athlete. Delete existing plan before creating a replacement.

---

## Strava Integration

- OAuth 2.0 flow; scopes: `read, activity:read_all`
- Athlete connects at `/athletes/:id/settings`
- Activities filtered to `Run` and `TrailRun` types
- Tokens auto-refresh (5-minute expiry buffer)
- Sync via UI, `GET /api/athletes/{id}/activities/sync`, or MCP `sync_activities` tool

---

## MCP Tools Available to Agents

Athletes & profiles: `list_athletes`, `get_athlete`, `create_athlete`, `update_athlete`, `add_coach_note`

Training plans: `get_training_plan`, `get_week_detail`, `create_training_plan`, `update_training_plan`, `delete_training_plan`

Strava & adherence: `sync_activities`, `get_strava_connect_url`, `get_dashboard_summary`, `get_plan_vs_actual`

---

## Claude Desktop / Claude Code MCP Config

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "ai-coach": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

**Claude Code:**
```bash
claude mcp add --transport http ai-coach http://localhost:3001/mcp
```

---

## Conventions

- Kotlin package: `com.aicoach`
- DB migrations: Liquibase XML in `backend/src/main/resources/db/changelog/`
- Frontend API calls: `frontend/src/api/` (axios-based)
- Workout effort levels: `EASY | MODERATE | HARD | VERY_HARD`
- Fitness levels: `BEGINNER | INTERMEDIATE | ADVANCED | ELITE`
- Goal types: `FINISH_COMFORTABLY | TARGET_TIME | PODIUM`
