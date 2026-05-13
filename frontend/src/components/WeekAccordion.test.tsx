import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { WeekAccordion } from './WeekAccordion'
import { WeeklyBlock, DailyWorkout } from '../types/plan'

// scrollIntoView is not implemented in jsdom
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

function makeWorkout(overrides: Partial<DailyWorkout> = {}): DailyWorkout {
  return {
    id: 1,
    workoutDate: '2025-03-10',
    dayOfWeek: 'Monday',
    workoutType: 'Easy Run',
    description: 'Easy jog',
    plannedKm: 10,
    plannedVertM: null,
    isRestDay: false,
    isRaceDay: false,
    ...overrides,
  }
}

function makeWeek(overrides: Partial<WeeklyBlock> = {}): WeeklyBlock {
  return {
    id: 1,
    weekNumber: 2,
    phase: 'Base Building',
    startDate: '2025-03-10',
    endDate: '2025-03-16',
    plannedKm: 50,
    plannedVertM: 500,
    notes: null,
    workouts: [],
    ...overrides,
  }
}

function renderAccordion(
  props: { week?: WeeklyBlock; isCurrentWeek?: boolean } = {},
  initialEntries: string[] = ['/']
) {
  const week = props.week ?? makeWeek()
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <WeekAccordion week={week} isCurrentWeek={props.isCurrentWeek} />
    </MemoryRouter>
  )
}

describe('WeekAccordion', () => {
  it('renders week number, phase and date range in header', () => {
    renderAccordion()
    expect(screen.getByText('Week 2')).toBeInTheDocument()
    expect(screen.getByText('Base Building')).toBeInTheDocument()
    expect(screen.getByText(/2025-03-10/)).toBeInTheDocument()
    expect(screen.getByText(/2025-03-16/)).toBeInTheDocument()
  })

  it('is collapsed by default when isCurrentWeek=false', () => {
    const week = makeWeek({ workouts: [makeWorkout({ description: 'Easy jog' })] })
    renderAccordion({ week, isCurrentWeek: false })
    expect(screen.queryByText('Easy jog')).not.toBeInTheDocument()
  })

  it('expands on header button click and collapses on second click', async () => {
    const user = userEvent.setup()
    const week = makeWeek({ workouts: [makeWorkout({ id: 11, description: 'Morning run' })] })
    renderAccordion({ week })
    const btn = screen.getByRole('button')
    await user.click(btn)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
    await user.click(btn)
    expect(screen.queryByText('Morning run')).not.toBeInTheDocument()
  })

  it('is open by default and shows "Current" badge when isCurrentWeek=true', () => {
    const week = makeWeek({ workouts: [makeWorkout({ id: 12, workoutType: 'Tempo', description: 'Tempo intervals' })] })
    renderAccordion({ week, isCurrentWeek: true })
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText('Tempo intervals')).toBeInTheDocument()
  })

  it('renders workout type and description when expanded', async () => {
    const user = userEvent.setup()
    const week = makeWeek({ workouts: [makeWorkout({ id: 13, workoutType: 'Long Run', description: 'Long slow distance' })] })
    renderAccordion({ week })
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Long Run')).toBeInTheDocument()
    expect(screen.getByText('Long slow distance')).toBeInTheDocument()
  })

  it('has border-orange-500 class for current week', () => {
    const { container } = renderAccordion({ isCurrentWeek: true })
    const wrapper = container.querySelector('[id="week-2"]')
    expect(wrapper).toBeTruthy()
    expect(wrapper!.className).toContain('border-orange-500')
  })

  it('has border-gray-800 class for non-current week', () => {
    const { container } = renderAccordion({ isCurrentWeek: false })
    const wrapper = container.querySelector('[id="week-2"]')
    expect(wrapper).toBeTruthy()
    expect(wrapper!.className).toContain('border-gray-800')
  })

  it('has id="week-{weekNumber}" attribute on wrapper div', () => {
    const { container } = renderAccordion()
    const wrapper = container.querySelector('#week-2')
    expect(wrapper).toBeTruthy()
  })

  it('auto-opens when URL hash matches the week number', () => {
    const week = makeWeek({ workouts: [makeWorkout({ id: 14, workoutType: 'Intervals', description: 'Speed work' })] })
    renderAccordion({ week }, ['/#week-2'])
    expect(screen.getByText('Speed work')).toBeInTheDocument()
  })
})
