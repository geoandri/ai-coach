CREATE TABLE `athletes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`experience_years` integer,
	`fitness_level` text,
	`current_weekly_km` real,
	`longest_recent_run_km` real,
	`recent_races` text,
	`training_days_per_week` integer,
	`preferred_long_run_day` text,
	`injuries` text,
	`strength_training_frequency` text,
	`goal_type` text,
	`target_finish_time` text,
	`trail_access` integer DEFAULT false NOT NULL,
	`coach_notes` text,
	`athlete_summary` text,
	`race_name` text,
	`race_date` text,
	`race_distance_km` real,
	`race_elevation_m` integer,
	`strava_enabled` integer DEFAULT false NOT NULL,
	`strava_athlete_id` integer,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`weekly_block_id` integer NOT NULL,
	`workout_date` text NOT NULL,
	`day_of_week` text,
	`workout_type` text,
	`description` text,
	`planned_km` real,
	`planned_vert_m` integer,
	`is_rest_day` integer DEFAULT false NOT NULL,
	`is_race_day` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`weekly_block_id`) REFERENCES `weekly_blocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_daily_workouts_block_date` ON `daily_workouts` (`weekly_block_id`,`workout_date`);--> statement-breakpoint
CREATE TABLE `strava_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`strava_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`internal_athlete_id` integer,
	`name` text,
	`sport_type` text,
	`activity_date` text NOT NULL,
	`start_datetime` text,
	`distance_m` real,
	`moving_time_s` integer,
	`elapsed_time_s` integer,
	`total_elevation_m` real,
	`average_speed` real,
	`max_speed` real,
	`average_heartrate` real,
	`max_heartrate` real,
	`trainer` integer DEFAULT false,
	`manual` integer DEFAULT false,
	`synced_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`internal_athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `strava_activities_strava_id_unique` ON `strava_activities` (`strava_id`);--> statement-breakpoint
CREATE TABLE `strava_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`internal_athlete_id` integer,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`scope` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`internal_athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `strava_tokens_athlete_id_unique` ON `strava_tokens` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `training_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer,
	`name` text NOT NULL,
	`race_name` text,
	`race_date` text,
	`tune_up_race_name` text,
	`tune_up_race_date` text,
	`total_weeks` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `weekly_blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`training_plan_id` integer NOT NULL,
	`week_number` integer NOT NULL,
	`phase` text,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`planned_km` real,
	`planned_vert_m` integer,
	`notes` text,
	FOREIGN KEY (`training_plan_id`) REFERENCES `training_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_weekly_blocks_plan_week` ON `weekly_blocks` (`training_plan_id`,`week_number`);