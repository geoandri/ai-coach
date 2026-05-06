import { sqliteTable, integer, text, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const athletes = sqliteTable('athletes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  experienceYears: integer('experience_years'),
  fitnessLevel: text('fitness_level'),
  currentWeeklyKm: real('current_weekly_km'),
  longestRecentRunKm: real('longest_recent_run_km'),
  recentRaces: text('recent_races'),
  trainingDaysPerWeek: integer('training_days_per_week'),
  preferredLongRunDay: text('preferred_long_run_day'),
  injuries: text('injuries'),
  strengthTrainingFrequency: text('strength_training_frequency'),
  goalType: text('goal_type'),
  targetFinishTime: text('target_finish_time'),
  trailAccess: integer('trail_access', { mode: 'boolean' }).notNull().default(false),
  coachNotes: text('coach_notes'),
  athleteSummary: text('athlete_summary'),
  raceName: text('race_name'),
  raceDate: text('race_date'),
  raceDistanceKm: real('race_distance_km'),
  raceElevationM: integer('race_elevation_m'),
  stravaEnabled: integer('strava_enabled', { mode: 'boolean' }).notNull().default(false),
  stravaAthleteId: integer('strava_athlete_id'),
  createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
})

export const trainingPlans = sqliteTable('training_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  athleteId: integer('athlete_id').references(() => athletes.id),
  name: text('name').notNull(),
  raceName: text('race_name'),
  raceDate: text('race_date'),
  tuneUpRaceName: text('tune_up_race_name'),
  tuneUpRaceDate: text('tune_up_race_date'),
  totalWeeks: integer('total_weeks').notNull(),
  createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
})

export const weeklyBlocks = sqliteTable(
  'weekly_blocks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    trainingPlanId: integer('training_plan_id')
      .notNull()
      .references(() => trainingPlans.id, { onDelete: 'cascade' }),
    weekNumber: integer('week_number').notNull(),
    phase: text('phase'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    plannedKm: real('planned_km'),
    plannedVertM: integer('planned_vert_m'),
    notes: text('notes'),
  },
  (table) => [uniqueIndex('uq_weekly_blocks_plan_week').on(table.trainingPlanId, table.weekNumber)]
)

export const dailyWorkouts = sqliteTable(
  'daily_workouts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    weeklyBlockId: integer('weekly_block_id')
      .notNull()
      .references(() => weeklyBlocks.id, { onDelete: 'cascade' }),
    workoutDate: text('workout_date').notNull(),
    dayOfWeek: text('day_of_week'),
    workoutType: text('workout_type'),
    description: text('description'),
    plannedKm: real('planned_km'),
    plannedVertM: integer('planned_vert_m'),
    isRestDay: integer('is_rest_day', { mode: 'boolean' }).notNull().default(false),
    isRaceDay: integer('is_race_day', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => [uniqueIndex('uq_daily_workouts_block_date').on(table.weeklyBlockId, table.workoutDate)]
)

export const stravaTokens = sqliteTable('strava_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  athleteId: integer('athlete_id').notNull().unique(),
  internalAthleteId: integer('internal_athlete_id').references(() => athletes.id),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: integer('expires_at').notNull(),
  scope: text('scope'),
  createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
})

export const stravaActivities = sqliteTable('strava_activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stravaId: integer('strava_id').notNull().unique(),
  athleteId: integer('athlete_id').notNull(),
  internalAthleteId: integer('internal_athlete_id').references(() => athletes.id),
  name: text('name'),
  sportType: text('sport_type'),
  activityDate: text('activity_date').notNull(),
  startDatetime: text('start_datetime'),
  distanceM: real('distance_m'),
  movingTimeS: integer('moving_time_s'),
  elapsedTimeS: integer('elapsed_time_s'),
  totalElevationM: real('total_elevation_m'),
  averageSpeed: real('average_speed'),
  maxSpeed: real('max_speed'),
  averageHeartrate: real('average_heartrate'),
  maxHeartrate: real('max_heartrate'),
  trainer: integer('trainer', { mode: 'boolean' }).default(false),
  manual: integer('manual', { mode: 'boolean' }).default(false),
  syncedAt: text('synced_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
})
