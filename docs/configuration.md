# Configuration

All configuration is passed via environment variables. Copy `.env.example` to `.env` to get started.

```bash
cp .env.example .env
```

## Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `POSTGRES_DB` | No | `ai_coach` | Database name |
| `POSTGRES_USER` | No | `ai_coach_user` | Database user |
| `POSTGRES_PASSWORD` | **Yes** | — | Database password — change this |
| `STRAVA_CLIENT_ID` | **Yes** | — | From https://www.strava.com/settings/api |
| `STRAVA_CLIENT_SECRET` | **Yes** | — | From https://www.strava.com/settings/api |
| `STRAVA_REDIRECT_URI` | No | `http://localhost/api/auth/strava/callback` | Must match Strava app settings |
| `ALLOWED_ORIGINS` | No | `http://localhost` | CORS allowed origins (comma-separated) |
| `FRONTEND_BASE_URL` | No | `http://localhost` | Base URL used in OAuth post-callback redirect |

## Strava redirect URI

The value must match the callback URL registered in your Strava application settings.

| Mode | `STRAVA_REDIRECT_URI` |
|---|---|
| Docker (`docker compose up`) | `http://localhost/api/auth/strava/callback` |
| Bare-metal dev | `http://localhost:8080/api/auth/strava/callback` |
