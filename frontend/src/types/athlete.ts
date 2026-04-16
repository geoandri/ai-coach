export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'
export type GoalType = 'FINISH_COMFORTABLY' | 'TARGET_TIME' | 'PODIUM'

export interface Athlete {
  id: number
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
  trailAccess: boolean
  coachNotes?: string
  athleteSummary?: string
  raceName?: string
  raceDate?: string
  raceDistanceKm?: number
  raceElevationM?: number
  stravaEnabled: boolean
  stravaAthleteId?: number
  createdAt: string
  updatedAt: string
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

