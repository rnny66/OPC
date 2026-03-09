# Phase 3A Design — Organizer Dashboard, Tournament Management & Registrations

**Date:** 2026-03-09
**Parent plan:** [phase-3-organizer-tools.md](phase-3-organizer-tools.md)
**Depends on:** Phase 2 (complete)

## Goal

Build the organizer-facing pages for managing tournaments and viewing registrations. Create the database tables needed for the full Phase 3 (results, stats, achievements) so Phase 3B can focus purely on the results entry UI and points calculation logic.

## Approach

- Server Components for all pages (data fetching at the top)
- Inline styles with CSS custom properties from `tokens.css`
- Client components only for interactive bits (forms, dropdowns, exports)
- Server Actions for all mutations (tournament create/edit, registration status updates)
- Same layout pattern as `(player)/layout.tsx`

---

## 1. Database Migrations

### Migration 005: `tournament_results`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| tournament_id | uuid | FK → tournaments, NOT NULL |
| player_id | uuid | FK → profiles, NOT NULL |
| placement | integer | NOT NULL, final position |
| points_awarded | integer | NOT NULL, calculated |
| entered_by | uuid | FK → profiles (organizer) |
| created_at | timestamptz | DEFAULT now() |

- Unique constraint: `(tournament_id, player_id)`
- Indexes: `tournament_id`, `player_id`, `placement`
- RLS: public read, organizer insert/update for own tournaments, admin full access

### Migration 006: `player_stats`

| Column | Type | Notes |
|--------|------|-------|
| player_id | uuid | PK, FK → profiles |
| total_points | integer | DEFAULT 0 |
| tournament_count | integer | DEFAULT 0 |
| win_count | integer | DEFAULT 0 |
| top3_count | integer | DEFAULT 0 |
| avg_finish | numeric | |
| best_finish | integer | |
| current_rank | integer | |
| previous_rank | integer | |
| last_computed | timestamptz | |

- RLS: public read, no direct writes (function-only via service role in Phase 3B)

### Migration 007: `achievements` + `player_achievements`

**`achievements`:**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | NOT NULL, unique |
| description | text | |
| icon | text | Emoji or icon key |
| criteria_type | text | e.g. 'tournament_count', 'win_count', 'top3_count' |
| criteria_threshold | integer | Value to reach |
| created_at | timestamptz | DEFAULT now() |

**`player_achievements`:**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| player_id | uuid | FK → profiles |
| achievement_id | uuid | FK → achievements |
| awarded_at | timestamptz | DEFAULT now() |

- Unique constraint: `(player_id, achievement_id)`
- RLS: public read on both, no direct writes (function-only in Phase 3B)
- Seed achievements: First Blood (1 tournament), Regular (5), Veteran (20), Champion (1 win), Triple Crown (3 wins), Podium Master (10 top-3)

---

## 2. Route Structure

```
platform/app/(organizer)/
├── layout.tsx                              # Organizer nav layout
├── dashboard/page.tsx                      # Organizer dashboard
├── tournaments/
│   ├── new/page.tsx                        # Create tournament
│   └── [id]/
│       ├── page.tsx                        # Edit tournament
│       └── registrations/page.tsx          # Manage registrations
```

---

## 3. Organizer Layout

Same pattern as `(player)/layout.tsx`:
- Header with "OPC Europe" title
- Nav links: Dashboard, Tournaments (browse, player view), Profile
- Inline styles with CSS vars

---

## 4. Organizer Dashboard (`/organizer/dashboard`)

**Data fetching:** Fetch tournaments where `organizer_id = user.id`, plus registration counts.

**UI:**
- Stats cards: Total tournaments managed, Total registrations, Upcoming tournaments
- Tournament table: Name, date, city, status, registrations/capacity, actions (Edit, Registrations)
- "Create Tournament" button → `/organizer/tournaments/new`
- Tabs or sections: Upcoming, In Progress, Completed

---

## 5. Tournament Editor

### Create (`/organizer/tournaments/new`)
### Edit (`/organizer/tournaments/[id]`)

Same client component form, two modes based on whether tournament data is passed.

**Fields:**
- name, club_name, city, country, series (dropdown: OPC Main / OPC Open)
- description (textarea), venue_address, contact_email
- start_date, end_date, registration_deadline (date inputs)
- entry_fee, capacity, points_multiplier (number inputs)
- registration_open (toggle), requires_verification (toggle)
- status (dropdown: upcoming/ongoing/completed/cancelled) — edit only

**Server Actions:**
- `createTournament(formData)` — inserts with `organizer_id = user.id`
- `updateTournament(id, formData)` — updates, validates ownership
- Both redirect to `/organizer/dashboard` on success

**Validation:**
- Required: name, club_name, city, country, start_date, end_date
- end_date >= start_date
- capacity > 0 if provided
- points_multiplier > 0

---

## 6. Registration Management (`/organizer/tournaments/[id]/registrations`)

**Data fetching:** Tournament details + all registrations with player profiles joined.

**UI:**
- Header: Tournament name, registration count / capacity
- Table columns: Player name, nationality (flag), registered date, status, actions
- Status dropdown per row: registered → confirmed, or → no_show (Client component)
- CSV export button (client-side: fetch data, generate CSV, trigger download)
- Sort by registration date (newest first)

**Server Action:**
- `updateRegistrationStatus(registrationId, newStatus)` — validates organizer owns the tournament

---

## 7. Components

| Component | Type | Location |
|-----------|------|----------|
| OrganizerLayout | Server | `app/(organizer)/layout.tsx` |
| OrganizerDashboard | Server | `app/(organizer)/dashboard/page.tsx` |
| TournamentForm | Client | `components/organizer/tournament-form.tsx` |
| RegistrationTable | Server | `app/(organizer)/tournaments/[id]/registrations/page.tsx` |
| RegistrationStatusSelect | Client | `components/organizer/registration-status-select.tsx` |
| ExportCSVButton | Client | `components/organizer/export-csv-button.tsx` |

---

## 8. Security

- Middleware already gates `/organizer/*` to role = organizer or admin
- Server Actions double-check ownership (organizer_id = user.id) before mutations
- RLS policies enforce at the database level as a third layer
- Organizers cannot see other organizers' tournaments in their dashboard (query filter)
- Organizers cannot update registrations for tournaments they don't own

---

## Out of Scope (Phase 3B)

- Results entry UI
- Points calculation Postgres functions
- Auto-compute triggers on tournament_results
- Achievement checking logic
- Player stats recomputation
