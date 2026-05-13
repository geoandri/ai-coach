import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { createTestDb, resetDb } from '../test/dbHelper.js'
import { buildApp } from '../app.js'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

beforeAll(async () => {
  await createTestDb()
  app = await buildApp()
})

afterEach(() => {
  resetDb()
})

afterAll(async () => {
  await app.close()
})

describe('POST /api/athletes', () => {
  it('creates athlete and returns 201', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/athletes',
      payload: { name: 'Alice' },
    })
    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.name).toBe('Alice')
    expect(body.id).toBeGreaterThan(0)
  })
})

describe('GET /api/athletes', () => {
  it('returns empty array when no athletes', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/athletes' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual([])
  })

  it('returns list after creating athletes', async () => {
    await app.inject({ method: 'POST', url: '/api/athletes', payload: { name: 'Bob' } })
    await app.inject({ method: 'POST', url: '/api/athletes', payload: { name: 'Carol' } })
    const res = await app.inject({ method: 'GET', url: '/api/athletes' })
    expect(res.statusCode).toBe(200)
    const names = res.json().map((a: { name: string }) => a.name)
    expect(names).toContain('Bob')
    expect(names).toContain('Carol')
  })
})

describe('GET /api/athletes/:id', () => {
  it('returns 200 with correct body for existing athlete', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/athletes',
      payload: { name: 'Dave' },
    })
    const { id } = create.json()

    const res = await app.inject({ method: 'GET', url: `/api/athletes/${id}` })
    expect(res.statusCode).toBe(200)
    expect(res.json().name).toBe('Dave')
  })

  it('returns 404 with error body for unknown id', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/athletes/99999' })
    expect(res.statusCode).toBe(404)
    expect(res.json()).toEqual({ error: 'Athlete not found' })
  })
})

describe('PUT /api/athletes/:id', () => {
  it('returns 200 with updated athlete', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/athletes',
      payload: { name: 'Eve' },
    })
    const { id } = create.json()

    const res = await app.inject({
      method: 'PUT',
      url: `/api/athletes/${id}`,
      payload: { name: 'Eve Updated' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().name).toBe('Eve Updated')
  })

  it('returns 404 for missing athlete', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/athletes/99999',
      payload: { name: 'Nobody' },
    })
    expect(res.statusCode).toBe(404)
  })
})

describe('DELETE /api/athletes/:id', () => {
  it('returns 204 with no body for existing athlete', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/athletes',
      payload: { name: 'Frank' },
    })
    const { id } = create.json()

    const res = await app.inject({ method: 'DELETE', url: `/api/athletes/${id}` })
    expect(res.statusCode).toBe(204)
    expect(res.body).toBe('')
  })

  it('returns 404 for missing athlete', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/api/athletes/99999' })
    expect(res.statusCode).toBe(404)
  })
})

describe('POST /api/athletes/:id/coach-notes', () => {
  it('returns 200 with updated athlete', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/athletes',
      payload: { name: 'Grace' },
    })
    const { id } = create.json()

    const res = await app.inject({
      method: 'POST',
      url: `/api/athletes/${id}/coach-notes`,
      payload: { note: 'Great progress' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().coachNotes).toBe('Great progress')
  })

  it('returns 404 for missing athlete', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/athletes/99999/coach-notes',
      payload: { note: 'note' },
    })
    expect(res.statusCode).toBe(404)
  })
})

describe('GET /api/athletes/:id/dashboard/summary', () => {
  it('returns 200 with empty weeks when athlete has no plan', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/athletes',
      payload: { name: 'Henry' },
    })
    const { id } = create.json()

    const res = await app.inject({
      method: 'GET',
      url: `/api/athletes/${id}/dashboard/summary`,
    })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.weeks).toEqual([])
    expect(body.currentWeekNumber).toBeNull()
  })
})
