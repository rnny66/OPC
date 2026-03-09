import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: vi.fn(),
}))

import OrganizerDashboardPage from '../page'
import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const mockTournaments = [
  {
    id: 'tour-1',
    name: 'Prague Poker Open',
    start_date: '2027-06-15',
    city: 'Prague',
    status: 'upcoming',
    tournament_registrations: [{ count: 42 }],
  },
  {
    id: 'tour-2',
    name: 'Vienna Championship',
    start_date: '2027-08-20',
    city: 'Vienna',
    status: 'draft',
    tournament_registrations: [{ count: 10 }],
  },
]

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()

  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'organizer@test.com' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockTournaments }),
        }),
      }),
    }),
  }

  vi.mocked(createSupabaseServer).mockResolvedValue(mockSupabase as any)
})

describe('OrganizerDashboardPage', () => {
  it('renders "Organizer Dashboard" heading', async () => {
    const Page = await OrganizerDashboardPage()
    render(Page)
    expect(screen.getByRole('heading', { name: /organizer dashboard/i })).toBeInTheDocument()
  })

  it('shows tournament names from mock data', async () => {
    const Page = await OrganizerDashboardPage()
    render(Page)
    expect(screen.getByText('Prague Poker Open')).toBeInTheDocument()
    expect(screen.getByText('Vienna Championship')).toBeInTheDocument()
  })

  it('shows a "Create Tournament" link', async () => {
    const Page = await OrganizerDashboardPage()
    render(Page)
    const link = screen.getByRole('link', { name: /create tournament/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/organizer/tournaments/new')
  })

  it('shows stats cards with correct values', async () => {
    const Page = await OrganizerDashboardPage()
    render(Page)
    expect(screen.getByText('Total Tournaments')).toBeInTheDocument()
    expect(screen.getByText('Total Registrations')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    // 2 tournaments and 2 upcoming (both show "2")
    const statValues = screen.getAllByText('2')
    expect(statValues.length).toBeGreaterThanOrEqual(2)
    // 42 + 10 = 52 registrations
    expect(screen.getByText('52')).toBeInTheDocument()
  })

  it('redirects to /login if no user', async () => {
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: vi.fn(),
    }
    vi.mocked(createSupabaseServer).mockResolvedValue(mockSupabase as any)

    await expect(OrganizerDashboardPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
