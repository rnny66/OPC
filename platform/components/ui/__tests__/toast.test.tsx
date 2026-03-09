import { render, screen, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ToastProvider, useToast } from '../toast'

function TestComponent() {
  const { toast } = useToast()
  return (
    <button onClick={() => toast({ type: 'success', message: 'It worked!' })}>
      Show toast
    </button>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows toast message when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      screen.getByText('Show toast').click()
    })

    expect(screen.getByText('It worked!')).toBeInTheDocument()
  })

  it('auto-dismisses after 3 seconds', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      screen.getByText('Show toast').click()
    })
    expect(screen.getByText('It worked!')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(3500)
    })
    expect(screen.queryByText('It worked!')).not.toBeInTheDocument()
  })

  it('supports error type', async () => {
    function ErrorTest() {
      const { toast } = useToast()
      return <button onClick={() => toast({ type: 'error', message: 'Failed!' })}>Error</button>
    }

    render(
      <ToastProvider>
        <ErrorTest />
      </ToastProvider>
    )

    await act(async () => {
      screen.getByText('Error').click()
    })
    expect(screen.getByText('Failed!')).toBeInTheDocument()
  })
})
