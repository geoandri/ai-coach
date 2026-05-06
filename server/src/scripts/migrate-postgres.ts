#!/usr/bin/env tsx
/**
 * One-shot migration from PostgreSQL → SQLite.
 *
 * Usage:
 *   DATABASE_PATH=./data/ai_coach.db \
 *   PG_URL=postgres://user:pass@localhost:5432/ai_coach \
 *   npx tsx src/scripts/migrate-postgres.ts
 */

import pg from 'pg'
import Database from 'better-sqlite3'

const pgUrl = process.env.PG_URL
const dbPath = process.env.DATABASE_PATH ?? './data/ai_coach.db'

if (!pgUrl) {
  console.error('PG_URL environment variable is required')
  process.exit(1)
}

const { Client } = pg
const pgClient = new Client({ connectionString: pgUrl })
const sqlite = new Database(dbPath)

sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = OFF')  // disable FK checks during bulk insert

async function copyTable(
  tableName: string,
  transform?: (row: Record<string, unknown>) => Record<string, unknown>
) {
  const result = await pgClient.query(`SELECT * FROM ${tableName} ORDER BY id`)
  const rows = result.rows as Record<string, unknown>[]
  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 rows`)
    return
  }

  const first = transform ? transform(rows[0]) : rows[0]
  const columns = Object.keys(first)
  const placeholders = columns.map((_, i) => `?`).join(', ')
  const stmt = sqlite.prepare(
    `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`
  )

  const insertMany = sqlite.transaction((rows: Record<string, unknown>[]) => {
    for (const row of rows) {
      const r = transform ? transform(row) : row
      stmt.run(...columns.map((c) => r[c]))
    }
  })

  insertMany(rows)
  console.log(`  ${tableName}: ${rows.length} rows migrated`)
}

function toIsoString(val: unknown): string | null {
  if (val == null) return null
  if (val instanceof Date) return val.toISOString()
  return String(val)
}

function toDateString(val: unknown): string | null {
  if (val == null) return null
  if (val instanceof Date) return val.toISOString().substring(0, 10)
  const s = String(val)
  return s.length > 10 ? s.substring(0, 10) : s
}

async function main() {
  await pgClient.connect()
  console.log('Connected to PostgreSQL')

  await copyTable('athletes', (row) => ({
    ...row,
    trail_access: row.trail_access ? 1 : 0,
    strava_enabled: row.strava_enabled ? 1 : 0,
    race_date: toDateString(row.race_date),
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at),
  }))

  await copyTable('training_plans', (row) => ({
    ...row,
    race_date: toDateString(row.race_date),
    tune_up_race_date: toDateString(row.tune_up_race_date),
    created_at: toIsoString(row.created_at),
  }))

  await copyTable('weekly_blocks', (row) => ({
    ...row,
    start_date: toDateString(row.start_date),
    end_date: toDateString(row.end_date),
  }))

  await copyTable('daily_workouts', (row) => ({
    ...row,
    workout_date: toDateString(row.workout_date),
    is_rest_day: row.is_rest_day ? 1 : 0,
    is_race_day: row.is_race_day ? 1 : 0,
  }))

  await copyTable('strava_tokens', (row) => ({
    ...row,
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at),
  }))

  await copyTable('strava_activities', (row) => ({
    ...row,
    activity_date: toDateString(row.activity_date),
    start_datetime: toIsoString(row.start_datetime),
    trainer: row.trainer ? 1 : 0,
    manual: row.manual ? 1 : 0,
    synced_at: toIsoString(row.synced_at),
  }))

  sqlite.pragma('foreign_keys = ON')
  await pgClient.end()
  console.log('Migration complete.')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
