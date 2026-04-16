import type { RunningCoachClient } from '../client.js';
export declare const activityTools: ({
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
            endDate: {
                type: string;
                description: string;
            };
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
            startDate?: undefined;
            endDate?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleActivityTool(name: string, args: unknown, client: RunningCoachClient): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
//# sourceMappingURL=activities.d.ts.map