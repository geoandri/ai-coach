import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handlePlanTool } from './plans.js'
import { createMockClient } from '../test/mockClient.js'

let client: ReturnType<typeof createMockClient>

beforeEach(() => {
  client = createMockClient()
  vi.clearAllMocks()
})

describe('get_training_plan', () => {
  it('calls client.getTrainingPlanSummary(1)', async () => {
    const mockPlan = { id: 1, athleteId: 1, name: 'Plan', totalWeeks: 8, weeks: [] }
    vi.mocked(client.getTrainingPlanSummary).mockResolvedValue(mockPlan as never)

    const result = await handlePlanTool('get_training_plan', { athleteId: 1 }, client)
    expect(client.getTrainingPlanSummary).toHaveBeenCalledWith(1)
    expect(JSON.parse(result.content[0].text)).toEqual(mockPlan)
  })

  it('returns message when plan is null', async () => {
    vi.mocked(client.getTrainingPlanSummary).mockResolvedValue(null)

    const result = await handlePlanTool('get_training_plan', { athleteId: 1 }, client)
    const parsed = JSON.parse(result.content[0].text)
    expect(parsed.message).toContain('No training plan found')
  })
})

describe('get_week_detail', () => {
  it('calls client.getWeekDetail(1, 3)', async () => {
    const mockWeek = { id: 1, weekNumber: 3, startDate: '2025-01-01', endDate: '2025-01-07', workouts: [] }
    vi.mocked(client.getWeekDetail).mockResolvedValue(mockWeek as never)

    const result = await handlePlanTool('get_week_detail', { athleteId: 1, weekNumber: 3 }, client)
    expect(client.getWeekDetail).toHaveBeenCalledWith(1, 3)
    expect(JSON.parse(result.content[0].text)).toEqual(mockWeek)
  })
})

describe('create_training_plan', () => {
  it('calls client.createTrainingPlan with athleteId extracted', async () => {
    const mockPlan = { id: 2, athleteId: 1, name: 'New Plan', totalWeeks: 4, weeks: [] }
    vi.mocked(client.createTrainingPlan).mockResolvedValue(mockPlan as never)

    const args = {
      athleteId: 1,
      name: 'New Plan',
      totalWeeks: 4,
      weeks: [],
    }
    await handlePlanTool('create_training_plan', args, client)
    expect(client.createTrainingPlan).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'New Plan',
      totalWeeks: 4,
    }))
    // athleteId should NOT be in the request object
    const callArgs = vi.mocked(client.createTrainingPlan).mock.calls[0]
    expect(callArgs[0]).toBe(1)
    expect((callArgs[1] as Record<string, unknown>).athleteId).toBeUndefined()
  })
})

describe('delete_training_plan', () => {
  it('calls client.deleteTrainingPlan(1, 99) and returns confirmation text', async () => {
    vi.mocked(client.deleteTrainingPlan).mockResolvedValue(undefined)

    const result = await handlePlanTool('delete_training_plan', { athleteId: 1, planId: 99 }, client)
    expect(client.deleteTrainingPlan).toHaveBeenCalledWith(1, 99)
    const parsed = JSON.parse(result.content[0].text)
    expect(parsed.message).toContain('deleted')
  })
})

describe('update_training_plan', () => {
  it('calls client.updateWeek(1, 2, { phase: "Peak" })', async () => {
    const mockWeek = { id: 1, weekNumber: 2, startDate: '2025-01-01', endDate: '2025-01-07', workouts: [] }
    vi.mocked(client.updateWeek).mockResolvedValue(mockWeek as never)

    await handlePlanTool('update_training_plan', { athleteId: 1, weekNumber: 2, phase: 'Peak' }, client)
    expect(client.updateWeek).toHaveBeenCalledWith(1, 2, expect.objectContaining({ phase: 'Peak' }))
  })
})

describe('unknown tool', () => {
  it('throws Error for unknown tool name', async () => {
    await expect(handlePlanTool('unknown_tool', {}, client)).rejects.toThrow()
  })
})
