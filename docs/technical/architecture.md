# OPC Platform — Technical Architecture

## Monorepo Structure

```
OCP/                            # Root (npm workspaces)
├── package.json                # Workspace config + test scripts
├── package-lock.json
├── site/                       # Static marketing site
│   ├── index.html
│   ├── ranking.html
│   ├── tournaments.html
│   ├── contact.html
│   ├── privacy.html
│   ├── terms.html
│   ├── responsible-gaming.html
│   ├── styles.css              # ~2088 lines, all design tokens
│   └── assets/                 # Images, logos, flags
├── platform/                   # Next.js 15 app
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json           # Path alias: @/* → ./*
│   ├── middleware.ts            # Route protection + session refresh
│   ├── vitest.config.ts        # Vitest + jsdom + React plugin
│   ├── vitest.setup.ts         # jest-dom + MSW lifecycle
│   ├── playwright.config.ts
│   ├── .env.local              # Supabase keys (gitignored)
│   ├── .env.local.example      # Template for env vars
│   ├── app/
│   │   ├── layout.tsx          # Root: Inter font, globals.css
│   │   ├── globals.css         # Reset + base styles (imports tokens.css)
│   │   ├── tokens.css          # Design tokens (from site/styles.css)
│   │   ├── page.tsx            # Root redirect → /dashboard
│   │   ├── (auth)/
│   │   │   ├── layout.tsx      # Centered card layout with OPC branding
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   ├── (player)/
│   │   │   ├── layout.tsx      # Player layout with header
│   │   │   └── dashboard/page.tsx  # Server Component, auth check
│   │   └── auth/
│   │       └── callback/route.ts   # OAuth code exchange
│   ├── components/
│   │   └── auth/
│   │       ├── login-form.tsx      # Client Component
│   │       ├── signup-form.tsx     # Client Component
│   │       └── __tests__/
│   │           ├── login-form.test.tsx
│   │           └── signup-form.test.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   └── routes.ts          # classifyRoute() — pure function
│   │   ├── supabase/
│   │   │   ├── client.ts          # createBrowserClient()
│   │   │   ├── server.ts          # createSupabaseServer()
│   │   │   ├── admin.ts           # createSupabaseAdmin()
│   │   │   ├── middleware.ts       # updateSession()
│   │   │   └── __tests__/
│   │   │       └── client.test.ts
│   │   └── __tests__/
│   │       ├── smoke.test.ts
│   │       └── middleware-routes.test.ts
│   ├── test-utils/
│   │   ├── index.ts               # Barrel export
│   │   ├── render.tsx             # renderWithProviders()
│   │   ├── factories.ts          # buildProfile(), buildTournament(), etc.
│   │   ├── msw/
│   │   │   ├── server.ts
│   │   │   └── handlers.ts       # Default Supabase auth handler
│   │   └── __tests__/
│   └── e2e/
│       └── smoke.spec.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   ├── 002_tournaments.sql
│   │   └── 003_tournament_registrations.sql
│   └── tests/
│       ├── 00_smoke.test.sql
│       ├── 01_profiles.test.sql
│       ├── 02_tournaments.test.sql
│       └── 03_registrations.test.sql
└── docs/
    ├── STYLE_GUIDE.md
    ├── functional/                # Functional documentation
    ├── technical/                 # Technical documentation
    └── plans/                     # Phase plans
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Runtime | Node.js | 18+ |
| Auth | Supabase Auth | via @supabase/ssr |
| Database | PostgreSQL (Supabase hosted) | 15.x |
| Identity verification | Didit Web SDK | Phase 5 |
| Unit testing | Vitest + React Testing Library | 4.x |
| API mocking | MSW | 2.x |
| E2E testing | Playwright | latest |
| DB testing | pgTAP | via supabase test db |

## Environment Variables

| Variable | Description | Where Used |
|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Browser + server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) | Server only |

## Request Flow

```
Browser Request
  ↓
Next.js Middleware (middleware.ts)
  ├── updateSession() — refresh Supabase cookies
  ├── classifyRoute() — determine route type
  ├── Check authentication
  ├── Check role (for organizer/admin routes)
  └── Return response (or redirect)
  ↓
Next.js App Router
  ├── Server Component → createSupabaseServer() for data
  └── Client Component → createBrowserClient() for mutations
```

## Component Architecture

### Server Components (default)
- Data fetching pages (dashboard, tournament list, profile view)
- Use `createSupabaseServer()` for authenticated data access
- No client-side JavaScript bundle

### Client Components (`'use client'`)
- Forms with state (LoginForm, SignupForm)
- Interactive elements (filters, registration buttons)
- Use `createBrowserClient()` for mutations
- Must wrap `useSearchParams()` in `<Suspense>` at the page level

## Testing Architecture

### Unit Tests (Vitest)
- **Location:** `__tests__/` directories alongside source files
- **Setup:** `vitest.setup.ts` configures jest-dom matchers + MSW server lifecycle
- **Mocking:** MSW for Supabase API, `vi.mock('next/navigation')` for router
- **Run:** `npm run test:unit` (21 tests)

### Database Tests (pgTAP)
- **Location:** `supabase/tests/*.test.sql`
- **Tests:** Table existence, column checks, RLS enabled
- **Run:** `npm run test:db`

### E2E Tests (Playwright)
- **Location:** `platform/e2e/*.spec.ts`
- **Config:** Chromium only, localhost:3000
- **Run:** `npm run test:e2e`

## Deployment (planned)

| Component | Hosting | URL |
|-----------|---------|-----|
| Static site | CDN/static hosting | `opc-europe.com` |
| Platform | Vercel | `app.opc-europe.com` |
| Database | Supabase (hosted) | `uxlnhyeijfeiurwleecy.supabase.co` |

## Design System Bridge

The platform shares design tokens with the static site:

```
site/styles.css (lines 13-36)     →  platform/app/tokens.css
       ↓                                       ↓
  :root { --color-brand: #1570ef }    @import './tokens.css'
                                              ↓
                                      platform/app/globals.css
                                              ↓
                                      platform/app/layout.tsx
```

Both the static site and the platform use the same CSS custom properties, ensuring visual consistency.
