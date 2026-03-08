# Phase 1 — Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Supabase client libraries, database migrations (profiles, tournaments, registrations), RLS policies, auth (email/password + OAuth), Next.js middleware for route protection, design system bridge, and auth pages.

**Architecture:** Next.js 15 App Router with Supabase SSR for auth. Server Components by default, Client Components only for forms. Supabase handles auth sessions via cookies, refreshed in middleware. Database tables use RLS with role-based policies.

**Tech Stack:** Next.js 15, @supabase/supabase-js, @supabase/ssr, TypeScript, pgTAP for DB tests

**Prerequisites:** Monorepo is set up (`site/`, `platform/`, `supabase/`). Testing framework is ready (Vitest + MSW + Playwright + pgTAP). All 7 existing unit tests pass.

---

### Task 1: Design System Bridge — Extract Tokens and Set Up Inter Font

**Files:**
- Create: `platform/app/tokens.css`
- Modify: `platform/app/layout.tsx`
- Modify: `platform/app/globals.css`

**Step 1: Create shared design tokens CSS**

Create `platform/app/tokens.css` — extract from `site/styles.css` lines 13-36:
```css
:root {
  --color-bg-primary: #0c0e12;
  --color-bg-secondary: #161b26;
  --color-bg-card: #1f242f;
  --color-bg-white: #ffffff;
  --color-text-primary: #f5f5f6;
  --color-text-secondary: #94969c;
  --color-text-tertiary: #535862;
  --color-text-dark: #181d27;
  --color-brand: #1570ef;
  --color-brand-dark: #194185;
  --color-brand-light: #53b1fd;
  --color-brand-secondary: #175cd3;
  --color-border: #1f242f;
  --color-border-light: #d5d7da;
  --color-border-brand: #2e90fa;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --shadow-xs: 0 1px 2px rgba(10,13,18,0.05);
  --shadow-sm: 0 1px 3px rgba(10,13,18,0.1), 0 1px 2px -1px rgba(10,13,18,0.1);
  --shadow-lg: 0 12px 16px -4px rgba(10,13,18,0.08), 0 4px 6px -2px rgba(10,13,18,0.03);
}
```

**Step 2: Replace globals.css with OPC base styles**

Replace entire `platform/app/globals.css` with:
```css
@import './tokens.css';

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--color-brand-light);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

**Step 3: Update layout.tsx — Inter font + OPC metadata**

Replace entire `platform/app/layout.tsx` with:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'OPC Europe — Tournament Platform',
  description: 'European Open Poker Championship tournament management platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

**Step 4: Verify build passes**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx next build`
Expected: Build succeeds

**Step 5: Verify existing tests still pass**

Run: `cd "c:/Users/ronal/GitHub/OCP" && npm run test:unit`
Expected: All 7 tests pass

**Step 6: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/app/tokens.css platform/app/globals.css platform/app/layout.tsx && git commit -m "feat: add design system bridge — OPC tokens and Inter font

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Install Supabase Dependencies

**Files:**
- Modify: `platform/package.json`

**Step 1: Install Supabase packages**

```bash
cd "c:/Users/ronal/GitHub/OCP" && npm -w platform install @supabase/supabase-js @supabase/ssr
```

**Step 2: Verify install succeeded**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npm ls @supabase/supabase-js @supabase/ssr`
Expected: Both packages listed

**Step 3: Create env file template**

Create `platform/.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Step 4: Add .env.local to .gitignore**

Append to `platform/.gitignore`:
```
# Environment
.env.local
.env*.local
```

**Step 5: Create actual .env.local with real keys**

Create `platform/.env.local` with the project's real Supabase URL and keys. Use the Supabase MCP `get_project_url` and `get_publishable_keys` tools to get the real values. The file should look like:
```
NEXT_PUBLIC_SUPABASE_URL=https://uxlnhyeijfeiurwleecy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<real-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-dashboard>
```

Note: If the Supabase instance is paused, just create the file with placeholder values matching `.env.local.example` and note it needs updating.

**Step 6: Commit (NOT .env.local)**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/package.json platform/.env.local.example platform/.gitignore package-lock.json && git commit -m "feat: install Supabase dependencies and env template

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Supabase Client Libraries

