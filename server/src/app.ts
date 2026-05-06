import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifySensible from '@fastify/sensible'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

import { athleteRoutes } from './routes/athletes.js'
import { authRoutes } from './routes/auth.js'
import { legacyRoutes } from './routes/legacy.js'
import { healthRoutes } from './routes/health.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(fastifySensible)

  // Serve static frontend files if ./public exists
  const publicPath = join(__dirname, '..', 'public')
  if (existsSync(publicPath)) {
    await app.register(fastifyStatic, {
      root: publicPath,
      prefix: '/',
    })
  }

  // API routes
  await app.register(healthRoutes)
  await app.register(athleteRoutes)
  await app.register(authRoutes)
  await app.register(legacyRoutes)

  // SPA fallback: non-API GET → index.html
  if (existsSync(publicPath)) {
    app.setNotFoundHandler((request, reply) => {
      if (!request.url.startsWith('/api')) {
        return reply.sendFile('index.html')
      }
      return reply.code(404).send({ error: 'Not Found' })
    })
  } else {
    app.setNotFoundHandler((_request, reply) => {
      return reply.code(404).send({ error: 'Not Found' })
    })
  }

  return app
}
