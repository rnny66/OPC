import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AdminTournamentTable } from '../admin-tournament-table'

vi.mock('@/lib/actions/admin', () => ({
  cancelTournamentAdmin: vi.fn(),
}))

afterEach(() => cleanup())

const mockTournaments = [
  {
    id: '1',
    name: 'Amsterdam Open',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2026-06-01',
    status: 'upcoming' as const,
    organizer_name: 'Alice',
    registration_count: 42,
  },
  {
    id: '2',
    name: 'Berlin Classic',
    city: 'Berlin',
    country: 'DE',
    start_date: '2026-01-15',
    status: 'completed' as const,
    organizer_name: 'Bob',
    registration_count: 100,
  },
]

describe('AdminTournamentTable', () => {
  it('renders tournament rows', () => {
    render(<AdminTournamentTable tournaments={mockTournaments} />)
    expect(screen.getByText('Amsterdam Open')).toBeDefined()
    expect(screen.getByText('Berlin Classic')).toBeDefined()
  })

  it('shows cancel button only for non-cancelled/non-completed tournaments', () => {
    render(<AdminTournamentTable tournaments={mockTournaments} />)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    expect(cancelButtons).toHaveLength(1)
  })

  it('shows organizer names', () => {
    render(<AdminTournamentTable tournaments={mockTournaments} />)
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('Bob')).toBeDefined()
  })

  it('renders empty state', () => {
    render(<AdminTournamentTable tournaments={[]} />)
    expect(screen.getByText('No tournaments found.')).toBeDefined()
  })
})
