# AI Coach

A personalised AI coaching platform powered by Claude where an AI agent acts as a personal
coach: it interviews athletes, generates periodized training plans, and tracks week-by-week
adherence. It works with Claude Desktop and Claude Code. intervals.icu integration is
optional — it allows the coach to pull your training history automatically, but the app
works fully without it.

> **Strava integration deprecated.** Strava now requires a paid API subscription for
> third-party apps. This feature has been removed. Use intervals.icu instead (see setup
> instructions below).

## Requirements

- Node.js 18 or later
- Claude Desktop or Claude Code

No native dependencies — works on macOS, Linux, and Windows.

## Download

Download the latest release from the [Releases](../../releases) page and extract it to a folder of your choice.

## Setup

> **Note:** All commands below must be run from inside the extracted folder.
> For example, if you extracted to `C:\ai-coach` (Windows) or `~/ai-coach` (macOS/Linux),
> open a terminal in that folder before running any of the following commands.

### 1. Connect intervals.icu (optional)

intervals.icu integration lets the coach import your training history automatically, skipping
most of the manual fitness questions during onboarding. The app works fully without it.

**Per-athlete credentials (recommended):** No server-side configuration required — credentials
are entered per-athlete directly in the app's Settings page.

1. Go to https://intervals.icu/settings
2. Under **API Access**, note your **Athlete ID** (starts with `i`, e.g. `i12345`) and **API Key**
3. Open the athlete's **Settings** tab in the app and enter these under **intervals.icu Connection**

**Global credentials (optional):** You can also set `INTERVALS_ICU_ATHLETE_ID` and
`INTERVALS_ICU_API_KEY` in your `.env` file as a server-level fallback. This lets the coach
sync activities immediately after creating a new athlete, before per-athlete credentials are
entered in the UI. Per-athlete credentials always take priority over these global values.

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

The `.env` file has sensible defaults. No changes are required unless you want to set
intervals.icu global credentials or change the server ports.

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
