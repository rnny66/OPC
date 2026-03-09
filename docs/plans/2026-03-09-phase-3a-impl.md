# Phase 3A Implementation Plan — Organizer Dashboard, Tournament Management & Registrations

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build organizer-facing pages for managing tournaments and viewing registrations, plus the database tables needed for Phase 3B (results, stats, achievements).

**Architecture:** Server Components with inline styles + CSS custom properties (same as player pages). Client components for forms and interactive elements. Server Actions for mutations. Supabase RLS for security.

**Tech Stack:** Next.js 15 (App Router), Supabase, TypeScript, Vitest + RTL, pgTAP

---

### Task 1: Migration — `tournament_results` table

**Files:**
- Create: `supabase/migrations/005_tournament_results.sql`
- Test: `supabase/tests/005_tournament_results.test.sql`

**Step 1: Write the migration**

```sql
-- Create tournament_results table
CREATE TABLE public.tournament_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  placement integer NOT NULL CHECK (placement > 0),
  points_awarded integer NOT NULL DEFAULT 0,
  entered_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, player_id)
);

-- Indexes
CREATE INDEX idx_results_tournament ON public.tournament_results (tournament_id);
CREATE INDEX idx_results_player ON public.tournament_results (player_id);
CREATE INDEX idx_results_placement ON public.tournament_results (placement);

-- Enable RLS
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;

-- Anyone can read results
CREATE POLICY "Public read results" ON public.tournament_results
  FOR SELECT USING (true);

-- Organizers can insert results for their tournaments
CREATE POLICY "Organizers can insert results" ON public.tournament_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );

-- Organizers can update results for their tournaments
CREATE POLICY "Organizers can update results" ON public.tournament_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "Admins full access results" ON public.tournament_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

**Step 2: Write pgTAP test**

```sql
BEGIN;
SELECT plan(5);

SELECT has_table('public', 'tournament_results', 'tournament_results table exists');
SELECT has_column('public', 'tournament_results', 'tournament_id', 'has tournament_id');
SELECT has_column('public', 'tournament_results', 'player_id', 'has player_id');
SELECT has_column('public', 'tournament_results', 'placement', 'has placement');
SELECT has_column('public', 'tournament_results', 'points_awarded', 'has points_awarded');

SELECT * FROM finish();
ROLLBACK;
```

**Step 3: Apply migration via Supabase MCP**

Use `mcp__ocp-supabase__apply_migration` with name `005_tournament_results` and the SQL from Step 1.

**Step 4: Run DB tests**

Run: `npm run test:db --prefix platform` or verify via MCP `execute_sql`.

**Step 5: Commit**

```bash
git add supabase/migrations/005_tournament_results.sql supabase/tests/005_tournament_results.test.sql
git commit -m "feat: add tournament_results table with RLS"
```

---

### Task 2: Migration — `player_stats` table

**Files:**
- Create: `supabase/migrations/006_player_stats.sql`
- Test: `supabase/tests/006_player_stats.test.sql`

**Step 1: Write the migration**

```sql
-- Create player_stats table (computed, populated by functions in Phase 3B)
CREATE TABLE public.player_stats (
  player_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  tournament_count integer NOT NULL DEFAULT 0,
  win_count integer NOT NULL DEFAULT 0,
  top3_count integer NOT NULL DEFAULT 0,
  avg_finish numeric,
  best_finish integer,
  current_rank integer,
  previous_rank integer,
  last_computed timestamptz
);

-- Index for leaderboard queries
CREATE INDEX idx_player_stats_rank ON public.player_stats (current_rank ASC NULLS LAST);
CREATE INDEX idx_player_stats_points ON public.player_stats (total_points DESC);

-- Enable RLS
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read stats
CREATE POLICY "Public read player stats" ON public.player_stats
  FOR SELECT USING (true);

-- No direct writes — only via Postgres functions (service role) in Phase 3B
```

**Step 2: Write pgTAP test**

```sql
BEGIN;
SELECT plan(5);

SELECT has_table('public', 'player_stats', 'player_stats table exists');
SELECT has_column('public', 'player_stats', 'total_points', 'has total_points');
SELECT has_column('public', 'player_stats', 'tournament_count', 'has tournament_count');
SELECT has_column('public', 'player_stats', 'current_rank', 'has current_rank');
SELECT has_column('public', 'player_stats', 'best_finish', 'has best_finish');

