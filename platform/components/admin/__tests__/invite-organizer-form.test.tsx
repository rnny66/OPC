import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ToastProvider } from '@/components/ui/toast'
import { InviteOrganizerForm } from '../invite-organizer-form'

vi.mock('@/lib/actions/admin', () => ({
  inviteOrganizer: vi.fn(),
}))

afterEach(() => cleanup())

describe('InviteOrganizerForm', () => {
  it('renders email input and submit button', () => {
    render(<ToastProvider><InviteOrganizerForm /></ToastProvider>)

    expect(screen.getByPlaceholderText('organizer@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Invite' })).toBeInTheDocument()
  })

  it('email input has type="email" and is required', () => {
    render(<ToastProvider><InviteOrganizerForm /></ToastProvider>)

    const input = screen.getByPlaceholderText('organizer@example.com')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toBeRequired()
  })
})
