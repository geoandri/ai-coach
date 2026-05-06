import { db } from '../db/client.js'
import { trainingPlans, weeklyBlocks } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { getActivitiesByDateRange } from './stravaActivityService.js'
import type { DashboardSummaryDto, WeekAdherenceDto } from '../types/index.js'

async function buildDashboard(
  planId: number,
  athleteId: number,
): Promise<DashboardSummaryDto> {
  const weeks = (await db
    .select()
    .from(weeklyBlocks)
    .where(eq(weeklyBlocks.trainingPlanId, planId))
    .all())
    .sort((a, b) => a.weekNumber - b.weekNumber)

  const today = new Date().toISOString().substring(0, 10)

  const weekAdherences: WeekAdherenceDto[] = await Promise.all(weeks.map(async (week) => {
    const activities = await getActivitiesByDateRange(athleteId, week.startDate, week.endDate)

    const actualKm =
      activities.reduce((sum, a) => sum + (a.distanceM ? a.distanceM / 1000 : 0), 0)
    const actualVertM = activities.reduce(
      (sum, a) => sum + (a.totalElevationM ?? 0),
      0
    )
    const plannedKm = week.plannedKm ?? 0
    const plannedVertM = week.plannedVertM ?? 0

    const adherence = plannedKm > 0
      ? Math.min((actualKm / plannedKm) * 100, 200)
      : 0

    const isCurrentWeek = today >= week.startDate && today <= week.endDate
    const isFutureWeek = today < week.startDate

    return {
      weekNumber: week.weekNumber,
      phase: week.phase ?? null,
      startDate: week.startDate,
      endDate: week.endDate,
      plannedKm,
      actualKm: Math.round(actualKm * 100) / 100,
      plannedVertM,
      actualVertM: Math.round(actualVertM * 10) / 10,
      adherencePercent: Math.round(adherence * 10) / 10,
      activityCount: activities.length,
      isCurrentWeek,
      isFutureWeek,
    }
  }))

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

export async function getDashboardSummary(): Promise<DashboardSummaryDto> {
  const plans = await db.select().from(trainingPlans).all()
  const plan = plans.sort((a, b) => a.id - b.id)[0]
  if (!plan) return { weeks: [], currentWeekNumber: null, totalPlannedKm: 0, totalActualKm: 0 }

  return buildDashboard(plan.id, plan.athleteId ?? 0)
}

export async function getDashboardSummaryForAthlete(athleteId: number): Promise<DashboardSummaryDto> {
  const plan = await db
    .select()
    .from(trainingPlans)
    .where(eq(trainingPlans.athleteId, athleteId))
    .get()
  if (!plan) return { weeks: [], currentWeekNumber: null, totalPlannedKm: 0, totalActualKm: 0 }

  return buildDashboard(plan.id, athleteId)
}
