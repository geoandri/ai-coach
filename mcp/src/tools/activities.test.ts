import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleActivityTool } from './activities.js'
import { createMockClient } from '../test/mockClient.js'

let client: ReturnType<typeof createMockClient>

beforeEach(() => {
  client = createMockClient()
  vi.clearAllMocks()
})

describe('get_plan_vs_actual', () => {
  it('calls client.getPlanVsActual(1, startDate, endDate)', async () => {
    const mockResult = { athleteId: 1, startDate: '2025-01-01', endDate: '2025-01-07', days: [], totalPlannedKm: 50, totalActualKm: 45, adherencePercent: 90 }
    vi.mocked(client.getPlanVsActual).mockResolvedValue(mockResult as never)

    const result = await handleActivityTool('get_plan_vs_actual', {
      athleteId: 1,
      startDate: '2025-01-01',
      endDate: '2025-01-07',
    }, client)
    expect(client.getPlanVsActual).toHaveBeenCalledWith(1, '2025-01-01', '2025-01-07')
    expect(JSON.parse(result.content[0].text)).toEqual(mockResult)
  })

  it('throws ZodError when dates are missing', async () => {
    await expect(handleActivityTool('get_plan_vs_actual', { athleteId: 1 }, client)).rejects.toThrow()
  })
})

describe('get_dashboard_summary', () => {
  it('calls client.getDashboardSummary(1)', async () => {
    const mockSummary = { weeks: [], currentWeekNumber: null, totalPlannedKm: 0, totalActualKm: 0 }
    vi.mocked(client.getDashboardSummary).mockResolvedValue(mockSummary)

    const result = await handleActivityTool('get_dashboard_summary', { athleteId: 1 }, client)
    expect(client.getDashboardSummary).toHaveBeenCalledWith(1)
    expect(JSON.parse(result.content[0].text)).toEqual(mockSummary)
  })
})

describe('sync_activities', () => {
  it('calls with undefined afterDate when absent', async () => {
    vi.mocked(client.syncActivities).mockResolvedValue({ syncedCount: 0, message: 'Synced' } as never)

    await handleActivityTool('sync_activities', { athleteId: 1 }, client)
    expect(client.syncActivities).toHaveBeenCalledWith(1, undefined)
  })

  it('calls with date string when afterDate provided', async () => {
    vi.mocked(client.syncActivities).mockResolvedValue({ syncedCount: 5, message: 'Synced' } as never)

    await handleActivityTool('sync_activities', { athleteId: 1, afterDate: '2025-01-01' }, client)
    expect(client.syncActivities).toHaveBeenCalledWith(1, '2025-01-01')
  })
})

describe('unknown tool', () => {
  it('throws Error for unknown tool name', async () => {
    await expect(handleActivityTool('unknown_tool', {}, client)).rejects.toThrow()
  })
})
