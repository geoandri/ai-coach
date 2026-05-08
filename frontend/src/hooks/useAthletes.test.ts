import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useAthletes, useAthlete } from './useAthletes'
import { mockAthlete } from '../test/handlers'

const server = setupServer(
  http.get('/api/athletes', () => HttpResponse.json([mockAthlete])),
  http.get('/api/athletes/:id', ({ params }) =>
    HttpResponse.json({ ...mockAthlete, id: Number(params.id) })
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useAthletes', () => {
  it('loading=true initially, data populated after resolve, loading=false after', async () => {
    const { result } = renderHook(() => useAthletes())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].name).toBe('Test Athlete')
    expect(result.current.error).toBeNull()
  })

  it('error set on API failure', async () => {
    server.use(
      http.get('/api/athletes', () => HttpResponse.error())
    )

    const { result } = renderHook(() => useAthletes())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeTruthy()
  })
})

describe('useAthlete', () => {
  it('fetches and returns single athlete', async () => {
    const { result } = renderHook(() => useAthlete(7))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data?.id).toBe(7)
  })

  it('does not fetch when id is undefined — loading=false immediately', async () => {
    const { result } = renderHook(() => useAthlete(undefined))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