**Files:**
- Create: `platform/lib/supabase/client.ts`
- Create: `platform/lib/supabase/server.ts`
- Create: `platform/lib/supabase/admin.ts`
- Create: `platform/lib/supabase/middleware.ts`
- Test: `platform/lib/supabase/__tests__/client.test.ts`

**Step 1: Write the failing test**

Create `platform/lib/supabase/__tests__/client.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

describe('Supabase browser client', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('creates a browser client', async () => {
    const { createBrowserClient } = await import('../client')
    const client = createBrowserClient()
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run lib/supabase/__tests__/client.test.ts`
Expected: FAIL — module not found

**Step 3: Create browser client**

Create `platform/lib/supabase/client.ts`:
```ts
import { createBrowserClient as createClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run lib/supabase/__tests__/client.test.ts`
Expected: PASS

**Step 5: Create server client**

Create `platform/lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  )
}
```

**Step 6: Create admin client**

Create `platform/lib/supabase/admin.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

**Step 7: Create middleware helper**

Create `platform/lib/supabase/middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, user, response: supabaseResponse }
}
```

**Step 8: Run all tests**

Run: `cd "c:/Users/ronal/GitHub/OCP" && npm run test:unit`
Expected: All tests pass (7 existing + 1 new = 8)

**Step 9: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/lib/supabase/ && git commit -m "feat: add Supabase client libraries — browser, server, admin, middleware

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Database Migration — Profiles Table + Auto-Create Trigger

**Files:**
- Create: `supabase/migrations/001_profiles.sql`
- Test: `supabase/tests/01_profiles.test.sql`

**Step 1: Write the pgTAP test**

Create `supabase/tests/01_profiles.test.sql`:
```sql
BEGIN;

SELECT plan(5);

-- Test 1: profiles table exists
SELECT has_table('public', 'profiles', 'profiles table should exist');

-- Test 2: profiles has expected columns
SELECT has_column('public', 'profiles', 'id', 'profiles should have id column');
SELECT has_column('public', 'profiles', 'role', 'profiles should have role column');
SELECT has_column('public', 'profiles', 'identity_verified', 'profiles should have identity_verified column');

-- Test 3: RLS is enabled
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles'),
  true,
  'profiles should have RLS enabled'
);

SELECT * FROM finish();

ROLLBACK;
```

**Step 2: Create the migration**

Create `supabase/migrations/001_profiles.sql`:
```sql
-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text CHECK (char_length(bio) <= 500),
  city text,
  home_country text,
  nationality text[] DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'organizer', 'admin')),
  identity_verified boolean NOT NULL DEFAULT false,
  identity_verified_at timestamptz,
  didit_session_id text,
  date_of_birth date,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_home_country ON public.profiles (home_country);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read basic profile info
CREATE POLICY "Public read basic profile" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile (but not role or verification fields)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND identity_verified = (SELECT identity_verified FROM public.profiles WHERE id = auth.uid())
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Step 3: Apply migration via Supabase MCP**

Use the Supabase MCP tool `apply_migration` with name `001_profiles` and the SQL above. If the Supabase instance is paused, note it and move on.

**Step 4: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add supabase/migrations/001_profiles.sql supabase/tests/01_profiles.test.sql && git commit -m "feat: add profiles table migration with auto-create trigger and RLS

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Database Migration — Tournaments Table

**Files:**
- Create: `supabase/migrations/002_tournaments.sql`
- Test: `supabase/tests/02_tournaments.test.sql`

**Step 1: Write the pgTAP test**

Create `supabase/tests/02_tournaments.test.sql`:
```sql
BEGIN;

SELECT plan(5);

SELECT has_table('public', 'tournaments', 'tournaments table should exist');
SELECT has_column('public', 'tournaments', 'organizer_id', 'should have organizer_id');
SELECT has_column('public', 'tournaments', 'requires_verification', 'should have requires_verification');
SELECT has_column('public', 'tournaments', 'capacity', 'should have capacity');
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'tournaments'),
  true,
  'tournaments should have RLS enabled'
);

SELECT * FROM finish();

ROLLBACK;
```

**Step 2: Create the migration**

