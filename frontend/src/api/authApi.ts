import axiosClient from './axiosClient'

export const authApi = {
  getStatus: () => axiosClient.get<{ connected: boolean; athleteId?: number }>('/auth/strava/status').then(r => r.data),
  refreshToken: () => axiosClient.post('/auth/strava/refresh').then(r => r.data),
}
