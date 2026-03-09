# OPC Platform — Testing Guide

## Overview

The project uses three testing layers: unit tests (Vitest), database tests (pgTAP), and E2E tests (Playwright). TDD is mandatory for all feature work.

## Test Scripts

```bash
# From project root (c:/Users/ronal/GitHub/OCP)
npm run test:unit      # Vitest — unit + component tests
npm run test:watch     # Vitest in watch mode
npm run test:coverage  # Vitest with v8 coverage report
npm run test:db        # pgTAP — database schema + RLS tests
npm run test:e2e       # Playwright — end-to-end browser tests
npm run test:all       # All three layers sequentially
```

## Unit Tests (Vitest + React Testing Library)

### Configuration
- **Config:** `platform/vitest.config.ts`
- **Setup:** `platform/vitest.setup.ts` (jest-dom matchers + MSW lifecycle)
- **Environment:** jsdom
- **Coverage:** v8 provider, includes `app/`, `components/`, `lib/`

### Test Utilities (`platform/test-utils/`)

**`renderWithProviders()`** — Wraps RTL render with app providers:
```tsx
import { renderWithProviders } from '@/test-utils'
renderWithProviders(<MyComponent />)
```

**Data factories** — Create test data with defaults:
```ts
import { buildProfile, buildTournament, buildRegistration } from '@/test-utils'
const profile = buildProfile({ display_name: 'Test Player' })
const tournament = buildTournament({ country: 'NL' })
```

**MSW handlers** — Default Supabase auth mock (returns 401 for unauthenticated):
```ts
// platform/test-utils/msw/handlers.ts
import { http, HttpResponse } from 'msw'
```

### Testing Next.js Client Components

Components using `useRouter()` or `useSearchParams()` need mocks:

```tsx
import { vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Suspense } from 'react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

// Wrap in Suspense for useSearchParams
function renderMyComponent() {
  return render(
    <Suspense fallback={null}>
      <MyComponent />
    </Suspense>
  )
}

// Use cleanup between tests
afterEach(() => cleanup())
```

### Current Test Count: 128 (28 files)

| File | Tests | What it covers |
|------|-------|----------------|
| `lib/__tests__/smoke.test.ts` | 1 | Vitest works |
| `test-utils/__tests__/factories.test.ts` | 4 | Data factories |
| `test-utils/__tests__/msw.test.ts` | 1 | MSW server |
| `test-utils/__tests__/render.test.tsx` | 1 | Render helper |
| `lib/supabase/__tests__/client.test.ts` | 1 | Browser client creation |
| `lib/__tests__/middleware-routes.test.ts` | 5 | Route classification |
| `components/auth/__tests__/login-form.test.tsx` | 4 | Login form rendering |
| `components/auth/__tests__/signup-form.test.tsx` | 4 | Signup form rendering |
| `components/tournaments/__tests__/tournament-card.test.tsx` | 7 | Card rendering, date format, entry fee |
| `components/tournaments/__tests__/filter-bar.test.tsx` | 4 | Filter selects, URL param updates |
| `components/tournaments/__tests__/pagination.test.tsx` | 4 | Page buttons, disabled states |
| `components/tournaments/__tests__/registration-button.test.tsx` | 8 | All 8 registration states |
| `components/dashboard/__tests__/cancel-registration-button.test.tsx` | 2 | Cancel + confirmation flow |
| `components/profile/__tests__/profile-form.test.tsx` | 6 | Form fields, save button, avatar |
| `components/organizer/__tests__/tournament-form.test.tsx` | — | Tournament create/edit form |
| `components/organizer/__tests__/registration-status-select.test.tsx` | — | Status dropdown |
| `components/organizer/__tests__/export-csv-button.test.tsx` | — | CSV export |
| `lib/actions/__tests__/tournament.test.ts` | — | Server Action mocking |
| `lib/__tests__/points.test.ts` | 17 | Points calculation brackets + multiplier + custom brackets |
| `lib/actions/__tests__/results.test.ts` | — | Results server action |
| `components/organizer/__tests__/results-entry-form.test.tsx` | 7 | Results entry form |
| `components/admin/__tests__/points-config-editor.test.tsx` | 4 | Admin points config editor |
| `app/(organizer)/organizer/tournaments/[id]/results/__tests__/page.test.tsx` | — | Results page |
| `components/rankings/__tests__/rank-badge.test.tsx` | 5 | Rank change indicators (up/down/same) |
| `components/rankings/__tests__/leaderboard-search.test.tsx` | 3 | Search input + country filter |
| `components/players/__tests__/achievement-badge.test.tsx` | 4 | Badge rendering, earned/unearned states |
| `components/players/__tests__/achievement-grid.test.tsx` | 2 | Grid layout, section title |
| `components/players/__tests__/stats-grid.test.tsx` | 2 | 6 stat cards, null handling |
| `components/players/__tests__/player-profile-header.test.tsx` | 5 | Name, rank, initials, country, date |
| `components/players/__tests__/tournament-history-table.test.tsx` | 4 | Links, placement, empty state |

