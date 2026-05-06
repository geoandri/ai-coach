# AI Coach

A personalised AI coaching platform where an AI agent acts as a personal coach: it interviews
athletes, pulls their Strava history, generates periodized training plans, and tracks
week-by-week adherence.

## Requirements

Node.js 18 or later. No native dependencies — works on macOS, Linux, and Windows.

## Download

Download the latest release from the [Releases](../../releases) page and extract it.

## Setup

### 1. Create a Strava API application

1. Go to https://www.strava.com/settings/api and create an application
2. Set **Authorization Callback Domain** to `localhost`
3. Note your **Client ID** and **Client Secret**

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

### 3. Start the server

**macOS / Linux**
```bash
node --env-file=.env dist/index.js
```

**Windows (Command Prompt / PowerShell)**
```cmd
node --env-file=.env dist\index.js
```

Open **http://localhost:3000** — the app's landing page has everything you need to get started,
including MCP setup instructions for Claude Desktop and Claude Code.

## Documentation

- [MCP setup](docs/mcp-setup.md)
