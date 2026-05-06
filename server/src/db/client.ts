import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import * as schema from './schema.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = process.env.DATABASE_PATH ?? './data/ai_coach.db'

// Ensure data directory exists
const dataDir = dbPath.includes('/') ? dbPath.substring(0, dbPath.lastIndexOf('/')) : '.'
if (dataDir && dataDir !== '.') {
  mkdirSync(dataDir, { recursive: true })
}

const client = createClient({ url: `file:${dbPath}` })

export const db = drizzle(client, { schema })

export async function runMigrations() {
  const migrationsFolder = join(__dirname, 'migrations')
  await migrate(db, { migrationsFolder })
}
