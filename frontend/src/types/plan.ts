export interface DailyWorkout {
  id: number
  workoutDate: string
  dayOfWeek: string | null
  workoutType: string | null
  description: string | null
  plannedKm: number | null
  plannedVertM: number | null
  isRestDay: boolean
  isRaceDay: boolean
}

export interface WeeklyBlock {
  id: number
  weekNumber: number
  phase: string | null
  startDate: string
  endDate: string
  plannedKm: number | null
  plannedVertM: number | null
  notes: string | null
  workouts: DailyWorkout[]
}

export interface TrainingPlan {
  id: number
  name: string
  raceName: string | null
  raceDate: string | null
  tuneUpRaceName: string | null
  tuneUpRaceDate: string | null
  totalWeeks: number
  weeks: WeeklyBlock[]
}
