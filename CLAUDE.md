# OPC — European Open Poker Championship

## Project Overview
Static marketing website for a European poker championship platform, evolving into a full-stack tournament management platform. Dark-themed, premium design built with vanilla HTML/CSS (static site) and Next.js (platform app).

## Tech Stack

### Static Site (`site/`)
- **HTML5** — semantic markup, no frameworks
- **CSS3** — custom properties, flexbox, grid, media queries
- **Vanilla JS** — minimal, for dropdowns, filters, scroll-reveal animations
- **Supabase JS client** (CDN) — used by ranking.html and results-upload.html for live data
- **SheetJS** (CDN) — XLSX parsing in results-upload.html
- **Google Fonts** — Inter (400, 500, 600, 700)
- **No build tools** — static files served directly

### Platform (`platform/`) — Phase 5 + Didit verification + Payload CMS
- **Next.js 15.4.11** (App Router, TypeScript) — pinned for Payload CMS compatibility
- **Supabase** — auth (email + Google + Facebook), Postgres, RLS
- **@supabase/ssr** — cookie-based server-side auth sessions
- **Payload CMS v3** — embedded in Next.js, Lexical rich text editor, own `payload` Postgres schema
- **Didit** v3 API (redirect-based verification, no client SDK) — identity verification (age 18+)
- **Vitest 4** + React Testing Library + MSW 2 — unit testing
- **Playwright** — E2E testing
- **pgTAP** — database/RLS testing
- Masterplan: `docs/plans/2026-03-08-tournament-platform-design.md`
- Phases 1–5: `docs/plans/phase-*.md`

