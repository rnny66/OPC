import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Suspense } from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import { LoginForm } from '../login-form'

afterEach(() => cleanup())

function renderLoginForm() {
  return render(
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderLoginForm()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders login button', () => {
    renderLoginForm()
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument()
  })

  it('renders social login buttons', () => {
    renderLoginForm()
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument()
  })

  it('renders link to signup', () => {
    renderLoginForm()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })
})
