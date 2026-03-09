import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { VerificationStatus } from '../verification-status'

afterEach(() => cleanup())

describe('VerificationStatus', () => {
  it('shows verified badge when verified', () => {
    render(<VerificationStatus isVerified={true} verifiedAt="2026-01-15T10:00:00Z" />)
    expect(screen.getByText(/identity verified/i)).toBeInTheDocument()
  })

  it('shows verify button when not verified', () => {
    render(<VerificationStatus isVerified={false} verifiedAt={null} />)
    expect(screen.getByRole('link', { name: /verify/i })).toBeInTheDocument()
  })

  it('links to verify-identity page', () => {
    render(<VerificationStatus isVerified={false} verifiedAt={null} />)
    const link = screen.getByRole('link', { name: /verify/i })
    expect(link).toHaveAttribute('href', '/verify-identity')
  })

  it('shows verification date when verified', () => {
    render(<VerificationStatus isVerified={true} verifiedAt="2026-01-15T10:00:00Z" />)
    expect(screen.getByText(/jan/i)).toBeInTheDocument()
  })
})
