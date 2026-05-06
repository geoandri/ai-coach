# AI Coach Standalone

AI Coach is a personal coaching platform where an AI agent interviews athletes, pulls training
history from Strava, generates periodized training plans, and tracks week-by-week adherence.
The AI runs in Claude via MCP — this package contains the backend server and coaching dashboard.

## Requirements

Node.js 18 or later. No native dependencies — works on macOS, Linux, and Windows.

## Setup

### 1. Create a Strava API application

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Set **Authorization Callback Domain** to `localhost`
4. Note your **Client ID** and **Client Secret**

### 2. Configure environment variables

**macOS / Linux**
```bash
cp .env.example .env
```

**Windows (Command Prompt)**
```cmd
copy .env.example .env
```

**Windows (PowerShell)**
```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in your Strava credentials:

```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
```

The other values (`PORT`, `DATABASE_PATH`, etc.) can be left as defaults.

### 3. Start the server

**macOS / Linux**
```bash
node dist/index.js
```

**Windows (Command Prompt / PowerShell)**
```cmd
node dist\index.js
```

Open http://localhost:3000. The coaching dashboard and MCP server start together.
The MCP server is reachable at http://localhost:3001/mcp.

## MCP Setup

The MCP server starts automatically alongside the app — you do not need to configure a path
or run it separately. Just make sure the app is running before starting a coaching session.

### Claude Desktop

Add the following to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

Restart Claude Desktop after saving the file.

### Claude Code

Run once (from any directory):

```bash
claude mcp add --transport http ai-coach http://localhost:3001/mcp
```

## Starting a coaching session

1. Start the app (`node dist/index.js`)
2. Open a new conversation in Claude Desktop or Claude Code
3. Select a coach persona from the AI Coach connector (plug icon) — e.g. `trail-running-coach`
4. Claude will guide the session from there

## Data

The SQLite database is stored at `./data/ai_coach.db` by default.
To use a different location set the `DATABASE_PATH` environment variable in `.env`.

## All environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the web server and dashboard |
| `MCP_PORT` | `3001` | Port for the MCP server |
| `DATABASE_PATH` | `./data/ai_coach.db` | Path to the SQLite database file |
| `STRAVA_CLIENT_ID` | — | Strava application client ID |
| `STRAVA_CLIENT_SECRET` | — | Strava application client secret |
| `STRAVA_REDIRECT_URI` | `http://localhost:3000/api/auth/strava/callback` | Strava OAuth callback URL |
| `FRONTEND_BASE_URL` | `http://localhost:3000` | Base URL used for post-OAuth redirects |
