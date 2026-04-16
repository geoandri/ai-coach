import { z } from 'zod';
export const athleteTools = [
    {
        name: 'list_athletes',
        description: 'List all athletes in the running coach platform.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'get_athlete',
        description: 'Get detailed information about a specific athlete by their ID.',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' }
            },
            required: ['athleteId']
        }
    },
    {
        name: 'create_athlete',
        description: 'Create a new athlete profile. Only name is required; all other coaching fields are optional.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Full name of the athlete' },
                email: { type: 'string', description: 'Email address' },
                experienceYears: { type: 'number', description: 'Years of running experience' },
                fitnessLevel: {
                    type: 'string',
                    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'],
                    description: 'Current fitness level'
                },
                currentWeeklyKm: { type: 'number', description: 'Current average weekly km' },
                longestRecentRunKm: { type: 'number', description: 'Longest run in the last 3 months (km)' },
                recentRaces: { type: 'string', description: 'Recent race history (free text or JSON)' },
                trainingDaysPerWeek: { type: 'number', description: 'Number of training days per week' },
                preferredLongRunDay: { type: 'string', description: 'Preferred day for long runs (e.g. Saturday)' },
                injuries: { type: 'string', description: 'Current or recent injuries / physical limitations' },
                strengthTrainingFrequency: { type: 'number', description: 'Strength training sessions per week' },
                goalType: {
                    type: 'string',
                    enum: ['FINISH_COMFORTABLY', 'TARGET_TIME', 'PODIUM'],
                    description: 'Race goal type'
                },
                targetFinishTime: { type: 'string', description: 'Target finish time (e.g. "9:30:00")' },
                trailAccess: { type: 'boolean', description: 'Does the athlete have access to trails for training?' },
                coachNotes: { type: 'string', description: 'Initial coach notes' }
            },
            required: ['name']
        }
    },
    {
        name: 'update_athlete',
        description: 'Update one or more profile fields for an existing athlete.',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                name: { type: 'string' },
                email: { type: 'string' },
                experienceYears: { type: 'number' },
                fitnessLevel: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'] },
                currentWeeklyKm: { type: 'number' },
                longestRecentRunKm: { type: 'number' },
                recentRaces: { type: 'string' },
                trainingDaysPerWeek: { type: 'number' },
                preferredLongRunDay: { type: 'string' },
                injuries: { type: 'string' },
                strengthTrainingFrequency: { type: 'number' },
                goalType: { type: 'string', enum: ['FINISH_COMFORTABLY', 'TARGET_TIME', 'PODIUM'] },
                targetFinishTime: { type: 'string' },
                trailAccess: { type: 'boolean' },
                coachNotes: { type: 'string' }
            },
            required: ['athleteId']
        }
    },
    {
        name: 'add_coach_note',
        description: 'Append a coaching note to an athlete\'s profile. Notes are appended with a newline separator.',
        inputSchema: {
            type: 'object',
            properties: {
                athleteId: { type: 'number', description: 'The internal athlete ID' },
                note: { type: 'string', description: 'The note text to append' }
            },
            required: ['athleteId', 'note']
        }
    }
];
const GetAthleteSchema = z.object({ athleteId: z.number() });
const CreateAthleteSchema = z.object({
    name: z.string(),
    email: z.string().optional(),
    experienceYears: z.number().optional(),
    fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']).optional(),
    currentWeeklyKm: z.number().optional(),
    longestRecentRunKm: z.number().optional(),
    recentRaces: z.string().optional(),
    trainingDaysPerWeek: z.number().optional(),
    preferredLongRunDay: z.string().optional(),
    injuries: z.string().optional(),
    strengthTrainingFrequency: z.number().optional(),
    goalType: z.enum(['FINISH_COMFORTABLY', 'TARGET_TIME', 'PODIUM']).optional(),
    targetFinishTime: z.string().optional(),
    trailAccess: z.boolean().optional(),
    coachNotes: z.string().optional()
});
const UpdateAthleteSchema = CreateAthleteSchema.partial().extend({ athleteId: z.number() });
const AddCoachNoteSchema = z.object({ athleteId: z.number(), note: z.string() });
export async function handleAthleteTool(name, args, client) {
    const text = (obj) => [{ type: 'text', text: JSON.stringify(obj, null, 2) }];
    switch (name) {
        case 'list_athletes': {
            const athletes = await client.listAthletes();
            return { content: text(athletes) };
        }
        case 'get_athlete': {
            const { athleteId } = GetAthleteSchema.parse(args);
            const athlete = await client.getAthlete(athleteId);
            return { content: text(athlete) };
        }
        case 'create_athlete': {
            const request = CreateAthleteSchema.parse(args);
            const athlete = await client.createAthlete(request);
            return { content: text(athlete) };
        }
        case 'update_athlete': {
            const { athleteId, ...fields } = UpdateAthleteSchema.parse(args);
            const athlete = await client.updateAthlete(athleteId, fields);
            return { content: text(athlete) };
        }
        case 'add_coach_note': {
            const { athleteId, note } = AddCoachNoteSchema.parse(args);
            const athlete = await client.addCoachNote(athleteId, note);
            return { content: text(athlete) };
        }
        default:
            throw new Error(`Unknown athlete tool: ${name}`);
    }
}
//# sourceMappingURL=athletes.js.map