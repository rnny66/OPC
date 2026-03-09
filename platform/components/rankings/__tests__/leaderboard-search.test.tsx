import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Suspense } from 'react'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/rankings',
}))

import { LeaderboardSearch } from '../leaderboard-search'

afterEach(() => {
  cleanup()
  mockPush.mockClear()
})

const countries = [
  { code: 'NL', name: 'Netherlands' },
  { code: 'DE', name: 'Germany' },
]

describe('LeaderboardSearch', () => {
  it('renders search input', () => {
    render(
      <Suspense fallback={null}>
        <LeaderboardSearch countries={countries} />
      </Suspense>
    )
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders country filter dropdown', () => {
    render(
      <Suspense fallback={null}>
        <LeaderboardSearch countries={countries} />
      </Suspense>
    )
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
    expect(screen.getByText('Netherlands')).toBeInTheDocument()
  })

  it('updates URL when country is selected', () => {
    render(
      <Suspense fallback={null}>
        <LeaderboardSearch countries={countries} />
      </Suspense>
    )
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'NL' } })
    expect(mockPush).toHaveBeenCalledWith('/rankings?country=NL')
  })
})
