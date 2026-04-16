import axiosClient from './axiosClient'
import { Activity, PagedResponse, SyncResult } from '../types/activity'

export const activitiesApi = {
  list: (page = 0, size = 20) =>
    axiosClient.get<PagedResponse<Activity>>(`/activities?page=${page}&size=${size}`).then(r => r.data),
  sync: () => axiosClient.get<SyncResult>('/activities/sync').then(r => r.data),
}
