import axios from 'axios'
import { db } from '../db/client.js'
import { stravaTokens, athletes } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const CLIENT_ID = process.env.STRAVA_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET ?? ''
const REDIRECT_URI =
  process.env.STRAVA_REDIRECT_URI ?? 'http://localhost:3000/api/auth/strava/callback'
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

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
  const response = await axios.post(STRAVA_TOKEN_URL, new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  return upsertToken(response.data as Record<string, unknown>)
}

async function refreshTokenRow(token: typeof stravaTokens.$inferSelect) {
  const response = await axios.post(STRAVA_TOKEN_URL, new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: token.refreshToken,
    grant_type: 'refresh_token',
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

  const data = response.data as Record<string, unknown>
  return db.update(stravaTokens).set({
    accessToken: data.access_token as string,
    refreshToken: (data.refresh_token as string | undefined) ?? token.refreshToken,
    expiresAt: data.expires_at as number,
    updatedAt: new Date().toISOString(),
  }).where(eq(stravaTokens.id, token.id)).returning().get()
}

function isExpired(token: typeof stravaTokens.$inferSelect): boolean {
  return token.expiresAt - 300 < Date.now() / 1000
}

export async function getValidToken() {
  const tokens = await db.select().from(stravaTokens).all()
  const token = tokens.sort((a, b) => a.id - b.id)[0]
  if (!token) return null
  return isExpired(token) ? refreshTokenRow(token) : token
}

export async function hasToken(): Promise<boolean> {
  const tokens = await db.select().from(stravaTokens).all()
  return tokens.length > 0
}

export async function getValidTokenForAthlete(internalAthleteId: number) {
  const token = await db.select().from(stravaTokens).where(eq(stravaTokens.internalAthleteId, internalAthleteId)).get()
  if (!token) return null
  return isExpired(token) ? refreshTokenRow(token) : token
}

export async function hasTokenForAthlete(internalAthleteId: number): Promise<boolean> {
  const token = await db.select().from(stravaTokens).where(eq(stravaTokens.internalAthleteId, internalAthleteId)).get()
  return token != null
}

async function upsertToken(data: Record<string, unknown>) {
  const athlete = data.athlete as Record<string, unknown> | undefined
  const stravaAthleteId = Number((athlete?.id as number | undefined) ?? 0)
  if (!stravaAthleteId) throw new Error('No athlete id in Strava response')

  const accessToken = data.access_token as string
  const refreshToken = data.refresh_token as string
  const expiresAt = data.expires_at as number
  const scope = (data.scope as string | undefined) ?? null
  const now = new Date().toISOString()

  const existing = await db.select().from(stravaTokens).where(eq(stravaTokens.athleteId, stravaAthleteId)).get()
  if (existing) {
    await db.update(stravaTokens).set({ accessToken, refreshToken, expiresAt, scope, updatedAt: now })
      .where(eq(stravaTokens.id, existing.id)).run()
  } else {
    await db.insert(stravaTokens).values({ athleteId: stravaAthleteId, accessToken, refreshToken, expiresAt, scope, createdAt: now, updatedAt: now }).run()
  }
  return { athleteId: stravaAthleteId, accessToken, refreshToken, expiresAt, scope }
}

export async function linkTokenToAthlete(stravaAthleteId: number, internalAthleteId: number) {
  const token = await db.select().from(stravaTokens).where(eq(stravaTokens.athleteId, stravaAthleteId)).get()
  if (!token) return
  const athlete = await db.select().from(athletes).where(eq(athletes.id, internalAthleteId)).get()
  if (!athlete) return
  await db.update(stravaTokens).set({ internalAthleteId, updatedAt: new Date().toISOString() })
    .where(eq(stravaTokens.id, token.id)).run()
}
