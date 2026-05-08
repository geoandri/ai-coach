export interface ActualActivitySummary {
  id: number
  stravaId: number
  name?: string
  sportType?: string
  distanceKm: number
  movingTimeS?: number
  totalElevationM?: number
}

export interface DayComparisonDto {
  date: string
  dayOfWeek?: string
  plannedWorkoutType?: string
  plannedDescription?: string
  plannedKm?: number
  plannedVertM?: number
  isRestDay: boolean
  activities: ActualActivitySummary[]
  actualKm: number
  actualVertM: number
  kmDiff: number
  hasActivity: boolean
}

export interface PlanVsActualDto {
  athleteId: number
  startDate: string
  endDate: string
  days: DayComparisonDto[]
  totalPlannedKm: number
  totalActualKm: number
  adherencePercent: number
}
