import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ToastProvider } from '@/components/ui/toast'
import { ResultsEntryForm } from '../results-entry-form'

vi.mock('@/lib/actions/results', () => ({
  saveResults: vi.fn(),
}))

afterEach(() => cleanup())

const mockPlayers = [
  { id: 'p1', displayName: 'Alice', nationality: 'NL' },
  { id: 'p2', displayName: 'Bob', nationality: 'DE' },
  { id: 'p3', displayName: 'Charlie', nationality: null },
]

describe('ResultsEntryForm', () => {
  it('renders all players in the table', () => {
    render(
      <ToastProvider><ResultsEntryForm
        tournamentId="t1"
        pointsMultiplier={1.0}
        players={mockPlayers}
        existingResults={[]}
      /></ToastProvider>
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('renders placement inputs with aria labels', () => {
    render(
      <ToastProvider><ResultsEntryForm
        tournamentId="t1"
        pointsMultiplier={1.0}
        players={mockPlayers}
        existingResults={[]}
      /></ToastProvider>
    )
    expect(
      screen.getByLabelText('Placement for Alice')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Placement for Bob')
    ).toBeInTheDocument()
  })

  it('pre-fills existing results', () => {
    render(
      <ToastProvider><ResultsEntryForm
        tournamentId="t1"
        pointsMultiplier={1.0}
        players={mockPlayers}
        existingResults={[
          { playerId: 'p1', placement: 1, pointsAwarded: 1000 },
          { playerId: 'p2', placement: 3, pointsAwarded: 500 },
        ]}
      /></ToastProvider>
    )
    const aliceInput = screen.getByLabelText('Placement for Alice') as HTMLInputElement
    const bobInput = screen.getByLabelText('Placement for Bob') as HTMLInputElement
    expect(aliceInput.value).toBe('1')
    expect(bobInput.value).toBe('3')
  })

  it('shows auto-calculated points when placement is entered', () => {
    render(
      <ToastProvider><ResultsEntryForm
        tournamentId="t1"
        pointsMultiplier={1.0}
        players={mockPlayers}
        existingResults={[]}
      /></ToastProvider>
    )
    const input = screen.getByLabelText('Placement for Alice')
    fireEvent.change(input, { target: { value: '1' } })

    // 1st place = 1000 points with 1.0 multiplier
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  it('applies points multiplier correctly', () => {
    render(
      <ToastProvider><ResultsEntryForm
        tournamentId="t1"
        pointsMultiplier={1.5}
        players={mockPlayers}
        existingResults={[]}
      /></ToastProvider>
    )
    const input = screen.getByLabelText('Placement for Alice')
    fireEvent.change(input, { target: { value: '1' } })

    // 1st place = 1000 * 1.5 = 1500
    expect(screen.getByText('1500')).toBeInTheDocument()
  })

  it('renders Save Results button', () => {
    render(
      <ToastProvider><ResultsEntryForm
        tournamentId="t1"
        pointsMultiplier={1.0}
        players={mockPlayers}
        existingResults={[]}
      /></ToastProvider>
    )
    expect(
      screen.getByRole('button', { name: /save results/i })
    ).toBeInTheDocument()
  })

  it('shows error when saving with no placements', () => {
    render(
      <ToastProvider><ResultsEntryForm
        tournamentId="t1"
        pointsMultiplier={1.0}
        players={mockPlayers}
        existingResults={[]}
      /></ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /save results/i }))
    expect(screen.getByText('Enter at least one placement.')).toBeInTheDocument()
  })
})
