import { db } from '../db/client.js'
import { trainingPlans, weeklyBlocks, dailyWorkouts, athletes } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import type {
  TrainingPlanDto,
  TrainingPlanSummaryDto,
  WeeklyBlockDto,
  WeeklyBlockSummaryDto,
  DailyWorkoutDto,
  CreateTrainingPlanRequest,
  UpdateWeekRequest,
} from '../types/index.js'

function workoutToDto(w: typeof dailyWorkouts.$inferSelect): DailyWorkoutDto {
  return {
    id: w.id,
    workoutDate: w.workoutDate,
    dayOfWeek: w.dayOfWeek ?? null,
    workoutType: w.workoutType ?? null,
    description: w.description ?? null,
    plannedKm: w.plannedKm ?? null,
    plannedVertM: w.plannedVertM ?? null,
    isRestDay: w.isRestDay,
    isRaceDay: w.isRaceDay,
  }
}

function weekToDto(
  w: typeof weeklyBlocks.$inferSelect,
  workouts: typeof dailyWorkouts.$inferSelect[]
): WeeklyBlockDto {
  return {
    id: w.id,
    weekNumber: w.weekNumber,
    phase: w.phase ?? null,
    startDate: w.startDate,
    endDate: w.endDate,
    plannedKm: w.plannedKm ?? null,
    plannedVertM: w.plannedVertM ?? null,
    notes: w.notes ?? null,
    workouts: workouts.map(workoutToDto),
  }
}

function weekToSummaryDto(w: typeof weeklyBlocks.$inferSelect): WeeklyBlockSummaryDto {
  return {
    id: w.id,
    weekNumber: w.weekNumber,
    phase: w.phase ?? null,
    startDate: w.startDate,
    endDate: w.endDate,
    plannedKm: w.plannedKm ?? null,
    plannedVertM: w.plannedVertM ?? null,
    notes: w.notes ?? null,
  }
}

async function buildFullPlan(
  plan: typeof trainingPlans.$inferSelect,
  athleteIdOverride?: number
): Promise<TrainingPlanDto> {
  const weeks = (await db.select().from(weeklyBlocks).where(eq(weeklyBlocks.trainingPlanId, plan.id)).all())
    .sort((a, b) => a.weekNumber - b.weekNumber)

  const weekDtos = await Promise.all(weeks.map(async (week) => {
    const workouts = (await db.select().from(dailyWorkouts).where(eq(dailyWorkouts.weeklyBlockId, week.id)).all())
      .sort((a, b) => a.workoutDate.localeCompare(b.workoutDate))
    return weekToDto(week, workouts)
  }))

  return {
    id: plan.id,
    athleteId: athleteIdOverride ?? plan.athleteId ?? 0,
    name: plan.name,
    raceName: plan.raceName ?? null,
    raceDate: plan.raceDate ?? null,
    tuneUpRaceName: plan.tuneUpRaceName ?? null,
    tuneUpRaceDate: plan.tuneUpRaceDate ?? null,
    totalWeeks: plan.totalWeeks,
    weeks: weekDtos,
  }
}

async function buildSummaryPlan(
  plan: typeof trainingPlans.$inferSelect,
  athleteIdOverride?: number
): Promise<TrainingPlanSummaryDto> {
  const weeks = (await db.select().from(weeklyBlocks).where(eq(weeklyBlocks.trainingPlanId, plan.id)).all())
    .sort((a, b) => a.weekNumber - b.weekNumber)

  return {
    id: plan.id,
    athleteId: athleteIdOverride ?? plan.athleteId ?? 0,
    name: plan.name,
    raceName: plan.raceName ?? null,
    raceDate: plan.raceDate ?? null,
    tuneUpRaceName: plan.tuneUpRaceName ?? null,
    tuneUpRaceDate: plan.tuneUpRaceDate ?? null,
    totalWeeks: plan.totalWeeks,
    weeks: weeks.map(weekToSummaryDto),
  }
}

export async function getFirstPlan(): Promise<TrainingPlanDto | null> {
  const plans = await db.select().from(trainingPlans).all()
  const plan = plans.sort((a, b) => a.id - b.id)[0]
  if (!plan) return null
  return buildFullPlan(plan)
}

export async function getFirstPlanWeek(weekNumber: number): Promise<WeeklyBlockDto | null> {
  const plans = await db.select().from(trainingPlans).all()
  const plan = plans.sort((a, b) => a.id - b.id)[0]
  if (!plan) return null

  const week = await db.select().from(weeklyBlocks)
    .where(and(eq(weeklyBlocks.trainingPlanId, plan.id), eq(weeklyBlocks.weekNumber, weekNumber)))
    .get()
  if (!week) return null

  const workouts = (await db.select().from(dailyWorkouts).where(eq(dailyWorkouts.weeklyBlockId, week.id)).all())
    .sort((a, b) => a.workoutDate.localeCompare(b.workoutDate))
  return weekToDto(week, workouts)
}

export async function getPlanForAthlete(athleteId: number): Promise<TrainingPlanDto | null> {
  const plan = await db.select().from(trainingPlans).where(eq(trainingPlans.athleteId, athleteId)).get()
  if (!plan) return null
  return buildFullPlan(plan, athleteId)
}

export async function getPlanSummaryForAthlete(athleteId: number): Promise<TrainingPlanSummaryDto | null> {
  const plan = await db.select().from(trainingPlans).where(eq(trainingPlans.athleteId, athleteId)).get()
  if (!plan) return null
  return buildSummaryPlan(plan, athleteId)
}

