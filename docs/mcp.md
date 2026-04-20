# MCP Server

The MCP server exposes coaching tools and coach persona prompts. When running via Docker Compose it listens on HTTP at `http://localhost:3001/mcp` (Streamable HTTP transport). It also supports stdio for local development.

## Running via Docker (recommended)

The MCP server is included in the Docker Compose stack and starts automatically:

```bash
docker compose -f docker-compose.prod.yml up -d
```

The server is available at `http://localhost:3001/mcp` once the backend is healthy.

## Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "ai-coach": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

## Configure Claude Code

```bash
claude mcp add --transport http ai-coach http://localhost:3001/mcp
```

## Selecting a Coach Persona

The MCP server exposes coach personas as named prompts. In Claude Desktop, type `@ai-coach` in a new conversation and select a persona from the list. Claude will load the full coaching instructions as its context.

**Available personas:**

| Prompt name | Description |
|---|---|
| `trail-running-coach` | Trail running and ultramarathon coach |

Personas are loaded from `docs/personas/` at server startup (baked into the Docker image at build time). Any `.md` file that does not start with `_` is automatically exposed as a prompt.

## Local development (stdio)

To run the MCP server locally without Docker:

```bash
cd mcp
npm install
npm run build
node dist/index.js   # stdio mode — no PORT env var set
```

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "ai-coach": {
      "command": "node",
      "args": ["/absolute/path/to/ai_coach/mcp/dist/index.js"],
      "env": { "BACKEND_URL": "http://localhost:8080/api" }
    }
  }
}
```

## Available Tools

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
