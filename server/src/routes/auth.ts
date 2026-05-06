import type { FastifyInstance } from 'fastify'
import * as stravaOAuthService from '../services/stravaOAuthService.js'
import * as athleteService from '../services/athleteService.js'

const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000'

export async function authRoutes(app: FastifyInstance) {
  // Global Strava OAuth redirect
  app.get('/api/auth/strava', async (_request, reply) => {
    const url = stravaOAuthService.buildAuthorizationUrl()
    return reply.code(302).header('Location', url).send()
  })

  // OAuth callback
  app.get<{
    Querystring: { code?: string; error?: string; state?: string }
  }>('/api/auth/strava/callback', async (request, reply) => {
    const { code, error, state } = request.query
    const internalAthleteId = state ? Number(state) : undefined

    const baseRedirect =
      internalAthleteId
        ? `${FRONTEND_BASE_URL}/athletes/${internalAthleteId}`
        : `${FRONTEND_BASE_URL}/settings`

    if (error || !code) {
      return reply
        .code(302)
        .header('Location', `${baseRedirect}?error=strava_denied`)
        .send()
    }

    try {
      const token = await stravaOAuthService.exchangeCodeForToken(code)

      if (internalAthleteId) {
        athleteService.linkStravaAthlete(internalAthleteId, token.athleteId)
        stravaOAuthService.linkTokenToAthlete(token.athleteId, internalAthleteId)
      }

      return reply
        .code(302)
        .header('Location', `${baseRedirect}?connected=true`)
        .send()
    } catch (err) {
      app.log.error(err)
      return reply
        .code(302)
        .header('Location', `${baseRedirect}?error=token_exchange_failed`)
        .send()
    }
  })

  // Refresh token
  app.post('/api/auth/strava/refresh', async () => {
    const token = await stravaOAuthService.getValidToken()
    if (!token) return { success: false, message: 'No token found' }
    return { success: true, athleteId: token.athleteId, expiresAt: token.expiresAt }
  })

  // Status
  app.get('/api/auth/strava/status', async () => {
    const hasToken = stravaOAuthService.hasToken()
    if (hasToken) {
      const token = await stravaOAuthService.getValidToken()
      return {
        connected: true,
        athleteId: token?.athleteId ?? 0,
        expired: token == null,
      }
    }
    return { connected: false }
  })
}