Create `supabase/migrations/002_tournaments.sql`:
```sql
-- Create tournaments table (expanded from existing plan)
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  club_name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  series text NOT NULL DEFAULT 'OPC Open',
  start_date date NOT NULL,
  end_date date NOT NULL,
  entry_fee integer NOT NULL DEFAULT 0,
  image_url text,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  organizer_id uuid REFERENCES public.profiles(id),
  description text,
  capacity integer,
  registration_open boolean NOT NULL DEFAULT true,
  registration_deadline timestamptz,
  venue_address text,
  contact_email text,
  points_multiplier numeric NOT NULL DEFAULT 1.0,
  requires_verification boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tournaments_start_date ON public.tournaments (start_date ASC);
CREATE INDEX idx_tournaments_country ON public.tournaments (country);
CREATE INDEX idx_tournaments_series ON public.tournaments (series);
CREATE INDEX idx_tournaments_status ON public.tournaments (status);
CREATE INDEX idx_tournaments_organizer ON public.tournaments (organizer_id);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read tournaments
CREATE POLICY "Public read tournaments" ON public.tournaments
  FOR SELECT USING (true);

-- Organizers and admins can insert
CREATE POLICY "Organizers can create tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('organizer', 'admin')
    )
  );

-- Organizers can update their own tournaments, admins can update any
CREATE POLICY "Organizers can update own tournaments" ON public.tournaments
  FOR UPDATE USING (
    organizer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "Admins can delete tournaments" ON public.tournaments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Auto-update updated_at (reuse existing function)
CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed mock data (same 16 tournaments from the static mockup)
INSERT INTO public.tournaments (name, club_name, city, country, series, start_date, end_date, entry_fee, status) VALUES
  ('Amsterdam Open',        'Holland Casino',          'Amsterdam',  'NL', 'OPC Main',  '2026-03-11', '2026-03-14', 0,     'upcoming'),
  ('Berlin Masters',        'Casino Berlin',           'Berlin',     'DE', 'OPC Main',  '2026-03-18', '2026-03-21', 5000,  'upcoming'),
  ('Brussels Classic',      'Grand Casino Brussels',   'Brussels',   'BE', 'OPC Open',  '2026-03-25', '2026-03-28', 0,     'upcoming'),
  ('London Series',         'The Hippodrome',          'London',     'GB', 'OPC Main',  '2026-04-01', '2026-04-04', 10000, 'upcoming'),
  ('Rotterdam Cup',         'Holland Casino',          'Rotterdam',  'NL', 'OPC Open',  '2026-04-08', '2026-04-11', 5000,  'upcoming'),
  ('Munich Invitational',   'Bayerischer Poker Club',  'Munich',     'DE', 'OPC Open',  '2026-04-15', '2026-04-18', 0,     'upcoming'),
  ('Antwerp Open',          'Stardust Casino',         'Antwerp',    'BE', 'OPC Main',  '2026-04-22', '2026-04-25', 10000, 'upcoming'),
  ('Edinburgh Grand',       'Grosvenor Casino',        'Edinburgh',  'GB', 'OPC Open',  '2026-04-29', '2026-05-02', 0,     'upcoming'),
  ('The Hague Championship','Holland Casino',          'The Hague',  'NL', 'OPC Main',  '2026-05-06', '2026-05-09', 5000,  'upcoming'),
  ('Hamburg Open',          'Casino Esplanade',        'Hamburg',    'DE', 'OPC Open',  '2026-05-13', '2026-05-16', 0,     'upcoming'),
  ('Ghent Classic',         'Casino de Gand',          'Ghent',      'BE', 'OPC Main',  '2026-05-20', '2026-05-23', 10000, 'upcoming'),
  ('Manchester Series',     'Manchester235',           'Manchester', 'GB', 'OPC Open',  '2026-05-27', '2026-05-30', 5000,  'upcoming'),
  ('Utrecht Open',          'Holland Casino',          'Utrecht',    'NL', 'OPC Open',  '2026-06-03', '2026-06-06', 0,     'upcoming'),
  ('Cologne Cup',           'Poker Club Cologne',      'Cologne',    'DE', 'OPC Main',  '2026-06-10', '2026-06-13', 5000,  'upcoming'),
  ('Bruges Invitational',   'Casino Brugge',           'Bruges',     'BE', 'OPC Open',  '2026-06-17', '2026-06-20', 0,     'upcoming'),
  ('Bristol Championship',  'Grosvenor Casino',        'Bristol',    'GB', 'OPC Main',  '2026-06-24', '2026-06-27', 10000, 'upcoming');
```

