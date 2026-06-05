import type { FastifyInstance } from 'fastify'
import * as athleteService from '../services/athleteService.js'
import * as trainingPlanService from '../services/trainingPlanService.js'
import * as planDiffService from '../services/planDiffService.js'
import * as pdfExportService from '../services/pdfExportService.js'
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

  // ── Activities ────────────────────────────────────────────────────────────
  app.get<{
    Params: { id: string }
    Querystring: { afterDate?: string }
  }>('/api/athletes/:id/activities/sync', async (request) => {
    const internalAthleteId = Number(request.params.id)
    const { afterDate } = request.query
    const result = await intervalsIcuService.syncActivitiesForAthlete(internalAthleteId, afterDate)
    if (result.syncedCount >= 0 && intervalsIcuService.hasEnvCredentials()) {
      athleteService.enableIntervalsIcu(internalAthleteId)
    }
    return result
  })

  app.get<{
    Params: { id: string }
    Querystring: { page?: string; size?: string }
  }>('/api/athletes/:id/activities', async (request) => {
    const internalAthleteId = Number(request.params.id)
    const page = Number(request.query.page ?? 0)
    const size = Number(request.query.size ?? 20)
    return intervalsIcuService.getActivitiesForAthlete(internalAthleteId, page, size)
  })

  // ── intervals.icu ─────────────────────────────────────────────────────────

  // Connect using server env credentials — no form input required (mirrors Strava one-click connect)
  app.post<{ Params: { id: string } }>(
    '/api/athletes/:id/auth/intervals-icu/connect-env',
    async (request, reply) => {
      const internalAthleteId = Number(request.params.id)
      const env = intervalsIcuService.getEnvCredentials()
      if (!env) {
        return reply.code(400).send({ error: 'No intervals.icu credentials configured. Set INTERVALS_ICU_ATHLETE_ID and INTERVALS_ICU_API_KEY in .env.' })
      }
      let valid: boolean
      try {
        valid = await intervalsIcuService.validateCredentials(env.athleteId, env.apiKey)
      } catch {
        return reply.code(502).send({ error: 'Failed to reach intervals.icu API' })
      }
      if (!valid) {
        return reply.code(401).send({ error: 'Invalid intervals.icu credentials in .env' })
      }
      intervalsIcuService.upsertToken(env.athleteId, env.apiKey, internalAthleteId)
      athleteService.linkIntervalsIcuAthlete(internalAthleteId, env.athleteId)
      return { connected: true, intervalsAthleteId: env.athleteId }
    }
  )

  // Connect with explicit credentials (admin/advanced use)
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
      const envAvailable = intervalsIcuService.hasEnvCredentials()
      if (connected) {
        const token = intervalsIcuService.getTokenForAthlete(internalAthleteId)
        return { connected: true, intervalsAthleteId: token?.athlete_id ?? null, envAvailable }
      }
      return { connected: false, envAvailable }
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