## Project Structure
```
OCP/
├── site/                       # Static HTML pages
│   ├── index.html              # Landing page
│   ├── ranking.html            # Player rankings / leaderboard
│   ├── tournaments.html        # Tournament listing
│   ├── contact.html            # Contact page
│   ├── privacy.html            # Privacy policy
│   ├── terms.html              # Terms & conditions
│   ├── responsible-gaming.html # Responsible gaming
│   ├── countries/              # Country pages
│   │   ├── netherlands.html    # Netherlands
│   │   ├── belgium.html        # Belgium
│   │   ├── germany.html        # Germany
│   │   ├── england.html        # England
│   │   ├── poland.html         # Poland
│   │   └── austria.html        # Austria
│   ├── partners/               # Partner pages
│   │   ├── overview.html       # Partner listing page
│   │   ├── juice-brothers.html # Juice Brothers
│   │   ├── luxon-pay.html      # Luxon Pay
│   │   ├── ipr.html            # International Poker Rules
│   │   └── arend-klein.html    # Poker Arend
│   ├── tournament-detail.html  # Tournament detail page (single placeholder)
│   ├── news.html               # News — coming soon placeholder
│   ├── blog.html               # Blog — coming soon placeholder
│   ├── events.html             # Events — coming soon placeholder
│   ├── about.html              # About OPC page
│   ├── results-upload.html     # Master ranking results upload (password-gated)
│   ├── styles.css              # Shared stylesheet (~3100 lines)
│   └── assets/                 # Images, logos, flags
├── platform/                   # Next.js 15 app
│   ├── app/
│   │   ├── (auth)/             # Auth pages (login, signup, verify-email)
│   │   ├── (player)/           # Player pages (dashboard, profile, verify-identity, tournaments, rankings, players)
│   │   ├── (organizer)/        # Organizer pages
│   │   │   └── organizer/      # URL prefix (avoids route group conflicts)
│   │   │       ├── dashboard/  # Organizer dashboard with stats
│   │   │       └── tournaments/# Create, edit, registrations
│   │   │           └── [id]/results/ # Results entry page
│   │   │       ├── rankings/   # Public leaderboard
│   │   │       └── players/[slug]/ # Public player profiles
│   │   ├── (admin)/            # Admin pages
│   │   │   └── admin/
│   │   │       ├── points-config/ # Points bracket & country config
│   │   │       ├── dashboard/  # Admin stats overview
│   │   │       ├── users/      # User management
│   │   │       ├── organizers/ # Organizer invitations
│   │   │       └── tournaments/# Tournament oversight
│   │   ├── (payload)/          # Payload CMS admin (own layout, no sidebar)
│   │   │   ├── cms/[[...segments]]/ # CMS admin catch-all
│   │   │   └── api/[...slug]/  # Payload REST API
│   │   ├── (public)/           # Public content pages (no sidebar)
│   │   │   ├── news/           # News listing + [slug] detail
│   │   │   ├── blog/           # Blog listing + [slug] detail
│   │   │   └── events/         # Events listing + [slug] detail
│   │   ├── api/
│   │   │   ├── tournaments-list/ # Tournament list for CMS selector
│   │   │   ├── verification/  # Didit session creation
│   │   │   └── webhooks/didit/# Didit webhook handler
│   │   ├── auth/callback/      # OAuth callback route
│   │   ├── layout.tsx          # Root layout (Inter font, globals.css)
│   │   ├── globals.css         # OPC base styles (imports tokens.css)
│   │   └── tokens.css          # Design tokens (shared with site/)
│   ├── components/
│   │   ├── auth/               # LoginForm, SignupForm, VerificationStatus
│   │   ├── tournaments/        # TournamentCard, FilterBar, Pagination, RegistrationButton
│   │   ├── dashboard/          # CancelRegistrationButton
│   │   ├── profile/            # ProfileForm
│   │   ├── layout/             # sidebar-layout.tsx, app-sidebar.tsx
│   │   ├── admin/              # points-config-editor.tsx, user-table.tsx, invite-organizer-form.tsx, admin-tournament-table.tsx
│   │   ├── rankings/           # RankBadge, LeaderboardSearch
│   │   ├── players/            # AchievementBadge, AchievementGrid, StatsGrid, PlayerProfileHeader, TournamentHistoryTable
│   │   ├── organizer/          # TournamentForm, RegistrationStatusSelect, ExportCsvButton
│   │   ├── content/            # ContentCard, ContentGrid, FeaturedHero, PublicHeader
│   │   └── cms/                # TournamentSelect (Payload admin field component)
│   ├── lib/
│   │   ├── actions/            # Server Actions (tournament.ts, registration.ts, results.ts, admin.ts — includes promoteToOrganizer, inviteOrganizer, cancelTournamentAdmin)
│   │   ├── points.ts           # Client-side points calculation
│   │   ├── didit.ts            # Didit API + webhook signature validation
│   │   ├── feature-flags.ts    # Feature flags (server) + route→flag mapping
│   │   ├── feature-flags-shared.ts # Shared flag types/constants (server+client)
│   │   ├── auth/routes.ts      # Route classification (public/protected/organizer/admin)
│   │   └── supabase/           # client.ts, server.ts, admin.ts, middleware.ts
│   ├── collections/            # Payload CMS collections
│   │   ├── Posts.ts            # News + blog posts (category field)
│   │   ├── EventAnnouncements.ts # Tournament announcements
│   │   ├── Media.ts            # Image uploads
│   │   └── Users.ts            # CMS auth users
│   ├── payload.config.ts       # Payload CMS configuration
│   ├── middleware.ts            # Route protection + session refresh
│   ├── test-utils/             # MSW handlers, render helpers, data factories
│   └── e2e/                    # Playwright E2E tests
├── supabase/
│   ├── migrations/             # 001_profiles through 015_cms_feature_flags
│   └── tests/                  # pgTAP tests
├── designs/                    # Figma design screenshots
└── docs/
    ├── STYLE_GUIDE.md          # Design system reference
    └── plans/                  # Implementation plans (phases 1–5)
```

## Design System
- **Theme:** Dark mode (`#0c0e12` bg) with blue accent (`#1570ef`)
- **Font:** Inter, weights 400–700
- **Static site tokens:** CSS custom properties in `:root` of `site/styles.css`
- **Platform tokens:** `platform/app/tokens.css` (extracted from site, shared)
- **Full reference:** See `docs/STYLE_GUIDE.md`

## Code Conventions

