import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { UserTable } from '../user-table'

vi.mock('@/lib/actions/admin', () => ({
  promoteToOrganizer: vi.fn(),
}))

afterEach(() => cleanup())

const mockUsers = [
  {
    id: 'user-1',
    display_name: 'Alice',
    email: 'alice@example.com',
    role: 'player' as const,
    identity_verified: true,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    display_name: 'Bob',
    email: 'bob@example.com',
    role: 'organizer' as const,
    identity_verified: false,
    created_at: '2026-02-20T10:00:00Z',
  },
]

describe('UserTable', () => {
  it('renders user rows with name and email', () => {
    render(<UserTable users={mockUsers} />)
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('alice@example.com')).toBeDefined()
    expect(screen.getByText('Bob')).toBeDefined()
    expect(screen.getByText('bob@example.com')).toBeDefined()
  })

  it('shows promote button only for players', () => {
    render(<UserTable users={mockUsers} />)
    const promoteButtons = screen.getAllByRole('button', { name: /promote to organizer/i })
    expect(promoteButtons).toHaveLength(1)
  })

  it('shows role badges', () => {
    render(<UserTable users={mockUsers} />)
    expect(screen.getByText('player')).toBeDefined()
    expect(screen.getByText('organizer')).toBeDefined()
  })

  it('shows verified status', () => {
    render(<UserTable users={mockUsers} />)
    const cells = screen.getAllByRole('cell')
    const verifiedCells = cells.filter(
      cell => cell.textContent === '\u2705' || cell.textContent === '\u2014'
    )
    expect(verifiedCells).toHaveLength(2)
  })

  it('renders empty state', () => {
    render(<UserTable users={[]} />)
    expect(screen.getByText('No users found.')).toBeDefined()
  })
})
