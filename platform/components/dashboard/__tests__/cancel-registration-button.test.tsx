// platform/components/dashboard/__tests__/cancel-registration-button.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import { CancelRegistrationButton } from '../cancel-registration-button'

afterEach(() => cleanup())

describe('CancelRegistrationButton', () => {
  it('renders cancel button', () => {
    render(<CancelRegistrationButton registrationId="test-id" />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows confirmation text after clicking', () => {
    render(<CancelRegistrationButton registrationId="test-id" />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })
})
