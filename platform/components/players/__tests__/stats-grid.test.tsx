import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { StatsGrid } from '../stats-grid'

const mockStats = {
  total_points: 15000,
  tournament_count: 12,
  win_count: 3,
  top3_count: 7,
  avg_finish: 4.2,
  best_finish: 1,
}

describe('StatsGrid', () => {
  afterEach(() => cleanup())

  it('renders all 6 stat cards', () => {
    render(<StatsGrid stats={mockStats} />)
    expect(screen.getByText('Total Points')).toBeInTheDocument()
    expect(screen.getByText('15,000')).toBeInTheDocument()
    expect(screen.getByText('Tournaments')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Wins')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Top 3')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Avg Finish')).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('Best Finish')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows dashes for null values', () => {
    render(<StatsGrid stats={{ ...mockStats, avg_finish: null, best_finish: null }} />)
    const dashes = screen.getAllByText('—')
    expect(dashes).toHaveLength(2)
  })
})
