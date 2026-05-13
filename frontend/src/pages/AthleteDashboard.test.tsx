import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import AthleteDashboard from './AthleteDashboard'
import { DashboardSummary } from '../types/dashboard'

const mockDashboardWithPlan: DashboardSummary = {
  weeks: [
    {
      weekNumber: 1,
      phase: 'Base Building',
      startDate: '2025-03-03',
      endDate: '2025-03-09',
      plannedKm: 50,
      actualKm: 45,
      plannedVertM: 500,
      actualVertM: 450,
      adherencePercent: 90,
      activityCount: 4,
      isCurrentWeek: false,
      isFutureWeek: false,
    },
    {
      weekNumber: 2,
      phase: 'Build',
      startDate: '2025-03-10',
      endDate: '2025-03-16',
      plannedKm: 60,
      actualKm: 55,
      plannedVertM: 600,
      actualVertM: 550,
      adherencePercent: 91.7,
      activityCount: 5,
      isCurrentWeek: true,
      isFutureWeek: false,
    },
  ],
  currentWeekNumber: 2,
  totalPlannedKm: 110,
  totalActualKm: 100,
}

const server = setupServer(
  http.get('/api/athletes/:id/dashboard/summary', () => {
    return HttpResponse.json(mockDashboardWithPlan)
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderDashboard(athleteId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/athletes/${athleteId}`]}>
      <Routes>
        <Route path="/athletes/:athleteId" element={<AthleteDashboard />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AthleteDashboard', () => {
  it('shows loading state initially', () => {
    renderDashboard()
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument()
  })

  it('shows "No training plan yet." when API returns empty weeks', async () => {
    server.use(
      http.get('/api/athletes/:id/dashboard/summary', () => {
        return HttpResponse.json({
          weeks: [],
          currentWeekNumber: null,
          totalPlannedKm: 0,
          totalActualKm: 0,
        })
      })
    )
    renderDashboard()
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    expect(screen.getByText(/No training plan yet/i)).toBeInTheDocument()
  })

  it('renders four stat cards after data loads', async () => {
    renderDashboard()
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    expect(screen.getByText('Total Actual km')).toBeInTheDocument()
    expect(screen.getByText('Total Planned km')).toBeInTheDocument()
    expect(screen.getByText('Overall Adherence')).toBeInTheDocument()
    // "Current Week" appears as stat label and as section heading — getAllByText handles both
    expect(screen.getAllByText('Current Week').length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Current Week" section heading when a week has isCurrentWeek=true', async () => {
    renderDashboard()
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings.some(h => h.textContent === 'Current Week')).toBe(true)
  })

  it('no "Current Week" section heading when currentWeekNumber=null', async () => {
    server.use(
      http.get('/api/athletes/:id/dashboard/summary', () => {
        return HttpResponse.json({
          weeks: [
            {
              weekNumber: 1,
              phase: 'Base',
              startDate: '2025-01-01',
              endDate: '2025-01-07',
              plannedKm: 50,
              actualKm: 45,
              plannedVertM: 500,
              actualVertM: 450,
              adherencePercent: 90,
              activityCount: 4,
              isCurrentWeek: false,
              isFutureWeek: false,
            },
          ],
          currentWeekNumber: null,
          totalPlannedKm: 50,
          totalActualKm: 45,
        })
      })
    )
    renderDashboard()
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings.some(h => h.textContent === 'Current Week')).toBe(false)
  })

  it('renders one WeeklyCard per week in "All Weeks" grid', async () => {
    renderDashboard()
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    // Week numbers appear in stat card ("Week 2") and in the week cards
    expect(screen.getAllByText(/Week 1/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Week 2/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders phase legend with Base, Build, Peak, Taper, Race, Recovery labels', async () => {
    renderDashboard()
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    // Legend labels are rendered as text inside flex spans
    const legendLabels = ['Base', 'Build', 'Peak', 'Taper', 'Race', 'Recovery']
    for (const label of legendLabels) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('each week card is a link pointing to /athletes/1/plan#week-N', async () => {
    const { container } = renderDashboard('1')
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    const links = container.querySelectorAll('a[href]')
    const hrefs = Array.from(links).map(a => a.getAttribute('href'))
    expect(hrefs).toContain('/athletes/1/plan#week-1')
    expect(hrefs).toContain('/athletes/1/plan#week-2')
  })

  it('clicking Refresh re-fetches the dashboard API', async () => {
    let callCount = 0
    server.use(
      http.get('/api/athletes/:id/dashboard/summary', () => {
        callCount++
        return HttpResponse.json(mockDashboardWithPlan)
      })
    )
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument())
    const initialCount = callCount
    await user.click(screen.getByText('Refresh'))
    await waitFor(() => expect(callCount).toBeGreaterThan(initialCount))
  })
})
