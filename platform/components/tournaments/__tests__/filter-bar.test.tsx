// platform/components/tournaments/__tests__/filter-bar.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Suspense } from 'react'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/tournaments',
}))

import { FilterBar } from '../filter-bar'

afterEach(() => {
  cleanup()
  mockPush.mockClear()
})

describe('FilterBar', () => {
  const countries = ['NL', 'DE', 'BE', 'GB']
  const seriesList = ['OPC Main', 'OPC Open']

  it('renders country select', () => {
    render(
      <Suspense fallback={null}>
        <FilterBar countries={countries} seriesList={seriesList} />
      </Suspense>
    )
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
  })

  it('renders series select', () => {
    render(
      <Suspense fallback={null}>
        <FilterBar countries={countries} seriesList={seriesList} />
      </Suspense>
    )
    expect(screen.getByLabelText(/series/i)).toBeInTheDocument()
  })

  it('renders sort select', () => {
    render(
      <Suspense fallback={null}>
        <FilterBar countries={countries} seriesList={seriesList} />
      </Suspense>
    )
    expect(screen.getByLabelText(/sort/i)).toBeInTheDocument()
  })

  it('updates URL when country changes', () => {
    render(
      <Suspense fallback={null}>
        <FilterBar countries={countries} seriesList={seriesList} />
      </Suspense>
    )
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'NL' } })
    expect(mockPush).toHaveBeenCalledWith('/tournaments?country=NL')
  })
})
