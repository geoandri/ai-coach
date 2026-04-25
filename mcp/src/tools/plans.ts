import { z } from 'zod'
import type { AiCoachClient } from '../client.js'

const DailyWorkoutSchema = z.object({
  workoutDate: z.string(),
  dayOfWeek: z.string().optional(),
  workoutType: z.string().optional(),
  description: z.string().optional(),
  plannedKm: z.number().optional(),
  plannedVertM: z.number().optional(),
  isRestDay: z.boolean().optional(),
  isRaceDay: z.boolean().optional()
})

const WeeklyBlockSchema = z.object({
  weekNumber: z.number(),
  phase: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  plannedKm: z.number().optional(),
  plannedVertM: z.number().optional(),
  notes: z.string().optional(),
  workouts: z.array(DailyWorkoutSchema).default([])
})

export const planTools = [
  {
    name: 'get_training_plan',
    description: 'Get a summary of the training plan for an athlete: plan metadata and one row per week (phase, dates, planned km/vert) without individual workouts. Use get_week_detail to fetch daily workouts for a specific week.',
    inputSchema: {
      type: 'object' as const,
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
      type: 'object' as const,
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
      type: 'object' as const,
      properties: {
        athleteId: { type: 'number', description: 'The internal athlete ID' },
        name: { type: 'string', description: 'Plan name (e.g. "UTMB 2026 Plan")' },
        raceDate: { type: 'string', description: 'Race date (YYYY-MM-DD)' },
        raceName: { type: 'string', description: 'Race name' },
        tuneUpRaceName: { type: 'string', description: 'Tune-up race name' },
        tuneUpRaceDate: { type: 'string', description: 'Tune-up race date (YYYY-MM-DD)' },
        totalWeeks: { type: 'number', description: 'Total number of weeks in the plan' },
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
              workouts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    workoutDate: { type: 'string', description: 'Date of the workout (YYYY-MM-DD)' },
                    dayOfWeek: { type: 'string' },
                    workoutType: { type: 'string' },
                    description: { type: 'string' },
                    plannedKm: { type: 'number' },
                    plannedVertM: { type: 'number' },
                    isRestDay: { type: 'boolean' },
                    isRaceDay: { type: 'boolean' }
                  },
                  required: ['workoutDate']
                }
              }
            },
            required: ['weekNumber', 'startDate', 'endDate']
          }
        }
      },
      required: ['athleteId', 'name', 'totalWeeks', 'weeks']
    }
  },
  {
    name: 'delete_training_plan',
    description: 'Delete the current training plan for an athlete. Required before creating a new plan.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        athleteId: { type: 'number', description: 'The internal athlete ID' },
        planId: { type: 'number', description: 'The plan ID to delete (get it from get_training_plan)' }
      },
      required: ['athleteId', 'planId']
    }
  },
  {
    name: 'update_training_plan',
    description: 'Update a specific week in an athlete\'s training plan. Can update week-level fields (phase, plannedKm, plannedVertM, notes) and/or individual daily workouts within the week.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        athleteId: { type: 'number', description: 'The internal athlete ID' },
        weekNumber: { type: 'number', description: 'The week number to update' },
        phase: { type: 'string' },
        plannedKm: { type: 'number' },
        plannedVertM: { type: 'number' },
        notes: { type: 'string' },
        workouts: {
          type: 'array',
          description: 'Daily workouts to update. Only workouts listed here will be changed; others are left as-is.',
          items: {
            type: 'object',
            properties: {
              workoutDate: { type: 'string', description: 'Date of the workout to update (YYYY-MM-DD)' },
              dayOfWeek: { type: 'string' },
              workoutType: { type: 'string' },
              description: { type: 'string' },
              plannedKm: { type: 'number' },
              plannedVertM: { type: 'number' },
              isRestDay: { type: 'boolean' },
              isRaceDay: { type: 'boolean' }
            },
            required: ['workoutDate']
          }
        }
      },
      required: ['athleteId', 'weekNumber']
    }
  }
]

const CreatePlanSchema = z.object({
  athleteId: z.number(),
  name: z.string(),
  raceDate: z.string().optional(),
  raceName: z.string().optional(),
  tuneUpRaceName: z.string().optional(),
  tuneUpRaceDate: z.string().optional(),
  totalWeeks: z.number(),
  weeks: z.array(WeeklyBlockSchema)
})

const DeletePlanSchema = z.object({ athleteId: z.number(), planId: z.number() })
const GetWeekSchema = z.object({ athleteId: z.number(), weekNumber: z.number() })
const GetPlanSchema = z.object({ athleteId: z.number() })

const UpdateWeekSchema = z.object({
  athleteId: z.number(),
  weekNumber: z.number(),
  phase: z.string().optional(),
  plannedKm: z.number().optional(),
  plannedVertM: z.number().optional(),
  notes: z.string().optional(),
  workouts: z.array(z.object({
    workoutDate: z.string(),
    dayOfWeek: z.string().optional(),
    workoutType: z.string().optional(),
    description: z.string().optional(),
    plannedKm: z.number().optional(),
    plannedVertM: z.number().optional(),
    isRestDay: z.boolean().optional(),
    isRaceDay: z.boolean().optional()
  })).optional()
})
  name: string,
  args: unknown,
  client: AiCoachClient
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const text = (obj: unknown) => [{ type: 'text' as const, text: JSON.stringify(obj, null, 2) }]

  switch (name) {
    case 'get_training_plan': {
      const { athleteId } = GetPlanSchema.parse(args)
      const plan = await client.getTrainingPlanSummary(athleteId)
      if (!plan) {
        return { content: text({ message: `No training plan found for athlete ${athleteId}` }) }
      }
      return { content: text(plan) }
    }
    case 'get_week_detail': {
      const { athleteId, weekNumber } = GetWeekSchema.parse(args)
      const week = await client.getWeekDetail(athleteId, weekNumber)
      if (!week) {
        return { content: text({ message: `Week ${weekNumber} not found for athlete ${athleteId}` }) }
      }
      return { content: text(week) }
    }
    case 'create_training_plan': {
      const { athleteId, ...request } = CreatePlanSchema.parse(args)
      const plan = await client.createTrainingPlan(athleteId, request)
      return { content: text(plan) }
    }
    case 'delete_training_plan': {
      const { athleteId, planId } = DeletePlanSchema.parse(args)
      await client.deleteTrainingPlan(athleteId, planId)
      return { content: text({ message: `Training plan ${planId} deleted for athlete ${athleteId}` }) }
    }
    case 'update_training_plan': {
      const { athleteId, weekNumber, ...request } = UpdateWeekSchema.parse(args)
      const week = await client.updateWeek(athleteId, weekNumber, request)
      return { content: text(week) }
    }
    default:
      throw new Error(`Unknown plan tool: ${name}`)
  }
}
