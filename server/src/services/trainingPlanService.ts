import { queryRows, queryOne, run, saveDb, lastInsertId } from '../db/client.js'
import type {
  TrainingPlanDto,
  TrainingPlanSummaryDto,
  WeeklyBlockDto,
  WeeklyBlockSummaryDto,
  DailyWorkoutDto,
  CreateTrainingPlanRequest,
  UpdateWeekRequest,
} from '../types/index.js'

function workoutToDto(row: Record<string, unknown>): DailyWorkoutDto {
  return {
    id: row.id as number,
    workoutDate: row.workout_date as string,
    dayOfWeek: (row.day_of_week as string | null) ?? null,
    workoutType: (row.workout_type as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    plannedKm: (row.planned_km as number | null) ?? null,
    plannedVertM: (row.planned_vert_m as number | null) ?? null,
    isRestDay: Boolean(row.is_rest_day),
    isRaceDay: Boolean(row.is_race_day),
  }
}

function weekToDto(week: Record<string, unknown>, workouts: Record<string, unknown>[]): WeeklyBlockDto {
  return {
    id: week.id as number,
    weekNumber: week.week_number as number,
    phase: (week.phase as string | null) ?? null,
    startDate: week.start_date as string,
    endDate: week.end_date as string,
    plannedKm: (week.planned_km as number | null) ?? null,
    plannedVertM: (week.planned_vert_m as number | null) ?? null,
    notes: (week.notes as string | null) ?? null,
    workouts: workouts.map(workoutToDto),
  }
}

function weekToSummaryDto(week: Record<string, unknown>): WeeklyBlockSummaryDto {
  return {
    id: week.id as number,
    weekNumber: week.week_number as number,
    phase: (week.phase as string | null) ?? null,
    startDate: week.start_date as string,
    endDate: week.end_date as string,
    plannedKm: (week.planned_km as number | null) ?? null,
    plannedVertM: (week.planned_vert_m as number | null) ?? null,
    notes: (week.notes as string | null) ?? null,
  }
}

function buildFullPlan(plan: Record<string, unknown>, athleteIdOverride?: number): TrainingPlanDto {
  const weeks = queryRows(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? ORDER BY week_number',
    [plan.id as number]
  )
  const weekDtos = weeks.map((week) => {
    const workouts = queryRows(
      'SELECT * FROM daily_workouts WHERE weekly_block_id = ? ORDER BY workout_date',
      [week.id as number]
    )
    return weekToDto(week, workouts)
  })
  return {
    id: plan.id as number,
    athleteId: athleteIdOverride ?? (plan.athlete_id as number | null) ?? 0,
    name: plan.name as string,
    raceName: (plan.race_name as string | null) ?? null,
    raceDate: (plan.race_date as string | null) ?? null,
    tuneUpRaceName: (plan.tune_up_race_name as string | null) ?? null,
    tuneUpRaceDate: (plan.tune_up_race_date as string | null) ?? null,
    totalWeeks: plan.total_weeks as number,
    weeks: weekDtos,
  }
}

function buildSummaryPlan(plan: Record<string, unknown>, athleteIdOverride?: number): TrainingPlanSummaryDto {
  const weeks = queryRows(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? ORDER BY week_number',
    [plan.id as number]
  )
  return {
    id: plan.id as number,
    athleteId: athleteIdOverride ?? (plan.athlete_id as number | null) ?? 0,
    name: plan.name as string,
    raceName: (plan.race_name as string | null) ?? null,
    raceDate: (plan.race_date as string | null) ?? null,
    tuneUpRaceName: (plan.tune_up_race_name as string | null) ?? null,
    tuneUpRaceDate: (plan.tune_up_race_date as string | null) ?? null,
    totalWeeks: plan.total_weeks as number,
    weeks: weeks.map(weekToSummaryDto),
  }
}

export function getFirstPlan(): TrainingPlanDto | null {
  const plan = queryOne('SELECT * FROM training_plans ORDER BY id LIMIT 1')
  if (!plan) return null
  return buildFullPlan(plan)
}

export function getFirstPlanWeek(weekNumber: number): WeeklyBlockDto | null {
  const plan = queryOne('SELECT * FROM training_plans ORDER BY id LIMIT 1')
  if (!plan) return null
  const week = queryOne(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? AND week_number = ?',
    [plan.id as number, weekNumber]
  )
  if (!week) return null
  const workouts = queryRows(
    'SELECT * FROM daily_workouts WHERE weekly_block_id = ? ORDER BY workout_date',
    [week.id as number]
  )
  return weekToDto(week, workouts)
}

export function getPlanForAthlete(athleteId: number): TrainingPlanDto | null {
  const plan = queryOne('SELECT * FROM training_plans WHERE athlete_id = ?', [athleteId])
  if (!plan) return null
  return buildFullPlan(plan, athleteId)
}

export function getPlanSummaryForAthlete(athleteId: number): TrainingPlanSummaryDto | null {
  const plan = queryOne('SELECT * FROM training_plans WHERE athlete_id = ?', [athleteId])
  if (!plan) return null
  return buildSummaryPlan(plan, athleteId)
}

export function getWeekForAthlete(athleteId: number, weekNumber: number): WeeklyBlockDto | null {
  const plan = queryOne('SELECT * FROM training_plans WHERE athlete_id = ?', [athleteId])
  if (!plan) return null
  const week = queryOne(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? AND week_number = ?',
    [plan.id as number, weekNumber]
  )
  if (!week) return null
  const workouts = queryRows(
    'SELECT * FROM daily_workouts WHERE weekly_block_id = ? ORDER BY workout_date',
    [week.id as number]
  )
  return weekToDto(week, workouts)
}

export function createPlanForAthlete(
  athleteId: number,
  req: CreateTrainingPlanRequest
): TrainingPlanDto | { error: string; status: number } {
  const athlete = queryOne('SELECT id FROM athletes WHERE id = ?', [athleteId])
  if (!athlete) return { error: `Athlete ${athleteId} not found`, status: 404 }

  const existing = queryOne('SELECT id FROM training_plans WHERE athlete_id = ?', [athleteId])
  if (existing)
    return {
      error: `Athlete ${athleteId} already has a training plan. Delete it first.`,
      status: 409,
    }

  run(
    `INSERT INTO training_plans (athlete_id, name, race_name, race_date, tune_up_race_name, tune_up_race_date, total_weeks)
     VALUES (?,?,?,?,?,?,?)`,
    [
      athleteId,
      req.name,
      req.raceName ?? null,
      req.raceDate ?? null,
      req.tuneUpRaceName ?? null,
      req.tuneUpRaceDate ?? null,
      req.totalWeeks,
    ]
  )
  const planId = lastInsertId()

  for (const weekReq of req.weeks ?? []) {
    run(
      `INSERT INTO weekly_blocks (training_plan_id, week_number, phase, start_date, end_date, planned_km, planned_vert_m, notes)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        planId,
        weekReq.weekNumber,
        weekReq.phase ?? null,
        weekReq.startDate,
        weekReq.endDate,
        weekReq.plannedKm ?? null,
        weekReq.plannedVertM ?? null,
        weekReq.notes ?? null,
      ]
    )
    const weekId = lastInsertId()

    for (const wReq of weekReq.workouts ?? []) {
      run(
        `INSERT INTO daily_workouts (weekly_block_id, workout_date, day_of_week, workout_type, description, planned_km, planned_vert_m, is_rest_day, is_race_day)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          weekId,
          wReq.workoutDate,
          wReq.dayOfWeek ?? null,
          wReq.workoutType ?? null,
          wReq.description ?? null,
          wReq.plannedKm ?? null,
          wReq.plannedVertM ?? null,
          wReq.isRestDay ? 1 : 0,
          wReq.isRaceDay ? 1 : 0,
        ]
      )
    }
  }

  saveDb()
  const plan = queryOne('SELECT * FROM training_plans WHERE id = ?', [planId])!
  return buildFullPlan(plan, athleteId)
}

