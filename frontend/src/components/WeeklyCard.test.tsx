import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeeklyCard } from './WeeklyCard'
import { WeekAdherence } from '../types/dashboard'

function makeWeek(overrides: Partial<WeekAdherence> = {}): WeekAdherence {
  return {
    weekNumber: 3,
    phase: 'Build Phase',
    startDate: '2025-03-17',
    endDate: '2025-03-23',
    plannedKm: 60,
    actualKm: 55,
    plannedVertM: 600,
    actualVertM: 550,
    adherencePercent: 91.7,
    activityCount: 5,
    isCurrentWeek: false,
    isFutureWeek: false,
    ...overrides,
  }
}

describe('WeeklyCard', () => {
  it('renders week number and phase name', () => {
    render(<WeeklyCard week={makeWeek()} />)
    expect(screen.getByText('Week 3')).toBeInTheDocument()
    expect(screen.getByText('Build Phase')).toBeInTheDocument()
  })

  it('shows "Current" badge when isCurrentWeek=true', () => {
    render(<WeeklyCard week={makeWeek({ isCurrentWeek: true })} />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('does not show "Current" badge when isCurrentWeek=false', () => {
    render(<WeeklyCard week={makeWeek({ isCurrentWeek: false })} />)
    expect(screen.queryByText('Current')).not.toBeInTheDocument()
  })

  it('shows adherence progress bar when not a future week', () => {
    const { container } = render(<WeeklyCard week={makeWeek({ isFutureWeek: false })} />)
    // Progress bar is rendered as a div with h-2 class
    const bar = container.querySelector('.h-2.bg-gray-700')
    expect(bar).toBeInTheDocument()
  })

  it('hides progress bar for future weeks', () => {
    const { container } = render(<WeeklyCard week={makeWeek({ isFutureWeek: true })} />)
    const bar = container.querySelector('.h-2.bg-gray-700')
    expect(bar).not.toBeInTheDocument()
  })
})
