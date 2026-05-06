import { queryRows } from '../db/client.js'
import { getActivitiesByDateRange } from './stravaActivityService.js'
import type {
  PlanVsActualDto,
  DayComparisonDto,
  ActualActivitySummary,
} from '../types/index.js'

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().substring(0, 10)
}

export function getPlanVsActual(
  athleteId: number,
  startDate: string,
  endDate: string
): PlanVsActualDto {
  const plans = queryRows('SELECT id FROM training_plans WHERE athlete_id = ?', [athleteId])
  const plan = plans[0]

  const plannedWorkoutsByDate: Record<string, Record<string, unknown>> = {}

  if (plan) {
    const blocks = queryRows(
      `SELECT id FROM weekly_blocks
       WHERE training_plan_id = ?
         AND end_date >= ?
         AND start_date <= ?`,
      [plan.id as number, startDate, endDate]
    )

    for (const block of blocks) {
      const workouts = queryRows(
        `SELECT * FROM daily_workouts
         WHERE weekly_block_id = ?
           AND workout_date >= ?
           AND workout_date <= ?`,
        [block.id as number, startDate, endDate]
      )
      for (const w of workouts) {
        plannedWorkoutsByDate[w.workout_date as string] = w
      }
    }
  }

  const activities = getActivitiesByDateRange(athleteId, startDate, endDate)
  const activitiesByDate: Record<string, Record<string, unknown>[]> = {}
  for (const a of activities) {
    const date = a.activity_date as string
    if (!activitiesByDate[date]) activitiesByDate[date] = []
    activitiesByDate[date].push(a)
  }

  const days: DayComparisonDto[] = []
  let current = startDate

  while (current <= endDate) {
    const workout = plannedWorkoutsByDate[current]
    const dayActivities = activitiesByDate[current] ?? []

    const actualKm = dayActivities.reduce(
      (sum, a) => sum + (a.distance_m ? (a.distance_m as number) / 1000 : 0),
      0
    )
    const actualVertM = dayActivities.reduce(
      (sum, a) => sum + ((a.total_elevation_m as number | null) ?? 0),
      0
    )
    const plannedKm = (workout?.planned_km as number | null) ?? 0

    const activitySummaries: ActualActivitySummary[] = dayActivities.map((a) => ({
      id: a.id as number,
      stravaId: a.strava_id as number,
      name: (a.name as string | null) ?? null,
      sportType: (a.sport_type as string | null) ?? null,
      distanceKm: a.distance_m
        ? Math.round(((a.distance_m as number) / 1000) * 100) / 100
        : 0,
      movingTimeS: (a.moving_time_s as number | null) ?? null,
      totalElevationM: (a.total_elevation_m as number | null) ?? null,
    }))

    days.push({
      date: current,
      dayOfWeek: (workout?.day_of_week as string | null) ?? null,
      plannedWorkoutType: (workout?.workout_type as string | null) ?? null,
      plannedDescription: (workout?.description as string | null) ?? null,
      plannedKm: (workout?.planned_km as number | null) ?? null,
      plannedVertM: (workout?.planned_vert_m as number | null) ?? null,
      isRestDay: Boolean(workout?.is_rest_day),
      activities: activitySummaries,
      actualKm: Math.round(actualKm * 100) / 100,
      actualVertM: Math.round(actualVertM * 10) / 10,
      kmDiff: Math.round((actualKm - plannedKm) * 100) / 100,
      hasActivity: dayActivities.length > 0,
    })

    current = addDays(current, 1)
  }

  const totalPlannedKm = days.reduce((sum, d) => sum + (d.plannedKm ?? 0), 0)
  const totalActualKm = days.reduce((sum, d) => sum + d.actualKm, 0)
  const adherencePercent =
    totalPlannedKm > 0 ? Math.min((totalActualKm / totalPlannedKm) * 100, 200) : 0

  return {
    athleteId,
    startDate,
    endDate,
    days,
    totalPlannedKm: Math.round(totalPlannedKm * 100) / 100,
    totalActualKm: Math.round(totalActualKm * 100) / 100,
    adherencePercent: Math.round(adherencePercent * 10) / 10,
  }
}
