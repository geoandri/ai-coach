import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleAthleteTool } from './athletes.js'
import { createMockClient } from '../test/mockClient.js'

let client: ReturnType<typeof createMockClient>

beforeEach(() => {
  client = createMockClient()
  vi.clearAllMocks()
})

describe('list_athletes', () => {
  it('calls client.listAthletes() and returns JSON content', async () => {
    const mockAthletes = [{ id: 1, name: 'Alice' }]
    vi.mocked(client.listAthletes).mockResolvedValue(mockAthletes as never)

    const result = await handleAthleteTool('list_athletes', {}, client)
    expect(client.listAthletes).toHaveBeenCalledOnce()
    expect(result.content).toHaveLength(1)
    expect(result.content[0].type).toBe('text')
    expect(JSON.parse(result.content[0].text)).toEqual(mockAthletes)
  })
})

describe('get_athlete', () => {
  it('calls client.getAthlete(42) when athleteId=42', async () => {
    const mockAthlete = { id: 42, name: 'Bob' }
    vi.mocked(client.getAthlete).mockResolvedValue(mockAthlete as never)

    const result = await handleAthleteTool('get_athlete', { athleteId: 42 }, client)
    expect(client.getAthlete).toHaveBeenCalledWith(42)
    expect(JSON.parse(result.content[0].text)).toEqual(mockAthlete)
  })

  it('throws ZodError for missing athleteId', async () => {
    await expect(handleAthleteTool('get_athlete', {}, client)).rejects.toThrow()
  })
})

describe('create_athlete', () => {
  it('calls client.createAthlete with parsed fields', async () => {
    const mockAthlete = { id: 1, name: 'Carol' }
    vi.mocked(client.createAthlete).mockResolvedValue(mockAthlete as never)

    await handleAthleteTool('create_athlete', { name: 'Carol', email: 'carol@example.com' }, client)
    expect(client.createAthlete).toHaveBeenCalledWith({ name: 'Carol', email: 'carol@example.com' })
  })

  it('throws ZodError when name is missing', async () => {
    await expect(handleAthleteTool('create_athlete', {}, client)).rejects.toThrow()
  })
})

describe('update_athlete', () => {
  it('calls client.updateAthlete with athleteId split out', async () => {
    const mockAthlete = { id: 5, name: 'Dave Updated' }
    vi.mocked(client.updateAthlete).mockResolvedValue(mockAthlete as never)

    await handleAthleteTool('update_athlete', { athleteId: 5, name: 'Dave Updated' }, client)
    expect(client.updateAthlete).toHaveBeenCalledWith(5, { name: 'Dave Updated' })
  })
})

describe('add_coach_note', () => {
  it('calls client.addCoachNote with id and note', async () => {
    vi.mocked(client.addCoachNote).mockResolvedValue({ id: 3, name: 'Eve' } as never)

    await handleAthleteTool('add_coach_note', { athleteId: 3, note: 'Good run' }, client)
    expect(client.addCoachNote).toHaveBeenCalledWith(3, 'Good run')
  })

  it('throws ZodError when note is missing', async () => {
    await expect(handleAthleteTool('add_coach_note', { athleteId: 3 }, client)).rejects.toThrow()
  })
})

describe('connect_intervals_icu', () => {
  it('calls client.connectIntervalsIcu with parsed fields', async () => {
    const mockResult = { connected: true, intervalsAthleteId: 'i12345' }
    vi.mocked(client.connectIntervalsIcu).mockResolvedValue(mockResult as never)

    const result = await handleAthleteTool('connect_intervals_icu', { athleteId: 5, intervalsAthleteId: 'i12345', apiKey: 'secret' }, client)
    expect(client.connectIntervalsIcu).toHaveBeenCalledWith(5, 'i12345', 'secret')
    expect(JSON.parse(result.content[0].text)).toEqual(mockResult)
  })
})

describe('unknown tool', () => {
  it('throws Error for unknown tool name', async () => {
    await expect(handleAthleteTool('foo', {}, client)).rejects.toThrow('Unknown athlete tool: foo')
  })
})
