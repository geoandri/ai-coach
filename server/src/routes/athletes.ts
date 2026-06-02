import type { FastifyInstance } from 'fastify'
import * as athleteService from '../services/athleteService.js'
import * as trainingPlanService from '../services/trainingPlanService.js'
import * as planDiffService from '../services/planDiffService.js'
import * as pdfExportService from '../services/pdfExportService.js'
import * as stravaOAuthService from '../services/stravaOAuthService.js'
import * as stravaActivityService from '../services/stravaActivityService.js'
import * as intervalsIcuService from '../services/intervalsIcuService.js'
import * as dashboardService from '../services/dashboardService.js'
import type {
  CreateAthleteRequest,
  UpdateAthleteRequest,
  AddCoachNoteRequest,
  CreateTrainingPlanRequest,
  UpdateWeekRequest,
  ConnectIntervalsIcuRequest,
} from '../types/index.js'

export async function athleteRoutes(app: FastifyInstance) {
  // ── CRUD ──────────────────────────────────────────────────────────────────
  app.post<{ Body: CreateAthleteRequest }>('/api/athletes', async (request, reply) => {
    const athlete = athleteService.createAthlete(request.body)
    return reply.code(201).send(athlete)
  })

  app.get('/api/athletes', async () => {
    return athleteService.listAthletes()
  })

  app.get<{ Params: { id: string } }>('/api/athletes/:id', async (request, reply) => {
    const athlete = athleteService.getAthlete(Number(request.params.id))
    if (!athlete) return reply.code(404).send({ error: 'Athlete not found' })
    return athlete
  })

  app.put<{ Params: { id: string }; Body: UpdateAthleteRequest }>(
    '/api/athletes/:id',
    async (request, reply) => {
      const athlete = athleteService.updateAthlete(Number(request.params.id), request.body)
      if (!athlete) return reply.code(404).send({ error: 'Athlete not found' })
      return athlete
    }
  )

  app.delete<{ Params: { id: string } }>('/api/athletes/:id', async (request, reply) => {
    const ok = athleteService.deleteAthlete(Number(request.params.id))
    if (!ok) return reply.code(404).send({ error: 'Athlete not found' })
    return reply.code(204).send()
  })

  // ── Coach Notes ───────────────────────────────────────────────────────────
  app.post<{ Params: { id: string }; Body: AddCoachNoteRequest }>(
    '/api/athletes/:id/coach-notes',
    async (request, reply) => {
      const athlete = athleteService.addCoachNote(
        Number(request.params.id),
        request.body.note
      )
      if (!athlete) return reply.code(404).send({ error: 'Athlete not found' })
      return athlete
    }
  )

  // ── Training Plan ─────────────────────────────────────────────────────────
  app.post<{ Params: { id: string }; Body: CreateTrainingPlanRequest }>(
    '/api/athletes/:id/training-plan',
    async (request, reply) => {
      const result = trainingPlanService.createPlanForAthlete(
        Number(request.params.id),
        request.body
      )
      if ('error' in result) return reply.code(result.status).send({ error: result.error })
      return reply.code(201).send(result)
    }
  )

  app.get<{ Params: { id: string } }>(
    '/api/athletes/:id/training-plan',
    async (request, reply) => {
      const plan = trainingPlanService.getPlanForAthlete(Number(request.params.id))
      if (!plan) return reply.code(404).send({ error: 'No training plan found' })
      return plan
    }
  )

  app.get<{ Params: { id: string } }>(
    '/api/athletes/:id/training-plan/summary',
    async (request, reply) => {
      const plan = trainingPlanService.getPlanSummaryForAthlete(Number(request.params.id))
      if (!plan) return reply.code(404).send({ error: 'No training plan found' })
      return plan
    }
  )

  app.delete<{ Params: { id: string; planId: string } }>(
    '/api/athletes/:id/training-plans/:planId',
    async (request, reply) => {
      const ok = trainingPlanService.deletePlanForAthlete(
        Number(request.params.id),
        Number(request.params.planId)
      )
      if (!ok) return reply.code(404).send({ error: 'Plan not found' })
      return reply.code(204).send()
    }
  )

  app.get<{ Params: { id: string; weekNumber: string } }>(
    '/api/athletes/:id/training-plan/week/:weekNumber',
    async (request, reply) => {
      const week = trainingPlanService.getWeekForAthlete(
        Number(request.params.id),
        Number(request.params.weekNumber)
      )
      if (!week) return reply.code(404).send({ error: 'Week not found' })
      return week
    }
  )

  app.patch<{ Params: { id: string; weekNumber: string }; Body: UpdateWeekRequest }>(
    '/api/athletes/:id/training-plan/weeks/:weekNumber',
    async (request, reply) => {
      const result = trainingPlanService.updateWeekForAthlete(
        Number(request.params.id),
        Number(request.params.weekNumber),
        request.body
      )
      if ('error' in result) return reply.code(result.status).send({ error: result.error })
      return result
    }
  )

  // ── PDF Export ────────────────────────────────────────────────────────────
  app.get<{ Params: { id: string; planId: string } }>(
    '/api/athletes/:id/training-plans/:planId/export/pdf/full',
    async (request, reply) => {
      const pdf = await pdfExportService.generateFullPdf(
        Number(request.params.id),
        Number(request.params.planId)
      )
      if (!pdf) return reply.code(404).send({ error: 'Plan not found' })
      return reply
        .code(200)
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename="training-plan-full.pdf"')
        .send(pdf)
    }
  )

  // ── Plan vs Actual ────────────────────────────────────────────────────────
  app.get<{
    Params: { id: string }
    Querystring: { startDate: string; endDate: string }
  }>('/api/athletes/:id/plan-vs-actual', async (request, reply) => {
    const { startDate, endDate } = request.query
    if (!startDate || !endDate) {
      return reply.code(400).send({ error: 'startDate and endDate are required' })
    }
    return planDiffService.getPlanVsActual(Number(request.params.id), startDate, endDate)
  })

  // ── Strava ────────────────────────────────────────────────────────────────
  app.get<{ Params: { id: string } }>(
    '/api/athletes/:id/auth/strava',
    async (request, reply) => {
      const url = stravaOAuthService.buildAuthorizationUrl(Number(request.params.id))
      return reply.code(302).header('Location', url).send()
    }
  )

  app.get<{ Params: { id: string } }>(
    '/api/athletes/:id/auth/strava/status',
    async (request) => {
      const id = Number(request.params.id)
      const hasToken = stravaOAuthService.hasTokenForAthlete(id)
      if (hasToken) {
        const token = await stravaOAuthService.getValidTokenForAthlete(id)
        return { connected: true, stravaAthleteId: token?.athleteId ?? 0 }
      }
      return { connected: false }
    }
  )

  app.get<{
    Params: { id: string }
    Querystring: { afterDate?: string; provider?: string }
  }>('/api/athletes/:id/activities/sync', async (request) => {
    const internalAthleteId = Number(request.params.id)
    const { afterDate, provider } = request.query

    const stravaConnected = stravaOAuthService.hasTokenForAthlete(internalAthleteId)
    const intervalsConnected = intervalsIcuService.hasTokenForAthlete(internalAthleteId)

    if (provider === 'intervals_icu') {
      return intervalsIcuService.syncActivitiesForAthlete(internalAthleteId, afterDate)
    }
    if (provider === 'strava') {
      return stravaActivityService.syncActivitiesForAthlete(internalAthleteId, afterDate)
    }
    if (stravaConnected && intervalsConnected) {
      return {
        syncedCount: 0,
        message: 'Multiple providers active. Specify ?provider=strava or ?provider=intervals_icu',
      }
    }
    if (intervalsConnected) {
      return intervalsIcuService.syncActivitiesForAthlete(internalAthleteId, afterDate)
    }
    return stravaActivityService.syncActivitiesForAthlete(internalAthleteId, afterDate)
  })

  app.get<{
    Params: { id: string }
    Querystring: { page?: string; size?: string }
  }>('/api/athletes/:id/activities', async (request) => {
    const internalAthleteId = Number(request.params.id)
    const page = Number(request.query.page ?? 0)
    const size = Number(request.query.size ?? 20)

    const stravaPage = stravaActivityService.getActivitiesForAthlete(internalAthleteId, 0, 10000)
    const intervalsPage = intervalsIcuService.getActivitiesForAthlete(internalAthleteId, 0, 10000)

    const combined = [...stravaPage.content, ...intervalsPage.content].sort(
      (a, b) => b.activityDate.localeCompare(a.activityDate)
    )
    const totalElements = combined.length
    const totalPages = Math.ceil(totalElements / size)
    const content = combined.slice(page * size, page * size + size)
    return { content, totalElements, totalPages, number: page, size }
  })

  // ── intervals.icu ─────────────────────────────────────────────────────────
  app.post<{ Params: { id: string }; Body: ConnectIntervalsIcuRequest }>(
    '/api/athletes/:id/auth/intervals-icu',
    async (request, reply) => {
      const internalAthleteId = Number(request.params.id)
      const { athleteId, apiKey } = request.body
      if (!athleteId || !apiKey) {
        return reply.code(400).send({ error: 'athleteId and apiKey are required' })
      }
      let valid: boolean
      try {
        valid = await intervalsIcuService.validateCredentials(athleteId, apiKey)
      } catch {
        return reply.code(502).send({ error: 'Failed to reach intervals.icu API' })
      }
      if (!valid) {
        return reply.code(401).send({ error: 'Invalid intervals.icu credentials' })
      }
      intervalsIcuService.upsertToken(athleteId, apiKey, internalAthleteId)
      athleteService.linkIntervalsIcuAthlete(internalAthleteId, athleteId)
      return { connected: true, intervalsAthleteId: athleteId }
    }
  )

  app.delete<{ Params: { id: string } }>(
    '/api/athletes/:id/auth/intervals-icu',
    async (request, reply) => {
      const internalAthleteId = Number(request.params.id)
      intervalsIcuService.removeToken(internalAthleteId)
      athleteService.unlinkIntervalsIcuAthlete(internalAthleteId)
      return reply.code(204).send()
    }
  )

  app.get<{ Params: { id: string } }>(
    '/api/athletes/:id/auth/intervals-icu/status',
    async (request) => {
      const internalAthleteId = Number(request.params.id)
      const connected = intervalsIcuService.hasTokenForAthlete(internalAthleteId)
      if (connected) {
        const token = intervalsIcuService.getTokenForAthlete(internalAthleteId)
        return { connected: true, intervalsAthleteId: token?.athlete_id ?? null }
      }
      return { connected: false }
    }
  )

  // ── Dashboard ─────────────────────────────────────────────────────────────
  app.get<{ Params: { id: string } }>(
    '/api/athletes/:id/dashboard/summary',
    async (request) => {
      return dashboardService.getDashboardSummaryForAthlete(Number(request.params.id))
    }
  )
}
