import type { RunningCoachClient } from '../client.js';
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
        };
        required: string[];
    };
})[];
export declare function handleAthleteTool(name: string, args: unknown, client: RunningCoachClient): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
//# sourceMappingURL=athletes.d.ts.map