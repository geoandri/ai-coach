# AI Coach — Claude Context

AI-assisted coaching platform. An AI agent acts as a personal coach: gathers athlete info via conversation, generates personalised training plans, and tracks adherence by syncing Strava activities.

For platform-level agent behaviour (MCP rules, tool usage, check-in workflow) see @docs/personas/_base.md.
For the trail running coach persona see @docs/personas/trail-running-coach.md.
For the road running coach persona see @docs/personas/road-running-coach.md.
For adding a new coach persona see @docs/personas/_template.md.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js / TypeScript, Fastify, SQLite (sql.js) |
| Frontend | React 18 (TypeScript), Vite, Tailwind CSS |
| MCP Server | TypeScript, `@modelcontextprotocol/sdk` |

---

## Key Commands

```bash
# Build and start (from server/)
npm run build
node dist/index.js
```

- UI: `http://localhost:3000`
- MCP server: `http://localhost:3001/mcp`

```bash
# Dev mode with hot reload (from server/)
npm run dev
```

---

## Architecture

```
frontend/        React SPA — athlete profiles, training plans, activity dashboard
server/          Fastify REST API — business logic, SQLite DB, Strava OAuth + sync
mcp/             MCP server — wraps backend API as tools for AI agents
docs/personas/   Coach persona prompts loaded by MCP server at startup
```

The server serves the React frontend as static files and exposes the REST API under `/api`.
The MCP server starts as a child process of the server, on port 3001.
The MCP server uses **Streamable HTTP transport**. Agents discover tools at runtime via `tools/list`.

---

## Environment Variables

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3000` | Web server port |
| `MCP_PORT` | `3001` | MCP server port |
| `DATABASE_PATH` | `./data/ai_coach.db` | SQLite file location |
| `STRAVA_CLIENT_ID` | — | Required for Strava OAuth |
| `STRAVA_CLIENT_SECRET` | — | Required for Strava OAuth |
| `STRAVA_REDIRECT_URI` | `http://localhost:3000/api/auth/strava/callback` | OAuth callback |
| `FRONTEND_BASE_URL` | `http://localhost:3000` | Post-OAuth redirect base |

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
- Athlete connects via `/api/athletes/:id/auth/strava`
- Activities filtered to `Run` and `TrailRun` types
- Tokens auto-refresh (5-minute expiry buffer)
- Sync via UI, `GET /api/athletes/:id/activities/sync`, or MCP `sync_activities` tool

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
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:3001/mcp"]
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

- All dates as ISO strings: `YYYY-MM-DD`
- Frontend API calls via axios with `baseURL: '/api'`
- Workout effort levels: `EASY | MODERATE | HARD | VERY_HARD`
- Fitness levels: `BEGINNER | INTERMEDIATE | ADVANCED | ELITE`
- Goal types: `FINISH_COMFORTABLY | TARGET_TIME | PODIUM`
