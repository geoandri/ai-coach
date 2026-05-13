import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createTestDb, resetDb } from '../test/dbHelper.js'
import { run, queryOne } from '../db/client.js'
import { getDashboardSummaryForAthlete } from './dashboardService.js'

beforeAll(async () => {
  await createTestDb()
})

afterEach(() => {
  resetDb()
})

function insertAthlete(name = 'Test Athlete'): number {
  const now = new Date().toISOString()
  run(
    `INSERT INTO athletes (name, trail_access, strava_enabled, created_at, updated_at) VALUES (?, 0, 0, ?, ?)`,
    [name, now, now]
  )
  return queryOne('SELECT last_insert_rowid() as id')!.id as number
}

function insertPlan(athleteId: number, totalWeeks = 4): number {
  const now = new Date().toISOString()
  run(
    `INSERT INTO training_plans (athlete_id, name, total_weeks, created_at) VALUES (?, ?, ?, ?)`,
    [athleteId, 'Test Plan', totalWeeks, now]
  )
  return queryOne('SELECT last_insert_rowid() as id')!.id as number
}

function insertWeek(
  planId: number,
  weekNumber: number,
  startDate: string,
  endDate: string,
  plannedKm = 50,
  plannedVertM = 500,
  phase = 'Base'
): number {
  run(
    `INSERT INTO weekly_blocks (training_plan_id, week_number, phase, start_date, end_date, planned_km, planned_vert_m)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [planId, weekNumber, phase, startDate, endDate, plannedKm, plannedVertM]
  )
  return queryOne('SELECT last_insert_rowid() as id')!.id as number
}

describe('getDashboardSummaryForAthlete', () => {
  it('returns empty weeks array when athlete has no plan', () => {
    const athleteId = insertAthlete()
    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result).toEqual({
      weeks: [],
      currentWeekNumber: null,
      totalPlannedKm: 0,
      totalActualKm: 0,
    })
  })

  it('returns empty for non-existent athlete', () => {
    const result = getDashboardSummaryForAthlete(99999)
    expect(result).toEqual({
      weeks: [],
      currentWeekNumber: null,
      totalPlannedKm: 0,
      totalActualKm: 0,
    })
  })

  it('isCurrentWeek=true for week spanning today', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId)
    const start = new Date(Date.now() - 3 * 86400000).toISOString().substring(0, 10)
    const end = new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10)
    insertWeek(planId, 1, start, end)

    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result.weeks).toHaveLength(1)
    expect(result.weeks[0].isCurrentWeek).toBe(true)
    expect(result.weeks[0].isFutureWeek).toBe(false)
    expect(result.currentWeekNumber).toBe(1)
  })

  it('isCurrentWeek=false and isFutureWeek=false for past week', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId)
    insertWeek(planId, 1, '2020-01-01', '2020-01-07')

    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result.weeks[0].isCurrentWeek).toBe(false)
    expect(result.weeks[0].isFutureWeek).toBe(false)
    expect(result.currentWeekNumber).toBeNull()
  })

  it('isFutureWeek=true for week in the future', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId)
    insertWeek(planId, 1, '2099-01-01', '2099-01-07')

    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result.weeks[0].isFutureWeek).toBe(true)
    expect(result.weeks[0].isCurrentWeek).toBe(false)
  })

  it('totalPlannedKm excludes future weeks', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId, 2)
    insertWeek(planId, 1, '2020-01-01', '2020-01-07', 50)
    insertWeek(planId, 2, '2099-01-01', '2099-01-07', 60)

    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result.totalPlannedKm).toBe(50)
  })

  it('currentWeekNumber is null when no week spans today', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId, 2)
    insertWeek(planId, 1, '2020-01-01', '2020-01-07')
    insertWeek(planId, 2, '2099-01-01', '2099-01-07')

    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result.currentWeekNumber).toBeNull()
  })

  it('adherencePercent is 0 when plannedKm is 0 (no divide-by-zero)', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId)
    insertWeek(planId, 1, '2020-01-01', '2020-01-07', 0)

    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result.weeks[0].adherencePercent).toBe(0)
  })

  it('actualKm is 0.00 when no activities', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId)
    insertWeek(planId, 1, '2020-01-01', '2020-01-07')

    const result = getDashboardSummaryForAthlete(athleteId)
    expect(result.weeks[0].actualKm).toBe(0)
    expect(result.weeks[0].actualVertM).toBe(0)
  })

  it('week fields include phase and date strings', () => {
    const athleteId = insertAthlete()
    const planId = insertPlan(athleteId)
    insertWeek(planId, 1, '2020-01-01', '2020-01-07', 50, 500, 'Build')

    const result = getDashboardSummaryForAthlete(athleteId)
    const week = result.weeks[0]
    expect(week.weekNumber).toBe(1)
    expect(week.phase).toBe('Build')
    expect(week.startDate).toBe('2020-01-01')
    expect(week.endDate).toBe('2020-01-07')
    expect(week.plannedKm).toBe(50)
    expect(week.plannedVertM).toBe(500)
  })
})
