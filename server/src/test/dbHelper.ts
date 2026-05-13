import initSqlJs, { type Database } from 'sql.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { setDb } from '../db/client.js'

process.env.DATABASE_PATH = '/tmp/ai-coach-test.db'

export let db: Database

export async function createTestDb(): Promise<void> {
  const SQL = await initSqlJs()
  db = new SQL.Database()
  db.run('PRAGMA foreign_keys = ON;')

  const sqlPath = new URL('../db/migrations/schema.sql', import.meta.url).pathname
  const sql = readFileSync(sqlPath, 'utf8')
  const statements = sql
    .split(/^--> statement-breakpoint$/m)
    .flatMap((chunk) => chunk.split(';'))
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const stmt of statements) {
    try {
      db.run(stmt)
    } catch {
      // Ignore already-exists errors
    }
  }

  setDb(db)
}

export function resetDb(): void {
  // Delete in FK-safe order (children before parents)
  db.run('DELETE FROM daily_workouts')
  db.run('DELETE FROM weekly_blocks')
  db.run('DELETE FROM strava_activities')
  db.run('DELETE FROM strava_tokens')
  db.run('DELETE FROM training_plans')
  db.run('DELETE FROM athletes')
  // Reset auto-increment counters
  const tables = ['daily_workouts', 'weekly_blocks', 'strava_activities', 'strava_tokens', 'training_plans', 'athletes']
  for (const t of tables) {
    try {
      db.run(`DELETE FROM sqlite_sequence WHERE name = '${t}'`)
    } catch {
      // sqlite_sequence only exists after first insert
    }
  }
}
