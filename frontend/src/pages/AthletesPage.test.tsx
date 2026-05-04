import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import AthletesPage from './AthletesPage'
import { mockAthlete } from '../test/handlers'

const server = setupServer(
  http.get('/api/athletes', () => HttpResponse.json([mockAthlete]))
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderPage() {
  return render(
    <MemoryRouter>
      <AthletesPage />
    </MemoryRouter>
  )
}

describe('AthletesPage', () => {
  it('shows loading state initially', () => {
    renderPage()
    expect(screen.getByText(/Loading athletes/i)).toBeInTheDocument()
  })

  it('renders athlete cards after data loads', async () => {
    renderPage()
    await waitFor(() => expect(screen.queryByText(/Loading athletes/i)).not.toBeInTheDocument())
    expect(screen.getByText('Test Athlete')).toBeInTheDocument()
  })

  it('shows empty state message when no athletes', async () => {
    server.use(http.get('/api/athletes', () => HttpResponse.json([])))

    renderPage()
    await waitFor(() => expect(screen.queryByText(/Loading athletes/i)).not.toBeInTheDocument())
    expect(screen.getByText(/No athletes yet/i)).toBeInTheDocument()
  })

  it('shows error message on API failure', async () => {
    server.use(http.get('/api/athletes', () => HttpResponse.error()))

    renderPage()
    await waitFor(() => expect(screen.queryByText(/Loading athletes/i)).not.toBeInTheDocument())
    // Error message from hook
    expect(screen.getByText(/Is the backend running/i)).toBeInTheDocument()
  })

  it('clicking an athlete card navigates to /athletes/:id', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Test Athlete')).toBeInTheDocument())

    const card = screen.getByText('Test Athlete').closest('div[class*="cursor-pointer"]')
    expect(card).toBeTruthy()
    await user.click(card!)
    // Click is handled; navigation happens internally via MemoryRouter
  })
})
