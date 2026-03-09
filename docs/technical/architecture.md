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
│   │   │   ├── layout.tsx      # Player layout (delegates to AppSidebar)
│   │   │   ├── dashboard/page.tsx  # Registrations list + stats
│   │   │   ├── profile/page.tsx    # Profile edit + avatar upload
│   │   │   ├── verify-identity/page.tsx  # Identity verification page
│   │   │   ├── rankings/page.tsx   # Public leaderboard (Phase 4)
│   │   │   ├── players/[slug]/page.tsx  # Public player profile (Phase 4)
│   │   │   └── tournaments/
│   │   │       ├── page.tsx        # Browse with filters/pagination
│   │   │       └── [id]/page.tsx   # Detail + registration button
│   │   ├── (organizer)/
│   │   │   ├── layout.tsx      # Organizer layout (delegates to AppSidebar)
│   │   │   └── organizer/      # URL prefix to avoid route conflicts
│   │   │       ├── dashboard/page.tsx         # Organizer stats + tournament table
│   │   │       └── tournaments/
│   │   │           ├── new/page.tsx            # Create tournament
│   │   │           └── [id]/
│   │   │               ├── page.tsx            # Edit tournament
│   │   │               ├── registrations/page.tsx  # Registration management
│   │   │               └── results/page.tsx        # Results entry (Phase 3B)
│   │   ├── (admin)/
│   │   │   ├── layout.tsx      # Admin layout (delegates to AppSidebar)
│   │   │   └── admin/
│   │   │       ├── points-config/page.tsx     # Bracket + country config (Phase 3C)
│   │   │       ├── dashboard/page.tsx         # Admin stats overview (Phase 5)
│   │   │       ├── users/page.tsx             # User management (Phase 5)
│   │   │       ├── organizers/page.tsx        # Organizer invitations (Phase 5)
│   │   │       └── tournaments/page.tsx       # Tournament oversight (Phase 5)
│   │   ├── api/
│   │   │   ├── verification/
│   │   │   │   └── create-session/route.ts  # Didit session creation
│   │   │   └── webhooks/
│   │   │       └── didit/route.ts           # Didit webhook handler
│   │   └── auth/
│   │       └── callback/route.ts   # OAuth code exchange
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login-form.tsx      # Client Component
│   │   │   ├── signup-form.tsx     # Client Component
│   │   │   ├── verification-status.tsx  # Verification badge/link
│   │   │   └── __tests__/
│   │   ├── tournaments/
│   │   │   ├── tournament-card.tsx      # Server Component
│   │   │   ├── tournament-grid.tsx      # Server Component
│   │   │   ├── filter-bar.tsx           # Client Component
│   │   │   ├── pagination.tsx           # Client Component
│   │   │   ├── registration-button.tsx  # Client Component
│   │   │   └── __tests__/
│   │   ├── dashboard/
│   │   │   ├── cancel-registration-button.tsx  # Client Component
│   │   │   └── __tests__/
│   │   ├── profile/
│   │   │   ├── profile-form.tsx         # Client Component
│   │   │   └── __tests__/
│   │   ├── organizer/
│   │   │   ├── tournament-form.tsx             # Client Component (create/edit)
│   │   │   ├── results-entry-form.tsx          # Client Component (Phase 3B)
│   │   │   ├── registration-status-select.tsx  # Client Component
│   │   │   ├── export-csv-button.tsx           # Client Component
│   │   │   └── __tests__/
│   │   ├── admin/
│   │   │   ├── points-config-editor.tsx        # Client Component (Phase 3C)
│   │   │   ├── user-table.tsx                  # Client Component (Phase 5)
│   │   │   ├── invite-organizer-form.tsx       # Client Component (Phase 5)
│   │   │   ├── admin-tournament-table.tsx      # Client Component (Phase 5)
│   │   │   └── __tests__/
│   │   ├── rankings/
│   │   │   ├── rank-badge.tsx                  # Server Component (Phase 4)
│   │   │   ├── leaderboard-search.tsx          # Client Component (Phase 4)
│   │   │   └── __tests__/
│   │   ├── players/
│   │   │   ├── achievement-badge.tsx           # Server Component (Phase 4)
│   │   │   ├── achievement-grid.tsx            # Server Component (Phase 4)
│   │   │   ├── stats-grid.tsx                  # Server Component (Phase 4)
│   │   │   ├── player-profile-header.tsx       # Server Component (Phase 4)
│   │   │   ├── tournament-history-table.tsx    # Server Component (Phase 4)
│   │   │   └── __tests__/
│   │   └── layout/
│   │       ├── sidebar-layout.tsx              # Reusable sidebar layout shell
│   │       └── app-sidebar.tsx                 # Unified role-based sidebar
│   ├── lib/
│   │   ├── points.ts              # Client-side points calculation utility
│   │   ├── didit.ts               # Didit API + webhook signature validation
│   │   ├── actions/
│   │   │   ├── tournament.ts      # createTournament, updateTournament (Server Actions)
│   │   │   ├── registration.ts    # updateRegistrationStatus (Server Action)
│   │   │   ├── results.ts         # saveResults (Server Action, Phase 3B)
│   │   │   └── admin.ts           # updateDefaultBrackets, updateCountryConfig, recomputeAllStats, promoteToOrganizer, inviteOrganizer, cancelTournamentAdmin (Phase 3C + 5)
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
│   │       ├── didit.test.ts          # Webhook signature validation
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
│   │   ├── 003_tournament_registrations.sql
│   │   ├── 004_avatar_storage.sql
│   │   ├── 005_tournament_results.sql
│   │   ├── 006_player_stats.sql
│   │   ├── 007_achievements.sql
│   │   ├── 008_points_functions.sql
│   │   ├── 009_country_points.sql
│   │   ├── 010_country_stats_functions.sql
│   │   ├── 011_profile_slugs.sql
│   │   ├── 012_additional_achievements.sql
│   │   └── 013_organizer_invitations.sql
│   └── tests/
│       ├── 00_smoke.test.sql
│       ├── 01_profiles.test.sql
│       ├── 02_tournaments.test.sql
│       ├── 03_registrations.test.sql
│       ├── 04_tournament_results.test.sql
│       ├── 05_player_stats.test.sql
│       ├── 06_achievements.test.sql
│       ├── 008_points_functions.test.sql
│       ├── 009_country_points.test.sql
│       └── 011_profile_slugs.test.sql
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
| Identity verification | Didit v3 API (redirect-based, no client SDK) | Implemented |
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
| `DIDIT_API_KEY` | Didit verification API key | Server only |
| `DIDIT_WEBHOOK_SECRET` | Didit webhook HMAC secret | Server only |
| `NEXT_PUBLIC_DIDIT_WORKFLOW_ID` | Didit workflow identifier | Browser + server |

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
- Forms with state (LoginForm, SignupForm, ProfileForm, TournamentForm)
- Interactive elements (FilterBar, Pagination, RegistrationButton, CancelRegistrationButton, RegistrationStatusSelect, ExportCsvButton)
- Use `createBrowserClient()` for mutations or invoke Server Actions
- Must wrap `useSearchParams()` in `<Suspense>` at the page level

