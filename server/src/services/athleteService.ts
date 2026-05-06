import { queryRows, queryOne, run, saveDb, lastInsertId } from '../db/client.js'
import type {
  AthleteDto,
  CreateAthleteRequest,
  UpdateAthleteRequest,
} from '../types/index.js'

function toDto(row: Record<string, unknown>): AthleteDto {
  return {
    id: row.id as number,
    name: row.name as string,
    email: (row.email as string | null) ?? null,
    experienceYears: (row.experience_years as number | null) ?? null,
    fitnessLevel: (row.fitness_level as AthleteDto['fitnessLevel']) ?? null,
    currentWeeklyKm: (row.current_weekly_km as number | null) ?? null,
    longestRecentRunKm: (row.longest_recent_run_km as number | null) ?? null,
    recentRaces: (row.recent_races as string | null) ?? null,
    trainingDaysPerWeek: (row.training_days_per_week as number | null) ?? null,
    preferredLongRunDay: (row.preferred_long_run_day as string | null) ?? null,
    injuries: (row.injuries as string | null) ?? null,
    strengthTrainingFrequency: (row.strength_training_frequency as string | null) ?? null,
    goalType: (row.goal_type as AthleteDto['goalType']) ?? null,
    targetFinishTime: (row.target_finish_time as string | null) ?? null,
    trailAccess: Boolean(row.trail_access),
    coachNotes: (row.coach_notes as string | null) ?? null,
    athleteSummary: (row.athlete_summary as string | null) ?? null,
    raceName: (row.race_name as string | null) ?? null,
    raceDate: (row.race_date as string | null) ?? null,
    raceDistanceKm: (row.race_distance_km as number | null) ?? null,
    raceElevationM: (row.race_elevation_m as number | null) ?? null,
    stravaEnabled: Boolean(row.strava_enabled),
    stravaAthleteId: (row.strava_athlete_id as number | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function listAthletes(): AthleteDto[] {
  return queryRows('SELECT * FROM athletes ORDER BY id').map(toDto)
}

export function getAthlete(id: number): AthleteDto | null {
  const row = queryOne('SELECT * FROM athletes WHERE id = ?', [id])
  return row ? toDto(row) : null
}

export function createAthlete(req: CreateAthleteRequest): AthleteDto {
  const now = new Date().toISOString()
  run(
    `INSERT INTO athletes (
      name, email, experience_years, fitness_level, current_weekly_km,
      longest_recent_run_km, recent_races, training_days_per_week,
      preferred_long_run_day, injuries, strength_training_frequency,
      goal_type, target_finish_time, trail_access, coach_notes,
      athlete_summary, race_name, race_date, race_distance_km,
      race_elevation_m, strava_enabled, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)`,
    [
      req.name,
      req.email ?? null,
      req.experienceYears ?? null,
      req.fitnessLevel ?? null,
      req.currentWeeklyKm ?? null,
      req.longestRecentRunKm ?? null,
      req.recentRaces ?? null,
      req.trainingDaysPerWeek ?? null,
      req.preferredLongRunDay ?? null,
      req.injuries ?? null,
      req.strengthTrainingFrequency ?? null,
      req.goalType ?? null,
      req.targetFinishTime ?? null,
      req.trailAccess ? 1 : 0,
      req.coachNotes ?? null,
      req.athleteSummary ?? null,
      req.raceName ?? null,
      req.raceDate ?? null,
      req.raceDistanceKm ?? null,
      req.raceElevationM ?? null,
      now,
      now,
    ]
  )
  const id = lastInsertId()
  saveDb()
  return getAthlete(id)!
}

export function updateAthlete(id: number, req: UpdateAthleteRequest): AthleteDto | null {
  const existing = getAthlete(id)
  if (!existing) return null

  const now = new Date().toISOString()
  const fields: string[] = ['updated_at = ?']
  const values: unknown[] = [now]

  const colMap: Record<string, string> = {
    name: 'name',
    email: 'email',
    experienceYears: 'experience_years',
    fitnessLevel: 'fitness_level',
    currentWeeklyKm: 'current_weekly_km',
    longestRecentRunKm: 'longest_recent_run_km',
    recentRaces: 'recent_races',
    trainingDaysPerWeek: 'training_days_per_week',
    preferredLongRunDay: 'preferred_long_run_day',
    injuries: 'injuries',
    strengthTrainingFrequency: 'strength_training_frequency',
    goalType: 'goal_type',
    targetFinishTime: 'target_finish_time',
    trailAccess: 'trail_access',
    coachNotes: 'coach_notes',
    athleteSummary: 'athlete_summary',
    raceName: 'race_name',
    raceDate: 'race_date',
    raceDistanceKm: 'race_distance_km',
    raceElevationM: 'race_elevation_m',
  }

  for (const [key, col] of Object.entries(colMap)) {
    if ((req as Record<string, unknown>)[key] !== undefined) {
      fields.push(`${col} = ?`)
      let val = (req as Record<string, unknown>)[key]
      if (col === 'trail_access') val = val ? 1 : 0
      values.push(val)
    }
  }

  values.push(id)
  run(`UPDATE athletes SET ${fields.join(', ')} WHERE id = ?`, values as (string | number | null | boolean)[])
  saveDb()
  return getAthlete(id)!
}

export function addCoachNote(id: number, note: string): AthleteDto | null {
  const existing = getAthlete(id)
  if (!existing) return null

  const newNotes = existing.coachNotes ? `${existing.coachNotes}\n${note}` : note
  run('UPDATE athletes SET coach_notes = ?, updated_at = ? WHERE id = ?', [
    newNotes,
    new Date().toISOString(),
    id,
  ])
  saveDb()
  return getAthlete(id)!
}

export function linkStravaAthlete(internalAthleteId: number, stravaAthleteId: number): boolean {
  const existing = getAthlete(internalAthleteId)
  if (!existing) return false

  run(
    'UPDATE athletes SET strava_athlete_id = ?, strava_enabled = 1, updated_at = ? WHERE id = ?',
    [stravaAthleteId, new Date().toISOString(), internalAthleteId]
  )
  saveDb()
  return true
}

export function deleteAthlete(id: number): boolean {
  const existing = getAthlete(id)
  if (!existing) return false
  run('DELETE FROM athletes WHERE id = ?', [id])
  saveDb()
  return true
}