**Step 3: Apply migration via Supabase MCP**

Use `apply_migration` with name `002_tournaments`.

**Step 4: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add supabase/migrations/002_tournaments.sql supabase/tests/02_tournaments.test.sql && git commit -m "feat: add tournaments table migration with RLS and seed data

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Database Migration — Tournament Registrations Table

**Files:**
- Create: `supabase/migrations/003_tournament_registrations.sql`
- Test: `supabase/tests/03_registrations.test.sql`

**Step 1: Write the pgTAP test**

Create `supabase/tests/03_registrations.test.sql`:
```sql
BEGIN;

SELECT plan(4);

SELECT has_table('public', 'tournament_registrations', 'tournament_registrations table should exist');
SELECT has_column('public', 'tournament_registrations', 'tournament_id', 'should have tournament_id');
SELECT has_column('public', 'tournament_registrations', 'player_id', 'should have player_id');
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'tournament_registrations'),
  true,
  'tournament_registrations should have RLS enabled'
);

SELECT * FROM finish();

ROLLBACK;
```

**Step 2: Create the migration**

Create `supabase/migrations/003_tournament_registrations.sql`:
```sql
-- Create tournament registrations table
CREATE TABLE public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'no_show')),
  registered_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  UNIQUE (tournament_id, player_id)
);

-- Indexes
CREATE INDEX idx_registrations_tournament ON public.tournament_registrations (tournament_id);
CREATE INDEX idx_registrations_player ON public.tournament_registrations (player_id);
CREATE INDEX idx_registrations_status ON public.tournament_registrations (status);

-- Enable RLS
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Players can see their own registrations
CREATE POLICY "Players can view own registrations" ON public.tournament_registrations
  FOR SELECT USING (player_id = auth.uid());

-- Organizers can see registrations for their tournaments
CREATE POLICY "Organizers can view tournament registrations" ON public.tournament_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );

-- Admins can see all registrations
CREATE POLICY "Admins can view all registrations" ON public.tournament_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Authenticated users can register (with verification check handled in app)
CREATE POLICY "Authenticated users can register" ON public.tournament_registrations
  FOR INSERT WITH CHECK (
    auth.uid() = player_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND onboarding_complete = true
    )
  );

-- Players can cancel their own registration
CREATE POLICY "Players can cancel own registration" ON public.tournament_registrations
  FOR UPDATE USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- Organizers can update status for their tournament registrations
CREATE POLICY "Organizers can update registration status" ON public.tournament_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id
      AND organizer_id = auth.uid()
    )
  );
```

**Step 3: Apply migration via Supabase MCP**

Use `apply_migration` with name `003_tournament_registrations`.

**Step 4: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add supabase/migrations/003_tournament_registrations.sql supabase/tests/03_registrations.test.sql && git commit -m "feat: add tournament_registrations table migration with RLS

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Next.js Middleware — Route Protection

**Files:**
- Create: `platform/middleware.ts`
- Test: `platform/lib/__tests__/middleware-routes.test.ts`

**Step 1: Write the failing test for route classification**

Create `platform/lib/__tests__/middleware-routes.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

// We test the route classification logic as a pure function
import { classifyRoute } from '@/lib/auth/routes'

describe('route classification', () => {
  it('identifies public routes', () => {
    expect(classifyRoute('/login')).toBe('public')
    expect(classifyRoute('/signup')).toBe('public')
    expect(classifyRoute('/verify-email')).toBe('public')
    expect(classifyRoute('/verify-identity')).toBe('public')
  })

  it('identifies protected routes', () => {
    expect(classifyRoute('/dashboard')).toBe('protected')
    expect(classifyRoute('/profile')).toBe('protected')
    expect(classifyRoute('/profile/edit')).toBe('protected')
    expect(classifyRoute('/tournaments/123/register')).toBe('protected')
  })

  it('identifies organizer routes', () => {
    expect(classifyRoute('/organizer/dashboard')).toBe('organizer')
    expect(classifyRoute('/organizer/tournaments/123')).toBe('organizer')
    expect(classifyRoute('/organizer/tournaments/123/results')).toBe('organizer')
  })

  it('identifies admin routes', () => {
    expect(classifyRoute('/admin/dashboard')).toBe('admin')
    expect(classifyRoute('/admin/users')).toBe('admin')
    expect(classifyRoute('/admin/organizers')).toBe('admin')
  })

  it('treats unknown routes as public', () => {
    expect(classifyRoute('/')).toBe('public')
    expect(classifyRoute('/about')).toBe('public')
    expect(classifyRoute('/tournaments')).toBe('public')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run lib/__tests__/middleware-routes.test.ts`
