# Phase 2 — Core Tournament Flow ✅ COMPLETE

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** [Phase 1 — Foundation](phase-1-foundation.md)

## Goal

Build the player-facing tournament experience: browsing, filtering, viewing details, registering, and a personal dashboard.

## Tasks

### 1. ✅ Tournament browse page (`/tournaments`)
- Fetch tournaments from Supabase with server-side filtering
- Replicate the card design from `site/tournaments.html`
- Filter controls: country, series
- Sort options: soonest first, latest first, cheapest first
- Pagination (16 cards per page)
- Show registration status badge if user is registered

### 2. ✅ Tournament detail page (`/tournaments/[id]`)
- Full tournament info: name, description, dates, venue, entry fee, capacity
- Organizer contact info
- Registration count vs capacity
- Registration button (or status if already registered)
- `requires_verification` notice if applicable

### 3. ✅ Tournament registration flow
- "Register" button on tournament detail page
- Check: user is authenticated and onboarded
- Check: if `requires_verification`, user must be `identity_verified`
- Check: tournament `registration_open` and not past `registration_deadline`
- Check: capacity not reached
- Insert into `tournament_registrations` with status `registered`
- Confirmation state shown on the page

### 4. ✅ Player dashboard (`/dashboard`)
- List of user's tournament registrations (upcoming and past)
- Registration status per tournament
- Cancel registration option (for upcoming tournaments)
- Quick stats summary (tournaments registered, upcoming count)

### 5. ✅ Basic profile page (`/profile`)
- Display current profile info
- Edit form: display_name, city, home_country, nationality, bio, avatar
- Avatar upload to Supabase Storage
- Set `onboarding_complete = true` after first profile save

## Components to build
- `TournamentCard` — reusable card matching static site design
- `TournamentGrid` — responsive grid layout
- `FilterBar` — country/series/sort controls
- `RegistrationButton` — handles all registration logic and states
- `DashboardRegistrationList` — table of user's registrations

## Verification

- [x] Tournament list loads from Supabase, filters and sorts work
- [x] Tournament detail page shows all info correctly
- [x] Can register for a tournament, registration appears in dashboard
- [x] Cannot register when capacity is full, registration closed, or deadline passed
- [x] Cannot register for `requires_verification` tournament without being verified
- [x] Can cancel a registration from the dashboard
- [x] Profile edit saves correctly, avatar uploads work
- [x] `onboarding_complete` flag is set after first profile save
