import { http, HttpResponse } from 'msw'
import { Athlete } from '../types/athlete'
import { DashboardSummary } from '../types/dashboard'

export const mockAthlete: Athlete = {
  id: 1,
  name: 'Test Athlete',
  email: 'test@example.com',
  fitnessLevel: 'INTERMEDIATE',
  goalType: 'TARGET_TIME',
  trailAccess: false,
  stravaEnabled: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

export const mockDashboard: DashboardSummary = {
  weeks: [
    {
      weekNumber: 1,
      phase: 'Base Building',
      startDate: '2025-03-03',
      endDate: '2025-03-09',
      plannedKm: 50,
      actualKm: 45,
      plannedVertM: 500,
      actualVertM: 450,
      adherencePercent: 90,
      activityCount: 4,
      isCurrentWeek: false,
      isFutureWeek: false,
    },
  ],
  currentWeekNumber: null,
  totalPlannedKm: 50,
  totalActualKm: 45,
}

export const handlers = [
  http.get('/api/athletes', () => {
    return HttpResponse.json([mockAthlete])
  }),

  http.get('/api/athletes/:id', ({ params }) => {
    return HttpResponse.json({ ...mockAthlete, id: Number(params.id) })
  }),

  http.get('/api/athletes/:id/dashboard/summary', () => {
    return HttpResponse.json(mockDashboard)
  }),

  http.get('/api/athletes/:id/auth/strava/status', () => {
    return HttpResponse.json({ connected: false })
  }),
]
