import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PlayerProfileHeader } from '../player-profile-header'

const mockProfile = {
  display_name: 'John Doe',
  avatar_url: null,
  home_country: 'NL',
  nationality: ['NL'],
  created_at: '2025-06-15T00:00:00Z',
}

describe('PlayerProfileHeader', () => {
  afterEach(() => cleanup())

  it('renders player name', () => {
    render(<PlayerProfileHeader profile={mockProfile} rank={5} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows rank when provided', () => {
    render(<PlayerProfileHeader profile={mockProfile} rank={5} />)
    expect(screen.getByText('#5')).toBeInTheDocument()
    expect(screen.getByText('Global Rank')).toBeInTheDocument()
  })

  it('shows initials when no avatar', () => {
    render(<PlayerProfileHeader profile={mockProfile} rank={null} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows member since date', () => {
    render(<PlayerProfileHeader profile={mockProfile} rank={null} />)
    expect(screen.getByText(/member since/i)).toBeInTheDocument()
  })

  it('shows country', () => {
    render(<PlayerProfileHeader profile={mockProfile} rank={null} />)
    expect(screen.getByText('NL')).toBeInTheDocument()
  })
})
