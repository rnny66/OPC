import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Suspense } from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import { SignupForm } from '../signup-form'

afterEach(() => cleanup())

function renderSignupForm() {
  return render(
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}

describe('SignupForm', () => {
  it('renders email and password fields', () => {
    renderSignupForm()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders signup button', () => {
    renderSignupForm()
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument()
  })

  it('renders social signup buttons', () => {
    renderSignupForm()
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument()
  })

  it('renders link to login', () => {
    renderSignupForm()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })
})
