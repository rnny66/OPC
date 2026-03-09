import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TournamentForm } from '@/components/organizer/tournament-form'
import { buildTournament } from '@/test-utils/factories'

vi.mock('@/lib/actions/tournament', () => ({
  createTournament: vi.fn(),
  updateTournament: vi.fn(),
}))

afterEach(() => cleanup())

describe('TournamentForm', () => {
  it('renders all required field labels', () => {
    render(<TournamentForm />)
    expect(screen.getByLabelText(/tournament name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/club \/ venue name/i)).toBeInTheDocument()
    expect(screen.getByLabelText('City')).toBeInTheDocument()
    expect(screen.getByLabelText(/country \(iso code\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('renders in edit mode with pre-filled values', () => {
    const tournament = buildTournament({
      name: 'Berlin Masters',
      club_name: 'Spielbank Berlin',
      city: 'Berlin',
      country: 'DE',
      entry_fee: 15000,
      capacity: 200,
    })
    render(<TournamentForm tournament={tournament} />)

    expect(screen.getByLabelText(/tournament name/i)).toHaveValue('Berlin Masters')
    expect(screen.getByLabelText(/club \/ venue name/i)).toHaveValue('Spielbank Berlin')
    expect(screen.getByLabelText('City')).toHaveValue('Berlin')
    expect(screen.getByLabelText(/country \(iso code\)/i)).toHaveValue('DE')
    expect(screen.getByLabelText(/entry fee/i)).toHaveValue(150)
    expect(screen.getByLabelText(/capacity/i)).toHaveValue(200)
  })

  it('shows "Create Tournament" button in create mode', () => {
    render(<TournamentForm />)
    expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument()
  })

  it('shows "Save Changes" button in edit mode', () => {
    const tournament = buildTournament()
    render(<TournamentForm tournament={tournament} />)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('has series dropdown with OPC Main and OPC Open options', () => {
    render(<TournamentForm />)
    const select = screen.getByLabelText(/series/i) as HTMLSelectElement
    const options = Array.from(select.options).map(o => o.text)
    expect(options).toContain('OPC Main')
    expect(options).toContain('OPC Open')
  })

  it('does not show status field in create mode', () => {
    render(<TournamentForm />)
    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument()
  })

  it('shows status field in edit mode', () => {
    const tournament = buildTournament({ status: 'upcoming' })
    render(<TournamentForm tournament={tournament} />)
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('includes hidden id field in edit mode', () => {
    const tournament = buildTournament()
    const { container } = render(<TournamentForm tournament={tournament} />)
    const hiddenInput = container.querySelector('input[name="id"]') as HTMLInputElement
    expect(hiddenInput).toBeTruthy()
    expect(hiddenInput.value).toBe(tournament.id)
  })
})
