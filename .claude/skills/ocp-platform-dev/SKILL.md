---
name: ocp-platform-dev
description: Use when working on the OPC tournament management platform (Next.js app), implementing platform phases, setting up Supabase, or building authenticated features for the Open Poker Championship
---

# OPC Platform Development

## Overview
Guide for building the OPC tournament management platform — a Next.js app with Supabase backend that extends the static marketing site into a full-stack application.

## When to Use
- Implementing any platform phase (1–5)
- Setting up Next.js app, Supabase tables, auth, or edge functions
- Building authenticated pages (dashboard, profile, organizer tools, admin)
- Working on tournament registration, results, rankings, or verification flows

## Architecture Reference
- **Masterplan:** `docs/plans/2026-03-08-tournament-platform-design.md`
- **Phase plans:** `docs/plans/phase-{1..5}-*.md`

### Directory Structure (target)
```
OCP/
├── site/                   # Static HTML pages (moved from root)
├── platform/               # Next.js app (App Router, TypeScript)
│   ├── app/
│   │   ├── (auth)/         # login, signup, verify-email, verify-identity
│   │   ├── (player)/       # dashboard, profile, tournaments
│   │   ├── (organizer)/    # organizer dashboard, registrations, results
│   │   └── (admin)/        # admin dashboard, users, organizers
│   ├── components/
│   │   └── ui/             # Design system components
│   └── lib/supabase/       # client.ts, server.ts, admin.ts, middleware.ts
├── supabase/
│   ├── migrations/
│   └── functions/          # Edge Functions
└── docs/plans/
```

### Roles
| Role | Access |
|------|--------|
| Player | Dashboard, profile, tournament browse/register |
| Organizer (invite-only) | Tournament management, registrations, results entry |
| Admin | User management, organizer invitations, tournament oversight |

### Key Tables
- `profiles` — extends auth.users (display_name, nationality, verification status)
- `tournaments` — organizer_id, capacity, registration settings, points_multiplier
- `tournament_registrations` — player ↔ tournament with status tracking
- `tournament_results` — placements and points awarded
- `player_stats` — computed rankings (total_points, win_count, current_rank)
- `achievements` + `player_achievements` — badge system

## Development Workflow

### 1. Read the phase plan
Before starting work, read the relevant `docs/plans/phase-*.md` file thoroughly.

### 2. Use TDD (MANDATORY)
Invoke `superpowers:test-driven-development` before writing implementation code.
- Write tests first for all Supabase queries, auth flows, and business logic
- Test RLS policies via Supabase MCP tools
- Test middleware route protection

### 3. Design system bridge
- Extract CSS tokens from `styles.css` into shared `tokens.css`
- Use Inter font via `next/font/google`
- Match the dark theme (`#0c0e12` bg, `#1570ef` accent) from the static site

### 4. Supabase conventions
- Migrations in `supabase/migrations/` with descriptive names
- RLS policies on every table — test with different roles
- Use service role client (`admin.ts`) only in edge functions and server-side admin operations
- Postgres functions for computed data (stats, rankings, achievements)

### 5. Test and verify (MANDATORY)
Before marking any phase task as complete:
- [ ] Auth flows work end-to-end
- [ ] RLS policies block unauthorized access
- [ ] Middleware protects routes correctly
- [ ] UI matches static site design language
- [ ] Responsive at 1200px, 992px, 640px

### 6. Document (MANDATORY)
After completing each phase:
- [ ] Mark phase tasks as done in the plan document
- [ ] Update CLAUDE.md with any new conventions or structure changes
- [ ] Update relevant skills (this skill, ocp-style-system, etc.)
- [ ] Document any new components or patterns in `docs/STYLE_GUIDE.md`

## Phase Summary

| Phase | Focus | Plan |
|-------|-------|------|
| 1 | Monorepo, auth, Supabase setup | `phase-1-foundation.md` |
| 2 | Tournament browse, register, dashboard | `phase-2-tournament-flow.md` |
| 3 | Organizer tools, results entry, points | `phase-3-organizer-tools.md` |
| 4 | Public leaderboard, profiles, achievements | `phase-4-rankings-stats.md` |
| 5 | Didit verification, admin panel, emails | `phase-5-verification-admin.md` |

## Common Mistakes
- Skipping RLS policy testing — always verify access control
- Not bridging the design system from the static site
- Forgetting to update middleware when adding new routes
- Using client-side Supabase for admin operations (use service role)
- Not documenting new patterns after completing a phase
- Skipping TDD — tests are mandatory, not optional