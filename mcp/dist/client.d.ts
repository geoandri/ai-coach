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
    strengthTrainingFrequency?: number;
    goalType?: string;
    targetFinishTime?: string;
    trailAccess?: boolean;
    coachNotes?: string;
    stravaEnabled?: boolean;
    stravaAthleteId?: number;
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
    strengthTrainingFrequency?: number;
    goalType?: string;
    targetFinishTime?: string;
    trailAccess?: boolean;
    coachNotes?: string;
}
export interface UpdateAthleteRequest extends Partial<CreateAthleteRequest> {
}
export interface DailyWorkout {
    id?: number;
    dayOfWeek?: string;
    date?: string;
    workoutType?: string;
    description?: string;
    plannedKm?: number;
    plannedVertM?: number;
    perceivedEffort?: string;
    notes?: string;
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
    dailyWorkouts: DailyWorkout[];
}
export interface TrainingPlan {
    id: number;
    athleteId: number;
    startDate: string;
    endDate?: string;
    totalWeeks: number;
    raceDate?: string;
    raceName?: string;
    notes?: string;
    weeks: WeeklyBlock[];
}
export interface CreateTrainingPlanRequest {
    startDate: string;
    raceDate?: string;
    raceName?: string;
    totalWeeks: number;
    notes?: string;
    weeks: WeeklyBlock[];
}
export interface PlanVsActualDto {
    athleteId: number;
    startDate: string;
    endDate: string;
    days: DayComparison[];
}
export interface DayComparison {
    date: string;
    plannedWorkouts: DailyWorkout[];
    actualActivities: ActualActivitySummary[];
    totalPlannedKm: number;
    totalActualKm: number;
    kmDiff: number;
}
export interface ActualActivitySummary {
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
export declare class RunningCoachClient {
    private http;
    constructor(baseUrl: string);
    listAthletes(): Promise<Athlete[]>;
    getAthlete(athleteId: number): Promise<Athlete>;
    createAthlete(request: CreateAthleteRequest): Promise<Athlete>;
    updateAthlete(athleteId: number, request: UpdateAthleteRequest): Promise<Athlete>;
    addCoachNote(athleteId: number, note: string): Promise<Athlete>;
    getTrainingPlan(athleteId: number): Promise<TrainingPlan | null>;
    createTrainingPlan(athleteId: number, request: CreateTrainingPlanRequest): Promise<TrainingPlan>;
    deleteTrainingPlan(athleteId: number, planId: number): Promise<void>;
    getWeekDetail(athleteId: number, weekNumber: number): Promise<WeeklyBlock | null>;
    getPlanVsActual(athleteId: number, startDate: string, endDate: string): Promise<PlanVsActualDto>;
    getDashboardSummary(athleteId: number): Promise<unknown>;
    syncActivities(athleteId: number): Promise<SyncResultDto>;
}
//# sourceMappingURL=client.d.ts.map