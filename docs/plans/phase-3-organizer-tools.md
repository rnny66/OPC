# Phase 3 — Organizer Tools

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** [Phase 2 — Core Tournament Flow](phase-2-tournament-flow.md)

## Goal

Build the organizer dashboard for managing tournaments, viewing registrations, and entering results. Implement the points calculation system.

## Phase 3A/3B Split

Phase 3 was split into two sub-phases:
- **Phase 3A** (complete): Organizer dashboard, tournament CRUD, registration management, database tables
- **Phase 3B** (planned): Results entry UI, points calculation functions, auto-compute triggers, achievement checking

## Tasks

### 1. Organizer dashboard (`/organizer/dashboard`) --- COMPLETE
- ✅ List of organizer's tournaments (upcoming, in-progress, completed)
- ✅ Quick stats: total registrations, tournaments managed
- ✅ Create new tournament button

### 2. Tournament management (`/organizer/tournaments/[id]`) --- COMPLETE
- ✅ Edit tournament details (dates, capacity, description, venue, entry fee)
- ✅ Toggle `registration_open`
- ✅ Toggle `requires_verification`
- ✅ Set `registration_deadline`
- ✅ View tournament status

### 3. Registration management (`/organizer/tournaments/[id]/registrations`) --- COMPLETE
- ✅ Table of all registered players for a tournament
- ✅ Columns: player name, nationality, registration date, status
- ✅ Update registration status (registered → confirmed, or mark as no_show)
- ✅ Export registrations (CSV)
- ✅ Show count vs capacity

### 4. Results entry (`/organizer/tournaments/[id]/results`) — DEFERRED TO PHASE 3B
- Select players from the registration list
- Enter placement (1st, 2nd, 3rd, etc.)
- Points auto-calculated using the formula:
  ```
  1st: 1000, 2nd: 750, 3rd: 500, 4th: 400, 5th: 350
  6th-10th: 300, 11th-20th: 200, 21st-50th: 100, 51st+: 50
  Final = base_points x tournament.points_multiplier
  ```
- Bulk entry mode for efficiency
- Save results to `tournament_results` table

### 5. Points calculation — Postgres functions — DEFERRED TO PHASE 3B
- `compute_player_stats(player_id)` — recompute a single player's stats from all their results
- `compute_all_player_stats()` — recompute stats for all players (used for bulk refresh)
- Trigger: after INSERT on `tournament_results`, call `compute_player_stats()` for affected players
- `check_achievements(player_id)` — check and award any newly earned achievements

### 6. Supabase migrations — PARTIALLY COMPLETE
- ✅ Create migration: `tournament_results` table (005_tournament_results.sql)
- ✅ Create migration: `player_stats` table (006_player_stats.sql)
- ✅ Create migration: `achievements` and `player_achievements` tables (007_achievements.sql)
- ✅ Create migration: RLS policies for new tables
- Create migration: `compute_player_stats()` function — DEFERRED TO PHASE 3B
- Create migration: `check_achievements()` function — DEFERRED TO PHASE 3B
- Create migration: trigger on `tournament_results` INSERT — DEFERRED TO PHASE 3B

## Components to build
- `OrganizerTournamentList` — list of managed tournaments
- `TournamentEditor` — form for editing tournament details
- `RegistrationTable` — sortable table of registrations
- `ResultsEntryForm` — placement entry with auto-calculated points
- `PointsDisplay` — shows calculated points breakdown

## Verification

### Phase 3A (complete)
- [x] Organizer can see only their own tournaments
- [x] Can edit tournament details, toggle registration/verification settings
- [x] Registration table shows all players, status updates work
- [x] Non-organizers cannot access `/organizer/*` routes
- [x] Organizer cannot edit tournaments they don't own
- [x] RLS policies enforce all access rules

### Phase 3B (pending)
- [ ] Can enter results with correct points calculation
- [ ] `player_stats` updates automatically after results are saved
- [ ] Achievements are awarded when criteria are met
