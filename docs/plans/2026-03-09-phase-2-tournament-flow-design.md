# Phase 2 — Core Tournament Flow Design

**Date:** 2026-03-09
**Phase plan:** [phase-2-tournament-flow.md](phase-2-tournament-flow.md)
**Depends on:** Phase 1 (complete)

## Overview

Build the player-facing tournament experience: browsing with filters, viewing details, registering, managing registrations from a dashboard, and editing a player profile with avatar upload.

## Architecture Decisions

- **Server Components + URL search params** — all pages are Server Components fetching from Supabase server-side. Client Components only for interactive pieces (filter dropdowns, registration button, profile form, cancel button).
- **URL-based filtering** — `/tournaments?country=NL&series=OPC+Main&sort=soonest&page=2` for shareable, bookmarkable, refresh-safe filtering.
- **No new table migrations** — `tournaments`, `tournament_registrations`, and `profiles` tables already exist from Phase 1. Only need a storage bucket migration for avatars.
- **Design continuity** — tournament cards replicate the static site's `site/tournaments.html` card design using the same CSS patterns and `tokens.css` variables.

## Pages

### 1. Tournament Browse (`/tournaments`)

- **Type:** Server Component
- **Search params:** `country`, `series`, `sort` (soonest|latest|cheapest), `page`
- **Data:** Fetches from `tournaments` table with server-side filtering, sorting, pagination (16 per page)
- **Auth-aware:** If logged in, also fetches user's registrations to show "Registered" badge on cards
- **Layout:** Replicates the static site header, card grid, and filter controls

### 2. Tournament Detail (`/tournaments/[id]`)

- **Type:** Server Component
- **Data:** Single tournament + registration count (via `count` query on `tournament_registrations`)
- **Display:** Name, dates, venue address, entry fee, capacity vs registered count, description, organizer contact email, `requires_verification` notice
- **Registration:** `RegistrationButton` client component handles all checks and insertion
- **Status:** Shows current registration status if already registered

### 3. Player Dashboard (`/dashboard`)

- **Type:** Server Component (replaces current placeholder)
- **Data:** User's registrations joined with tournament data, split by upcoming vs past
- **Stats:** Total registered count, upcoming count
- **Actions:** `CancelRegistrationButton` client component for upcoming tournaments (sets status to `cancelled`, records `cancelled_at`)

### 4. Profile Page (`/profile`)

- **Type:** Server Component shell + `ProfileForm` client component
- **Fields:** display_name, city, home_country, nationality, bio, avatar
- **Avatar:** Upload to Supabase Storage `avatars` bucket, store URL in `profiles.avatar_url`
- **Onboarding:** Sets `onboarding_complete = true` on first save
- **Pre-filled:** Shows current profile data from Supabase

## Components

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| `TournamentCard` | Server | `components/tournaments/` | Card matching static site design |
| `TournamentGrid` | Server | `components/tournaments/` | Responsive grid wrapper |
| `FilterBar` | Client | `components/tournaments/` | Country/series/sort dropdowns, URL param updates |
| `Pagination` | Client | `components/tournaments/` | Page navigation with URL params |
| `RegistrationButton` | Client | `components/tournaments/` | Register with validation checks |
| `CancelRegistrationButton` | Client | `components/dashboard/` | Cancel upcoming registration |
| `ProfileForm` | Client | `components/profile/` | Edit profile + avatar upload |

## Registration Flow

1. User clicks "Register" on tournament detail page
2. `RegistrationButton` checks:
   - User is authenticated (redirect to login if not)
   - `onboarding_complete = true` (prompt to complete profile if not)
   - `requires_verification` → user must be `identity_verified` (show notice if not)
   - `registration_open = true` and before `registration_deadline`
   - Capacity not reached (compare registration count vs `capacity`)
3. Insert into `tournament_registrations` with `status = 'registered'`
4. Show confirmation state on button
5. RLS enforces `onboarding_complete` check at database level as additional guard

## Storage

- **Bucket:** `avatars` (public read)
- **Path:** `{user_id}/avatar.{ext}`
- **RLS:** Users can upload/update/delete files in their own `{user_id}/` folder
- **Migration:** `004_avatar_storage.sql`

## Route Classification

No changes needed to `lib/auth/routes.ts`:
- `/tournaments` — already public
- `/tournaments/[id]` — public (falls through to default)
- `/profile` — already in `PROTECTED_ROUTES`
- `/dashboard` — already in `PROTECTED_ROUTES`

## Styling

- Use `tokens.css` variables (`var(--color-*)`, `var(--font-*)`)
- Tournament cards use inline styles with CSS custom properties (matching Phase 1 auth component pattern)
- Responsive at 1200px, 992px, 640px breakpoints
- Dark theme consistent with static site
