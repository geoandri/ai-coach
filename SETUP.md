# Strava Integration — Setup Guide

This document covers everything needed to configure and use the Strava integration in the AI Coach platform.

---

## Prerequisites

- The platform stack is running (see [PLATFORM.md](./PLATFORM.md))
- A Strava account

---

## 1. Create a Strava OAuth Application

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Create a new application and fill in the details
3. Set **Authorization Callback Domain** to `localhost` for local development
4. Note down your **Client ID** and **Client Secret**

---

## 2. Configure Environment Variables

The backend requires the following environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `STRAVA_CLIENT_ID` | Yes | — | Client ID from your Strava app |
| `STRAVA_CLIENT_SECRET` | Yes | — | Client secret from your Strava app |
| `STRAVA_REDIRECT_URI` | No | `http://localhost:8080/api/auth/strava/callback` | OAuth callback URL |

Set them in your shell or add to an `.env` file loaded by your run configuration:

```bash
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
# STRAVA_REDIRECT_URI=http://localhost:8080/api/auth/strava/callback  # only if overriding
```

The backend reads these via `backend/src/main/resources/application.yml`.

---

## 3. Start the Platform

```bash
# Database
docker-compose up -d

# Backend (Liquibase migrations run on startup and create the required tables)
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm run dev
```

The migrations automatically create:
- `strava_tokens` — stores OAuth tokens per athlete
- `strava_activities` — stores synced run data

---

## 4. Connect an Athlete's Strava Account

1. Navigate to `/athletes/:id/settings` in the UI
2. Click **Connect Strava**
3. Approve the request on Strava (scopes: `read`, `activity:read_all`)
4. You are redirected back and the connection status updates to **Connected**

**OAuth flow:**
```
UI → GET /api/athletes/{id}/auth/strava
   → Strava authorization page
   → GET /api/auth/strava/callback (with auth code)
   → Token stored in strava_tokens, linked to athlete
```

---

## 5. Sync Activities

Once connected, activities can be synced in three ways:

**Via the UI:**
- Go to the athlete's Activities page and click **Sync**

**Via the API:**
```
GET /api/athletes/{id}/activities/sync
```

**Via the MCP agent tool:**
```
sync_activities(athleteId)
```

The sync fetches `Run` and `TrailRun` activities from Strava (paginated at 100/page) and stores them in `strava_activities`. Tokens are automatically refreshed when expired (checked with a 5-minute buffer).

---

## API Reference

| Endpoint | Description |
|---|---|
| `GET /api/athletes/{id}/auth/strava` | Start OAuth flow for an athlete |
| `GET /api/athletes/{id}/auth/strava/status` | Check connection status |
| `GET /api/athletes/{id}/activities/sync` | Sync activities for an athlete |
| `GET /api/athletes/{id}/activities` | List synced activities (paginated) |
| `GET /api/auth/strava/callback` | OAuth callback (handled automatically) |
| `POST /api/auth/strava/refresh` | Manually refresh token |
| `GET /api/auth/strava/status` | Global connection status |

---

## MCP Agent Tools

| Tool | Parameters | Description |
|---|---|---|
| `sync_activities` | `athleteId` | Trigger Strava sync for an athlete |
| `get_dashboard_summary` | `athleteId` | Week-by-week adherence data |
| `get_plan_vs_actual` | `athleteId`, `startDate`, `endDate` | Compare planned vs actual workouts |

---

## Data Model

### `strava_tokens`

| Column | Type | Description |
|---|---|---|
| `athlete_id` | Long (unique) | Strava athlete ID |
| `internal_athlete_id` | FK | Links to internal athlete record |
| `access_token` | TEXT | Current access token |
| `refresh_token` | TEXT | Used to obtain new access tokens |
| `expires_at` | Long | Unix timestamp of token expiry |
| `scope` | TEXT | Granted OAuth scopes |

### `strava_activities`

| Column | Type | Description |
|---|---|---|
| `strava_id` | Long (unique) | Strava activity ID |
| `internal_athlete_id` | FK | Links to internal athlete record |
| `sport_type` | String | `Run` or `TrailRun` |
| `activity_date` | Date | Date of the activity |
| `distance_m` | Float | Distance in metres |
| `moving_time_s` | Int | Moving time in seconds |
| `total_elevation_m` | Float | Elevation gain in metres |
| `average_heartrate` | Float | Average heart rate (if available) |
