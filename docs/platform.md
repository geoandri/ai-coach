# AI Coach Platform — Setup & Reference

This document is for developers and users setting up the AI Coach platform. It covers infrastructure, MCP server configuration, and data schemas.

For AI agent coaching behaviour see **[AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md)**.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.3.4 (Kotlin), PostgreSQL 16 |
| Frontend | React 18 (TypeScript), Vite, Tailwind CSS |
| MCP Server | TypeScript, `@modelcontextprotocol/sdk` |
| Migrations | Liquibase |
| Strava integration | OAuth 2.0 |

---

## Starting the Platform

```bash
docker compose -f docker-compose.prod.yml up -d
```

UI is available at `http://localhost`. The MCP server is at `http://localhost:3001/mcp`.

---

## MCP Server

The MCP server wraps the backend REST API and exposes it as tools for AI agents. It runs as part of the Docker Compose stack using Streamable HTTP transport.

**Claude Desktop configuration** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "ai-coach": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

**Claude Code configuration:**
```bash
claude mcp add --transport http ai-coach http://localhost:3001/mcp
```

The server advertises its tools dynamically via `tools/list` — no static configuration of individual tools is needed.

---

## Athlete Profile Schema

| Field | Type | Values |
|-------|------|--------|
| `name` | string | **Required** |
| `email` | string | |
| `experienceYears` | number | |
| `fitnessLevel` | enum | `BEGINNER` \| `INTERMEDIATE` \| `ADVANCED` \| `ELITE` |
| `currentWeeklyKm` | number | |
| `longestRecentRunKm` | number | |
| `recentRaces` | string | Free text |
| `trainingDaysPerWeek` | number | |
| `preferredLongRunDay` | string | e.g. `"Saturday"` |
| `injuries` | string | |
| `strengthTrainingFrequency` | number | Sessions per week |
| `goalType` | enum | `FINISH_COMFORTABLY` \| `TARGET_TIME` \| `PODIUM` |
| `targetFinishTime` | string | e.g. `"9:30:00"` |
| `trailAccess` | boolean | |
| `coachNotes` | string | Appended via the add coach note tool |

---

## Training Plan Schema

```
{
  athleteId: number,
  startDate: "YYYY-MM-DD",
  raceDate: "YYYY-MM-DD",
  raceName: string,
  totalWeeks: number,
  notes?: string,
  weeks: [
    {
      weekNumber: number,        // 1-based; 0 for a partial opening week
      phase: string,             // "Base Building" | "Build" | "Peak" | "Taper" | ...
      startDate: "YYYY-MM-DD",
      endDate: "YYYY-MM-DD",
      plannedKm: number,
      plannedVertM: number,
      notes?: string,
      dailyWorkouts: [
        {
          date: "YYYY-MM-DD",
          dayOfWeek: string,       // "Monday" … "Sunday"
          workoutType: string,     // see workout types in AGENT_INSTRUCTIONS.md
          description: string,
          plannedKm: number,
          plannedVertM?: number,
          perceivedEffort: string, // "EASY" | "MODERATE" | "HARD" | "VERY_HARD"
          notes?: string
        }
      ]
    }
  ]
}
```

> One plan per athlete. Delete the existing plan before creating a replacement.

---

## Strava Integration

Each athlete connects their own Strava account via the Settings tab in the UI (`/athletes/:id/settings`). The OAuth callback links the Strava token to the internal athlete record. Once connected, activities can be synced via the UI or triggered by the agent via the sync tool.