### CSS (Static Site)
- Use CSS custom properties (`var(--color-*)`) — never hardcode colors
- BEM-inspired class naming: `.component`, `.component-element`, `.component--modifier`
- Section comments: `/* --- Section Name --- */`
- Responsive styles grouped at the end of `styles.css`, by breakpoint
- Breakpoints: 1200px, 992px, 640px
- Transitions: `0.2s ease` for interactive states

### Platform (Next.js)
- **Inline styles** with CSS custom properties for auth/layout components
- **`tokens.css`** imported via `globals.css` — use `var(--color-*)` tokens
- **Server Components** by default, `'use client'` only for forms with state
- **`useSearchParams()`** must be wrapped in `<Suspense>` boundary
- **Mock `next/navigation`** in tests: `vi.mock('next/navigation', () => ({ useRouter: ... }))`
- **Server Actions** (`'use server'`) in `lib/actions/` for form mutations (create/update tournament, update registration status, save results, admin operations)
- **Route groups with URL prefix:** `(organizer)/organizer/` pattern avoids conflicts between route groups
- **Unified sidebar navigation:** `AppSidebar` server component builds role-based `NavSection[]`, used by all route group layouts (player, organizer, admin)
- **`SidebarLayout`** accepts `sections: NavSection[]` (not flat `items`) for role-based grouping with optional section labels
- **Server Actions** in `lib/actions/admin.ts` for admin operations (updateDefaultBrackets, updateCountryConfig, recomputeAllStats, promoteToOrganizer, inviteOrganizer, cancelTournamentAdmin)
- Page title format: `Page Name — OPC Europe`

### Animations
- **Hero entrance:** `fadeInUp` keyframe animation on `.hero-title`, `.hero-subtitle`, `.hero-actions` with staggered delays (0s, 0.15s, 0.3s)
- **Scroll reveal:** `.reveal` class (opacity 0, translateY 24px) → `.reveal--visible` added via JS IntersectionObserver
- **Staggered children:** `.reveal-stagger > .reveal:nth-child(n)` with incremental `transition-delay` (0.08s steps)
- **Marching dashes:** `marchDown` keyframe on `.how-steps-line path` for animated SVG connector lines
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all animations and transitions
- All animation CSS lives in the `/* --- Animations --- */` section at the end of `styles.css`

### HTML (Static Site)
- Semantic elements: `<header>`, `<section>`, `<footer>`, `<nav>`, `<aside>`
- Inline SVG for icons — no icon fonts or external sprite sheets
- Alt text required on all images
- Header and footer are duplicated per page (no templating)

### General
- No external CSS frameworks (Bootstrap, Tailwind, etc.)
- No JavaScript frameworks for the static site
- All mock data is hardcoded in HTML for the static site
- Platform uses Supabase for all data

## Database Schema (Supabase)
- **`profiles`** — extends auth.users (display_name, nationality, role, identity_verified, etc.)
  - Auto-created via trigger on auth.users insert
  - RLS: public read, self-update (cannot change role/verification)
- **`tournaments`** — name, dates, venue, capacity, points_multiplier, requires_verification
  - RLS: public read, organizer/admin create, organizer update own, admin delete
- **`tournament_registrations`** — player ↔ tournament with status tracking
  - RLS: player sees own, organizer sees their tournaments, admin sees all
  - Requires `onboarding_complete = true` to register
- **`tournament_results`** — placement and points per player per tournament
  - RLS: public read, organizer insert/update own tournaments, admin all
- **`player_stats`** — computed rankings (total points, wins, rank)
  - RLS: public read, function-only writes
- **`achievements`** — badge/achievement definitions (8 seeded)
  - RLS: public read
- **`player_achievements`** — player ↔ achievement mapping
  - RLS: public read
- **`country_config`** — country codes, multipliers, custom brackets (15 seeded)
- **`default_points_brackets`** — configurable placement→points mapping (9 seeded)
- **`player_country_stats`** — per-country per-player rankings
- **`organizer_invitations`** — email-based organizer invitations with auto-promote trigger
  - RLS: admin only
  - Trigger: on profiles INSERT, auto-promotes matching email to organizer
