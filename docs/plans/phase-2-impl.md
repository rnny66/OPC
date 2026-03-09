# Phase 2 — Core Tournament Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the player-facing tournament experience — browse, detail, register, dashboard, and profile with avatar upload.

**Architecture:** Server Components with URL search params for all pages. Client Components only for interactive pieces (FilterBar, RegistrationButton, ProfileForm). Supabase server client for data fetching, browser client for mutations. Inline styles with CSS custom properties matching existing auth component patterns.

**Tech Stack:** Next.js 15 (App Router), Supabase (@supabase/ssr), TypeScript, Vitest + RTL for unit tests

---

## Task 1: TournamentCard Component

**Files:**
- Create: `platform/components/tournaments/tournament-card.tsx`
- Create: `platform/components/tournaments/__tests__/tournament-card.test.tsx`

**Step 1: Write the failing test**

```tsx
// platform/components/tournaments/__tests__/tournament-card.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TournamentCard } from '../tournament-card'
import { buildTournament } from '@/test-utils/factories'

describe('TournamentCard', () => {
  const tournament = buildTournament({
    name: 'Amsterdam Open',
    club_name: 'Holland Casino',
    city: 'Amsterdam',
    country: 'NL',
    start_date: '2026-03-11',
    end_date: '2026-03-14',
    entry_fee: 0,
  })

  it('renders tournament name', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Amsterdam Open')).toBeInTheDocument()
  })

  it('renders venue and city', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Holland Casino, Amsterdam')).toBeInTheDocument()
  })

  it('renders date range', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Mar 11 – Mar 14, 2026')).toBeInTheDocument()
  })

  it('renders "Free entry" when entry_fee is 0', () => {
    render(<TournamentCard tournament={tournament} />)
    expect(screen.getByText('Free entry')).toBeInTheDocument()
  })

  it('renders formatted entry fee when > 0', () => {
    const paid = buildTournament({ entry_fee: 5000 })
    render(<TournamentCard tournament={paid} />)
    expect(screen.getByText('€50 buy-in')).toBeInTheDocument()
  })

  it('renders registered badge when isRegistered is true', () => {
    render(<TournamentCard tournament={tournament} isRegistered />)
    expect(screen.getByText('Registered')).toBeInTheDocument()
  })

  it('links to tournament detail page', () => {
    render(<TournamentCard tournament={tournament} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/tournaments/${tournament.id}`)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/tournaments/__tests__/tournament-card.test.tsx`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```tsx
// platform/components/tournaments/tournament-card.tsx
import Link from 'next/link'
import type { Tournament } from '@/test-utils/factories'

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = s.toLocaleDateString('en-US', opts)
  const endStr = e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  return `${startStr} – ${endStr}`
}

function formatEntryFee(fee: number): string {
  if (fee === 0) return 'Free entry'
  return `€${fee / 100} buy-in`
}

const styles = {
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    transition: 'border-color 0.2s ease',
  } as React.CSSProperties,
  body: {
    padding: '1rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.375rem',
  } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  } as React.CSSProperties,
}