### Testing Server Actions

Server Actions (`'use server'`) can be tested by mocking the Supabase client and calling the action function directly:

```ts
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: vi.fn(() => mockSupabaseClient),
}))

// Then call the action and assert on the result
const result = await createTournament(formData)
```

## Database Tests (pgTAP)

### Location
`supabase/tests/*.test.sql`

### Running
```bash
npm run test:db
# or: supabase test db
```

### Test Files

| File | Tests | What it covers |
|------|-------|----------------|
| `00_smoke.test.sql` | 1 | pgTAP works |
| `01_profiles.test.sql` | 5 | Table exists, columns, RLS enabled |
| `02_tournaments.test.sql` | 5 | Table exists, columns, RLS enabled |
| `03_registrations.test.sql` | 4 | Table exists, columns, RLS enabled |
| `04_tournament_results.test.sql` | — | Table exists, columns, RLS enabled |
| `05_player_stats.test.sql` | — | Table exists, columns, RLS enabled |
| `06_achievements.test.sql` | — | Tables exist, columns, seed data, RLS enabled |
| `008_points_functions.test.sql` | — | Points functions, triggers, stats computation |
| `009_country_points.test.sql` | — | Country config, brackets, country stats tables + RLS |
| `011_profile_slugs.test.sql` | 4 | Slug column, index, trigger + generation functions |

### Pattern
```sql
BEGIN;
SELECT plan(N);

SELECT has_table('public', 'table_name', 'description');
SELECT has_column('public', 'table_name', 'column', 'description');
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'table_name'),
  true,
  'should have RLS enabled'
);

SELECT * FROM finish();
ROLLBACK;
```

## E2E Tests (Playwright)

### Configuration
- **Config:** `platform/playwright.config.ts`
- **Browsers:** Chromium only
- **Base URL:** `http://localhost:3000`
- **Reports:** HTML reporter

### Running
```bash
npm run test:e2e           # Headless
npm -w platform run test:e2e:headed   # With browser window
npm -w platform run test:e2e:ui       # Playwright UI
```

### Current Tests
- `e2e/smoke.spec.ts` — Verifies the app loads

## TDD Workflow

1. **Write the failing test** (RED)
2. **Run test** to confirm it fails for the right reason
3. **Write minimum implementation** (GREEN)
4. **Run test** to confirm it passes
5. **Refactor** if needed
6. **Run all tests** to check for regressions
7. **Commit**

## Adding New Tests

### For a new component:
```
platform/components/my-feature/__tests__/my-component.test.tsx
```

### For a new lib module:
```
platform/lib/my-module/__tests__/my-module.test.ts
```

### For a new database table:
```
supabase/tests/0N_table_name.test.sql
```

### For a new E2E flow:
```
platform/e2e/feature-name.spec.ts
```