SELECT * FROM finish();
ROLLBACK;
```

**Step 3: Apply migration via Supabase MCP**

**Step 4: Commit**

```bash
git add supabase/migrations/006_player_stats.sql supabase/tests/006_player_stats.test.sql
git commit -m "feat: add player_stats table with RLS"
```

---

### Task 3: Migration — `achievements` + `player_achievements` tables

**Files:**
- Create: `supabase/migrations/007_achievements.sql`
- Test: `supabase/tests/007_achievements.test.sql`

**Step 1: Write the migration**

```sql
-- Achievements definition table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  criteria_type text NOT NULL,
  criteria_threshold integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Player achievements (awarded badges)
CREATE TABLE public.player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_player ON public.player_achievements (player_id);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

-- Public read on both
CREATE POLICY "Public read achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Public read player achievements" ON public.player_achievements
  FOR SELECT USING (true);

-- Seed achievement definitions
INSERT INTO public.achievements (name, description, icon, criteria_type, criteria_threshold) VALUES
  ('First Blood',    'Played in your first tournament',      '🎯', 'tournament_count', 1),
  ('Regular',        'Played in 5 tournaments',              '🃏', 'tournament_count', 5),
  ('Veteran',        'Played in 20 tournaments',             '🏅', 'tournament_count', 20),
  ('Champion',       'Won a tournament',                     '🏆', 'win_count',        1),
  ('Triple Crown',   'Won 3 tournaments',                    '👑', 'win_count',        3),
  ('Podium Master',  'Finished top 3 in 10 tournaments',     '🥇', 'top3_count',       10);
```

**Step 2: Write pgTAP test**

```sql
BEGIN;
SELECT plan(5);

SELECT has_table('public', 'achievements', 'achievements table exists');
SELECT has_table('public', 'player_achievements', 'player_achievements table exists');
SELECT has_column('public', 'achievements', 'criteria_type', 'has criteria_type');
SELECT has_column('public', 'player_achievements', 'player_id', 'has player_id');

-- Verify seed data
SELECT results_eq(
  'SELECT count(*)::integer FROM public.achievements',
  ARRAY[6],
  '6 achievements seeded'
);

SELECT * FROM finish();
ROLLBACK;
```

**Step 3: Apply migration via Supabase MCP**

**Step 4: Commit**

```bash
git add supabase/migrations/007_achievements.sql supabase/tests/007_achievements.test.sql
git commit -m "feat: add achievements and player_achievements tables with seed data"
```

---

### Task 4: Organizer layout

**Files:**
- Create: `platform/app/(organizer)/layout.tsx`

**Step 1: Write the layout**

Follow the exact same pattern as `platform/app/(player)/layout.tsx`. Inline styles with CSS vars. Nav links: "Dashboard" → `/organizer/dashboard`, "Tournaments" → `/tournaments`, "Profile" → `/profile`.

```tsx
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

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>OPC Europe — Organizer</h1>
        <nav style={styles.nav}>
          <Link href="/organizer/dashboard" style={styles.link}>Dashboard</Link>
          <Link href="/tournaments" style={styles.link}>Tournaments</Link>
          <Link href="/profile" style={styles.link}>Profile</Link>
        </nav>
      </header>
      {children}
    </div>
  )
}
```

**Step 2: Verify the layout renders**

Run: `npm run build --prefix platform` (ensure no compilation errors)

**Step 3: Commit**

```bash
git add platform/app/\(organizer\)/layout.tsx
git commit -m "feat: add organizer layout with nav"
```

---

### Task 5: Organizer dashboard page

**Files:**
- Create: `platform/app/(organizer)/dashboard/page.tsx`
- Test: `platform/__tests__/app/(organizer)/dashboard/page.test.tsx`

**Step 1: Write the failing test**

Test that the dashboard renders tournament list and stats. Mock `createSupabaseServer` to return mock data.

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrganizerDashboardPage from '@/app/(organizer)/dashboard/page'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

const mockTournaments = [
  {
    id: '1',
    name: 'Amsterdam Open',
    city: 'Amsterdam',
    start_date: '2026-04-01',
    status: 'upcoming',
    registration_count: [{ count: 5 }],
  },
]

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'org-1' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockTournaments }),
        }),
      }),
    }),
  }),
}))

describe('OrganizerDashboardPage', () => {
  it('renders the dashboard title', async () => {
    const Page = await OrganizerDashboardPage()
    render(Page)
    expect(screen.getByText('Organizer Dashboard')).toBeInTheDocument()
  })

  it('shows tournament name', async () => {
    const Page = await OrganizerDashboardPage()
    render(Page)
    expect(screen.getByText('Amsterdam Open')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run __tests__/app/\\(organizer\\)/dashboard/page.test.tsx`
Expected: FAIL (module not found)