export function TournamentCard({
  tournament,
  isRegistered = false,
}: {
  tournament: Tournament
  isRegistered?: boolean
}) {
  return (
    <Link href={`/tournaments/${tournament.id}`} style={styles.link}>
      <div style={styles.card}>
        <div style={styles.body}>
          {isRegistered && <span style={styles.badge}>Registered</span>}
          <h3 style={styles.title}>{tournament.name}</h3>
          <div style={styles.row}>
            <span>{tournament.club_name}, {tournament.city}</span>
          </div>
          <div style={styles.row}>
            <span>{formatDateRange(tournament.start_date, tournament.end_date)}</span>
          </div>
          <div style={styles.row}>
            <span>{formatEntryFee(tournament.entry_fee)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/tournaments/__tests__/tournament-card.test.tsx`
Expected: PASS (7 tests)

**Step 5: Commit**

```bash
git add platform/components/tournaments/
git commit -m "feat: add TournamentCard component with tests"
```

---

## Task 2: FilterBar Component

**Files:**
- Create: `platform/components/tournaments/filter-bar.tsx`
- Create: `platform/components/tournaments/__tests__/filter-bar.test.tsx`

**Step 1: Write the failing test**

```tsx
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
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/tournaments/__tests__/filter-bar.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

```tsx
// platform/components/tournaments/filter-bar.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const styles = {
  bar: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  select: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none',
  } as React.CSSProperties,
}

export function FilterBar({
  countries,
  seriesList,
}: {
  countries: string[]
  seriesList: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // reset pagination on filter change
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div style={styles.bar}>
      <label>
        <span className="sr-only">Country</span>
        <select
          aria-label="Country"
          style={styles.select}
          value={searchParams.get('country') || ''}
          onChange={e => updateParam('country', e.target.value)}
        >
          <option value="">All Countries</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Series</span>
        <select
          aria-label="Series"
          style={styles.select}
          value={searchParams.get('series') || ''}
          onChange={e => updateParam('series', e.target.value)}
        >
          <option value="">All Series</option>
          {seriesList.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Sort</span>
        <select
          aria-label="Sort"
          style={styles.select}
          value={searchParams.get('sort') || 'soonest'}
          onChange={e => updateParam('sort', e.target.value)}
        >
          <option value="soonest">Soonest first</option>
          <option value="latest">Latest first</option>
          <option value="cheapest">Cheapest first</option>
        </select>
      </label>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/tournaments/__tests__/filter-bar.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add platform/components/tournaments/filter-bar.tsx platform/components/tournaments/__tests__/filter-bar.test.tsx
git commit -m "feat: add FilterBar component with URL param filtering"
```

---

## Task 3: Pagination Component

**Files:**
- Create: `platform/components/tournaments/pagination.tsx`
- Create: `platform/components/tournaments/__tests__/pagination.test.tsx`

**Step 1: Write the failing test**

```tsx
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
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/tournaments/__tests__/pagination.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

```tsx
// platform/components/tournaments/pagination.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '2rem',
  } as React.CSSProperties,
  button: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  active: {
    backgroundColor: 'var(--color-brand)',
    borderColor: 'var(--color-brand)',
    color: '#fff',
  } as React.CSSProperties,
  disabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  } as React.CSSProperties,
}

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  if (totalPages <= 1) return null

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <nav style={styles.nav} aria-label="Pagination">
      <button
        style={{ ...styles.button, ...(currentPage === 1 ? styles.disabled : {}) }}
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        aria-label="Previous page"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          style={{ ...styles.button, ...(page === currentPage ? styles.active : {}) }}
          onClick={() => goToPage(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        style={{ ...styles.button, ...(currentPage === totalPages ? styles.disabled : {}) }}
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/tournaments/__tests__/pagination.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add platform/components/tournaments/pagination.tsx platform/components/tournaments/__tests__/pagination.test.tsx
git commit -m "feat: add Pagination component with URL param navigation"
```

---

## Task 4: Tournament Browse Page (`/tournaments`)

**Files:**
- Create: `platform/app/(player)/tournaments/page.tsx`
- Create: `platform/components/tournaments/tournament-grid.tsx`

**Step 1: Create TournamentGrid wrapper**

```tsx
// platform/components/tournaments/tournament-grid.tsx
import { TournamentCard } from './tournament-card'
import type { Tournament } from '@/test-utils/factories'

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
}

export function TournamentGrid({
  tournaments,
  registeredIds = [],
}: {
  tournaments: Tournament[]
  registeredIds?: string[]
}) {
  if (tournaments.length === 0) {
    return <p style={styles.empty}>No tournaments found matching your filters.</p>
  }
  return (
    <div style={styles.grid}>
      {tournaments.map(t => (
        <TournamentCard
          key={t.id}
          tournament={t}
          isRegistered={registeredIds.includes(t.id)}
        />
      ))}
    </div>
  )
}
```

**Step 2: Create the browse page**

```tsx
// platform/app/(player)/tournaments/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server'
import { TournamentGrid } from '@/components/tournaments/tournament-grid'
import { FilterBar } from '@/components/tournaments/filter-bar'
import { Pagination } from '@/components/tournaments/pagination'
import { Suspense } from 'react'

export const metadata = { title: 'Tournaments — OPC Europe' }

const PAGE_SIZE = 16

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; series?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const country = params.country || ''
  const series = params.series || ''
  const sort = params.sort || 'soonest'
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const supabase = await createSupabaseServer()

  // Build query
  let query = supabase
    .from('tournaments')
    .select('*', { count: 'exact' })

  if (country) query = query.eq('country', country)
  if (series) query = query.eq('series', series)

  // Sort
  if (sort === 'latest') {
    query = query.order('start_date', { ascending: false })
  } else if (sort === 'cheapest') {
    query = query.order('entry_fee', { ascending: true })
  } else {
    query = query.order('start_date', { ascending: true })
  }

  // Pagination
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data: tournaments, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  // Get distinct countries and series for filter options
  const { data: countryRows } = await supabase
    .from('tournaments')
    .select('country')
  const { data: seriesRows } = await supabase
    .from('tournaments')
    .select('series')

  const countries = [...new Set(countryRows?.map(r => r.country) || [])]
  const seriesList = [...new Set(seriesRows?.map(r => r.series) || [])]

  // Check user registrations if logged in
  let registeredIds: string[] = []
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: regs } = await supabase
      .from('tournament_registrations')
      .select('tournament_id')
      .eq('player_id', user.id)
      .neq('status', 'cancelled')
    registeredIds = regs?.map(r => r.tournament_id) || []
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Find your next tournament
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Discover OPC certified tournaments across Europe
        </p>
      </div>

      <Suspense fallback={null}>
        <FilterBar countries={countries} seriesList={seriesList} />
      </Suspense>

      <TournamentGrid
        tournaments={tournaments || []}
        registeredIds={registeredIds}
      />

      <Suspense fallback={null}>
        <Pagination currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
