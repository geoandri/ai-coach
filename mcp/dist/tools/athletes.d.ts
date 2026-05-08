import type { AiCoachClient } from '../client.js';
export declare const athleteTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            athleteId?: undefined;
            name?: undefined;
            email?: undefined;
            experienceYears?: undefined;
            fitnessLevel?: undefined;
            currentWeeklyKm?: undefined;
            longestRecentRunKm?: undefined;
            recentRaces?: undefined;
            trainingDaysPerWeek?: undefined;
            preferredLongRunDay?: undefined;
            injuries?: undefined;
            strengthTrainingFrequency?: undefined;
            goalType?: undefined;
            targetFinishTime?: undefined;
            trailAccess?: undefined;
            coachNotes?: undefined;
            athleteSummary?: undefined;
            raceName?: undefined;
            raceDate?: undefined;
            raceDistanceKm?: undefined;
            raceElevationM?: undefined;
            note?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            athleteId: {
                type: string;
                description: string;
            };
            name?: undefined;
            email?: undefined;
            experienceYears?: undefined;
            fitnessLevel?: undefined;
            currentWeeklyKm?: undefined;
            longestRecentRunKm?: undefined;
            recentRaces?: undefined;
            trainingDaysPerWeek?: undefined;
            preferredLongRunDay?: undefined;
            injuries?: undefined;
            strengthTrainingFrequency?: undefined;
            goalType?: undefined;
            targetFinishTime?: undefined;
            trailAccess?: undefined;
            coachNotes?: undefined;
            athleteSummary?: undefined;
            raceName?: undefined;
            raceDate?: undefined;
            raceDistanceKm?: undefined;
            raceElevationM?: undefined;
            note?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            name: {
                type: string;
                description: string;
            };
            email: {
                type: string;
                description: string;
            };
            experienceYears: {
                type: string;
                description: string;
            };
            fitnessLevel: {
                type: string;
                enum: string[];
                description: string;
            };
            currentWeeklyKm: {
                type: string;
                description: string;
            };
            longestRecentRunKm: {
                type: string;
                description: string;
            };
            recentRaces: {
                type: string;
                description: string;
            };
            trainingDaysPerWeek: {
                type: string;
                description: string;
            };
            preferredLongRunDay: {
                type: string;
                description: string;
            };
            injuries: {
                type: string;
                description: string;
            };
            strengthTrainingFrequency: {
                type: string;
                description: string;
            };
            goalType: {
                type: string;
                enum: string[];
                description: string;
            };
            targetFinishTime: {
                type: string;
                description: string;
            };
            trailAccess: {
                type: string;
                description: string;
            };
            coachNotes: {
                type: string;
                description: string;
            };
            athleteSummary: {
                type: string;
                description: string;
            };
            raceName: {
                type: string;
                description: string;
            };
            raceDate: {
                type: string;
                description: string;
            };
            raceDistanceKm: {
                type: string;
                description: string;
            };
            raceElevationM: {
                type: string;
                description: string;
            };
            athleteId?: undefined;
            note?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            athleteId: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description?: undefined;
            };
            email: {
                type: string;
                description?: undefined;
            };
            experienceYears: {
                type: string;
                description?: undefined;
            };
            fitnessLevel: {
                type: string;
                enum: string[];
                description?: undefined;
            };
            currentWeeklyKm: {
                type: string;
                description?: undefined;
            };
            longestRecentRunKm: {
                type: string;
                description?: undefined;
            };
            recentRaces: {
                type: string;
                description?: undefined;
            };
            trainingDaysPerWeek: {
                type: string;
                description?: undefined;
            };
            preferredLongRunDay: {
                type: string;
                description?: undefined;
            };
            injuries: {
                type: string;
                description?: undefined;
            };
            strengthTrainingFrequency: {
                type: string;
                description?: undefined;
            };
            goalType: {
                type: string;
                enum: string[];
                description?: undefined;
            };
            targetFinishTime: {
                type: string;
                description?: undefined;
            };
            trailAccess: {
                type: string;
                description?: undefined;
            };
            coachNotes: {
                type: string;
                description?: undefined;
            };
            athleteSummary: {
                type: string;
                description: string;
            };
            raceName: {
                type: string;
                description: string;
            };
            raceDate: {
                type: string;
                description: string;
            };
            raceDistanceKm: {
                type: string;
                description: string;
            };
            raceElevationM: {
                type: string;
                description: string;
            };
            note?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            athleteId: {
                type: string;
                description: string;
            };
            note: {
                type: string;
                description: string;
            };
            name?: undefined;
            email?: undefined;
            experienceYears?: undefined;
            fitnessLevel?: undefined;
            currentWeeklyKm?: undefined;
            longestRecentRunKm?: undefined;
            recentRaces?: undefined;
            trainingDaysPerWeek?: undefined;
            preferredLongRunDay?: undefined;
            injuries?: undefined;
            strengthTrainingFrequency?: undefined;
            goalType?: undefined;
            targetFinishTime?: undefined;
            trailAccess?: undefined;
            coachNotes?: undefined;
            athleteSummary?: undefined;
            raceName?: undefined;
            raceDate?: undefined;
            raceDistanceKm?: undefined;
            raceElevationM?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleAthleteTool(name: string, args: unknown, client: AiCoachClient): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
//# sourceMappingURL=athletes.d.ts.map