import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ToastProvider } from '@/components/ui/toast'
import { ProfileForm } from '../profile-form'
import { buildProfile } from '@/test-utils/factories'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

afterEach(() => cleanup())

describe('ProfileForm', () => {
  const profile = buildProfile({
    display_name: 'TestPlayer',
    city: 'Amsterdam',
    home_country: 'NL',
    nationality: ['NL'],
    bio: 'Poker enthusiast',
  })

  it('renders display name field with value', () => {
    render(<ToastProvider><ProfileForm profile={profile} /></ToastProvider>)
    const input = screen.getByLabelText(/display name/i) as HTMLInputElement
    expect(input.value).toBe('TestPlayer')
  })

  it('renders city field', () => {
    render(<ToastProvider><ProfileForm profile={profile} /></ToastProvider>)
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
  })

  it('renders country field', () => {
    render(<ToastProvider><ProfileForm profile={profile} /></ToastProvider>)
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
  })

  it('renders bio field', () => {
    render(<ToastProvider><ProfileForm profile={profile} /></ToastProvider>)
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(<ToastProvider><ProfileForm profile={profile} /></ToastProvider>)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders avatar upload', () => {
    render(<ToastProvider><ProfileForm profile={profile} /></ToastProvider>)
    expect(screen.getByLabelText(/avatar/i)).toBeInTheDocument()
  })
})
