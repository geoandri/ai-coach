import { z } from 'zod'
import type { AiCoachClient } from '../client.js'

export const athleteTools = [
  {
    name: 'list_athletes',
    description: 'List all athletes in the running coach platform.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: []
    }
  },
  {
    name: 'get_athlete',
    description: 'Get detailed information about a specific athlete by their ID.',
    inputSchema: {
      type: 'object' as const,
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
      type: 'object' as const,
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
        strengthTrainingFrequency: { type: 'string', description: 'Strength training frequency (e.g. "2x per week")' },
        goalType: {
          type: 'string',
          enum: ['FINISH_COMFORTABLY', 'TARGET_TIME', 'PODIUM'],
          description: 'Race goal type'
        },
        targetFinishTime: { type: 'string', description: 'Target finish time (e.g. "9:30:00")' },
        trailAccess: { type: 'boolean', description: 'Does the athlete have access to trails for training?' },
        coachNotes: { type: 'string', description: 'Initial coach notes' },
        athleteSummary: { type: 'string', description: 'AI-generated summary of the athlete based on the intake conversation' },
        raceName: { type: 'string', description: 'Goal race name (e.g. "UTMB")' },
        raceDate: { type: 'string', description: 'Goal race date (YYYY-MM-DD)' },
        raceDistanceKm: { type: 'number', description: 'Goal race distance in km' },
        raceElevationM: { type: 'number', description: 'Goal race total elevation gain in metres' }
      },
      required: ['name']
    }
  },
  {
    name: 'update_athlete',
    description: 'Update one or more profile fields for an existing athlete.',
    inputSchema: {
      type: 'object' as const,
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
        strengthTrainingFrequency: { type: 'string' },
        goalType: { type: 'string', enum: ['FINISH_COMFORTABLY', 'TARGET_TIME', 'PODIUM'] },
        targetFinishTime: { type: 'string' },
        trailAccess: { type: 'boolean' },
        coachNotes: { type: 'string' },
        athleteSummary: { type: 'string', description: 'AI-generated summary of the athlete based on the intake conversation' },
        raceName: { type: 'string', description: 'Goal race name (e.g. "UTMB")' },
        raceDate: { type: 'string', description: 'Goal race date (YYYY-MM-DD)' },
        raceDistanceKm: { type: 'number', description: 'Goal race distance in km' },
        raceElevationM: { type: 'number', description: 'Goal race total elevation gain in metres' }
      },
      required: ['athleteId']
    }
  },
  {
    name: 'add_coach_note',
    description: 'Append a coaching note to an athlete\'s profile. Notes are appended with a newline separator.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        athleteId: { type: 'number', description: 'The internal athlete ID' },
        note: { type: 'string', description: 'The note text to append' }
      },
      required: ['athleteId', 'note']
    }
  },
  {
    name: 'get_strava_connect_url',
    description: 'Get the Strava OAuth URL for an athlete. Present this URL to the athlete so they can open it in a browser, authorise Strava access, and return. Once they confirm, call sync_activities to pull their data.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        athleteId: { type: 'number', description: 'The internal athlete ID' }
      },
      required: ['athleteId']
    }
  }
]

const GetAthleteSchema = z.object({ athleteId: z.number() })
const GetStravaConnectUrlSchema = z.object({ athleteId: z.number() })
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
  strengthTrainingFrequency: z.string().optional(),
  goalType: z.enum(['FINISH_COMFORTABLY', 'TARGET_TIME', 'PODIUM']).optional(),
  targetFinishTime: z.string().optional(),
  trailAccess: z.boolean().optional(),
  coachNotes: z.string().optional(),
  athleteSummary: z.string().optional(),
  raceName: z.string().optional(),
  raceDate: z.string().optional(),
  raceDistanceKm: z.number().optional(),
  raceElevationM: z.number().optional()
})
const UpdateAthleteSchema = CreateAthleteSchema.partial().extend({ athleteId: z.number() })
const AddCoachNoteSchema = z.object({ athleteId: z.number(), note: z.string() })

export async function handleAthleteTool(
  name: string,
  args: unknown,
  client: AiCoachClient
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const text = (obj: unknown) => [{ type: 'text' as const, text: JSON.stringify(obj, null, 2) }]

  switch (name) {
    case 'list_athletes': {
      const athletes = await client.listAthletes()
      return { content: text(athletes) }
    }
    case 'get_athlete': {
      const { athleteId } = GetAthleteSchema.parse(args)
      const athlete = await client.getAthlete(athleteId)
      return { content: text(athlete) }
    }
    case 'create_athlete': {
      const request = CreateAthleteSchema.parse(args)
      const athlete = await client.createAthlete(request)
      return { content: text(athlete) }
    }
    case 'update_athlete': {
      const { athleteId, ...fields } = UpdateAthleteSchema.parse(args)
      const athlete = await client.updateAthlete(athleteId, fields)
      return { content: text(athlete) }
    }
    case 'add_coach_note': {
      const { athleteId, note } = AddCoachNoteSchema.parse(args)
      const athlete = await client.addCoachNote(athleteId, note)
      return { content: text(athlete) }
    }
    case 'get_strava_connect_url': {
      const { athleteId } = GetStravaConnectUrlSchema.parse(args)
      const url = client.getStravaConnectUrl(athleteId)
      return { content: text({ url, instruction: 'Ask the athlete to open this URL in a browser, approve Strava access, and return to the conversation. Then call sync_activities to pull their data.' }) }
    }
    default:
      throw new Error(`Unknown athlete tool: ${name}`)
  }
}
