import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TournamentHistoryTable } from '../tournament-history-table'

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

const mockResults = [
  {
    id: 'r1',
    placement: 1,
    points_awarded: 1000,
    tournaments: {
      id: 't1',
      name: 'Amsterdam Open',
      country: 'NL',
      start_date: '2026-01-15',
    },
  },
  {
    id: 'r2',
    placement: 5,
    points_awarded: 350,
    tournaments: {
      id: 't2',
      name: 'Berlin Classic',
      country: 'DE',
      start_date: '2026-02-20',
    },
  },
]

describe('TournamentHistoryTable', () => {
  afterEach(() => cleanup())

  it('renders tournament names as links', () => {
    render(<TournamentHistoryTable results={mockResults} />)
    const link = screen.getByText('Amsterdam Open')
    expect(link.closest('a')).toHaveAttribute('href', '/tournaments/t1')
  })

  it('shows placement and points', () => {
    render(<TournamentHistoryTable results={mockResults} />)
    expect(screen.getByText('1,000')).toBeInTheDocument()
    expect(screen.getByText('350')).toBeInTheDocument()
  })

  it('shows empty state when no results', () => {
    render(<TournamentHistoryTable results={[]} />)
    expect(screen.getByText(/no tournament history/i)).toBeInTheDocument()
  })

  it('renders section title', () => {
    render(<TournamentHistoryTable results={mockResults} />)
    expect(screen.getByText('Tournament History')).toBeInTheDocument()
  })
})
