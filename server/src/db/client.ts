import initSqlJs, { type Database, type SqlValue } from 'sql.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const dbPath = process.env.DATABASE_PATH ?? './data/ai_coach.db'

// Ensure data directory exists
const dataDir = dbPath.includes('/') ? dbPath.substring(0, dbPath.lastIndexOf('/')) : '.'
if (dataDir && dataDir !== '.') {
  mkdirSync(dataDir, { recursive: true })
}

let _db: Database

export function getDb(): Database {
  return _db
}

export function saveDb(): void {
  const data = _db.export()
  writeFileSync(dbPath, Buffer.from(data))
}

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs()
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    _db = new SQL.Database(fileBuffer)
  } else {
    _db = new SQL.Database()
  }
  _db.run('PRAGMA journal_mode = WAL;')
  _db.run('PRAGMA foreign_keys = ON;')
}

export function runMigrations(): void {
  const sqlPath = new URL('./migrations/schema.sql', import.meta.url).pathname
  const sql = readFileSync(sqlPath, 'utf8')
  // Split on drizzle-kit statement-breakpoint comments and semicolons
  const statements = sql
    .split(/^--> statement-breakpoint$/m)
    .flatMap((chunk) => chunk.split(';'))
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const stmt of statements) {
    try {
      _db.run(stmt)
    } catch {
      // Ignore "already exists" errors for idempotency
    }
  }
  saveDb()
}

// Convenience helpers used across all services
export type Param = number | string | null | boolean
export type Params = Param[]

function toSqlValues(params: Params): SqlValue[] {
  return params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p)) as SqlValue[]
}

export function queryRows(sql: string, params: Params = []): Record<string, unknown>[] {
  const stmt = _db.prepare(sql)
  const rows: Record<string, unknown>[] = []
  if (params.length > 0) stmt.bind(toSqlValues(params))
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>)
  }
  stmt.free()
  return rows
}

export function queryOne(sql: string, params: Params = []): Record<string, unknown> | null {
  return queryRows(sql, params)[0] ?? null
}

export function run(sql: string, params: Params = []): void {
  if (params.length > 0) {
    _db.run(sql, toSqlValues(params))
  } else {
    _db.run(sql)
  }
}

export function lastInsertId(): number {
  return _db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number
}