- **Postgres functions:** `calculate_points`, `compute_player_stats`, `compute_all_player_stats`, `check_achievements`, `generate_profile_slug`, `handle_organizer_invitation`
- **Trigger:** on `tournament_results` insert/update to auto-compute points and stats
- **`feature_flags`** — feature toggle table (key, enabled, label, description, tier, sort_order)
  - CMS flags: `cms_admin`, `cms_news`, `cms_blog`, `cms_events` (tier 8, disabled by default)

### Master Ranking Schema (Static Site)
- **`master_config`** — key-value config (stores upload_password), RLS: no public access
- **`master_players`** — standalone player pool (601 seeded), independent of auth/profiles
  - Columns: name, name_normalized, nationality, total_points, rank, linked_profile_id
  - RLS: public read, no direct writes
- **`points_entries`** — audit log of every points addition per player
  - Columns: player_id, points, event_label, uploaded_at, uploaded_by
  - RLS: public read, no direct writes
- **`submit_results`** RPC — SECURITY DEFINER function, password-protected, handles player creation, points insert, total/rank recomputation
- **Migrations:** `016_master_ranking.sql` (schema + RPC), `017_seed_master_ranking.sql` (601 legacy players)

### Payload CMS Schema
- Payload uses a separate `payload` Postgres schema in the same Supabase database
- Tables are auto-managed by Payload (Posts, EventAnnouncements, Media, Users)
- Payload has its own JWT auth — separate from Supabase Auth
- CMS admin panel at `/cms`, REST API at `/api/[...slug]`
- `next.config.ts` wrapped with `withPayload()` from `@payloadcms/next/withPayload`
- Next.js pinned to `15.4.11` (Payload v3 requires `>=15.4.11 <15.5.0`)

## Auth & Middleware
- **Supabase Auth:** email/password + Google + Facebook OAuth
- **Session management:** `@supabase/ssr` with cookie-based sessions, refreshed in middleware
- **Route classification** (`lib/auth/routes.ts`):
  - `public`: `/api/webhooks/*`, `/login`, `/signup`, `/verify-*`, `/`, `/tournaments`, `/rankings`, `/players/*`
  - `protected`: `/dashboard`, `/profile`, `/profile/*`, `/verify-identity`, `/tournaments/*/register`
  - `organizer`: `/organizer/*`
  - `admin`: `/admin/*`
- **Middleware** redirects unauthenticated users to `/login`, logged-in users away from auth pages
- **Middleware skips** `/cms` and `/api/payload` routes (Payload handles its own auth)
- **Feature flags** gate routes via `FLAG_ROUTE_MAP` in `lib/feature-flags.ts` (e.g., `/news` → `cms_news`)

## Creating New Static Pages
1. Copy the `<head>` block from `site/index.html` (includes fonts, favicon, viewport)
2. Reuse the same `<header>` and `<footer>` markup (includes Countries and About OPC dropdowns)
3. Add page-specific styles to `site/styles.css` under a new section comment
4. Link from the navigation in all existing pages
5. Follow the design in `designs/` folder if a Figma screenshot exists
6. Add `.reveal` classes to content sections for scroll-reveal animations
7. Include the scroll-reveal JS snippet (IntersectionObserver) if the page has reveal elements

## Navigation (Static Site)
- All pages share the same header nav: Home, Rankings, Tournaments, News, Partners, Countries dropdown, About OPC dropdown
- Country pages live in `site/countries/` (e.g., `countries/netherlands.html`)
- Partner pages live in `site/partners/` (e.g., `partners/juice-brothers.html`)
- Pages in subdirectories use `../` prefix for all asset/nav paths
- Tournament cards (`<a class="tournament-card">`) on `tournaments.html` link to `tournament-detail.html`
- Event cards (`<a class="event-card">`) on homepage and country pages also link to `tournament-detail.html`
- Currently a single tournament detail page exists as a placeholder (Amsterdam Open)

## Master Ranking System (Static Site)
- **`ranking.html`** — live leaderboard fetching from Supabase `master_players` table (replaces hardcoded mock data)
  - Supabase JS client from CDN, client-side pagination (50/page), search, country filter
  - Deterministic avatar colors from name hash, inline SVG flags for 5 countries
