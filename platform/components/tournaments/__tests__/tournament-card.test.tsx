import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TournamentCard } from '../tournament-card'
import { buildTournament } from '@/test-utils/factories'

afterEach(() => cleanup())

describe('TournamentCard', () => {
  const tournament = buildTournament({
    name: 'Amsterdam Open',
    club_name: 'Holland Casino',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2026-03-11',
    end_date: '2026-03-14',
    entry_fee: 0,
  })

  it('renders tournament name', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Amsterdam Open')).toBeInTheDocument()
  })

  it('renders venue and city', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Holland Casino, Amsterdam')).toBeInTheDocument()
  })

  it('renders date range', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Mar 11 – Mar 14, 2026')).toBeInTheDocument()
  })

  it('renders "Free entry" when entry_fee is 0', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Free entry')).toBeInTheDocument()
  })

  it('renders formatted entry fee when > 0', () => {
    const paid = buildTournament({ entry_fee: 5000 })
    render(<TournamentCard tournament={paid} />)
    expect(screen.getByText('€50 buy-in')).toBeInTheDocument()
  })

  it('renders registered badge when isRegistered is true', () => {
    render(<TournamentCard tournament={tournament} isRegistered />)
    expect(screen.getByText('Registered')).toBeInTheDocument()
  })

  it('links to tournament detail page', () => {
    render(<TournamentCard tournament={tournament} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/tournaments/${tournament.id}`)
  })
})
