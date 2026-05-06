import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = process.env.DATABASE_PATH ?? './data/ai_coach.db'

// Ensure data directory exists
import { mkdirSync } from 'fs'
const dataDir = dbPath.includes('/') ? dbPath.substring(0, dbPath.lastIndexOf('/')) : '.'
if (dataDir && dataDir !== '.') {
  mkdirSync(dataDir, { recursive: true })
}

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export function runMigrations() {
  // In compiled output (dist/db/), migrations are at dist/db/migrations/
  // In source (src/db/), they are at src/db/migrations/
  // Both work because tsc copies them via package.json include, but we also
  // support the source path for tsx dev mode.
  const migrationsFolder = join(__dirname, 'migrations')
  migrate(db, { migrationsFolder })
}
