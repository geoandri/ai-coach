import { z } from 'zod';
const DailyWorkoutSchema = z.object({
    dayOfWeek: z.string().optional(),
    date: z.string().optional(),
    workoutType: z.string().optional(),
    description: z.string().optional(),
    plannedKm: z.number().optional(),
    plannedVertM: z.number().optional(),
    perceivedEffort: z.string().optional(),
    notes: z.string().optional()
});
const WeeklyBlockSchema = z.object({
    weekNumber: z.number(),
    phase: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    plannedKm: z.number().optional(),
    plannedVertM: z.number().optional(),
    notes: z.string().optional(),
    dailyWorkouts: z.array(DailyWorkoutSchema).default([])
});
export const planTools = [
    {
        name: 'get_training_plan',
        description: 'Get the training plan for an athlete including all weeks and daily workouts.',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' }
            },
            required: ['athleteId']
        }
    },
    {
        name: 'get_week_detail',
        description: 'Get all daily workouts for a specific week number in an athlete\'s training plan.',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                weekNumber: { type: 'number', description: 'The week number (1-based)' }
            },
            required: ['athleteId', 'weekNumber']
        }
    },
    {
        name: 'create_training_plan',
        description: [
            'Create a full training plan for an athlete with all weeks and daily workouts.',
            'The athlete must not already have a plan — use delete_training_plan first if needed.',
            'Provide an array of weekly blocks, each with daily workout details.',
            'Dates should be ISO format (YYYY-MM-DD).',
            'WorkoutType examples: "Easy Run", "Long Run", "Tempo", "Intervals", "Trail Run", "Rest", "Strength", "Hike".',
            'PerceivedEffort examples: "EASY", "MODERATE", "HARD", "VERY_HARD".'
        ].join(' '),
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                startDate: { type: 'string', description: 'Plan start date (YYYY-MM-DD)' },
                raceDate: { type: 'string', description: 'Race date (YYYY-MM-DD)' },
                raceName: { type: 'string', description: 'Race name' },
                totalWeeks: { type: 'number', description: 'Total number of weeks in the plan' },
                notes: { type: 'string', description: 'Overall plan notes' },
                weeks: {
                    type: 'array',
                    description: 'Array of weekly blocks with daily workouts',
                    items: {
                        type: 'object',
                        properties: {
                            weekNumber: { type: 'number' },
                            phase: { type: 'string', description: 'Training phase (e.g. Base, Build, Peak, Taper)' },
                            startDate: { type: 'string' },
                            endDate: { type: 'string' },
                            plannedKm: { type: 'number' },
                            plannedVertM: { type: 'number' },
                            notes: { type: 'string' },
                            dailyWorkouts: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        dayOfWeek: { type: 'string' },
                                        date: { type: 'string' },
                                        workoutType: { type: 'string' },
                                        description: { type: 'string' },
                                        plannedKm: { type: 'number' },
                                        plannedVertM: { type: 'number' },
                                        perceivedEffort: { type: 'string' },
                                        notes: { type: 'string' }
                                    }
                                }
                            }
                        },
                        required: ['weekNumber', 'startDate', 'endDate']
                    }
                }
            },
            required: ['athleteId', 'startDate', 'totalWeeks', 'weeks']
        }
    },
    {
        name: 'delete_training_plan',
        description: 'Delete the current training plan for an athlete. Required before creating a new plan.',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                planId: { type: 'number', description: 'The plan ID to delete (get it from get_training_plan)' }
            },
            required: ['athleteId', 'planId']
        }
    },
    {
        name: 'update_training_plan',
        description: 'Update a specific week in an athlete\'s training plan (e.g. after reviewing actuals).',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                weekNumber: { type: 'number', description: 'The week number to update' },
                phase: { type: 'string' },
                plannedKm: { type: 'number' },
                plannedVertM: { type: 'number' },
                notes: { type: 'string' }
            },
            required: ['athleteId', 'weekNumber']
        }
    }
];
const CreatePlanSchema = z.object({
    athleteId: z.number(),
    startDate: z.string(),
    raceDate: z.string().optional(),
    raceName: z.string().optional(),
    totalWeeks: z.number(),
    notes: z.string().optional(),
    weeks: z.array(WeeklyBlockSchema)
});
const DeletePlanSchema = z.object({ athleteId: z.number(), planId: z.number() });
const GetWeekSchema = z.object({ athleteId: z.number(), weekNumber: z.number() });
const GetPlanSchema = z.object({ athleteId: z.number() });
export async function handlePlanTool(name, args, client) {
    const text = (obj) => [{ type: 'text', text: JSON.stringify(obj, null, 2) }];
    switch (name) {
        case 'get_training_plan': {
            const { athleteId } = GetPlanSchema.parse(args);
            const plan = await client.getTrainingPlan(athleteId);
            if (!plan) {
                return { content: text({ message: `No training plan found for athlete ${athleteId}` }) };
            }
            return { content: text(plan) };
        }
        case 'get_week_detail': {
            const { athleteId, weekNumber } = GetWeekSchema.parse(args);
            const week = await client.getWeekDetail(athleteId, weekNumber);
            if (!week) {
                return { content: text({ message: `Week ${weekNumber} not found for athlete ${athleteId}` }) };
            }
            return { content: text(week) };
        }
        case 'create_training_plan': {
            const { athleteId, ...request } = CreatePlanSchema.parse(args);
            const plan = await client.createTrainingPlan(athleteId, request);
            return { content: text(plan) };
        }
        case 'delete_training_plan': {
            const { athleteId, planId } = DeletePlanSchema.parse(args);
            await client.deleteTrainingPlan(athleteId, planId);
            return { content: text({ message: `Training plan ${planId} deleted for athlete ${athleteId}` }) };
        }
        case 'update_training_plan': {
            // update_training_plan: get the plan, find the week, update it
            // We use get_week_detail + inform the user since we don't have a dedicated update endpoint
            const parsed = z.object({
                athleteId: z.number(),
                weekNumber: z.number(),
                phase: z.string().optional(),
                plannedKm: z.number().optional(),
                plannedVertM: z.number().optional(),
                notes: z.string().optional()
            }).parse(args);
            // Return current week state with note that direct update is done via coach notes
            const week = await client.getWeekDetail(parsed.athleteId, parsed.weekNumber);
            return {
                content: text({
                    message: 'Week retrieved. To update week details, modify the plan by deleting and recreating it, or add coach notes.',
                    currentWeek: week,
                    requestedChanges: parsed
                })
            };
        }
        default:
            throw new Error(`Unknown plan tool: ${name}`);
    }
}
//# sourceMappingURL=plans.js.map