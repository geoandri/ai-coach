export interface Athlete {
    id: number;
    name: string;
    email?: string;
    experienceYears?: number;
    fitnessLevel?: string;
    currentWeeklyKm?: number;
    longestRecentRunKm?: number;
    recentRaces?: string;
    trainingDaysPerWeek?: number;
    preferredLongRunDay?: string;
    injuries?: string;
    strengthTrainingFrequency?: string;
    goalType?: string;
    targetFinishTime?: string;
    trailAccess?: boolean;
    coachNotes?: string;
    athleteSummary?: string;
    raceName?: string;
    raceDate?: string;
    raceDistanceKm?: number;
    raceElevationM?: number;
    intervalsIcuEnabled?: boolean;
    intervalsIcuAthleteId?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface CreateAthleteRequest {
    name: string;
    email?: string;
    experienceYears?: number;
    fitnessLevel?: string;
    currentWeeklyKm?: number;
    longestRecentRunKm?: number;
    recentRaces?: string;
    trainingDaysPerWeek?: number;
    preferredLongRunDay?: string;
    injuries?: string;
    strengthTrainingFrequency?: string;
    goalType?: string;
    targetFinishTime?: string;
    trailAccess?: boolean;
    coachNotes?: string;
    athleteSummary?: string;
    raceName?: string;
    raceDate?: string;
    raceDistanceKm?: number;
    raceElevationM?: number;
}
export interface UpdateAthleteRequest extends Partial<CreateAthleteRequest> {
}
export interface DailyWorkout {
    id?: number;
    dayOfWeek?: string;
    workoutDate?: string;
    workoutType?: string;
    description?: string;
    plannedKm?: number;
    plannedVertM?: number;
    isRestDay?: boolean;
    isRaceDay?: boolean;
}
export interface WeeklyBlock {
    id?: number;
    weekNumber: number;
    phase?: string;
    startDate: string;
    endDate: string;
    plannedKm?: number;
    plannedVertM?: number;
    notes?: string;
    workouts: DailyWorkout[];
}
export interface WeeklyBlockSummary {
    id?: number;
    weekNumber: number;
    phase?: string;
    startDate: string;
    endDate: string;
    plannedKm?: number;
    plannedVertM?: number;
    notes?: string;
}
export interface TrainingPlan {
    id: number;
    athleteId: number;
    name: string;
    totalWeeks: number;
    raceDate?: string;
    raceName?: string;
    tuneUpRaceName?: string;
    tuneUpRaceDate?: string;
    weeks: WeeklyBlock[];
}
export interface TrainingPlanSummary {
    id: number;
    athleteId: number;
    name: string;
    totalWeeks: number;
    raceDate?: string;
    raceName?: string;
    tuneUpRaceName?: string;
    tuneUpRaceDate?: string;
    weeks: WeeklyBlockSummary[];
}
export interface CreateTrainingPlanRequest {
    name: string;
    raceDate?: string;
    raceName?: string;
    tuneUpRaceName?: string;
    tuneUpRaceDate?: string;
    totalWeeks: number;
    weeks: WeeklyBlock[];
}
export interface PlanVsActualDto {
    athleteId: number;
    startDate: string;
    endDate: string;
    days: DayComparison[];
    totalPlannedKm: number;
    totalActualKm: number;
    adherencePercent: number;
}
export interface DayComparison {
    date: string;
    dayOfWeek?: string;
    plannedWorkoutType?: string;
    plannedDescription?: string;
    plannedKm?: number;
    plannedVertM?: number;
    isRestDay: boolean;
    activities: ActualActivitySummary[];
    actualKm: number;
    actualVertM: number;
    kmDiff: number;
    hasActivity: boolean;
}
export interface ActualActivitySummary {
    id: number;
    stravaId: number;
    name?: string;
    sportType?: string;
    distanceKm: number;
    movingTimeS?: number;
    totalElevationM?: number;
}
export interface SyncResultDto {
    syncedCount: number;
    message: string;
}
export interface UpdateWeekRequest {
    phase?: string;
    plannedKm?: number;
    plannedVertM?: number;
    notes?: string;
    workouts?: Array<{
        workoutDate: string;
        dayOfWeek?: string;
        workoutType?: string;
        description?: string;
        plannedKm?: number;
        plannedVertM?: number;
        isRestDay?: boolean;
        isRaceDay?: boolean;
    }>;
}
export declare class AiCoachClient {
    private http;
    private publicBaseUrl;
    constructor(baseUrl: string, publicBaseUrl?: string);
    listAthletes(): Promise<Athlete[]>;
    getAthlete(athleteId: number): Promise<Athlete>;
    createAthlete(request: CreateAthleteRequest): Promise<Athlete>;
    updateAthlete(athleteId: number, request: UpdateAthleteRequest): Promise<Athlete>;
    addCoachNote(athleteId: number, note: string): Promise<Athlete>;
    getTrainingPlan(athleteId: number): Promise<TrainingPlan | null>;
    getTrainingPlanSummary(athleteId: number): Promise<TrainingPlanSummary | null>;
    createTrainingPlan(athleteId: number, request: CreateTrainingPlanRequest): Promise<TrainingPlan>;
    deleteTrainingPlan(athleteId: number, planId: number): Promise<void>;
    getWeekDetail(athleteId: number, weekNumber: number): Promise<WeeklyBlock | null>;
    updateWeek(athleteId: number, weekNumber: number, request: UpdateWeekRequest): Promise<WeeklyBlock>;
    getPlanVsActual(athleteId: number, startDate: string, endDate: string): Promise<PlanVsActualDto>;
    getDashboardSummary(athleteId: number): Promise<unknown>;
    syncActivities(athleteId: number, afterDate?: string): Promise<SyncResultDto>;
    connectIntervalsIcu(athleteId: number, intervalsAthleteId: string, apiKey: string): Promise<{
        connected: boolean;
        intervalsAthleteId?: string;
    }>;
    disconnectIntervalsIcu(athleteId: number): Promise<void>;
    getIntervalsIcuStatus(athleteId: number): Promise<{
        connected: boolean;
        intervalsAthleteId?: string;
    }>;
}
//# sourceMappingURL=client.d.ts.map