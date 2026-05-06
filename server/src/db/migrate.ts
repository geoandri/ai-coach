import { runMigrations } from '../db/client.js'

await runMigrations()
console.log('Migrations applied.')
