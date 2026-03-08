# Phase 3 — Organizer Tools

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** [Phase 2 — Core Tournament Flow](phase-2-tournament-flow.md)

## Goal

Build the organizer dashboard for managing tournaments, viewing registrations, and entering results. Implement the points calculation system.

## Tasks

### 1. Organizer dashboard (`/organizer/dashboard`)
- List of organizer's tournaments (upcoming, in-progress, completed)
- Quick stats: total registrations, tournaments managed
- Create new tournament button

### 2. Tournament management (`/organizer/tournaments/[id]`)
- Edit tournament details (dates, capacity, description, venue, entry fee)
- Toggle `registration_open`
- Toggle `requires_verification`
- Set `registration_deadline`
- View tournament status

### 3. Registration management (`/organizer/tournaments/[id]/registrations`)
- Table of all registered players for a tournament
- Columns: player name, nationality, registration date, status
- Update registration status (registered → confirmed, or mark as no_show)
- Export registrations (CSV)
- Show count vs capacity

### 4. Results entry (`/organizer/tournaments/[id]/results`)
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

### 5. Points calculation — Postgres functions
- `compute_player_stats(player_id)` — recompute a single player's stats from all their results
- `compute_all_player_stats()` — recompute stats for all players (used for bulk refresh)
- Trigger: after INSERT on `tournament_results`, call `compute_player_stats()` for affected players
- `check_achievements(player_id)` — check and award any newly earned achievements

### 6. Supabase migrations
- Create migration: `tournament_results` table
- Create migration: `player_stats` table
- Create migration: `achievements` and `player_achievements` tables
- Create migration: `compute_player_stats()` function
- Create migration: `check_achievements()` function
- Create migration: trigger on `tournament_results` INSERT
- Create migration: RLS policies for new tables

## Components to build
- `OrganizerTournamentList` — list of managed tournaments
- `TournamentEditor` — form for editing tournament details
- `RegistrationTable` — sortable table of registrations
- `ResultsEntryForm` — placement entry with auto-calculated points
- `PointsDisplay` — shows calculated points breakdown

## Verification

- [ ] Organizer can see only their own tournaments
- [ ] Can edit tournament details, toggle registration/verification settings
- [ ] Registration table shows all players, status updates work
- [ ] Can enter results with correct points calculation
- [ ] `player_stats` updates automatically after results are saved
- [ ] Achievements are awarded when criteria are met
- [ ] Non-organizers cannot access `/organizer/*` routes
- [ ] Organizer cannot edit tournaments they don't own
- [ ] RLS policies enforce all access rules