export function updateWeekForAthlete(
  athleteId: number,
  weekNumber: number,
  req: UpdateWeekRequest
): WeeklyBlockDto | { error: string; status: number } {
  const plan = queryOne('SELECT * FROM training_plans WHERE athlete_id = ?', [athleteId])
  if (!plan) return { error: `No training plan found for athlete ${athleteId}`, status: 404 }

  const existingWeek = queryOne(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? AND week_number = ?',
    [plan.id as number, weekNumber]
  )
  if (!existingWeek) return { error: `Week ${weekNumber} not found`, status: 404 }

  const fields: string[] = []
  const values: unknown[] = []

  if (req.phase !== undefined) { fields.push('phase = ?'); values.push(req.phase) }
  if (req.plannedKm !== undefined) { fields.push('planned_km = ?'); values.push(req.plannedKm) }
  if (req.plannedVertM !== undefined) { fields.push('planned_vert_m = ?'); values.push(req.plannedVertM) }
  if (req.notes !== undefined) { fields.push('notes = ?'); values.push(req.notes) }

  if (fields.length > 0) {
    values.push(existingWeek.id as number)
    run(`UPDATE weekly_blocks SET ${fields.join(', ')} WHERE id = ?`, values as (string | number | null | boolean)[])
  }

  if (req.workouts) {
    const existingWorkouts = queryRows(
      'SELECT * FROM daily_workouts WHERE weekly_block_id = ?',
      [existingWeek.id as number]
    )
    const workoutsByDate = Object.fromEntries(
      existingWorkouts.map((w) => [w.workout_date as string, w])
    )

    for (const wReq of req.workouts) {
      const existing = workoutsByDate[wReq.workoutDate]
      if (!existing) continue
      const wFields: string[] = []
      const wValues: unknown[] = []
      if (wReq.dayOfWeek !== undefined) { wFields.push('day_of_week = ?'); wValues.push(wReq.dayOfWeek) }
      if (wReq.workoutType !== undefined) { wFields.push('workout_type = ?'); wValues.push(wReq.workoutType) }
      if (wReq.description !== undefined) { wFields.push('description = ?'); wValues.push(wReq.description) }
      if (wReq.plannedKm !== undefined) { wFields.push('planned_km = ?'); wValues.push(wReq.plannedKm) }
      if (wReq.plannedVertM !== undefined) { wFields.push('planned_vert_m = ?'); wValues.push(wReq.plannedVertM) }
      if (wReq.isRestDay !== undefined) { wFields.push('is_rest_day = ?'); wValues.push(wReq.isRestDay ? 1 : 0) }
      if (wReq.isRaceDay !== undefined) { wFields.push('is_race_day = ?'); wValues.push(wReq.isRaceDay ? 1 : 0) }
      if (wFields.length > 0) {
        wValues.push(existing.id as number)
        run(`UPDATE daily_workouts SET ${wFields.join(', ')} WHERE id = ?`, wValues as (string | number | null | boolean)[])
      }
    }
  }

  saveDb()
  const result = getWeekForAthlete(athleteId, weekNumber)
  if (!result) throw new Error('Week not found after update')
  return result
}

export function deletePlanForAthlete(athleteId: number, planId: number): boolean {
  const plan = queryOne(
    'SELECT id FROM training_plans WHERE id = ? AND athlete_id = ?',
    [planId, athleteId]
  )
  if (!plan) return false
  // Cascade handled by FK ON DELETE CASCADE
  run('DELETE FROM training_plans WHERE id = ?', [planId])
  saveDb()
  return true
}
