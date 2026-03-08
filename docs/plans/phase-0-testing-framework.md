# Testing Framework Setup — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up the complete testing infrastructure for the OPC tournament platform before any feature development begins.

**Architecture:** Four testing layers — Vitest for unit/integration tests, pgTAP for database/RLS testing, MSW for Supabase API mocking, and Playwright for E2E tests. All tests live inside `platform/` alongside the Next.js app.

**Tech Stack:**
- Vitest 3.x + React Testing Library 16.x (unit/integration)
- MSW 2.x + msw-postgrest (Supabase mocking)
- pgTAP via `supabase test db` (database/RLS)
- Playwright (E2E)

**Prerequisites:** The monorepo structure from Phase 1 must exist first — `platform/` must be initialized as a Next.js app with TypeScript. If it doesn't exist yet, run Phase 1 Task 1 (monorepo setup) before this plan.

---

## Testing Stack Overview

| Layer | Tool | What it tests |
|-------|------|---------------|
| Unit | Vitest + RTL | Client components, hooks, pure functions, utilities |
| Server logic | Vitest | Extracted data-fetching functions, transformations |
| API mocking | MSW + msw-postgrest | Supabase client calls in unit/integration tests |
| Database | pgTAP via `supabase test db` | RLS policies, database functions, triggers |
| E2E | Playwright | Full user flows, auth, server components |