```

**Step 3: Run dev server and verify visually**

Run: `cd platform && npm run dev`
Navigate to `http://localhost:3000/tournaments` — should show tournament cards from Supabase.

**Step 4: Commit**

```bash
git add platform/app/(player)/tournaments/ platform/components/tournaments/tournament-grid.tsx
git commit -m "feat: add tournament browse page with filters and pagination"
```

---

## Task 5: Tournament Detail Page (`/tournaments/[id]`)

**Files:**
- Create: `platform/app/(player)/tournaments/[id]/page.tsx`

**Step 1: Create the detail page**

```tsx
// platform/app/(player)/tournaments/[id]/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RegistrationButton } from '@/components/tournaments/registration-button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name')
    .eq('id', id)
    .single()
  return { title: tournament ? `${tournament.name} — OPC Europe` : 'Tournament — OPC Europe' }
}

const styles = {
  container: {
    maxWidth: '720px',
  } as React.CSSProperties,
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1rem',
  } as React.CSSProperties,
  meta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
  label: {
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    minWidth: '120px',
  } as React.CSSProperties,
  description: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  capacity: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  notice: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
}

function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatEntryFee(fee: number): string {
  if (fee === 0) return 'Free entry'
  return `€${fee / 100}`
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  // Count registrations
  const { count: registrationCount } = await supabase
    .from('tournament_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', id)
    .neq('status', 'cancelled')

  // Check if user is registered
  let userRegistration = null
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: reg } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', id)
      .eq('player_id', user.id)
      .neq('status', 'cancelled')
      .maybeSingle()
    userRegistration = reg
  }

  // Get user profile for onboarding/verification checks
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete, identity_verified')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  const isFull = tournament.capacity ? (registrationCount || 0) >= tournament.capacity : false
  const isPastDeadline = tournament.registration_deadline
    ? new Date() > new Date(tournament.registration_deadline)
    : false

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{tournament.name}</h2>

      <div style={styles.meta}>
        <div style={styles.row}>
          <span style={styles.label}>Venue</span>
          <span>{tournament.club_name}, {tournament.city}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Dates</span>
          <span>{formatDate(tournament.start_date)} – {formatDate(tournament.end_date)}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Entry Fee</span>
          <span>{formatEntryFee(tournament.entry_fee)}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Series</span>
          <span>{tournament.series}</span>
        </div>
        {tournament.venue_address && (
          <div style={styles.row}>
            <span style={styles.label}>Address</span>
            <span>{tournament.venue_address}</span>
          </div>
        )}
        {tournament.contact_email && (
          <div style={styles.row}>
            <span style={styles.label}>Contact</span>
            <span>{tournament.contact_email}</span>
          </div>
        )}
      </div>

      {tournament.description && (
        <p style={styles.description}>{tournament.description}</p>
      )}

      {tournament.capacity && (
        <div style={styles.capacity}>
          <div style={styles.row}>
            <span style={styles.label}>Capacity</span>
            <span>{registrationCount || 0} / {tournament.capacity} registered</span>
          </div>
        </div>
      )}

      {tournament.requires_verification && (
        <div style={styles.notice}>
          This tournament requires identity verification to register.
        </div>
      )}

      <RegistrationButton
        tournamentId={tournament.id}
        isLoggedIn={!!user}
        isRegistered={!!userRegistration}
        isOnboarded={userProfile?.onboarding_complete || false}
        isVerified={userProfile?.identity_verified || false}
        requiresVerification={tournament.requires_verification}
        registrationOpen={tournament.registration_open}
        isFull={isFull}
        isPastDeadline={isPastDeadline}
      />
    </div>
  )
}
```

