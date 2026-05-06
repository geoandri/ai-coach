import { db } from '../db/client.js'
import { athletes } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import type {
  AthleteDto,
  CreateAthleteRequest,
  UpdateAthleteRequest,
} from '../types/index.js'

function toDto(row: typeof athletes.$inferSelect): AthleteDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    experienceYears: row.experienceYears ?? null,
    fitnessLevel: (row.fitnessLevel as AthleteDto['fitnessLevel']) ?? null,
    currentWeeklyKm: row.currentWeeklyKm ?? null,
    longestRecentRunKm: row.longestRecentRunKm ?? null,
    recentRaces: row.recentRaces ?? null,
    trainingDaysPerWeek: row.trainingDaysPerWeek ?? null,
    preferredLongRunDay: row.preferredLongRunDay ?? null,
    injuries: row.injuries ?? null,
    strengthTrainingFrequency: row.strengthTrainingFrequency ?? null,
    goalType: (row.goalType as AthleteDto['goalType']) ?? null,
    targetFinishTime: row.targetFinishTime ?? null,
    trailAccess: row.trailAccess,
    coachNotes: row.coachNotes ?? null,
    athleteSummary: row.athleteSummary ?? null,
    raceName: row.raceName ?? null,
    raceDate: row.raceDate ?? null,
    raceDistanceKm: row.raceDistanceKm ?? null,
    raceElevationM: row.raceElevationM ?? null,
    stravaEnabled: row.stravaEnabled,
    stravaAthleteId: row.stravaAthleteId ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function listAthletes(): AthleteDto[] {
  const rows = db.select().from(athletes).all()
  return rows.map(toDto)
}

export function getAthlete(id: number): AthleteDto | null {
  const row = db.select().from(athletes).where(eq(athletes.id, id)).get()
  return row ? toDto(row) : null
}

export function createAthlete(req: CreateAthleteRequest): AthleteDto {
  const now = new Date().toISOString()
  const result = db.insert(athletes).values({
    name: req.name,
    email: req.email,
    experienceYears: req.experienceYears,
    fitnessLevel: req.fitnessLevel,
    currentWeeklyKm: req.currentWeeklyKm,
    longestRecentRunKm: req.longestRecentRunKm,
    recentRaces: req.recentRaces,
    trainingDaysPerWeek: req.trainingDaysPerWeek,
    preferredLongRunDay: req.preferredLongRunDay,
    injuries: req.injuries,
    strengthTrainingFrequency: req.strengthTrainingFrequency,
    goalType: req.goalType,
    targetFinishTime: req.targetFinishTime,
    trailAccess: req.trailAccess ?? false,
    coachNotes: req.coachNotes,
    athleteSummary: req.athleteSummary,
    raceName: req.raceName,
    raceDate: req.raceDate,
    raceDistanceKm: req.raceDistanceKm,
    raceElevationM: req.raceElevationM,
    stravaEnabled: false,
    createdAt: now,
    updatedAt: now,
  }).returning().get()
  return toDto(result)
}

export function updateAthlete(id: number, req: UpdateAthleteRequest): AthleteDto | null {
  const existing = db.select().from(athletes).where(eq(athletes.id, id)).get()
  if (!existing) return null

  const now = new Date().toISOString()
  const updated = db.update(athletes).set({
    ...(req.name !== undefined && { name: req.name }),
    ...(req.email !== undefined && { email: req.email }),
    ...(req.experienceYears !== undefined && { experienceYears: req.experienceYears }),
    ...(req.fitnessLevel !== undefined && { fitnessLevel: req.fitnessLevel }),
    ...(req.currentWeeklyKm !== undefined && { currentWeeklyKm: req.currentWeeklyKm }),
    ...(req.longestRecentRunKm !== undefined && { longestRecentRunKm: req.longestRecentRunKm }),
    ...(req.recentRaces !== undefined && { recentRaces: req.recentRaces }),
    ...(req.trainingDaysPerWeek !== undefined && { trainingDaysPerWeek: req.trainingDaysPerWeek }),
    ...(req.preferredLongRunDay !== undefined && { preferredLongRunDay: req.preferredLongRunDay }),
    ...(req.injuries !== undefined && { injuries: req.injuries }),
    ...(req.strengthTrainingFrequency !== undefined && { strengthTrainingFrequency: req.strengthTrainingFrequency }),
    ...(req.goalType !== undefined && { goalType: req.goalType }),
    ...(req.targetFinishTime !== undefined && { targetFinishTime: req.targetFinishTime }),
    ...(req.trailAccess !== undefined && { trailAccess: req.trailAccess }),
    ...(req.coachNotes !== undefined && { coachNotes: req.coachNotes }),
    ...(req.athleteSummary !== undefined && { athleteSummary: req.athleteSummary }),
    ...(req.raceName !== undefined && { raceName: req.raceName }),
    ...(req.raceDate !== undefined && { raceDate: req.raceDate }),
    ...(req.raceDistanceKm !== undefined && { raceDistanceKm: req.raceDistanceKm }),
    ...(req.raceElevationM !== undefined && { raceElevationM: req.raceElevationM }),
    updatedAt: now,
  }).where(eq(athletes.id, id)).returning().get()
  return toDto(updated)
}

export function addCoachNote(id: number, note: string): AthleteDto | null {
  const existing = db.select().from(athletes).where(eq(athletes.id, id)).get()
  if (!existing) return null

  const newNotes = existing.coachNotes
    ? `${existing.coachNotes}\n${note}`
    : note

  const updated = db.update(athletes).set({
    coachNotes: newNotes,
    updatedAt: new Date().toISOString(),
  }).where(eq(athletes.id, id)).returning().get()
  return toDto(updated)
}

export function linkStravaAthlete(internalAthleteId: number, stravaAthleteId: number): boolean {
  const existing = db.select().from(athletes).where(eq(athletes.id, internalAthleteId)).get()
  if (!existing) return false

  db.update(athletes).set({
    stravaAthleteId,
    stravaEnabled: true,
    updatedAt: new Date().toISOString(),
  }).where(eq(athletes.id, internalAthleteId)).run()
  return true
}

export function deleteAthlete(id: number): boolean {
  const existing = db.select().from(athletes).where(eq(athletes.id, id)).get()
  if (!existing) return false
  db.delete(athletes).where(eq(athletes.id, id)).run()
  return true
}
