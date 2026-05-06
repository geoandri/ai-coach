import type { FastifyInstance } from 'fastify'
import * as trainingPlanService from '../services/trainingPlanService.js'

export async function legacyRoutes(app: FastifyInstance) {
  app.get('/api/plan', async (_request, reply) => {
    const plan = await trainingPlanService.getFirstPlan()
    if (!plan) return reply.code(404).send({ error: 'No plan found' })
    return plan
  })

  app.get<{ Params: { n: string } }>('/api/plan/week/:n', async (request, reply) => {
    const week = await trainingPlanService.getFirstPlanWeek(Number(request.params.n))
    if (!week) return reply.code(404).send({ error: 'Week not found' })
    return week
  })
}
