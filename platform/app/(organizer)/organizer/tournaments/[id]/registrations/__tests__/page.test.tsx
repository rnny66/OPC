import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: vi.fn(),
}))

vi.mock('@/components/organizer/registration-status-select', () => ({
  RegistrationStatusSelect: ({ currentStatus }: any) => (
    <span data-testid="status-select">{currentStatus}</span>
  ),
}))

vi.mock('@/components/organizer/export-csv-button', () => ({
  ExportCSVButton: () => <button>Export CSV</button>,
}))

import RegistrationsPage from '../page'
import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

const mockTournament = {
  id: 'tour-1',
  name: 'Prague Poker Open',
  organizer_id: 'user-1',
  capacity: 100,
  start_date: '2027-06-15',
}

const mockRegistrations = [
  {
    id: 'reg-1',
    tournament_id: 'tour-1',
    player_id: 'player-1',
    status: 'registered',
    registered_at: '2027-05-01T10:00:00Z',
    profiles: {
      display_name: 'John Doe',
      nationality: ['Czech Republic'],
    },
  },
  {
    id: 'reg-2',
    tournament_id: 'tour-1',
    player_id: 'player-2',
    status: 'confirmed',
    registered_at: '2027-05-02T14:00:00Z',
    profiles: {
      display_name: 'Jane Smith',
      nationality: ['Austria'],
    },
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
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'tournaments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockTournament }),
            }),
          }),
        }
      }
      // tournament_registrations
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            neq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockRegistrations }),
            }),
          }),
        }),
      }
    }),
  }

  vi.mocked(createSupabaseServer).mockResolvedValue(mockSupabase as any)
})

const params = Promise.resolve({ id: 'tour-1' })

describe('RegistrationsPage', () => {
  it('renders tournament name in heading', async () => {
    const Page = await RegistrationsPage({ params })
    render(Page)
    expect(
      screen.getByRole('heading', { name: /Prague Poker Open/i })
    ).toBeInTheDocument()
  })

  it('shows player names in table', async () => {
    const Page = await RegistrationsPage({ params })
    render(Page)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows registration count', async () => {
    const Page = await RegistrationsPage({ params })
    render(Page)
    expect(screen.getByText(/2 \/ 100 registered/)).toBeInTheDocument()
  })

  it('renders status select for each registration', async () => {
    const Page = await RegistrationsPage({ params })
    render(Page)
    const selects = screen.getAllByTestId('status-select')
    expect(selects).toHaveLength(2)
    expect(selects[0]).toHaveTextContent('registered')
    expect(selects[1]).toHaveTextContent('confirmed')
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

    await expect(RegistrationsPage({ params })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('calls notFound if tournament does not exist', async () => {
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    }
    vi.mocked(createSupabaseServer).mockResolvedValue(mockSupabase as any)

    await expect(RegistrationsPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})