**Step 3: Write the page**

Server Component that fetches organizer's tournaments with registration counts. Stats cards (total tournaments, total registrations, upcoming). Table of tournaments with links to edit and manage registrations. "Create Tournament" button.

Pattern: Same as `platform/app/(player)/dashboard/page.tsx` — inline styles, `createSupabaseServer()`, `getUser()`, `redirect('/login')` if no user.

Key query:
```ts
const { data: tournaments } = await supabase
  .from('tournaments')
  .select('*, tournament_registrations(count)')
  .eq('organizer_id', user.id)
  .order('start_date', { ascending: true })
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run __tests__/app/\\(organizer\\)/dashboard/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add platform/app/\(organizer\)/dashboard/page.tsx platform/__tests__/app/\(organizer\)/dashboard/page.test.tsx
git commit -m "feat: add organizer dashboard page with stats and tournament list"
```

---

### Task 6: Tournament form component (create + edit)

**Files:**
- Create: `platform/components/organizer/tournament-form.tsx`
- Create: `platform/app/(organizer)/tournaments/new/page.tsx`
- Create: `platform/app/(organizer)/tournaments/[id]/page.tsx`
- Create: `platform/lib/actions/tournament.ts` (Server Actions)
- Test: `platform/__tests__/components/organizer/tournament-form.test.tsx`

**Step 1: Write the failing test**

Test that the form renders all fields, shows validation errors, and calls the appropriate action on submit.

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TournamentForm } from '@/components/organizer/tournament-form'

describe('TournamentForm', () => {
  it('renders all required fields', () => {
    render(<TournamentForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/club/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('renders in edit mode with pre-filled values', () => {
    const tournament = {
      id: '1',
      name: 'Amsterdam Open',
      club_name: 'Holland Casino',
      city: 'Amsterdam',
      country: 'NL',
      series: 'OPC Main',
      start_date: '2026-04-01',
      end_date: '2026-04-04',
      entry_fee: 5000,
      capacity: 100,
      points_multiplier: 1.5,
      registration_open: true,
      requires_verification: false,
      description: '',
      venue_address: '',
      contact_email: '',
      registration_deadline: null,
      status: 'upcoming',
    }
    render(<TournamentForm tournament={tournament} />)
    expect(screen.getByDisplayValue('Amsterdam Open')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Holland Casino')).toBeInTheDocument()
  })

  it('shows Create Tournament button in create mode', () => {
    render(<TournamentForm />)
    expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument()
  })

  it('shows Save Changes button in edit mode', () => {
    render(<TournamentForm tournament={{ id: '1', name: 'Test' } as any} />)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run __tests__/components/organizer/tournament-form.test.tsx`

**Step 3: Write the Server Actions**

`platform/lib/actions/tournament.ts`:
- `createTournament(formData: FormData)` — validates, inserts with `organizer_id = user.id`, redirects to `/organizer/dashboard`
- `updateTournament(formData: FormData)` — validates, updates (checks ownership via RLS), redirects back

**Step 4: Write the TournamentForm component**

`'use client'` component. Props: `tournament?` (for edit mode). Uses HTML `<form>` with `action` prop pointing to the Server Action. Fields match the design doc. Toggles for `registration_open` and `requires_verification`. Status dropdown only in edit mode.

**Step 5: Write the create page**

`platform/app/(organizer)/tournaments/new/page.tsx`: Simple Server Component that renders `<TournamentForm />` with no tournament prop.

**Step 6: Write the edit page**

`platform/app/(organizer)/tournaments/[id]/page.tsx`: Server Component that fetches tournament by ID, verifies organizer owns it, renders `<TournamentForm tournament={tournament} />`.

**Step 7: Run tests**

Run: `cd platform && npx vitest run __tests__/components/organizer/tournament-form.test.tsx`
Expected: PASS

**Step 8: Commit**

```bash
git add platform/components/organizer/tournament-form.tsx platform/lib/actions/tournament.ts platform/app/\(organizer\)/tournaments/
git commit -m "feat: add tournament create/edit form with server actions"
```

---

### Task 7: Registration management page

**Files:**
- Create: `platform/app/(organizer)/tournaments/[id]/registrations/page.tsx`
- Create: `platform/components/organizer/registration-status-select.tsx`
- Create: `platform/lib/actions/registration.ts` (Server Action)
- Test: `platform/__tests__/app/(organizer)/tournaments/registrations/page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RegistrationsPage from '@/app/(organizer)/tournaments/[id]/registrations/page'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

const mockRegistrations = [
  {
    id: 'reg-1',
    player_id: 'p-1',
    status: 'registered',
    registered_at: '2026-03-01T10:00:00Z',
    profiles: { display_name: 'Alice', nationality: ['NL'] },
  },
]

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'org-1' } },
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'tournaments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 't-1', name: 'Amsterdam Open', organizer_id: 'org-1', capacity: 100 },
              }),
            }),
          }),
        }
      }
      if (table === 'tournament_registrations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              neq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockRegistrations }),
              }),
            }),
          }),
        }
      }
      return {}
    }),
  }),
}))

