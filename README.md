# AI Coach

A personalised AI coaching platform where an AI agent acts as a personal coach: it interviews
athletes, generates periodized training plans, and tracks week-by-week adherence. Strava
integration is optional — it allows the coach to pull your training history automatically,
but the app works fully without it.

## Requirements

Node.js 18 or later. No native dependencies — works on macOS, Linux, and Windows.

## Download

Download the latest release from the [Releases](../../releases) page and extract it.

## Setup

### 1. Create a Strava API application (optional)

Strava integration is optional. Without it the coach will ask about your training history
manually instead of importing it automatically. If you want to skip Strava, leave the
`STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` fields blank in your `.env` file.

To enable Strava:
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

## Upgrading

1. Download the new release from the [Releases](../../releases) page and extract it to a new folder
2. Copy your `.env` file from the old folder to the new one
3. Copy your `data/` folder from the old folder to the new one — this contains your database
4. Start the new version: `node --env-file=.env dist/index.js`

Your athlete profiles, training plans, and activity history are all stored in `data/ai_coach.db`.
As long as you carry that file across, nothing is lost.

## Disclaimer

AI Coach uses large language models to generate training plans and coaching advice. The output
is intended as a starting point and a coaching aid — **not a substitute for professional advice
from a certified coach, physician, or physiotherapist**.

Always use your own judgement before following any training recommendation. If you have a medical
condition, injury, or health concern, consult a qualified professional before starting or
modifying a training programme. Training loads, intensities, and race strategies suggested by
the AI should be treated as guidelines and adjusted to your individual circumstances.
