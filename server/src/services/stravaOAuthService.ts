import axios from 'axios'
import { queryRows, queryOne, run, saveDb } from '../db/client.js'

const CLIENT_ID = process.env.STRAVA_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET ?? ''
const REDIRECT_URI =
  process.env.STRAVA_REDIRECT_URI ?? 'http://localhost:3000/api/auth/strava/callback'
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

interface TokenRow {
  id: number
  athlete_id: number
  athleteId: number
  internal_athlete_id: number | null
  access_token: string
  refresh_token: string
  expires_at: number
  expiresAt: number
  scope: string | null
}

function rowToToken(row: Record<string, unknown>): TokenRow {
  const athlete_id = row.athlete_id as number
  const expires_at = row.expires_at as number
  return {
    id: row.id as number,
    athlete_id,
    athleteId: athlete_id,
    internal_athlete_id: (row.internal_athlete_id as number | null) ?? null,
    access_token: row.access_token as string,
    refresh_token: row.refresh_token as string,
    expires_at,
    expiresAt: expires_at,
    scope: (row.scope as string | null) ?? null,
  }
}

export function buildAuthorizationUrl(internalAthleteId?: number): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  })
  if (internalAthleteId !== undefined) params.set('state', String(internalAthleteId))
  return `${STRAVA_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string) {
  const response = await axios.post(
    STRAVA_TOKEN_URL,
    new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  return upsertToken(response.data as Record<string, unknown>)
}

async function refreshTokenRow(token: TokenRow) {
  const response = await axios.post(
    STRAVA_TOKEN_URL,
    new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  const data = response.data as Record<string, unknown>
  run(
    'UPDATE strava_tokens SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = ? WHERE id = ?',
    [
      data.access_token as string,
      (data.refresh_token as string | undefined) ?? token.refresh_token,
      data.expires_at as number,
      new Date().toISOString(),
      token.id,
    ]
  )
  saveDb()
  const updated = queryOne('SELECT * FROM strava_tokens WHERE id = ?', [token.id])
  return updated ? rowToToken(updated) : null
}

function isExpired(token: TokenRow): boolean {
  return token.expires_at - 300 < Date.now() / 1000
}

export async function getValidToken() {
  const row = queryOne('SELECT * FROM strava_tokens ORDER BY id LIMIT 1')
  if (!row) return null
  const token = rowToToken(row)
  return isExpired(token) ? refreshTokenRow(token) : token
}

export function hasToken(): boolean {
  const row = queryOne('SELECT id FROM strava_tokens LIMIT 1')
  return row != null
}

export async function getValidTokenForAthlete(internalAthleteId: number) {
  const row = queryOne('SELECT * FROM strava_tokens WHERE internal_athlete_id = ?', [
    internalAthleteId,
  ])
  if (!row) return null
  const token = rowToToken(row)
  return isExpired(token) ? refreshTokenRow(token) : token
}

export function hasTokenForAthlete(internalAthleteId: number): boolean {
  const row = queryOne('SELECT id FROM strava_tokens WHERE internal_athlete_id = ?', [
    internalAthleteId,
  ])
  return row != null
}

function upsertToken(data: Record<string, unknown>) {
  const athlete = data.athlete as Record<string, unknown> | undefined
  const stravaAthleteId = Number((athlete?.id as number | undefined) ?? 0)
  if (!stravaAthleteId) throw new Error('No athlete id in Strava response')

  const accessToken = data.access_token as string
  const refreshToken = data.refresh_token as string
  const expiresAt = data.expires_at as number
  const scope = (data.scope as string | undefined) ?? null
  const now = new Date().toISOString()

  const existing = queryOne('SELECT * FROM strava_tokens WHERE athlete_id = ?', [stravaAthleteId])
  if (existing) {
    run(
      'UPDATE strava_tokens SET access_token = ?, refresh_token = ?, expires_at = ?, scope = ?, updated_at = ? WHERE id = ?',
      [accessToken, refreshToken, expiresAt, scope, now, existing.id as number]
    )
  } else {
    run(
      'INSERT INTO strava_tokens (athlete_id, access_token, refresh_token, expires_at, scope, created_at, updated_at) VALUES (?,?,?,?,?,?,?)',
      [stravaAthleteId, accessToken, refreshToken, expiresAt, scope, now, now]
    )
  }
  saveDb()
  return { athleteId: stravaAthleteId, accessToken, refreshToken, expiresAt, scope }
}

export function linkTokenToAthlete(stravaAthleteId: number, internalAthleteId: number) {
  const token = queryOne('SELECT id FROM strava_tokens WHERE athlete_id = ?', [stravaAthleteId])
  if (!token) return
  const athlete = queryOne('SELECT id FROM athletes WHERE id = ?', [internalAthleteId])
  if (!athlete) return
  run('UPDATE strava_tokens SET internal_athlete_id = ?, updated_at = ? WHERE id = ?', [
    internalAthleteId,
    new Date().toISOString(),
    token.id as number,
  ])
  saveDb()
}