describe('RegistrationsPage', () => {
  it('renders tournament name', async () => {
    const Page = await RegistrationsPage({ params: Promise.resolve({ id: 't-1' }) })
    render(Page)
    expect(screen.getByText(/Amsterdam Open/)).toBeInTheDocument()
  })

  it('renders player name in table', async () => {
    const Page = await RegistrationsPage({ params: Promise.resolve({ id: 't-1' }) })
    render(Page)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run __tests__/app/\\(organizer\\)/tournaments/registrations/page.test.tsx`

**Step 3: Write the Server Action**

`platform/lib/actions/registration.ts`:
- `updateRegistrationStatus(registrationId: string, status: string)` — validates via Supabase (RLS handles ownership), updates status, revalidates path

**Step 4: Write RegistrationStatusSelect**

`'use client'` component. Dropdown with options: registered, confirmed, no_show. On change, calls the Server Action. Shows loading state.

**Step 5: Write the registrations page**

Server Component. Fetches tournament (verify ownership), fetches registrations with joined profiles. Renders header with tournament name + count/capacity. Table with player name, nationality, date, status (using RegistrationStatusSelect), sorted by registered_at desc.

**Step 6: Run tests**

Run: `cd platform && npx vitest run __tests__/app/\\(organizer\\)/tournaments/registrations/page.test.tsx`
Expected: PASS

**Step 7: Commit**

```bash
git add platform/app/\(organizer\)/tournaments/\[id\]/registrations/ platform/components/organizer/registration-status-select.tsx platform/lib/actions/registration.ts
git commit -m "feat: add registration management page with status updates"
```

---

### Task 8: CSV export button

**Files:**
- Create: `platform/components/organizer/export-csv-button.tsx`
- Test: `platform/__tests__/components/organizer/export-csv-button.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportCSVButton } from '@/components/organizer/export-csv-button'

describe('ExportCSVButton', () => {
  it('renders the export button', () => {
    render(<ExportCSVButton registrations={[]} tournamentName="Test" />)
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
  })

  it('generates CSV content on click', () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url')
    global.URL.createObjectURL = mockCreateObjectURL

    const registrations = [
      { profiles: { display_name: 'Alice' }, status: 'registered', registered_at: '2026-03-01' },
    ]
    render(<ExportCSVButton registrations={registrations as any} tournamentName="Amsterdam Open" />)
    fireEvent.click(screen.getByRole('button', { name: /export csv/i }))
    expect(mockCreateObjectURL).toHaveBeenCalled()
  })
})
```

**Step 2: Run test to verify it fails**

**Step 3: Write the component**

`'use client'` component. Takes `registrations` array and `tournamentName` as props. On click: generates CSV string, creates Blob, triggers download via hidden anchor element. Columns: Player Name, Nationality, Registered Date, Status.

**Step 4: Run tests, verify pass**

**Step 5: Wire into registrations page**

Add `<ExportCSVButton>` to the registrations page, passing the fetched registrations data.

**Step 6: Commit**

```bash
git add platform/components/organizer/export-csv-button.tsx platform/__tests__/components/organizer/export-csv-button.test.tsx
git commit -m "feat: add CSV export for tournament registrations"
```

---

### Task 9: Build verification + full test run

**Step 1: Run all unit tests**

Run: `cd platform && npm run test:unit`
Expected: All tests pass (existing 52 + new tests)

**Step 2: Run build**

Run: `cd platform && npm run build`
Expected: Build succeeds with no errors

**Step 3: Manual smoke test**

- Set a test user's role to 'organizer' in Supabase
- Navigate to `/organizer/dashboard` — should see tournament list
- Click "Create Tournament" — form should render
- Edit an existing tournament — fields pre-filled
- View registrations for a tournament — table renders
- Update a registration status — dropdown works
- Export CSV — file downloads
- Non-organizer user → redirected to `/dashboard`

**Step 4: Commit any fixes**

**Step 5: Final commit**

```bash
git commit -m "feat: complete Phase 3A — organizer dashboard, tournament management, registrations"
```