Expected: FAIL — module not found

**Step 3: Create route classification module**

Create `platform/lib/auth/routes.ts`:
```ts
export type RouteType = 'public' | 'protected' | 'organizer' | 'admin'

const AUTH_ROUTES = ['/login', '/signup']
const VERIFY_ROUTES_PREFIX = '/verify-'
const PROTECTED_ROUTES = ['/dashboard', '/profile']
const PROTECTED_PREFIXES = ['/profile/', '/tournaments/']
const ORGANIZER_PREFIX = '/organizer'
const ADMIN_PREFIX = '/admin'

function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_ROUTES.includes(pathname)) return true
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p) && pathname.includes('/register'))) return true
  if (pathname.startsWith('/profile/')) return true
  return false
}

export function classifyRoute(pathname: string): RouteType {
  if (pathname.startsWith(ADMIN_PREFIX)) return 'admin'
  if (pathname.startsWith(ORGANIZER_PREFIX)) return 'organizer'
  if (isProtectedRoute(pathname)) return 'protected'
  if (AUTH_ROUTES.includes(pathname)) return 'public'
  if (pathname.startsWith(VERIFY_ROUTES_PREFIX)) return 'public'
  return 'public'
}
```

**Step 4: Run test to verify it passes**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run lib/__tests__/middleware-routes.test.ts`
Expected: PASS

**Step 5: Create the middleware**

Create `platform/middleware.ts`:
```ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { classifyRoute } from '@/lib/auth/routes'

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const routeType = classifyRoute(request.nextUrl.pathname)

  // Public routes — always accessible
  if (routeType === 'public') {
    // Redirect logged-in users away from auth pages
    if (user && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // All other routes require authentication
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Role-gated routes — need to check profile
  if (routeType === 'organizer' || routeType === 'admin') {
    const { supabase } = await updateSession(request)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (routeType === 'organizer' && profile?.role !== 'organizer' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (routeType === 'admin' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 6: Run all tests**

Run: `cd "c:/Users/ronal/GitHub/OCP" && npm run test:unit`
Expected: All tests pass

**Step 7: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/middleware.ts platform/lib/auth/routes.ts platform/lib/__tests__/middleware-routes.test.ts && git commit -m "feat: add Next.js middleware with route protection and classification

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Auth Pages — Shared Layout

**Files:**
- Create: `platform/app/(auth)/layout.tsx`

**Step 1: Create auth layout**

Create `platform/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}>
            OPC Europe
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
          }}>
            European Open Poker Championship
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/app/\(auth\)/layout.tsx && git commit -m "feat: add auth layout with OPC branding

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9: Auth Pages — Login Page

**Files:**
- Create: `platform/app/(auth)/login/page.tsx`
- Create: `platform/components/auth/login-form.tsx`
- Test: `platform/components/auth/__tests__/login-form.test.tsx`

**Step 1: Write the failing test**

Create `platform/components/auth/__tests__/login-form.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test-utils'

import { LoginForm } from '../login-form'

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    const { getByLabelText } = renderWithProviders(<LoginForm />)
    expect(getByLabelText(/email/i)).toBeInTheDocument()
    expect(getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders login button', () => {
    const { getByRole } = renderWithProviders(<LoginForm />)
    expect(getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('renders social login buttons', () => {
    const { getByRole } = renderWithProviders(<LoginForm />)
    expect(getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(getByRole('button', { name: /facebook/i })).toBeInTheDocument()
  })

  it('renders link to signup', () => {
    const { getByRole } = renderWithProviders(<LoginForm />)
    expect(getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run components/auth/__tests__/login-form.test.tsx`
Expected: FAIL — module not found

**Step 3: Create LoginForm component**

Create `platform/components/auth/login-form.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const formStyles = {
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--color-border)',
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
  button: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  socialButton: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
    color: 'var(--color-text-tertiary)',
    fontSize: '0.75rem',
  } as React.CSSProperties,
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--color-border)',
  } as React.CSSProperties,
  error: {
    color: '#f04438',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    const supabase = createBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    })
  }

  return (
    <div style={formStyles.card}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Log in to your account
      </h2>

      {error && <p style={formStyles.error}>{error}</p>}

      <form onSubmit={handleLogin}>
        <div style={formStyles.field}>
          <label htmlFor="email" style={formStyles.label}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={formStyles.input}
          />
        </div>
        <div style={formStyles.field}>
          <label htmlFor="password" style={formStyles.label}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            required
            style={formStyles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={formStyles.button}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div style={formStyles.divider}>
        <div style={formStyles.line} />
        <span>or</span>
        <div style={formStyles.line} />
      </div>

      <button onClick={() => handleOAuth('google')} style={formStyles.socialButton}>
        Continue with Google
      </button>
      <button onClick={() => handleOAuth('facebook')} style={formStyles.socialButton}>
        Continue with Facebook
      </button>

      <p style={formStyles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/signup">Sign up</Link>
      </p>
    </div>
  )
}
```

**Step 4: Create login page**

Create `platform/app/(auth)/login/page.tsx`:
```tsx
import { LoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'Log In — OPC Europe' }

export default function LoginPage() {
  return <LoginForm />
}
```

**Step 5: Run test to verify it passes**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run components/auth/__tests__/login-form.test.tsx`
Expected: PASS

**Step 6: Run all tests**

Run: `cd "c:/Users/ronal/GitHub/OCP" && npm run test:unit`
Expected: All tests pass

**Step 7: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/components/auth/ platform/app/\(auth\)/login/ && git commit -m "feat: add login page with email/password and social auth

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Auth Pages — Signup Page

**Files:**
- Create: `platform/app/(auth)/signup/page.tsx`
- Create: `platform/components/auth/signup-form.tsx`
- Test: `platform/components/auth/__tests__/signup-form.test.tsx`

**Step 1: Write the failing test**

Create `platform/components/auth/__tests__/signup-form.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test-utils'

import { SignupForm } from '../signup-form'

describe('SignupForm', () => {
  it('renders email and password fields', () => {
    const { getByLabelText } = renderWithProviders(<SignupForm />)
    expect(getByLabelText(/email/i)).toBeInTheDocument()
    expect(getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders signup button', () => {
    const { getByRole } = renderWithProviders(<SignupForm />)
    expect(getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders social signup buttons', () => {
    const { getByRole } = renderWithProviders(<SignupForm />)
    expect(getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(getByRole('button', { name: /facebook/i })).toBeInTheDocument()
  })

  it('renders link to login', () => {
    const { getByRole } = renderWithProviders(<SignupForm />)
    expect(getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run components/auth/__tests__/signup-form.test.tsx`
Expected: FAIL

**Step 3: Create SignupForm component**

Create `platform/components/auth/signup-form.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const formStyles = {
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--color-border)',
  } as React.CSSProperties,
  field: { marginBottom: '1rem' } as React.CSSProperties,
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
  button: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  socialButton: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
    color: 'var(--color-text-tertiary)',
    fontSize: '0.75rem',
  } as React.CSSProperties,
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--color-border)',
  } as React.CSSProperties,
  error: {
    color: '#f04438',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
}

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    const supabase = createBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (sent) {
    return (
      <div style={formStyles.card}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Check your email
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div style={formStyles.card}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Create your account
      </h2>

      {error && <p style={formStyles.error}>{error}</p>}

      <form onSubmit={handleSignup}>
        <div style={formStyles.field}>
          <label htmlFor="email" style={formStyles.label}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={formStyles.input}
          />
        </div>
        <div style={formStyles.field}>
          <label htmlFor="password" style={formStyles.label}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            minLength={6}
            style={formStyles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={formStyles.button}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <div style={formStyles.divider}>
        <div style={formStyles.line} />
        <span>or</span>
        <div style={formStyles.line} />
      </div>

      <button onClick={() => handleOAuth('google')} style={formStyles.socialButton}>
        Continue with Google
      </button>
      <button onClick={() => handleOAuth('facebook')} style={formStyles.socialButton}>
        Continue with Facebook
      </button>

      <p style={formStyles.footer}>
        Already have an account?{' '}
        <Link href="/login">Log in</Link>
      </p>
    </div>
  )
}
```

**Step 4: Create signup page**

Create `platform/app/(auth)/signup/page.tsx`:
```tsx
import { SignupForm } from '@/components/auth/signup-form'

export const metadata = { title: 'Sign Up — OPC Europe' }

export default function SignupPage() {
  return <SignupForm />
}
```

**Step 5: Run test to verify it passes**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx vitest run components/auth/__tests__/signup-form.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/components/auth/signup-form.tsx platform/components/auth/__tests__/signup-form.test.tsx platform/app/\(auth\)/signup/ && git commit -m "feat: add signup page with email/password and social auth

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 11: Auth Callback Route and Verify Email Page

**Files:**
- Create: `platform/app/auth/callback/route.ts`
- Create: `platform/app/(auth)/verify-email/page.tsx`

**Step 1: Create OAuth callback route handler**

Create `platform/app/auth/callback/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server Component context
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

**Step 2: Create verify-email page**

Create `platform/app/(auth)/verify-email/page.tsx`:
```tsx
export const metadata = { title: 'Verify Email — OPC Europe' }

export default function VerifyEmailPage() {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem',
      border: '1px solid var(--color-border)',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
        Check your email
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        We sent you a confirmation link. Click it to verify your email address and activate your account.
      </p>
      <a
        href="/login"
        style={{
          color: 'var(--color-brand-light)',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Back to login
      </a>
    </div>
  )
}
```

**Step 3: Build to verify no errors**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx next build`
Expected: Build succeeds

**Step 4: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/app/auth/callback/ platform/app/\(auth\)/verify-email/ && git commit -m "feat: add OAuth callback route and verify-email page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 12: Dashboard Placeholder and Root Page Redirect

**Files:**
- Modify: `platform/app/page.tsx`
- Create: `platform/app/(player)/dashboard/page.tsx`
- Create: `platform/app/(player)/layout.tsx`

**Step 1: Update root page to redirect to dashboard**

Replace `platform/app/page.tsx` with:
```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

**Step 2: Create player layout**

Create `platform/app/(player)/layout.tsx`:
```tsx
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>OPC Europe</h1>
      </header>
      {children}
    </div>
  )
}
```

**Step 3: Create dashboard placeholder**

Create `platform/app/(player)/dashboard/page.tsx`:
```tsx
import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard — OPC Europe' }

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Dashboard
      </h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Welcome, {user.email}. Your dashboard is under construction.
      </p>
    </div>
  )
}
```

**Step 4: Clean up unused files from create-next-app**

Delete: `platform/app/page.module.css` (no longer used)

**Step 5: Build to verify**

Run: `cd "c:/Users/ronal/GitHub/OCP/platform" && npx next build`
Expected: Build succeeds

**Step 6: Run all unit tests**

Run: `cd "c:/Users/ronal/GitHub/OCP" && npm run test:unit`
Expected: All tests pass

**Step 7: Commit**

```bash
cd "c:/Users/ronal/GitHub/OCP" && git add platform/app/ && git commit -m "feat: add dashboard placeholder with auth check and player layout

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

| Task | What | Tests |
|------|------|-------|
| 1 | Design tokens + Inter font | Build check |
| 2 | Supabase dependencies + env | Package check |
| 3 | Supabase client libs (browser, server, admin, middleware) | 1 unit test |
| 4 | Profiles table + trigger + RLS | 1 pgTAP test |
| 5 | Tournaments table + RLS + seed data | 1 pgTAP test |
| 6 | Tournament registrations table + RLS | 1 pgTAP test |
| 7 | Route classification + middleware | 5 unit tests |
| 8 | Auth layout | Build check |
| 9 | Login page + form | 4 unit tests |
| 10 | Signup page + form | 4 unit tests |
| 11 | OAuth callback + verify-email page | Build check |
| 12 | Dashboard placeholder + root redirect | Build check |

**Total new tests:** 15 unit tests + 3 pgTAP tests
