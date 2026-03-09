import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { RankBadge } from '../rank-badge'

afterEach(() => {
  cleanup()
})

describe('RankBadge', () => {
  it('shows rank number', () => {
    render(<RankBadge currentRank={5} previousRank={null} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows up arrow when rank improved', () => {
    render(<RankBadge currentRank={3} previousRank={5} />)
    expect(screen.getByLabelText('Rank improved')).toBeInTheDocument()
  })

  it('shows down arrow when rank dropped', () => {
    render(<RankBadge currentRank={5} previousRank={3} />)
    expect(screen.getByLabelText('Rank dropped')).toBeInTheDocument()
  })

  it('shows dash when rank unchanged', () => {
    render(<RankBadge currentRank={5} previousRank={5} />)
    expect(screen.getByLabelText('Rank unchanged')).toBeInTheDocument()
  })

  it('shows dash when no previous rank', () => {
    render(<RankBadge currentRank={5} previousRank={null} />)
    expect(screen.getByLabelText('Rank unchanged')).toBeInTheDocument()
  })
})