**Step 2: Commit (RegistrationButton created in next task)**

Note: This page depends on RegistrationButton from Task 6. Commit together after Task 6.

---

## Task 6: RegistrationButton Component

**Files:**
- Create: `platform/components/tournaments/registration-button.tsx`
- Create: `platform/components/tournaments/__tests__/registration-button.test.tsx`

**Step 1: Write the failing test**

```tsx
// platform/components/tournaments/__tests__/registration-button.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

import { RegistrationButton } from '../registration-button'

afterEach(() => cleanup())

const baseProps = {
  tournamentId: 'test-id',
  isLoggedIn: true,
  isRegistered: false,
  isOnboarded: true,
  isVerified: false,
  requiresVerification: false,
  registrationOpen: true,
  isFull: false,
  isPastDeadline: false,
}

describe('RegistrationButton', () => {
  it('renders Register button when eligible', () => {
    render(<RegistrationButton {...baseProps} />)
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows login prompt when not logged in', () => {
    render(<RegistrationButton {...baseProps} isLoggedIn={false} />)
    expect(screen.getByText(/log in to register/i)).toBeInTheDocument()
  })

  it('shows already registered status', () => {
    render(<RegistrationButton {...baseProps} isRegistered={true} />)
    expect(screen.getByText(/you are registered/i)).toBeInTheDocument()
  })

  it('shows complete profile prompt when not onboarded', () => {
    render(<RegistrationButton {...baseProps} isOnboarded={false} />)
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
  })

  it('shows verification required when tournament requires it and user is not verified', () => {
    render(<RegistrationButton {...baseProps} requiresVerification={true} isVerified={false} />)
    expect(screen.getByText(/identity verification required/i)).toBeInTheDocument()
  })

  it('shows full when capacity reached', () => {
    render(<RegistrationButton {...baseProps} isFull={true} />)
    expect(screen.getByText(/tournament is full/i)).toBeInTheDocument()
  })

  it('shows closed when registration not open', () => {
    render(<RegistrationButton {...baseProps} registrationOpen={false} />)
    expect(screen.getByText(/registration closed/i)).toBeInTheDocument()
  })

  it('shows deadline passed', () => {
    render(<RegistrationButton {...baseProps} isPastDeadline={true} />)
    expect(screen.getByText(/registration deadline passed/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/tournaments/__tests__/registration-button.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

```tsx
// platform/components/tournaments/registration-button.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const styles = {
  button: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  status: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  success: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  error: {
    color: '#f04438',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  link: {
    color: 'var(--color-brand)',
    textDecoration: 'underline',
  } as React.CSSProperties,
}