- **`results-upload.html`** — password-gated upload page (noindex, nofollow, no nav link)
  - 4-step flow: password gate → file upload (CSV/XLSX) → review & fuzzy match → submit
  - Fuzzy matching: Levenshtein distance against 601 existing players, exact/fuzzy/new badges
  - Calls `submit_results` RPC via Supabase anon key (password validated server-side)
  - CSS classes: `.upload-*` prefix (gate, dropzone, review-table, badges, submit)
  - SheetJS CDN for XLSX parsing, native JS for CSV

## Creating New Country Pages
1. Copy `site/countries/netherlands.html` as template
2. Replace country name, flag image, city names, and descriptions
3. Country pages live in `site/countries/` — use `../` prefix for all asset/nav/footer paths
4. Country pages have 4 sections: hero (with flag), partners grid, upcoming tournaments, country info, and CTA
5. CSS classes: `.country-hero`, `.country-section`, `.country-partners-grid`, `.country-partner-card`, `.country-cta`
6. Responsive breakpoints already included in `styles.css` (992px, 640px)
7. Add the country to the Countries dropdown in ALL page headers (root pages use `countries/*.html`, partner pages use `../countries/*.html`)

## Creating New Partner Pages
1. Copy `site/partners/juice-brothers.html` as template
2. Replace partner name, logo, tagline, website URL, and about content
3. Partner pages live in `site/partners/` — use `../` prefix for all asset/nav/footer paths
4. Partner pages have 3 sections: hero (split layout with logo), about, and CTA
5. CSS classes: `.pp-hero`, `.pp-hero-inner`, `.pp-hero-logo`, `.pp-hero-content`, `.pp-about`, `.pp-cta`, `.pp-breadcrumb`
6. Add the partner to `site/partners/overview.html` card grid
7. Wrap the partner logo on the homepage in an `<a>` tag linking to the partner page

## Testing & Verification
- **Always use TDD:** Use the `superpowers:test-driven-development` skill for all feature work
- **Test before done:** No feature is considered complete until it has been properly tested and verified
- **Unit tests:** `npm run test:unit` (Vitest + RTL, 155 tests, 35 files)
- **DB tests:** `npm run test:db` (pgTAP, 7 test files)
- **E2E tests:** `npm run test:e2e` (Playwright)
- **All tests:** `npm run test:all`
- **Visual QA:** Compare implementation against Figma designs side-by-side
- **Responsive testing:** Verify at all three breakpoints (1200px, 992px, 640px)
- **Accessibility:** Alt text present, keyboard navigation works, color contrast meets WCAG AA

## Documentation Requirements
- **After every phase:** Use the `ocp-phase-docs` skill to update ALL documentation
- **Functional docs** (`docs/functional/`): platform-overview, database-schema, auth-flow
- **Technical docs** (`docs/technical/`): architecture, testing
- **Also update:** CLAUDE.md, `ocp-platform-dev` skill, MEMORY.md, phase plan files
- If a new pattern or component is introduced, add it to the style guide and relevant skills
- Mark completed plan tasks/phases as done in the plan documents

## Figma Integration
- Design screenshots live in `designs/`
- MCP Figma tools are available for fetching design context
- Always match the Figma design as closely as possible

## Plans
- **Masterplan:** `docs/plans/2026-03-08-tournament-platform-design.md` — full platform architecture
- **Phase plans:** `docs/plans/phase-{1..5}-*.md` — detailed implementation phases
- **Impl plans:** `docs/plans/phase-*-impl.md` — task-by-task execution plans
- **Feature plans:** `docs/plans/YYYY-MM-DD-feature-name.md` — individual feature plans
- Plans should be detailed enough for task-by-task execution
- Use `superpowers:executing-plans` skill to implement plans

## Git Conventions
- Commit format: `type: description` (e.g., `feat: add ranking page`, `fix: adjust spacing`)
- Types: `feat`, `fix`, `refactor`, `docs`, `style`
- One logical change per commit

## Supabase MCP
- Project ref: `uxlnhyeijfeiurwleecy`
- MCP server: `ocp-supabase`
- Use `apply_migration` for DDL, `execute_sql` for queries
- Use `get_project_url` and `get_publishable_keys` for env setup
