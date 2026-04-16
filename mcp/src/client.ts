import axios, { type AxiosInstance } from 'axios'

export interface Athlete {
  id: number
  name: string
  email?: string
  experienceYears?: number
  fitnessLevel?: string
  currentWeeklyKm?: number
  longestRecentRunKm?: number
  recentRaces?: string
  trainingDaysPerWeek?: number
  preferredLongRunDay?: string
  injuries?: string
  strengthTrainingFrequency?: string
  goalType?: string
  targetFinishTime?: string
  trailAccess?: boolean
  coachNotes?: string
  athleteSummary?: string
  raceName?: string
  raceDate?: string
  raceDistanceKm?: number
  raceElevationM?: number
  stravaEnabled?: boolean
  stravaAthleteId?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateAthleteRequest {
  name: string
  email?: string
  experienceYears?: number
  fitnessLevel?: string
  currentWeeklyKm?: number
  longestRecentRunKm?: number
  recentRaces?: string
  trainingDaysPerWeek?: number
  preferredLongRunDay?: string
  injuries?: string
  strengthTrainingFrequency?: string
  goalType?: string
  targetFinishTime?: string
  trailAccess?: boolean
  coachNotes?: string
  athleteSummary?: string
  raceName?: string
  raceDate?: string
  raceDistanceKm?: number
  raceElevationM?: number
}

export interface UpdateAthleteRequest extends Partial<CreateAthleteRequest> {}

export interface DailyWorkout {
  id?: number
  dayOfWeek?: string
  workoutDate?: string
  workoutType?: string
  description?: string
  plannedKm?: number
  plannedVertM?: number
  isRestDay?: boolean
  isRaceDay?: boolean
}

export interface WeeklyBlock {
  id?: number
  weekNumber: number
  phase?: string
  startDate: string
  endDate: string
  plannedKm?: number
  plannedVertM?: number
  notes?: string
  workouts: DailyWorkout[]
}

export interface TrainingPlan {
  id: number
  athleteId: number
  name: string
  totalWeeks: number
  raceDate?: string
  raceName?: string
  tuneUpRaceName?: string
  tuneUpRaceDate?: string
  weeks: WeeklyBlock[]
}

export interface CreateTrainingPlanRequest {
  name: string
  raceDate?: string
  raceName?: string
  tuneUpRaceName?: string
  tuneUpRaceDate?: string
  totalWeeks: number
  weeks: WeeklyBlock[]
}

export interface PlanVsActualDto {
  athleteId: number
  startDate: string
  endDate: string
  days: DayComparison[]
  totalPlannedKm: number
  totalActualKm: number
  adherencePercent: number
}

export interface DayComparison {
  date: string
  dayOfWeek?: string
  plannedWorkoutType?: string
  plannedDescription?: string
  plannedKm?: number
  plannedVertM?: number
  isRestDay: boolean
  activities: ActualActivitySummary[]
  actualKm: number
  actualVertM: number
  kmDiff: number
  hasActivity: boolean
}

export interface ActualActivitySummary {
  id: number
  stravaId: number
  name?: string
  sportType?: string
  distanceKm: number
  movingTimeS?: number
  totalElevationM?: number
}

export interface SyncResultDto {
  syncedCount: number
  message: string
}

export class AiCoachClient {
  private http: AxiosInstance

  constructor(baseUrl: string) {
    this.http = axios.create({ baseURL: baseUrl })
  }

  // Athletes
  async listAthletes(): Promise<Athlete[]> {
    const { data } = await this.http.get<Athlete[]>('/athletes')
    return data
  }

  async getAthlete(athleteId: number): Promise<Athlete> {
    const { data } = await this.http.get<Athlete>(`/athletes/${athleteId}`)
    return data
  }

  async createAthlete(request: CreateAthleteRequest): Promise<Athlete> {
    const { data } = await this.http.post<Athlete>('/athletes', request)
    return data
  }

  async updateAthlete(athleteId: number, request: UpdateAthleteRequest): Promise<Athlete> {
    const { data } = await this.http.put<Athlete>(`/athletes/${athleteId}`, request)
    return data
  }

  async addCoachNote(athleteId: number, note: string): Promise<Athlete> {
    const { data } = await this.http.post<Athlete>(`/athletes/${athleteId}/coach-notes`, { note })
    return data
  }

  // Training Plans
  async getTrainingPlan(athleteId: number): Promise<TrainingPlan | null> {
    try {
      const { data } = await this.http.get<TrainingPlan>(`/athletes/${athleteId}/training-plan`)
      return data
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return null
      throw e
    }
  }

  async createTrainingPlan(athleteId: number, request: CreateTrainingPlanRequest): Promise<TrainingPlan> {
    const { data } = await this.http.post<TrainingPlan>(`/athletes/${athleteId}/training-plan`, request)
    return data
  }

  async deleteTrainingPlan(athleteId: number, planId: number): Promise<void> {
    await this.http.delete(`/athletes/${athleteId}/training-plans/${planId}`)
  }

  async getWeekDetail(athleteId: number, weekNumber: number): Promise<WeeklyBlock | null> {
    try {
      const { data } = await this.http.get<WeeklyBlock>(`/athletes/${athleteId}/training-plan/week/${weekNumber}`)
      return data
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return null
      throw e
    }
  }

  // Plan vs Actual
  async getPlanVsActual(athleteId: number, startDate: string, endDate: string): Promise<PlanVsActualDto> {
    const { data } = await this.http.get<PlanVsActualDto>(`/athletes/${athleteId}/plan-vs-actual`, {
      params: { startDate, endDate }
    })
    return data
  }

  // Dashboard
  async getDashboardSummary(athleteId: number): Promise<unknown> {
    const { data } = await this.http.get(`/athletes/${athleteId}/dashboard/summary`)
    return data
  }

  // Strava
  async syncActivities(athleteId: number, afterDate?: string): Promise<SyncResultDto> {
    const params = afterDate ? `?afterDate=${afterDate}` : ''
    const { data } = await this.http.get<SyncResultDto>(`/athletes/${athleteId}/activities/sync${params}`)
    return data
  }

  getStravaConnectUrl(athleteId: number): string {
    return `${this.http.defaults.baseURL}/athletes/${athleteId}/auth/strava`
  }
}