export function RegistrationButton({
  tournamentId,
  isLoggedIn,
  isRegistered,
  isOnboarded,
  isVerified,
  requiresVerification,
  registrationOpen,
  isFull,
  isPastDeadline,
}: {
  tournamentId: string
  isLoggedIn: boolean
  isRegistered: boolean
  isOnboarded: boolean
  isVerified: boolean
  requiresVerification: boolean
  registrationOpen: boolean
  isFull: boolean
  isPastDeadline: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(isRegistered)
  const router = useRouter()

  // Priority order of blocking conditions
  if (!isLoggedIn) {
    return (
      <div style={styles.status}>
        <Link href={`/login?redirect=/tournaments/${tournamentId}`} style={styles.link}>
          Log in to register
        </Link>
      </div>
    )
  }

  if (registered) {
    return <div style={styles.success}>You are registered for this tournament.</div>
  }

  if (!isOnboarded) {
    return (
      <div style={styles.status}>
        <Link href="/profile" style={styles.link}>Complete your profile</Link> to register for tournaments.
      </div>
    )
  }

  if (requiresVerification && !isVerified) {
    return <div style={styles.status}>Identity verification required to register for this tournament.</div>
  }

  if (!registrationOpen) {
    return <div style={styles.status}>Registration closed.</div>
  }

  if (isPastDeadline) {
    return <div style={styles.status}>Registration deadline passed.</div>
  }

  if (isFull) {
    return <div style={styles.status}>Tournament is full.</div>
  }

  async function handleRegister() {
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert({ tournament_id: tournamentId, player_id: user.id })

    if (regError) {
      setError(regError.message)
      setLoading(false)
      return
    }

    setRegistered(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <div>
      <button
        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register for this tournament'}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/tournaments/__tests__/registration-button.test.tsx`
Expected: PASS (8 tests)

**Step 5: Commit both detail page and registration button**

```bash
git add platform/app/(player)/tournaments/[id]/ platform/components/tournaments/registration-button.tsx platform/components/tournaments/__tests__/registration-button.test.tsx
git commit -m "feat: add tournament detail page with registration button"
```

---

## Task 7: Player Dashboard (Replace Placeholder)

**Files:**
- Modify: `platform/app/(player)/dashboard/page.tsx`
- Create: `platform/components/dashboard/cancel-registration-button.tsx`
- Create: `platform/components/dashboard/__tests__/cancel-registration-button.test.tsx`

**Step 1: Write the failing test for CancelRegistrationButton**

```tsx
// platform/components/dashboard/__tests__/cancel-registration-button.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import { CancelRegistrationButton } from '../cancel-registration-button'

afterEach(() => cleanup())

describe('CancelRegistrationButton', () => {
  it('renders cancel button', () => {
    render(<CancelRegistrationButton registrationId="test-id" />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows confirmation text after clicking', () => {
    render(<CancelRegistrationButton registrationId="test-id" />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/dashboard/__tests__/cancel-registration-button.test.tsx`
Expected: FAIL

**Step 3: Write CancelRegistrationButton**

```tsx
// platform/components/dashboard/cancel-registration-button.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const styles = {
  button: {
    padding: '0.375rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  confirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  confirmButton: {
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: '#f04438',
    color: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
  } as React.CSSProperties,
}

export function CancelRegistrationButton({ registrationId }: { registrationId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    const supabase = createBrowserClient()
    await supabase
      .from('tournament_registrations')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', registrationId)

    router.refresh()
  }

  if (confirming) {
    return (
      <div style={styles.confirm}>
        <span>Are you sure?</span>
        <button style={styles.confirmButton} onClick={handleCancel} disabled={loading}>
          {loading ? '...' : 'Yes, cancel'}
        </button>
        <button style={styles.button} onClick={() => setConfirming(false)}>
          No
        </button>
      </div>
    )
  }

  return (
    <button style={styles.button} onClick={() => setConfirming(true)}>
      Cancel
    </button>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/dashboard/__tests__/cancel-registration-button.test.tsx`
Expected: PASS (2 tests)

**Step 5: Rewrite dashboard page**

```tsx
// platform/app/(player)/dashboard/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CancelRegistrationButton } from '@/components/dashboard/cancel-registration-button'

export const metadata = { title: 'Dashboard — OPC Europe' }

const styles = {
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  stats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  stat: {
    flex: 1,
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
  } as React.CSSProperties,
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  section: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  td: {
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  link: {
    color: 'var(--color-brand)',
    textDecoration: 'none',
  } as React.CSSProperties,
  empty: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    padding: '1.5rem 0',
  } as React.CSSProperties,
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch registrations with tournament data
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(*)')
    .eq('player_id', user.id)
    .neq('status', 'cancelled')
    .order('registered_at', { ascending: false })

  const now = new Date().toISOString().split('T')[0]
  const upcoming = registrations?.filter(r => r.tournaments?.start_date >= now) || []
  const past = registrations?.filter(r => r.tournaments?.start_date < now) || []

  return (
    <div>
      <h2 style={styles.title}>Dashboard</h2>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Total Registrations</div>
          <div style={styles.statValue}>{registrations?.length || 0}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Upcoming</div>
          <div style={styles.statValue}>{upcoming.length}</div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Upcoming Tournaments</h3>
        {upcoming.length === 0 ? (
          <p style={styles.empty}>
            No upcoming tournaments.{' '}
            <Link href="/tournaments" style={styles.link}>Browse tournaments</Link>
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tournament</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map(reg => (
                <tr key={reg.id}>
                  <td style={styles.td}>
                    <Link href={`/tournaments/${reg.tournament_id}`} style={styles.link}>
                      {reg.tournaments?.name}
                    </Link>
                  </td>
                  <td style={styles.td}>{reg.tournaments?.start_date}</td>
                  <td style={styles.td}>{reg.tournaments?.city}</td>
                  <td style={styles.td}>{reg.status}</td>
                  <td style={styles.td}>
                    <CancelRegistrationButton registrationId={reg.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Past Tournaments</h3>
        {past.length === 0 ? (
          <p style={styles.empty}>No past tournaments.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tournament</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map(reg => (
                <tr key={reg.id}>
                  <td style={styles.td}>
                    <Link href={`/tournaments/${reg.tournament_id}`} style={styles.link}>
                      {reg.tournaments?.name}
                    </Link>
                  </td>
                  <td style={styles.td}>{reg.tournaments?.start_date}</td>
                  <td style={styles.td}>{reg.tournaments?.city}</td>
                  <td style={styles.td}>{reg.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add platform/app/(player)/dashboard/page.tsx platform/components/dashboard/
git commit -m "feat: add dashboard with registrations list and cancel button"
```

---

## Task 8: Avatar Storage Migration

**Files:**
- Create: `supabase/migrations/004_avatar_storage.sql`

**Step 1: Write and apply the migration**

```sql
-- supabase/migrations/004_avatar_storage.sql
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read for all avatars
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
```

**Step 2: Apply via Supabase MCP**

Run: `mcp__ocp-supabase__apply_migration` with name `004_avatar_storage` and the SQL above.

**Step 3: Commit**

```bash
git add supabase/migrations/004_avatar_storage.sql
git commit -m "feat: add avatars storage bucket with RLS policies"
```

---

## Task 9: Profile Page

**Files:**
- Create: `platform/app/(player)/profile/page.tsx`
- Create: `platform/components/profile/profile-form.tsx`
- Create: `platform/components/profile/__tests__/profile-form.test.tsx`

**Step 1: Write the failing test**

```tsx
// platform/components/profile/__tests__/profile-form.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ProfileForm } from '../profile-form'
import { buildProfile } from '@/test-utils/factories'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

afterEach(() => cleanup())

describe('ProfileForm', () => {
  const profile = buildProfile({
    display_name: 'TestPlayer',
    city: 'Amsterdam',
    home_country: 'NL',
    nationality: ['NL'],
    bio: 'Poker enthusiast',
  })

  it('renders display name field with value', () => {
    render(<ProfileForm profile={profile} />)
    const input = screen.getByLabelText(/display name/i) as HTMLInputElement
    expect(input.value).toBe('TestPlayer')
  })

  it('renders city field', () => {
    render(<ProfileForm profile={profile} />)
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
  })

  it('renders country field', () => {
    render(<ProfileForm profile={profile} />)
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
  })

  it('renders bio field', () => {
    render(<ProfileForm profile={profile} />)
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(<ProfileForm profile={profile} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders avatar upload', () => {
    render(<ProfileForm profile={profile} />)
    expect(screen.getByLabelText(/avatar/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/profile/__tests__/profile-form.test.tsx`
Expected: FAIL

**Step 3: Write ProfileForm**

```tsx
// platform/components/profile/profile-form.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/test-utils/factories'

const formStyles = {
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--color-border)',
    maxWidth: '560px',
  } as React.CSSProperties,
  field: {
    marginBottom: '1rem',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '0.375rem',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  } as React.CSSProperties,
  button: {
    padding: '0.625rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    backgroundColor: 'var(--color-bg-card)',
    border: '2px solid var(--color-border)',
  } as React.CSSProperties,
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  success: {
    color: '#10b981',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  error: {
    color: '#f04438',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [city, setCity] = useState(profile.city || '')
  const [homeCountry, setHomeCountry] = useState(profile.home_country || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setUploadingAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl)
    setUploadingAvatar(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        city,
        home_country: homeCountry,
        bio,
        avatar_url: avatarUrl || null,
        onboarding_complete: true,
      })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile saved!' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={formStyles.card}>
      <div style={formStyles.avatarRow}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" style={formStyles.avatar} />
        ) : (
          <div style={{ ...formStyles.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>
            {displayName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <label>
          <span style={formStyles.label}>Avatar</span>
          <input
            type="file"
            accept="image/*"
            aria-label="Avatar"
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
            style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}
          />
        </label>
      </div>

      <div style={formStyles.field}>
        <label htmlFor="displayName" style={formStyles.label}>Display Name</label>
        <input
          id="displayName"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          style={formStyles.input}
          required
        />
      </div>

      <div style={formStyles.field}>
        <label htmlFor="city" style={formStyles.label}>City</label>
        <input
          id="city"
          value={city}
          onChange={e => setCity(e.target.value)}
          style={formStyles.input}
        />
      </div>

      <div style={formStyles.field}>
        <label htmlFor="homeCountry" style={formStyles.label}>Country</label>
        <input
          id="homeCountry"
          value={homeCountry}
          onChange={e => setHomeCountry(e.target.value)}
          style={formStyles.input}
        />
      </div>

      <div style={formStyles.field}>
        <label htmlFor="bio" style={formStyles.label}>Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          style={formStyles.textarea}
          maxLength={500}
        />
      </div>

      <button type="submit" disabled={loading} style={{ ...formStyles.button, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>

      {message && (
        <p style={message.type === 'success' ? formStyles.success : formStyles.error}>
          {message.text}
        </p>
      )}
    </form>
  )
}
```

**Step 4: Create profile page**

```tsx
// platform/app/(player)/profile/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'

export const metadata = { title: 'Profile — OPC Europe' }

export default async function ProfilePage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Your Profile
      </h2>
      <ProfileForm profile={profile} />
    </div>
  )
}
```

**Step 5: Run test to verify it passes**

Run: `cd platform && npx vitest run components/profile/__tests__/profile-form.test.tsx`
Expected: PASS (6 tests)

**Step 6: Commit**

```bash
git add platform/app/(player)/profile/ platform/components/profile/
git commit -m "feat: add profile page with avatar upload and onboarding"
```

---

## Task 10: Update Player Layout Navigation

**Files:**
- Modify: `platform/app/(player)/layout.tsx`

**Step 1: Add nav links to player layout**

Update the player layout to include navigation links to Dashboard, Tournaments, and Profile.

```tsx
// platform/app/(player)/layout.tsx
import Link from 'next/link'

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
  } as React.CSSProperties,
  nav: {
    display: 'flex',
    gap: '1.5rem',
  } as React.CSSProperties,
  link: {
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
  } as React.CSSProperties,
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>OPC Europe</h1>
        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.link}>Dashboard</Link>
          <Link href="/tournaments" style={styles.link}>Tournaments</Link>
          <Link href="/profile" style={styles.link}>Profile</Link>
        </nav>
      </header>
      {children}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add platform/app/(player)/layout.tsx
git commit -m "feat: add navigation links to player layout"
```

---

## Task 11: Run All Tests and Verify

**Step 1: Run all unit tests**

Run: `cd platform && npm run test:unit`
Expected: All tests pass (previous 21 + new tests)

**Step 2: Run dev server and manually verify**

Run: `cd platform && npm run dev`

Verify:
- [ ] `/tournaments` — shows tournament cards from Supabase, filters work, pagination works
- [ ] `/tournaments/[id]` — shows tournament details, registration button shows correct state
- [ ] `/dashboard` — shows registrations (empty for new user), stats display correctly
- [ ] `/profile` — form pre-fills, avatar upload works, save sets `onboarding_complete`
- [ ] Registration flow: profile → register → dashboard shows registration → cancel works

**Step 3: Run build**

Run: `cd platform && npm run build`
Expected: Build succeeds without errors

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address test and build issues for Phase 2"
```
