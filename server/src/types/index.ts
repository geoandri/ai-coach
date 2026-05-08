// ── Athlete DTOs ─────────────────────────────────────────────────────────────

export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'
export type GoalType = 'FINISH_COMFORTABLY' | 'TARGET_TIME' | 'PODIUM'

export interface AthleteDto {
  id: number
  name: string
  email: string | null
  experienceYears: number | null
  fitnessLevel: FitnessLevel | null
  currentWeeklyKm: number | null
  longestRecentRunKm: number | null
  recentRaces: string | null
  trainingDaysPerWeek: number | null
  preferredLongRunDay: string | null
  injuries: string | null
  strengthTrainingFrequency: string | null
  goalType: GoalType | null
  targetFinishTime: string | null
  trailAccess: boolean
  coachNotes: string | null
  athleteSummary: string | null
  raceName: string | null
  raceDate: string | null   // ISO YYYY-MM-DD
  raceDistanceKm: number | null
  raceElevationM: number | null
  stravaEnabled: boolean
  stravaAthleteId: number | null
  createdAt: string         // ISO-8601
  updatedAt: string         // ISO-8601
}

export interface CreateAthleteRequest {
  name: string
  email?: string
  experienceYears?: number
  fitnessLevel?: FitnessLevel
  currentWeeklyKm?: number
  longestRecentRunKm?: number
  recentRaces?: string
  trainingDaysPerWeek?: number
  preferredLongRunDay?: string
  injuries?: string
  strengthTrainingFrequency?: string
  goalType?: GoalType
  targetFinishTime?: string
  trailAccess?: boolean
  coachNotes?: string
  athleteSummary?: string
  raceName?: string
  raceDate?: string
  raceDistanceKm?: number
  raceElevationM?: number
}

export interface UpdateAthleteRequest {
  name?: string
  email?: string
  experienceYears?: number
  fitnessLevel?: FitnessLevel
  currentWeeklyKm?: number
  longestRecentRunKm?: number
  recentRaces?: string
  trainingDaysPerWeek?: number
  preferredLongRunDay?: string
  injuries?: string
  strengthTrainingFrequency?: string
  goalType?: GoalType
  targetFinishTime?: string
  trailAccess?: boolean
  coachNotes?: string
  athleteSummary?: string
  raceName?: string
  raceDate?: string
  raceDistanceKm?: number
  raceElevationM?: number
}

export interface AddCoachNoteRequest {
  note: string
}

// ── Training Plan DTOs ────────────────────────────────────────────────────────

export interface DailyWorkoutDto {
  id: number
  workoutDate: string       // ISO YYYY-MM-DD
  dayOfWeek: string | null
  workoutType: string | null
  description: string | null
  plannedKm: number | null
  plannedVertM: number | null
  isRestDay: boolean
  isRaceDay: boolean
}

export interface WeeklyBlockDto {
  id: number
  weekNumber: number
  phase: string | null
  startDate: string         // ISO YYYY-MM-DD
  endDate: string           // ISO YYYY-MM-DD
  plannedKm: number | null
  plannedVertM: number | null
  notes: string | null
  workouts: DailyWorkoutDto[]
}

export interface WeeklyBlockSummaryDto {
  id: number
  weekNumber: number
  phase: string | null
  startDate: string
  endDate: string
  plannedKm: number | null
  plannedVertM: number | null
  notes: string | null
}

export interface TrainingPlanDto {
  id: number
  athleteId: number
  name: string
  raceName: string | null
  raceDate: string | null
  tuneUpRaceName: string | null
  tuneUpRaceDate: string | null
  totalWeeks: number
  weeks: WeeklyBlockDto[]
}

export interface TrainingPlanSummaryDto {
  id: number
  athleteId: number
  name: string
  raceName: string | null
  raceDate: string | null
  tuneUpRaceName: string | null
  tuneUpRaceDate: string | null
  totalWeeks: number
  weeks: WeeklyBlockSummaryDto[]
}

export interface CreateDailyWorkoutRequest {
  workoutDate: string
  dayOfWeek?: string
  workoutType?: string
  description?: string
  plannedKm?: number
  plannedVertM?: number
  isRestDay?: boolean
  isRaceDay?: boolean
}

export interface CreateWeeklyBlockRequest {
  weekNumber: number
  phase?: string
  startDate: string
  endDate: string
  plannedKm?: number
  plannedVertM?: number
  notes?: string
  workouts?: CreateDailyWorkoutRequest[]
}

export interface CreateTrainingPlanRequest {
  name: string
  raceName?: string
  raceDate?: string
  tuneUpRaceName?: string
  tuneUpRaceDate?: string
  totalWeeks: number
  weeks?: CreateWeeklyBlockRequest[]
}

export interface UpdateDailyWorkoutRequest {
  workoutDate: string
  dayOfWeek?: string
  workoutType?: string
  description?: string
  plannedKm?: number
  plannedVertM?: number
  isRestDay?: boolean
  isRaceDay?: boolean
}

export interface UpdateWeekRequest {
  phase?: string
  plannedKm?: number
  plannedVertM?: number
  notes?: string
  workouts?: UpdateDailyWorkoutRequest[]
}

// ── Dashboard DTOs ────────────────────────────────────────────────────────────

export interface WeekAdherenceDto {
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

export interface DashboardSummaryDto {
  weeks: WeekAdherenceDto[]
  currentWeekNumber: number | null
  totalPlannedKm: number
  totalActualKm: number
}

// ── Plan vs Actual DTOs ───────────────────────────────────────────────────────

export interface ActualActivitySummary {
  id: number
  stravaId: number
  name: string | null
  sportType: string | null
  distanceKm: number
  movingTimeS: number | null
  totalElevationM: number | null
}

export interface DayComparisonDto {
  date: string
  dayOfWeek: string | null
  plannedWorkoutType: string | null
  plannedDescription: string | null
  plannedKm: number | null
  plannedVertM: number | null
  isRestDay: boolean
  activities: ActualActivitySummary[]
  actualKm: number
  actualVertM: number
  kmDiff: number
  hasActivity: boolean
}

export interface PlanVsActualDto {
  athleteId: number
  startDate: string
  endDate: string
  days: DayComparisonDto[]
  totalPlannedKm: number
  totalActualKm: number
  adherencePercent: number
}

// ── Activity DTOs ─────────────────────────────────────────────────────────────

export interface ActivityDto {
  id: number
  stravaId: number
  name: string | null
  sportType: string | null
  activityDate: string        // ISO YYYY-MM-DD
  startDatetime: string | null
  distanceKm: number
  movingTimeS: number | null
  totalElevationM: number | null
  averageHeartrate: number | null
}

export interface SyncResultDto {
  syncedCount: number
  message: string
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
