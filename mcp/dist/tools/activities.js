import { z } from 'zod';
export const activityTools = [
    {
        name: 'get_plan_vs_actual',
        description: [
            'Compare planned workouts against actual Strava activities for an athlete over a date range.',
            'Returns day-by-day breakdown of planned vs actual km, elevation, and workout match.',
            'Use this to review adherence and adjust the training plan.'
        ].join(' '),
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
                endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' }
            },
            required: ['athleteId', 'startDate', 'endDate']
        }
    },
    {
        name: 'get_dashboard_summary',
        description: 'Get the dashboard summary for an athlete, including week-by-week adherence data and totals.',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' }
            },
            required: ['athleteId']
        }
    },
    {
        name: 'sync_activities',
        description: [
            'Trigger a Strava activity sync for an athlete. Pulls new runs from their connected Strava account.',
            'Use afterDate (YYYY-MM-DD) to limit the sync to activities after a specific date.',
            'For initial intake assessment pass afterDate as 12 months ago to avoid pulling all-time history.'
        ].join(' '),
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                afterDate: { type: 'string', description: 'Only sync activities after this date (YYYY-MM-DD). Omit to sync all new activities.' }
            },
            required: ['athleteId']
        }
    }
];
const PlanVsActualSchema = z.object({
    athleteId: z.number(),
    startDate: z.string(),
    endDate: z.string()
});
const DashboardSchema = z.object({ athleteId: z.number() });
const SyncSchema = z.object({
    athleteId: z.number(),
    afterDate: z.string().optional()
});
export async function handleActivityTool(name, args, client) {
    const text = (obj) => [{ type: 'text', text: JSON.stringify(obj, null, 2) }];
    switch (name) {
        case 'get_plan_vs_actual': {
            const { athleteId, startDate, endDate } = PlanVsActualSchema.parse(args);
            const result = await client.getPlanVsActual(athleteId, startDate, endDate);
            return { content: text(result) };
        }
        case 'get_dashboard_summary': {
            const { athleteId } = DashboardSchema.parse(args);
            const summary = await client.getDashboardSummary(athleteId);
            return { content: text(summary) };
        }
        case 'sync_activities': {
            const { athleteId, afterDate } = SyncSchema.parse(args);
            const result = await client.syncActivities(athleteId, afterDate);
            return { content: text(result) };
        }
        default:
            throw new Error(`Unknown activity tool: ${name}`);
    }
}
//# sourceMappingURL=activities.js.map