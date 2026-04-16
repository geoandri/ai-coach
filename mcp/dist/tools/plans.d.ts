import type { RunningCoachClient } from '../client.js';
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
            startDate?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            totalWeeks?: undefined;
            notes?: undefined;
            weeks?: undefined;
            planId?: undefined;
            phase?: undefined;
            plannedKm?: undefined;
            plannedVertM?: undefined;
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
            startDate?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            totalWeeks?: undefined;
            notes?: undefined;
            weeks?: undefined;
            planId?: undefined;
            phase?: undefined;
            plannedKm?: undefined;
            plannedVertM?: undefined;
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
            startDate: {
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
            totalWeeks: {
                type: string;
                description: string;
            };
            notes: {
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
                        dailyWorkouts: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    dayOfWeek: {
                                        type: string;
                                    };
                                    date: {
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
                                    perceivedEffort: {
                                        type: string;
                                    };
                                    notes: {
                                        type: string;
                                    };
                                };
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
            startDate?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            totalWeeks?: undefined;
            notes?: undefined;
            weeks?: undefined;
            phase?: undefined;
            plannedKm?: undefined;
            plannedVertM?: undefined;
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
                description?: undefined;
            };
            startDate?: undefined;
            raceDate?: undefined;
            raceName?: undefined;
            totalWeeks?: undefined;
            weeks?: undefined;
            planId?: undefined;
        };
        required: string[];
    };
})[];
export declare function handlePlanTool(name: string, args: unknown, client: RunningCoachClient): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
//# sourceMappingURL=plans.d.ts.map