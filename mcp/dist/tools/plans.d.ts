import type { AiCoachClient } from '../client.js';
export declare const planTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            athleteId: {
                type: string;
                description: string;
            };
            weekNumber?: undefined;
            name?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            tuneUpRaceName?: undefined;
            tuneUpRaceDate?: undefined;
            totalWeeks?: undefined;
            weeks?: undefined;
            planId?: undefined;
            phase?: undefined;
            plannedKm?: undefined;
            plannedVertM?: undefined;
            notes?: undefined;
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
            weekNumber: {
                type: string;
                description: string;
            };
            name?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            tuneUpRaceName?: undefined;
            tuneUpRaceDate?: undefined;
            totalWeeks?: undefined;
            weeks?: undefined;
            planId?: undefined;
            phase?: undefined;
            plannedKm?: undefined;
            plannedVertM?: undefined;
            notes?: undefined;
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
                description: string;
            };
            raceDate: {
                type: string;
                description: string;
            };
            raceName: {
                type: string;
                description: string;
            };
            tuneUpRaceName: {
                type: string;
                description: string;
            };
            tuneUpRaceDate: {
                type: string;
                description: string;
            };
            totalWeeks: {
                type: string;
                description: string;
            };
            weeks: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        weekNumber: {
                            type: string;
                        };
                        phase: {
                            type: string;
                            description: string;
                        };
                        startDate: {
                            type: string;
                        };
                        endDate: {
                            type: string;
                        };
                        plannedKm: {
                            type: string;
                        };
                        plannedVertM: {
                            type: string;
                        };
                        notes: {
                            type: string;
                        };
                        workouts: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    workoutDate: {
                                        type: string;
                                        description: string;
                                    };
                                    dayOfWeek: {
                                        type: string;
                                    };
                                    workoutType: {
                                        type: string;
                                    };
                                    description: {
                                        type: string;
                                    };
                                    plannedKm: {
                                        type: string;
                                    };
                                    plannedVertM: {
                                        type: string;
                                    };
                                    isRestDay: {
                                        type: string;
                                    };
                                    isRaceDay: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    required: string[];
                };
            };
            weekNumber?: undefined;
            planId?: undefined;
            phase?: undefined;
            plannedKm?: undefined;
            plannedVertM?: undefined;
            notes?: undefined;
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
            planId: {
                type: string;
                description: string;
            };
            weekNumber?: undefined;
            name?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            tuneUpRaceName?: undefined;
            tuneUpRaceDate?: undefined;
            totalWeeks?: undefined;
            weeks?: undefined;
            phase?: undefined;
            plannedKm?: undefined;
            plannedVertM?: undefined;
            notes?: undefined;
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
            weekNumber: {
                type: string;
                description: string;
            };
            phase: {
                type: string;
            };
            plannedKm: {
                type: string;
            };
            plannedVertM: {
                type: string;
            };
            notes: {
                type: string;
            };
            name?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            tuneUpRaceName?: undefined;
            tuneUpRaceDate?: undefined;
            totalWeeks?: undefined;
            weeks?: undefined;
            planId?: undefined;
        };
        required: string[];
    };
})[];
export declare function handlePlanTool(name: string, args: unknown, client: AiCoachClient): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
//# sourceMappingURL=plans.d.ts.map