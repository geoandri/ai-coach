import axiosClient from './axiosClient'
import { TrainingPlan, WeeklyBlock } from '../types/plan'

export const planApi = {
  getFullPlan: () => axiosClient.get<TrainingPlan>('/plan').then(r => r.data),
  getWeek: (n: number) => axiosClient.get<WeeklyBlock>(`/plan/week/${n}`).then(r => r.data),
}
