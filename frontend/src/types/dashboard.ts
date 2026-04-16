export interface WeekAdherence {
  weekNumber: number
  phase: string | null
  startDate: string
  endDate: string
  plannedKm: number
  actualKm: number
  plannedVertM: number
  actualVertM: number
  adherencePercent: number
  activityCount: number
  isCurrentWeek: boolean
  isFutureWeek: boolean
}

export interface DashboardSummary {
  weeks: WeekAdherence[]
  currentWeekNumber: number | null
  totalPlannedKm: number
  totalActualKm: number
}
