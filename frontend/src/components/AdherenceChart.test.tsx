import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdherenceChart } from './AdherenceChart'
import { WeekAdherence } from '../types/dashboard'

function makeWeek(overrides: Partial<WeekAdherence> = {}): WeekAdherence {
  return {
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
    ...overrides,
  }
}

describe('AdherenceChart', () => {
  it('renders without crashing with empty weeks array', () => {
    render(<AdherenceChart weeks={[]} />)
    expect(screen.getByText(/Planned vs Actual/i)).toBeInTheDocument()
  })

  it('renders the chart container for multiple weeks', () => {
    const weeks = [
      makeWeek({ weekNumber: 1 }),
      makeWeek({ weekNumber: 2 }),
      makeWeek({ weekNumber: 3 }),
    ]
    const { container } = render(<AdherenceChart weeks={weeks} />)
    // ResponsiveContainer is always rendered regardless of jsdom size constraints
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders without crashing with future weeks (actual=null)', () => {
    const weeks = [makeWeek({ isFutureWeek: true, actualKm: 0, activityCount: 0 })]
    const { container } = render(<AdherenceChart weeks={weeks} />)
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})
