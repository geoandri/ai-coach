export interface Activity {
  id: number
  stravaId: number
  name: string | null
  sportType: string | null
  activityDate: string
  startDatetime: string | null
  distanceKm: number
  movingTimeS: number | null
  totalElevationM: number | null
  averageHeartrate: number | null
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface SyncResult {
  syncedCount: number
  message: string
}
