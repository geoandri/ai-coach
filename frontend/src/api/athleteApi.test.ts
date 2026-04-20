import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { athleteApi } from './athleteApi'
import { mockAthlete } from '../test/handlers'

const server = setupServer(
  http.get('/api/athletes', () => HttpResponse.json([mockAthlete])),
  http.get('/api/athletes/:id', ({ params }) =>
    HttpResponse.json({ ...mockAthlete, id: Number(params.id) })
  ),
  http.post('/api/athletes', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ ...mockAthlete, name: body.name as string }, { status: 201 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('athleteApi', () => {
  describe('list', () => {
    it('calls GET /api/athletes and returns athlete array', async () => {
      const result = await athleteApi.list()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test Athlete')
    })
  })

  describe('get', () => {
    it('calls correct URL for athlete by id', async () => {
      const result = await athleteApi.get(42)
      expect(result.id).toBe(42)
    })
  })

  describe('create', () => {
    it('posts data and returns created athlete', async () => {
      const result = await athleteApi.create({ name: 'New Runner' })
      expect(result.name).toBe('New Runner')
    })
  })

  describe('getStravaConnectUrl', () => {
    it('returns correct URL string without making HTTP call', () => {
      const url = athleteApi.getStravaConnectUrl(5)
      expect(url).toBe('/api/athletes/5/auth/strava')
    })
  })
})
