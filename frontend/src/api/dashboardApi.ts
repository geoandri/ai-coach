import axiosClient from './axiosClient'
import { DashboardSummary } from '../types/dashboard'

export const dashboardApi = {
  getSummary: () => axiosClient.get<DashboardSummary>('/dashboard/summary').then(r => r.data),
}
