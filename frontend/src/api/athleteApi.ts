import axiosClient from './axiosClient'
import { Athlete, CreateAthleteRequest } from '../types/athlete'
import { TrainingPlan } from '../types/plan'
import { DashboardSummary } from '../types/dashboard'
import { PagedResponse, SyncResult, Activity } from '../types/activity'
import { PlanVsActualDto } from '../types/planVsActual'

export const athleteApi = {
  // Athletes
  list: () => axiosClient.get<Athlete[]>('/athletes').then(r => r.data),
  get: (id: number) => axiosClient.get<Athlete>(`/athletes/${id}`).then(r => r.data),
  create: (data: CreateAthleteRequest) =>
    axiosClient.post<Athlete>('/athletes', data).then(r => r.data),
  update: (id: number, data: Partial<CreateAthleteRequest>) =>
    axiosClient.put<Athlete>(`/athletes/${id}`, data).then(r => r.data),
  addCoachNote: (id: number, note: string) =>
    axiosClient.post<Athlete>(`/athletes/${id}/coach-notes`, { note }).then(r => r.data),

  // Training Plan
  getPlan: (athleteId: number) =>
    axiosClient.get<TrainingPlan>(`/athletes/${athleteId}/training-plan`).then(r => r.data),
  deletePlan: (athleteId: number, planId: number) =>
    axiosClient.delete(`/athletes/${athleteId}/training-plans/${planId}`),

  // PDF Download
  downloadFullPdf: async (athleteId: number, planId: number) => {
    const response = await axiosClient.get(
      `/athletes/${athleteId}/training-plans/${planId}/export/pdf/full`,
      { responseType: 'blob' }
    )
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'training-plan-full.pdf'
    a.click()
    URL.revokeObjectURL(url)
  },

  // Plan vs Actual
  getPlanVsActual: (athleteId: number, startDate: string, endDate: string) =>
    axiosClient
      .get<PlanVsActualDto>(`/athletes/${athleteId}/plan-vs-actual?startDate=${startDate}&endDate=${endDate}`)
      .then(r => r.data),

  // Dashboard
  getDashboard: (athleteId: number) =>
    axiosClient.get<DashboardSummary>(`/athletes/${athleteId}/dashboard/summary`).then(r => r.data),

  // Strava
  getStravaStatus: (athleteId: number) =>
    axiosClient
      .get<{ connected: boolean; stravaAthleteId?: number }>(`/athletes/${athleteId}/auth/strava/status`)
      .then(r => r.data),
  getStravaConnectUrl: (athleteId: number) => `/api/athletes/${athleteId}/auth/strava`,

  // Activities
  getActivities: (athleteId: number, page = 0, size = 20) =>
    axiosClient
      .get<PagedResponse<Activity>>(`/athletes/${athleteId}/activities?page=${page}&size=${size}`)
      .then(r => r.data),
  syncActivities: (athleteId: number) =>
    axiosClient.get<SyncResult>(`/athletes/${athleteId}/activities/sync`).then(r => r.data),
}
