---
name: ocp-platform-dev
description: Use when working on the OPC tournament management platform (Next.js app), implementing platform phases, setting up Supabase, or building authenticated features for the Open Poker Championship
---

# OPC Platform Development

## Overview
Guide for building the OPC tournament management platform — a Next.js 15 app with Supabase backend that extends the static marketing site into a full-stack application.

## When to Use
- Implementing any platform phase (1–5)
- Setting up Next.js app, Supabase tables, auth, or edge functions
- Building authenticated pages (dashboard, profile, organizer tools, admin)
- Working on tournament registration, results, rankings, or verification flows

## Architecture Reference
- **Masterplan:** `docs/plans/2026-03-08-tournament-platform-design.md`
- **Phase plans:** `docs/plans/phase-{1..5}-*.md`
- **Impl plans:** `docs/plans/phase-*-impl.md` (task-by-task execution plans)

### Directory Structure (current)
```
OCP/
├── site/                   # Static HTML pages (moved from root)
├── platform/               # Next.js 15 app (App Router, TypeScript)
│   ├── app/
│   │   ├── (auth)/         # login, signup, verify-email
│   │   ├── (player)/       # dashboard, profile, tournaments
│   │   ├── (organizer)/    # organizer dashboard, tournament CRUD, registrations
│   │   │   └── organizer/  # URL prefix (avoids route group conflicts)
│   │   │       └── tournaments/[id]/results/ # Results entry page
│   │   ├── (admin)/        # Admin pages
│   │   │   └── admin/
│   │   │       └── points-config/ # Points bracket & country config
│   │   ├── auth/callback/  # OAuth code exchange route
│   │   ├── layout.tsx      # Root layout (Inter font)
│   │   ├── globals.css     # Base styles (imports tokens.css)
│   │   └── tokens.css      # Design tokens shared with site/
│   ├── components/
│   │   ├── auth/           # LoginForm, SignupForm (client components)
│   │   ├── tournaments/    # TournamentCard, FilterBar, Pagination, RegistrationButton
│   │   ├── dashboard/      # CancelRegistrationButton
│   │   ├── profile/        # ProfileForm
│   │   ├── layout/         # sidebar-layout.tsx, app-sidebar.tsx
│   │   ├── admin/          # points-config-editor.tsx
│   │   ├── rankings/       # RankBadge, LeaderboardSearch (Phase 4)
│   │   ├── players/        # AchievementBadge, AchievementGrid, StatsGrid, PlayerProfileHeader, TournamentHistoryTable (Phase 4)
│   │   └── organizer/      # TournamentForm, RegistrationStatusSelect, ExportCsvButton
│   ├── lib/
│   │   ├── actions/        # Server Actions (tournament.ts, registration.ts, results.ts, admin.ts)
│   │   ├── points.ts      # Client-side points calculation
│   │   ├── auth/routes.ts  # Route classification logic
│   │   └── supabase/       # client.ts, server.ts, admin.ts, middleware.ts
│   ├── middleware.ts        # Route protection + session refresh
│   ├── test-utils/         # MSW handlers, render helpers, data factories
│   └── e2e/                # Playwright E2E tests
├── supabase/
│   ├── migrations/         # 001_profiles through 012_additional_achievements
│   └── tests/              # pgTAP tests
└── docs/plans/
```

### Roles
| Role | Access |
|------|--------|
| Player | Dashboard, profile, tournament browse/register |
| Organizer (invite-only) | Tournament management, registrations, results entry |
| Admin | User management, organizer invitations, tournament oversight |

### Database Tables
- `profiles` — extends auth.users (display_name, nationality, role, verification status)
  - Auto-created via trigger on auth.users insert
  - RLS: public read, self-update (cannot change role/verification fields)
- `tournaments` — organizer_id, capacity, registration settings, points_multiplier, requires_verification
  - RLS: public read, organizer/admin create, organizer update own, admin delete
  - 16 seed records pre-loaded
- `tournament_registrations` — player ↔ tournament with status tracking
  - RLS: player sees own, organizer sees their tournaments, admin sees all
  - Requires `onboarding_complete = true` to register
- `tournament_results` — placement and points per player per tournament
  - RLS: public read, organizer insert/update own tournaments, admin all
- `player_stats` — computed rankings (total points, wins, rank)
  - RLS: public read, function-only writes
- `achievements` — badge definitions (8 seeded), `player_achievements` — earned badges
  - RLS: public read
- `country_config` — country codes, multipliers, custom brackets (15 seeded)
- `default_points_brackets` — configurable placement→points mapping (9 seeded)
- `player_country_stats` — per-country per-player rankings

