import { runMigrations } from './db/client.js'
import { buildApp } from './app.js'
import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = Number(process.env.PORT ?? 3000)
const MCP_PORT = Number(process.env.MCP_PORT ?? 3001)

async function main() {
  // 1. Run database migrations
  console.log('Running migrations...')
  await runMigrations()
  console.log('Migrations complete.')

  // 2. Start Fastify
  const app = await buildApp()
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`AI Coach server listening on port ${PORT}`)

  // 3. Spawn MCP child process if dist exists
  const mcpPath = join(__dirname, '..', '..', 'mcp', 'dist', 'index.js')
  if (existsSync(mcpPath)) {
    const mcpEnv = {
      ...process.env,
      PORT: String(MCP_PORT),
      BACKEND_URL: `http://localhost:${PORT}`,
    }

    const mcp = spawn(process.execPath, [mcpPath], {
      env: mcpEnv,
      stdio: 'inherit',
    })

    mcp.on('error', (err) => {
      console.error('MCP process error:', err)
    })

    mcp.on('exit', (code) => {
      console.error(`MCP process exited with code ${code}`)
      process.exit(1)
    })

    process.on('SIGTERM', () => {
      mcp.kill('SIGTERM')
      process.exit(0)
    })

    process.on('SIGINT', () => {
      mcp.kill('SIGTERM')
      process.exit(0)
    })

    console.log(`MCP server spawned on port ${MCP_PORT}`)
  } else {
    console.log(`MCP server not found at ${mcpPath}, skipping.`)
  }
}

main().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