export async function getWeekForAthlete(athleteId: number, weekNumber: number): Promise<WeeklyBlockDto | null> {
  const plan = await db.select().from(trainingPlans).where(eq(trainingPlans.athleteId, athleteId)).get()
  if (!plan) return null

  const week = await db.select().from(weeklyBlocks)
    .where(and(eq(weeklyBlocks.trainingPlanId, plan.id), eq(weeklyBlocks.weekNumber, weekNumber)))
    .get()
  if (!week) return null

  const workouts = (await db.select().from(dailyWorkouts).where(eq(dailyWorkouts.weeklyBlockId, week.id)).all())
    .sort((a, b) => a.workoutDate.localeCompare(b.workoutDate))
  return weekToDto(week, workouts)
}

export async function createPlanForAthlete(
  athleteId: number,
  req: CreateTrainingPlanRequest
): Promise<TrainingPlanDto | { error: string; status: number }> {
  const athlete = await db.select().from(athletes).where(eq(athletes.id, athleteId)).get()
  if (!athlete) return { error: `Athlete ${athleteId} not found`, status: 404 }

  const existing = await db.select().from(trainingPlans).where(eq(trainingPlans.athleteId, athleteId)).get()
  if (existing) return { error: `Athlete ${athleteId} already has a training plan. Delete it first.`, status: 409 }

  const plan = await db.insert(trainingPlans).values({
    athleteId,
    name: req.name,
    raceName: req.raceName,
    raceDate: req.raceDate,
    tuneUpRaceName: req.tuneUpRaceName,
    tuneUpRaceDate: req.tuneUpRaceDate,
    totalWeeks: req.totalWeeks,
  }).returning().get()

  for (const weekReq of req.weeks ?? []) {
    const week = await db.insert(weeklyBlocks).values({
      trainingPlanId: plan.id,
      weekNumber: weekReq.weekNumber,
      phase: weekReq.phase,
      startDate: weekReq.startDate,
      endDate: weekReq.endDate,
      plannedKm: weekReq.plannedKm,
      plannedVertM: weekReq.plannedVertM,
      notes: weekReq.notes,
    }).returning().get()

    for (const wReq of weekReq.workouts ?? []) {
      await db.insert(dailyWorkouts).values({
        weeklyBlockId: week.id,
        workoutDate: wReq.workoutDate,
        dayOfWeek: wReq.dayOfWeek,
        workoutType: wReq.workoutType,
        description: wReq.description,
        plannedKm: wReq.plannedKm,
        plannedVertM: wReq.plannedVertM,
        isRestDay: wReq.isRestDay ?? false,
        isRaceDay: wReq.isRaceDay ?? false,
      }).run()
    }
  }

  return buildFullPlan(plan, athleteId)
}

export async function updateWeekForAthlete(
  athleteId: number,
  weekNumber: number,
  req: UpdateWeekRequest
): Promise<WeeklyBlockDto | { error: string; status: number }> {
  const plan = await db.select().from(trainingPlans).where(eq(trainingPlans.athleteId, athleteId)).get()
  if (!plan) return { error: `No training plan found for athlete ${athleteId}`, status: 404 }

  const existingWeek = await db.select().from(weeklyBlocks)
    .where(and(eq(weeklyBlocks.trainingPlanId, plan.id), eq(weeklyBlocks.weekNumber, weekNumber)))
    .get()
  if (!existingWeek) return { error: `Week ${weekNumber} not found`, status: 404 }

  await db.update(weeklyBlocks).set({
    ...(req.phase !== undefined && { phase: req.phase }),
    ...(req.plannedKm !== undefined && { plannedKm: req.plannedKm }),
    ...(req.plannedVertM !== undefined && { plannedVertM: req.plannedVertM }),
    ...(req.notes !== undefined && { notes: req.notes }),
  }).where(eq(weeklyBlocks.id, existingWeek.id)).run()

  if (req.workouts) {
    const existingWorkouts = await db.select().from(dailyWorkouts)
      .where(eq(dailyWorkouts.weeklyBlockId, existingWeek.id)).all()
    const workoutsByDate = Object.fromEntries(existingWorkouts.map((w) => [w.workoutDate, w]))

    for (const wReq of req.workouts) {
      const existing = workoutsByDate[wReq.workoutDate]
      if (!existing) continue
      await db.update(dailyWorkouts).set({
        ...(wReq.dayOfWeek !== undefined && { dayOfWeek: wReq.dayOfWeek }),
        ...(wReq.workoutType !== undefined && { workoutType: wReq.workoutType }),
        ...(wReq.description !== undefined && { description: wReq.description }),
        ...(wReq.plannedKm !== undefined && { plannedKm: wReq.plannedKm }),
        ...(wReq.plannedVertM !== undefined && { plannedVertM: wReq.plannedVertM }),
        ...(wReq.isRestDay !== undefined && { isRestDay: wReq.isRestDay }),
        ...(wReq.isRaceDay !== undefined && { isRaceDay: wReq.isRaceDay }),
      }).where(eq(dailyWorkouts.id, existing.id)).run()
    }
  }

  const result = await getWeekForAthlete(athleteId, weekNumber)
  if (!result) throw new Error('Week not found after update')
  return result
}

export async function deletePlanForAthlete(athleteId: number, planId: number): Promise<boolean> {
  const plan = await db.select().from(trainingPlans)
    .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.athleteId, athleteId))).get()
  if (!plan) return false
  await db.delete(trainingPlans).where(eq(trainingPlans.id, planId)).run()
  return true
}
