import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  afterEach(() => cleanup())

  it('renders with default styles', () => {
    render(<Skeleton data-testid="skel" />)
    const el = screen.getByTestId('skel')
    expect(el).toBeInTheDocument()
    expect(el.style.borderRadius).toBe('0.375rem')
  })

  it('applies custom width and height', () => {
    render(<Skeleton width="200px" height="1.5rem" data-testid="skel" />)
    const el = screen.getByTestId('skel')
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('1.5rem')
  })

  it('renders as circle when circle prop is set', () => {
    render(<Skeleton width="48px" height="48px" circle data-testid="skel" />)
    const el = screen.getByTestId('skel')
    expect(el.style.borderRadius).toBe('50%')
  })
})
