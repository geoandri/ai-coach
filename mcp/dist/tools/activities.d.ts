import type { AiCoachClient } from '../client.js';
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
            afterDate?: undefined;
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
            afterDate?: undefined;
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
            afterDate: {
                type: string;
                description: string;
            };
            startDate?: undefined;
            endDate?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleActivityTool(name: string, args: unknown, client: AiCoachClient): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
//# sourceMappingURL=activities.d.ts.map