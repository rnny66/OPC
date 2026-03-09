import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ToastProvider } from '@/components/ui/toast'

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
    render(<ToastProvider><RegistrationButton {...baseProps} /></ToastProvider>)
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows login prompt when not logged in', () => {
    render(<ToastProvider><RegistrationButton {...baseProps} isLoggedIn={false} /></ToastProvider>)
    expect(screen.getByText(/log in to register/i)).toBeInTheDocument()
  })

  it('shows already registered status', () => {
    render(<ToastProvider><RegistrationButton {...baseProps} isRegistered={true} /></ToastProvider>)
    expect(screen.getByText(/you are registered/i)).toBeInTheDocument()
  })

  it('shows complete profile prompt when not onboarded', () => {
    render(<ToastProvider><RegistrationButton {...baseProps} isOnboarded={false} /></ToastProvider>)
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
  })

  it('shows verification required when tournament requires it and user is not verified', () => {
    render(<ToastProvider><RegistrationButton {...baseProps} requiresVerification={true} isVerified={false} /></ToastProvider>)
    expect(screen.getByText(/identity verification required/i)).toBeInTheDocument()
  })

  it('shows full when capacity reached', () => {
    render(<ToastProvider><RegistrationButton {...baseProps} isFull={true} /></ToastProvider>)
    expect(screen.getByText(/tournament is full/i)).toBeInTheDocument()
  })

  it('shows closed when registration not open', () => {
    render(<ToastProvider><RegistrationButton {...baseProps} registrationOpen={false} /></ToastProvider>)
    expect(screen.getByText(/registration closed/i)).toBeInTheDocument()
  })

  it('shows deadline passed', () => {
    render(<ToastProvider><RegistrationButton {...baseProps} isPastDeadline={true} /></ToastProvider>)
    expect(screen.getByText(/registration deadline passed/i)).toBeInTheDocument()
  })
})
