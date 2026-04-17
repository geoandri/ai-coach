# MCP Server

The MCP server exposes coaching tools over stdio so AI agents (Claude Desktop, Claude Code, etc.) can manage athletes and training plans directly.

## Build

```bash
cd mcp
npm install
npm run build
```

## Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

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

## Configure Claude Code

```bash
claude mcp add ai-coach -- node /absolute/path/to/ai_coach/mcp/dist/index.js
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
