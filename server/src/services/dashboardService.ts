import { queryRows, queryOne } from '../db/client.js'
import { getActivitiesByDateRange } from './stravaActivityService.js'
import type { DashboardSummaryDto, WeekAdherenceDto } from '../types/index.js'

function buildDashboard(planId: number, athleteId: number): DashboardSummaryDto {
  const weeks = queryRows(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? ORDER BY week_number',
    [planId]
  )
  const today = new Date().toISOString().substring(0, 10)

  const weekAdherences: WeekAdherenceDto[] = weeks.map((week) => {
    const activities = getActivitiesByDateRange(
      athleteId,
      week.start_date as string,
      week.end_date as string
    )

    const actualKm = activities.reduce(
      (sum, a) => sum + (a.distance_m ? (a.distance_m as number) / 1000 : 0),
      0
    )
    const actualVertM = activities.reduce(
      (sum, a) => sum + ((a.total_elevation_m as number | null) ?? 0),
      0
    )
    const plannedKm = (week.planned_km as number | null) ?? 0
    const plannedVertM = (week.planned_vert_m as number | null) ?? 0

    const adherence = plannedKm > 0 ? Math.min((actualKm / plannedKm) * 100, 200) : 0

    const startDate = week.start_date as string
    const endDate = week.end_date as string
    const isCurrentWeek = today >= startDate && today <= endDate
    const isFutureWeek = today < startDate

    return {
      weekNumber: week.week_number as number,
      phase: (week.phase as string | null) ?? null,
      startDate,
      endDate,
      plannedKm,
      actualKm: Math.round(actualKm * 100) / 100,
      plannedVertM,
      actualVertM: Math.round(actualVertM * 10) / 10,
      adherencePercent: Math.round(adherence * 10) / 10,
      activityCount: activities.length,
      isCurrentWeek,
      isFutureWeek,
    }
  })

  const currentWeekNumber =
    weekAdherences.find((w) => w.isCurrentWeek)?.weekNumber ?? null
  const totalPlannedKm = weekAdherences
    .filter((w) => !w.isFutureWeek)
    .reduce((sum, w) => sum + w.plannedKm, 0)
  const totalActualKm = weekAdherences.reduce((sum, w) => sum + w.actualKm, 0)

  return {
    weeks: weekAdherences,
    currentWeekNumber,
    totalPlannedKm: Math.round(totalPlannedKm * 100) / 100,
    totalActualKm: Math.round(totalActualKm * 100) / 100,
  }
}

export function getDashboardSummary(): DashboardSummaryDto {
  const plan = queryOne('SELECT * FROM training_plans ORDER BY id LIMIT 1')
  if (!plan) return { weeks: [], currentWeekNumber: null, totalPlannedKm: 0, totalActualKm: 0 }
  return buildDashboard(plan.id as number, (plan.athlete_id as number | null) ?? 0)
}

export function getDashboardSummaryForAthlete(athleteId: number): DashboardSummaryDto {
  const plan = queryOne('SELECT * FROM training_plans WHERE athlete_id = ? LIMIT 1', [athleteId])
  if (!plan) return { weeks: [], currentWeekNumber: null, totalPlannedKm: 0, totalActualKm: 0 }
  return buildDashboard(plan.id as number, athleteId)
}
