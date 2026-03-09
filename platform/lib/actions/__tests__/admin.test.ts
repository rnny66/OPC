import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- mocks ----------

const mockAdminFrom = vi.fn()
const mockAdminClient = { from: mockAdminFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdmin: vi.fn(() => mockAdminClient),
}))

const mockServerSelect = vi.fn()
const mockServerAuth = {
  getUser: vi.fn(),
}
const mockServerClient = {
  auth: mockServerAuth,
  from: vi.fn(() => ({
    select: mockServerSelect,
  })),
}
// Make the chained .select().eq().single() work
mockServerSelect.mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    }),
  }),
})

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: vi.fn(() => Promise.resolve(mockServerClient)),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// ---------- imports (after mocks) ----------

import {
  promoteToOrganizer,
  inviteOrganizer,
  cancelTournamentAdmin,
} from '../admin'

// ---------- helpers ----------

function setupAdminAuth(userId = 'admin-user-id') {
  mockServerAuth.getUser.mockResolvedValue({
    data: { user: { id: userId } },
  })
}

function setupAdminChain(resolvedValue: { data?: unknown; error?: unknown }) {
  const chain = {
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue(resolvedValue),
    eq: vi.fn().mockResolvedValue(resolvedValue),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
  }
  mockAdminFrom.mockReturnValue(chain)
  return chain
}

// ---------- tests ----------

beforeEach(() => {
  vi.clearAllMocks()
  // Default: authenticated admin
  setupAdminAuth()
  // Re-setup the server from() chain for requireAdmin
  mockServerClient.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
    }),
  })
})

describe('promoteToOrganizer', () => {
  it('updates the user role to organizer', async () => {
    const chain = setupAdminChain({ data: {}, error: null })

    const result = await promoteToOrganizer('target-user-id')

    expect(mockAdminFrom).toHaveBeenCalledWith('profiles')
    expect(chain.update).toHaveBeenCalledWith({ role: 'organizer' })
    expect(chain.eq).toHaveBeenCalledWith('id', 'target-user-id')
    expect(result).toEqual({ success: true })
  })

  it('returns error when update fails', async () => {
    setupAdminChain({ data: null, error: { message: 'Update failed' } })

    const result = await promoteToOrganizer('target-user-id')

    expect(result).toEqual({ error: 'Update failed' })
  })

  it('throws when not authenticated', async () => {
    mockServerAuth.getUser.mockResolvedValue({
      data: { user: null },
    })

    await expect(promoteToOrganizer('target-user-id')).rejects.toThrow(
      'Not authenticated'
    )
  })
})

describe('inviteOrganizer', () => {
  it('inserts an organizer invitation', async () => {
    const chain = setupAdminChain({ data: {}, error: null })

    const result = await inviteOrganizer('neworg@example.com')

    expect(mockAdminFrom).toHaveBeenCalledWith('organizer_invitations')
    expect(chain.insert).toHaveBeenCalledWith({
      email: 'neworg@example.com',
      invited_by: 'admin-user-id',
    })
    expect(result).toEqual({ success: true })
  })

  it('returns error when insert fails', async () => {
    setupAdminChain({ data: null, error: { message: 'Duplicate email' } })

    const result = await inviteOrganizer('dup@example.com')

    expect(result).toEqual({ error: 'Duplicate email' })
  })

  it('throws when not admin', async () => {
    mockServerClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'player' },
            error: null,
          }),
        }),
      }),
    })

    await expect(inviteOrganizer('test@example.com')).rejects.toThrow(
      'Not authorized'
    )
  })
})

describe('cancelTournamentAdmin', () => {
  it('sets tournament status to cancelled', async () => {
    const chain = setupAdminChain({ data: {}, error: null })

    const result = await cancelTournamentAdmin('tournament-123')

    expect(mockAdminFrom).toHaveBeenCalledWith('tournaments')
    expect(chain.update).toHaveBeenCalledWith({ status: 'cancelled' })
    expect(chain.eq).toHaveBeenCalledWith('id', 'tournament-123')
    expect(result).toEqual({ success: true })
  })

  it('returns error when update fails', async () => {
    setupAdminChain({
      data: null,
      error: { message: 'Tournament not found' },
    })

    const result = await cancelTournamentAdmin('bad-id')

    expect(result).toEqual({ error: 'Tournament not found' })
  })
})