### Auth & Middleware
- **Supabase Auth:** email/password + Google + Facebook OAuth
- **@supabase/ssr** with cookie-based sessions, refreshed in middleware
- **Route classification** (`lib/auth/routes.ts`):
  - `public`: `/login`, `/signup`, `/verify-*`, `/`, `/tournaments`, `/rankings`, `/players/*`
  - `protected`: `/dashboard`, `/profile`, `/profile/*`, `/tournaments/*/register`
  - `organizer`: `/organizer/*`
  - `admin`: `/admin/*`

## Development Workflow

### 1. Read the phase plan
Before starting work, read the relevant `docs/plans/phase-*.md` file thoroughly.

### 2. Use TDD (MANDATORY)
Invoke `superpowers:test-driven-development` before writing implementation code.
- Write tests first for all Supabase queries, auth flows, and business logic
- Test RLS policies via Supabase MCP tools
- Test middleware route protection

### 3. Component patterns (from Phase 1)
- **Server Components** by default, `'use client'` only for forms with state
- **`useSearchParams()`** must be wrapped in `<Suspense>` on the page level
- **Inline styles** with CSS custom properties for auth/layout components
- **Mock `next/navigation`** in tests:
  ```ts
  vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
  }))
  ```
- Use `cleanup()` from RTL and `afterEach` in component tests
- **Server Actions** (`'use server'`) in `lib/actions/` for form mutations
  - `tournament.ts` — createTournament, updateTournament
  - `registration.ts` — updateRegistrationStatus
  - `results.ts` — saveResults
  - `admin.ts` — updateDefaultBrackets, updateCountryConfig, recomputeAllStats
- **Route groups with URL prefix:** use `(organizer)/organizer/` pattern to avoid conflicts between route groups that need the same URL prefix
- **Unified sidebar navigation:** `AppSidebar` server component (`components/layout/app-sidebar.tsx`) fetches user role and builds unified nav
  - All route group layouts (player, organizer, admin) delegate to `AppSidebar`
  - `SidebarLayout` uses `NavSection[]` with optional section labels for role-based grouping

### 4. Supabase conventions
- Migrations in `supabase/migrations/` with numbered names (001_, 002_, etc.)
- Apply via MCP: `mcp__ocp-supabase__apply_migration`
- RLS policies on every table — test with different roles
- Use service role client (`admin.ts`) only in edge functions and server-side admin operations
- Postgres functions for computed data (stats, rankings, achievements)

### 5. Test scripts
```bash
npm run test:unit     # Vitest (128 tests, 28 files)
npm run test:db       # pgTAP
npm run test:e2e      # Playwright
npm run test:all      # All of the above
```

### 6. Test and verify (MANDATORY)
Before marking any phase task as complete:
- [ ] Auth flows work end-to-end
- [ ] RLS policies block unauthorized access
- [ ] Middleware protects routes correctly
- [ ] UI matches static site design language
- [ ] Responsive at 1200px, 992px, 640px

### 7. Document (MANDATORY)
After completing each phase:
- [ ] Mark phase tasks as done in the plan document
- [ ] Update CLAUDE.md with any new conventions or structure changes
- [ ] Update relevant skills (this skill, ocp-style-system, etc.)
- [ ] Update MEMORY.md with new knowledge

## Phase Summary

| Phase | Focus | Status | Plan |
|-------|-------|--------|------|
| 0 | Testing framework | ✅ Complete | `phase-0-testing-framework.md` |
| 1 | Monorepo, auth, Supabase setup | ✅ Complete | `phase-1-foundation.md` |
| 2 | Tournament browse, register, dashboard | ✅ Complete | `phase-2-tournament-flow.md` |
| 3A | Organizer dashboard, tournament CRUD, registrations | ✅ Complete | `phase-3-organizer-tools.md` |
| 3B | Results entry, points calculation, achievements | ✅ Complete | `phase-3-organizer-tools.md` |
| 3C | Country points, admin UI, unified sidebar | ✅ Complete | `phase-3-organizer-tools.md` |
| 4 | Public leaderboard, profiles, achievements | ✅ Complete | `phase-4-rankings-stats.md` |
| 5 | Didit verification, admin panel, emails | Planned | `phase-5-verification-admin.md` |

## Common Mistakes
- Skipping RLS policy testing — always verify access control
- Not bridging the design system from the static site
- Forgetting to update middleware when adding new routes
- Using client-side Supabase for admin operations (use service role)
- Not documenting new patterns after completing a phase
- Skipping TDD — tests are mandatory, not optional
- Not wrapping `useSearchParams()` in `<Suspense>` — causes build failure
- Using Next.js 16 — stick with v15 (v16 has InvariantError build issues)