**Key constraint:** Async React Server Components cannot be unit-tested with RTL (open issue #1209). Strategy: keep Server Components thin, extract logic into pure functions, test those with Vitest, cover full pages with Playwright E2E.

---

### Task 1: Install Vitest and React Testing Library

**Files:**
- Modify: `platform/package.json`
- Create: `platform/vitest.config.ts`
- Create: `platform/vitest.setup.ts`

**Step 1: Install dev dependencies**

Run from `platform/`:
```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom
```

**Step 2: Create Vitest config**

Create `platform/vitest.config.ts`:
```ts
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['app/**', 'components/**', 'lib/**'],
      exclude: ['**/*.test.*', '**/*.d.ts'],
    },
  },
})
```

**Step 3: Create Vitest setup file**

Create `platform/vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

**Step 4: Add test scripts to package.json**

Add to `platform/package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**Step 5: Verify setup with a smoke test**

Create `platform/lib/__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('test setup', () => {
  it('runs a basic test', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**Step 6: Run test to verify it passes**

Run: `cd platform && npm test`
Expected: 1 test passed

**Step 7: Commit**

```bash
git add platform/vitest.config.ts platform/vitest.setup.ts platform/package.json platform/package-lock.json platform/lib/__tests__/smoke.test.ts
git commit -m "feat: add Vitest testing framework with RTL"
```

---

### Task 2: Install and Configure MSW for Supabase Mocking

**Files:**
- Modify: `platform/package.json`
- Create: `platform/test-utils/msw/handlers.ts`
- Create: `platform/test-utils/msw/server.ts`
- Modify: `platform/vitest.setup.ts`

**Step 1: Install MSW**

Run from `platform/`:
```bash
npm install -D msw msw-postgrest
```

**Step 2: Create MSW server setup**

Create `platform/test-utils/msw/server.ts`:
```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

**Step 3: Create default handlers**

Create `platform/test-utils/msw/handlers.ts`:
```ts
import { http, HttpResponse } from 'msw'

// Base Supabase URL — matches the env var NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

export const handlers = [
  // Default handler for Supabase auth session check
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(null, { status: 401 })
  }),
]
```

**Step 4: Wire MSW into Vitest setup**

Update `platform/vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './test-utils/msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Step 5: Write a test verifying MSW intercepts Supabase calls**

Create `platform/test-utils/__tests__/msw.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../msw/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

describe('MSW setup', () => {
  it('intercepts Supabase REST calls', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/tournaments`, () => {
        return HttpResponse.json([
          { id: '1', name: 'Amsterdam Open' },
        ])
      })
    )

    const response = await fetch(`${SUPABASE_URL}/rest/v1/tournaments`)
    const data = await response.json()

    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Amsterdam Open')
  })
})
```

**Step 6: Run test to verify it passes**

Run: `cd platform && npm test`
Expected: All tests pass (smoke + MSW)

**Step 7: Commit**

```bash
git add platform/test-utils/ platform/vitest.setup.ts platform/package.json platform/package-lock.json
git commit -m "feat: add MSW for Supabase API mocking in tests"
```

---

### Task 3: Create Test Utilities and Helpers

**Files:**
- Create: `platform/test-utils/render.tsx`
- Create: `platform/test-utils/factories.ts`
- Create: `platform/test-utils/index.ts`

**Step 1: Write the failing test for render helper**

Create `platform/test-utils/__tests__/render.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../render'

describe('renderWithProviders', () => {
  it('renders a component with providers', () => {
    const { getByText } = renderWithProviders(<div>Hello OPC</div>)
    expect(getByText('Hello OPC')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run test-utils/__tests__/render.test.tsx`
Expected: FAIL — `renderWithProviders` not found

**Step 3: Create the render helper**

Create `platform/test-utils/render.tsx`:
```tsx
import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'

// Add providers here as the app grows (e.g., auth context, theme)
function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run test-utils/__tests__/render.test.tsx`
Expected: PASS

**Step 5: Write the failing test for factories**

Create `platform/test-utils/__tests__/factories.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildProfile, buildTournament, buildRegistration } from '../factories'

describe('test factories', () => {
  it('builds a profile with defaults', () => {
    const profile = buildProfile()
    expect(profile.id).toBeDefined()
    expect(profile.role).toBe('player')
    expect(profile.identity_verified).toBe(false)
    expect(profile.onboarding_complete).toBe(false)
  })

  it('builds a profile with overrides', () => {
    const profile = buildProfile({ role: 'organizer', display_name: 'Marcel' })
    expect(profile.role).toBe('organizer')
    expect(profile.display_name).toBe('Marcel')
  })

  it('builds a tournament with defaults', () => {
    const tournament = buildTournament()
    expect(tournament.id).toBeDefined()
    expect(tournament.registration_open).toBe(true)
    expect(tournament.requires_verification).toBe(false)
  })

  it('builds a registration with defaults', () => {
    const reg = buildRegistration()
    expect(reg.id).toBeDefined()
    expect(reg.status).toBe('registered')
  })
})
```

**Step 6: Run test to verify it fails**

Run: `cd platform && npx vitest run test-utils/__tests__/factories.test.ts`
Expected: FAIL — `buildProfile` not found

**Step 7: Create the factories**

Create `platform/test-utils/factories.ts`:
```ts
import { randomUUID } from 'crypto'

export type Profile = {
  id: string
  email: string
  display_name: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  bio: string | null
  city: string | null
  home_country: string
  nationality: string[]
  social_links: Record<string, string>
  role: 'player' | 'organizer' | 'admin'
  identity_verified: boolean
  identity_verified_at: string | null
  didit_session_id: string | null
  date_of_birth: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export type Tournament = {
  id: string
  name: string
  club_name: string
  city: string
  country: string
  series: string
  start_date: string
  end_date: string
  entry_fee: number
  image_url: string | null
  status: string
  organizer_id: string
  description: string | null
  capacity: number
  registration_open: boolean
  registration_deadline: string | null
  venue_address: string | null
  contact_email: string | null
  points_multiplier: number
  requires_verification: boolean
  created_at: string
  updated_at: string
}

export type Registration = {
  id: string
  tournament_id: string
  player_id: string
  status: 'registered' | 'confirmed' | 'cancelled' | 'no_show'
  registered_at: string
  cancelled_at: string | null
}

export function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: randomUUID(),
    email: `player-${Date.now()}@test.com`,
    display_name: 'Test Player',
    first_name: null,
    last_name: null,
    avatar_url: null,
    bio: null,
    city: null,
    home_country: 'NL',
    nationality: ['NL'],
    social_links: {},
    role: 'player',
    identity_verified: false,
    identity_verified_at: null,
    didit_session_id: null,
    date_of_birth: null,
    onboarding_complete: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function buildTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: randomUUID(),
    name: 'Amsterdam Open',
    club_name: 'Holland Casino',
    city: 'Amsterdam',
    country: 'NL',
    series: 'Open',
    start_date: '2026-06-01',
    end_date: '2026-06-03',
    entry_fee: 100,
    image_url: null,
    status: 'upcoming',
    organizer_id: randomUUID(),
    description: null,
    capacity: 100,
    registration_open: true,
    registration_deadline: null,
    venue_address: null,
    contact_email: null,
    points_multiplier: 1.0,
    requires_verification: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function buildRegistration(overrides: Partial<Registration> = {}): Registration {
  return {
    id: randomUUID(),
    tournament_id: randomUUID(),
    player_id: randomUUID(),
    status: 'registered',
    registered_at: new Date().toISOString(),
    cancelled_at: null,
    ...overrides,
  }
}
```

**Step 8: Run test to verify it passes**

Run: `cd platform && npx vitest run test-utils/__tests__/factories.test.ts`
Expected: PASS

**Step 9: Create barrel export**

Create `platform/test-utils/index.ts`:
```ts
export { renderWithProviders } from './render'
export { buildProfile, buildTournament, buildRegistration } from './factories'
export type { Profile, Tournament, Registration } from './factories'
export { server } from './msw/server'
```

**Step 10: Run all tests**

Run: `cd platform && npm test`
Expected: All tests pass

**Step 11: Commit**

```bash
git add platform/test-utils/
git commit -m "feat: add test utilities — render helper and data factories"
```

---

### Task 4: Install and Configure Playwright for E2E Tests

**Files:**
- Modify: `platform/package.json`
- Create: `platform/playwright.config.ts`
- Create: `platform/e2e/smoke.spec.ts`

**Step 1: Install Playwright**

Run from `platform/`:
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

**Step 2: Create Playwright config**

Create `platform/playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 3: Create smoke E2E test**

Create `platform/e2e/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test('app loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/OPC/)
})
```

**Step 4: Add E2E scripts to package.json**

Add to `platform/package.json` scripts:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

**Step 5: Add Playwright artifacts to .gitignore**

Append to `platform/.gitignore` (or create if needed):
```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

**Step 6: Commit**

```bash
git add platform/playwright.config.ts platform/e2e/ platform/package.json platform/package-lock.json platform/.gitignore
git commit -m "feat: add Playwright for E2E testing"
```

**Note:** The smoke E2E test will only pass once the Next.js app is running with a root page. It's scaffolded now so the infrastructure is ready.

---

### Task 5: Set Up pgTAP for Database Testing

**Files:**
- Create: `supabase/tests/00_smoke.test.sql`

**Prerequisites:** Supabase CLI installed (`npm install -D supabase` or globally), local Supabase running via `supabase start`.

**Step 1: Create test directory**

```bash
mkdir -p supabase/tests
```

**Step 2: Create smoke database test**

Create `supabase/tests/00_smoke.test.sql`:
```sql
BEGIN;

SELECT plan(1);

SELECT ok(true, 'pgTAP is working');

SELECT * FROM finish();

ROLLBACK;
```

**Step 3: Add db test script to root package.json**

Add to root `package.json` scripts (create if it doesn't exist):
```json
{
  "scripts": {
    "test:db": "supabase test db"
  }
}
```

**Step 4: Commit**

```bash
git add supabase/tests/ package.json
git commit -m "feat: add pgTAP database testing infrastructure"
```

**Note:** `supabase test db` requires a running local Supabase instance (`supabase start`). This test validates the infrastructure is ready. Real RLS and function tests will be added in Phase 1 and Phase 3 alongside migrations.

---

### Task 6: Create Root Test Scripts

**Files:**
- Modify or create: root `package.json`

**Step 1: Add unified test scripts to root package.json**

The root `package.json` should have scripts that run tests across all layers:

```json
{
  "name": "opc",
  "private": true,
  "workspaces": ["platform"],
  "scripts": {
    "test": "npm run test:unit && npm run test:db",
    "test:unit": "npm -w platform test",
    "test:watch": "npm -w platform run test:watch",
    "test:coverage": "npm -w platform run test:coverage",
    "test:e2e": "npm -w platform run test:e2e",
    "test:db": "supabase test db",
    "test:all": "npm run test:unit && npm run test:db && npm run test:e2e"
  }
}
```

**Step 2: Verify unit tests via root**

Run: `npm run test:unit`
Expected: All Vitest tests pass

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add root test scripts for all testing layers"
```

---

## Test Script Summary

### From `platform/` (Next.js app):

| Command | Purpose |
|---------|---------|
| `npm test` | Run all unit/integration tests once |
| `npm run test:watch` | Run tests in watch mode (during development) |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run test:ui` | Open Vitest UI in browser |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Open Playwright UI mode |
| `npm run test:e2e:headed` | Run E2E tests in visible browser |

### From root (`OCP/`):

| Command | Purpose |
|---------|---------|
| `npm test` | Run unit tests + database tests |
| `npm run test:unit` | Run Vitest unit/integration tests only |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:db` | pgTAP database tests (requires local Supabase) |
| `npm run test:all` | Run everything — unit + db + e2e |

---

## File Structure After Completion

```
OCP/
├── package.json                          # Root with workspace + test scripts
├── platform/
│   ├── package.json                      # App + test dependencies + scripts
│   ├── vitest.config.ts                  # Vitest configuration
│   ├── vitest.setup.ts                   # Global test setup (jest-dom, MSW)
│   ├── playwright.config.ts              # Playwright E2E configuration
│   ├── .gitignore                        # Playwright artifacts excluded
│   ├── lib/
│   │   └── __tests__/
│   │       └── smoke.test.ts             # Vitest smoke test
│   ├── test-utils/
│   │   ├── index.ts                      # Barrel export
│   │   ├── render.tsx                    # RTL render with providers
│   │   ├── factories.ts                  # Data factories (profile, tournament, registration)
│   │   ├── msw/
│   │   │   ├── server.ts                 # MSW server setup
│   │   │   └── handlers.ts              # Default Supabase mock handlers
│   │   └── __tests__/
│   │       ├── msw.test.ts              # MSW integration test
│   │       ├── render.test.tsx          # Render helper test
│   │       └── factories.test.ts        # Factories test
│   └── e2e/
│       └── smoke.spec.ts                # Playwright smoke test
└── supabase/
    └── tests/
        └── 00_smoke.test.sql            # pgTAP smoke test
```