### Server Actions (`'use server'`)
- Located in `lib/actions/` directory
- Used for form mutations: `createTournament`, `updateTournament`, `updateRegistrationStatus`, `saveResults`, `updateDefaultBrackets`, `updateCountryConfig`, `recomputeAllStats`, `promoteToOrganizer`, `inviteOrganizer`, `cancelTournamentAdmin`
- Called from client components via form actions or direct invocation
- Validate input, check auth/role, perform Supabase operations, revalidate paths

## Testing Architecture

### Unit Tests (Vitest)
- **Location:** `__tests__/` directories alongside source files
- **Setup:** `vitest.setup.ts` configures jest-dom matchers + MSW server lifecycle
- **Mocking:** MSW for Supabase API, `vi.mock('next/navigation')` for router
- **Run:** `npm run test:unit` (155 tests, 34 files)

### Database Tests (pgTAP)
- **Location:** `supabase/tests/*.test.sql`
- **Tests:** Table existence, column checks, RLS enabled
- **Run:** `npm run test:db`

### E2E Tests (Playwright)
- **Location:** `platform/e2e/*.spec.ts`
- **Config:** Chromium only, localhost:3000
- **Run:** `npm run test:e2e`

## Phase Status

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 0 | Testing framework (Vitest, MSW, Playwright, pgTAP) | Complete |
| Phase 1 | Foundation (auth, middleware, DB migrations, design bridge) | Complete |
| Phase 2 | Tournament flow (browse, detail, register, dashboard, profile) | Complete |
| Phase 3A | Organizer tools (dashboard, tournament CRUD, registrations) | Complete |
| Phase 3B | Results & points (results entry, points calculation, achievements) | Complete |
| Phase 3C | Country points & admin (country points, admin UI, unified sidebar) | Complete |
| Phase 4 | Rankings & stats (leaderboard, public profiles, achievements) | Complete |
| Phase 5 | Verification & admin (identity verification, admin dashboard, user/organizer management) | Complete (email notifications deferred) |

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
