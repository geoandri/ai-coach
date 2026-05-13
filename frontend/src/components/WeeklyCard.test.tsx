import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
    render(
      <MemoryRouter>
        <WeeklyCard week={makeWeek()} />
      </MemoryRouter>
    )
    expect(screen.getByText('Week 3')).toBeInTheDocument()
    expect(screen.getByText('Build Phase')).toBeInTheDocument()
  })

  it('shows "Current" badge when isCurrentWeek=true', () => {
    render(
      <MemoryRouter>
        <WeeklyCard week={makeWeek({ isCurrentWeek: true })} />
      </MemoryRouter>
    )
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('does not show "Current" badge when isCurrentWeek=false', () => {
    render(
      <MemoryRouter>
        <WeeklyCard week={makeWeek({ isCurrentWeek: false })} />
      </MemoryRouter>
    )
    expect(screen.queryByText('Current')).not.toBeInTheDocument()
  })

  it('shows adherence progress bar when not a future week', () => {
    const { container } = render(
      <MemoryRouter>
        <WeeklyCard week={makeWeek({ isFutureWeek: false })} />
      </MemoryRouter>
    )
    const bar = container.querySelector('.h-2.bg-gray-700')
    expect(bar).toBeInTheDocument()
  })

  it('hides progress bar for future weeks', () => {
    const { container } = render(
      <MemoryRouter>
        <WeeklyCard week={makeWeek({ isFutureWeek: true })} />
      </MemoryRouter>
    )
    const bar = container.querySelector('.h-2.bg-gray-700')
    expect(bar).not.toBeInTheDocument()
  })

  it('renders as plain div (no <a>) when planUrl is not provided', () => {
    const { container } = render(
      <MemoryRouter>
        <WeeklyCard week={makeWeek()} />
      </MemoryRouter>
    )
    expect(container.querySelector('a')).toBeNull()
  })

  it('renders as <a> link with correct href when planUrl is provided', () => {
    const { container } = render(
      <MemoryRouter>
        <WeeklyCard week={makeWeek()} planUrl="/athletes/1/plan#week-3" />
      </MemoryRouter>
    )
    const link = container.querySelector('a')
    expect(link).toBeTruthy()
    expect(link!.getAttribute('href')).toBe('/athletes/1/plan#week-3')
  })
})
