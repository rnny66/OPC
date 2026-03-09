import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

import { RegistrationButton } from '../registration-button'

afterEach(() => cleanup())

const baseProps = {
  tournamentId: 'test-id',
  isLoggedIn: true,
  isRegistered: false,
  isOnboarded: true,
  isVerified: false,
  requiresVerification: false,
  registrationOpen: true,
  isFull: false,
  isPastDeadline: false,
}

describe('RegistrationButton', () => {
  it('renders Register button when eligible', () => {
    render(<RegistrationButton {...baseProps} />)
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows login prompt when not logged in', () => {
    render(<RegistrationButton {...baseProps} isLoggedIn={false} />)
    expect(screen.getByText(/log in to register/i)).toBeInTheDocument()
  })

  it('shows already registered status', () => {
    render(<RegistrationButton {...baseProps} isRegistered={true} />)
    expect(screen.getByText(/you are registered/i)).toBeInTheDocument()
  })

  it('shows complete profile prompt when not onboarded', () => {
    render(<RegistrationButton {...baseProps} isOnboarded={false} />)
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
  })

  it('shows verification required when tournament requires it and user is not verified', () => {
    render(<RegistrationButton {...baseProps} requiresVerification={true} isVerified={false} />)
    expect(screen.getByText(/identity verification required/i)).toBeInTheDocument()
  })

  it('shows full when capacity reached', () => {
    render(<RegistrationButton {...baseProps} isFull={true} />)
    expect(screen.getByText(/tournament is full/i)).toBeInTheDocument()
  })

  it('shows closed when registration not open', () => {
    render(<RegistrationButton {...baseProps} registrationOpen={false} />)
    expect(screen.getByText(/registration closed/i)).toBeInTheDocument()
  })

  it('shows deadline passed', () => {
    render(<RegistrationButton {...baseProps} isPastDeadline={true} />)
    expect(screen.getByText(/registration deadline passed/i)).toBeInTheDocument()
  })
})
