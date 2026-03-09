import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { InviteOrganizerForm } from '../invite-organizer-form'

vi.mock('@/lib/actions/admin', () => ({
  inviteOrganizer: vi.fn(),
}))

afterEach(() => cleanup())

describe('InviteOrganizerForm', () => {
  it('renders email input and submit button', () => {
    render(<InviteOrganizerForm />)

    expect(screen.getByPlaceholderText('organizer@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Invite' })).toBeInTheDocument()
  })

  it('email input has type="email" and is required', () => {
    render(<InviteOrganizerForm />)

    const input = screen.getByPlaceholderText('organizer@example.com')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toBeRequired()
  })
})
