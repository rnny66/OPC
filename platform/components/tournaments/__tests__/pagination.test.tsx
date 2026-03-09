// platform/components/tournaments/__tests__/pagination.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Suspense } from 'react'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('country=NL'),
  usePathname: () => '/tournaments',
}))

import { Pagination } from '../pagination'

afterEach(() => {
  cleanup()
  mockPush.mockClear()
})

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Suspense fallback={null}>
        <Pagination currentPage={1} totalPages={1} />
      </Suspense>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders page buttons when totalPages > 1', () => {
    render(
      <Suspense fallback={null}>
        <Pagination currentPage={1} totalPages={3} />
      </Suspense>
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(
      <Suspense fallback={null}>
        <Pagination currentPage={1} totalPages={3} />
      </Suspense>
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <Suspense fallback={null}>
        <Pagination currentPage={3} totalPages={3} />
      </Suspense>
    )
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})
