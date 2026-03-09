import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import { Spinner } from '../spinner'

afterEach(cleanup)

describe('Spinner', () => {
  it('renders with spin animation', () => {
    render(<Spinner data-testid="spinner" />)
    const el = screen.getByTestId('spinner')
    expect(el).toBeInTheDocument()
    expect(el.style.animation).toContain('spin')
  })

  it('accepts custom size', () => {
    render(<Spinner size="1.5rem" data-testid="spinner" />)
    const el = screen.getByTestId('spinner')
    expect(el.style.width).toBe('1.5rem')
    expect(el.style.height).toBe('1.5rem')
  })
})
