import { vi } from 'vitest'
import type { AiCoachClient } from '../../client.js'

export function createMockClient(): AiCoachClient {
  return {
    listAthletes: vi.fn(),
    getAthlete: vi.fn(),
    createAthlete: vi.fn(),
    updateAthlete: vi.fn(),
    addCoachNote: vi.fn(),
    getTrainingPlan: vi.fn(),
    getTrainingPlanSummary: vi.fn(),
    createTrainingPlan: vi.fn(),
    deleteTrainingPlan: vi.fn(),
    getWeekDetail: vi.fn(),
    updateWeek: vi.fn(),
    getPlanVsActual: vi.fn(),
    getDashboardSummary: vi.fn(),
    syncActivities: vi.fn(),
    connectIntervalsIcu: vi.fn(),
    disconnectIntervalsIcu: vi.fn(),
    getIntervalsIcuStatus: vi.fn(),
  } as unknown as AiCoachClient
}
