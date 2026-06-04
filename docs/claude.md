# AI Coach — Claude Context

AI-assisted coaching platform. An AI agent acts as a personal coach: gathers athlete info via conversation, generates personalised training plans, and tracks adherence by syncing activities from intervals.icu.

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
node --env-file=.env dist/index.js
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
server/          Fastify REST API — business logic, SQLite DB, intervals.icu sync
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
| `INTERVALS_ICU_ATHLETE_ID` | — | Used for first-time sync during new athlete onboarding (e.g. `i12345`) |
| `INTERVALS_ICU_API_KEY` | — | Used for first-time sync during new athlete onboarding |
| `FRONTEND_BASE_URL` | `http://localhost:3000` | Base URL for redirect links |

`INTERVALS_ICU_ATHLETE_ID` and `INTERVALS_ICU_API_KEY` are only needed for the initial activity import during onboarding. Once synced, the credentials are stored in the database and these env vars are no longer used.

---

## Data Model (Key Entities)

- **Athlete** — profile with fitness level, goals, injuries, coach notes, AI-generated athlete summary, and goal race details (name, date, distance, elevation)
- **TrainingPlan** — one per athlete; weeks → daily workouts
- **intervals_icu_tokens** — API credentials per athlete
- **intervals_icu_activities** — synced runs/trail runs from intervals.icu

One plan per athlete. Delete existing plan before creating a replacement.

---

## intervals.icu Integration

- HTTP Basic Auth: `Authorization: Basic base64(apiKey + ':' + '')`
- Credentials are stored per-athlete in `intervals_icu_tokens` (set via the athlete Settings page in the UI)
- `INTERVALS_ICU_ATHLETE_ID` / `INTERVALS_ICU_API_KEY` in `.env` are used only for the **first sync** during new athlete onboarding — on success the credentials are written to the DB and the env vars are no longer needed
- `intervalsIcuEnabled` on the athlete object is `true` only when a DB token row exists
- Activities filtered to `Run` and `TrailRun` types
- Sync via UI, `GET /api/athletes/:id/activities/sync`, or MCP `sync_activities` tool
- During **new athlete onboarding**: the coach asks if the athlete wants to import their history before creating the profile; calls `sync_activities` if yes
- During **check-ins**: the coach syncs automatically if `intervalsIcuEnabled` is `true`

---

## MCP Tools Available to Agents

Athletes & profiles: `list_athletes`, `get_athlete`, `create_athlete`, `update_athlete`, `add_coach_note`

Training plans: `get_training_plan`, `get_week_detail`, `create_training_plan`, `update_training_plan`, `delete_training_plan`

Activities & adherence: `sync_activities`, `get_dashboard_summary`, `get_plan_vs_actual`

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
