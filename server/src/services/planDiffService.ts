import { db } from '../db/client.js'
import { dailyWorkouts, weeklyBlocks, trainingPlans } from '../db/schema.js'
import { eq, and, gte, lte } from 'drizzle-orm'
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
  const plan = db
    .select()
    .from(trainingPlans)
    .where(eq(trainingPlans.athleteId, athleteId))
    .get()

  const plannedWorkoutsByDate: Record<string, typeof dailyWorkouts.$inferSelect> = {}

  if (plan) {
    const blocks = db
      .select()
      .from(weeklyBlocks)
      .where(
        and(
          eq(weeklyBlocks.trainingPlanId, plan.id),
          gte(weeklyBlocks.endDate, startDate),
          lte(weeklyBlocks.startDate, endDate)
        )
      )
      .all()

    for (const block of blocks) {
      const workouts = db
        .select()
        .from(dailyWorkouts)
        .where(
          and(
            eq(dailyWorkouts.weeklyBlockId, block.id),
            gte(dailyWorkouts.workoutDate, startDate),
            lte(dailyWorkouts.workoutDate, endDate)
          )
        )
        .all()

      for (const w of workouts) {
        plannedWorkoutsByDate[w.workoutDate] = w
      }
    }
  }

  const activities = getActivitiesByDateRange(athleteId, startDate, endDate)
  const activitiesByDate: Record<string, typeof activities> = {}
  for (const a of activities) {
    if (!activitiesByDate[a.activityDate]) activitiesByDate[a.activityDate] = []
    activitiesByDate[a.activityDate].push(a)
  }

  const days: DayComparisonDto[] = []
  let current = startDate

  while (current <= endDate) {
    const workout = plannedWorkoutsByDate[current]
    const dayActivities = activitiesByDate[current] ?? []

    const actualKm = dayActivities.reduce(
      (sum, a) => sum + (a.distanceM ? a.distanceM / 1000 : 0),
      0
    )
    const actualVertM = dayActivities.reduce(
      (sum, a) => sum + (a.totalElevationM ?? 0),
      0
    )
    const plannedKm = workout?.plannedKm ?? 0

    const activitySummaries: ActualActivitySummary[] = dayActivities.map((a) => ({
      id: a.id,
      stravaId: a.stravaId,
      name: a.name ?? null,
      sportType: a.sportType ?? null,
      distanceKm: a.distanceM ? Math.round((a.distanceM / 1000) * 100) / 100 : 0,
      movingTimeS: a.movingTimeS ?? null,
      totalElevationM: a.totalElevationM ?? null,
    }))

    days.push({
      date: current,
      dayOfWeek: workout?.dayOfWeek ?? null,
      plannedWorkoutType: workout?.workoutType ?? null,
      plannedDescription: workout?.description ?? null,
      plannedKm: workout?.plannedKm ?? null,
      plannedVertM: workout?.plannedVertM ?? null,
      isRestDay: workout?.isRestDay ?? false,
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
    totalPlannedKm > 0
      ? Math.min((totalActualKm / totalPlannedKm) * 100, 200)
      : 0

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
