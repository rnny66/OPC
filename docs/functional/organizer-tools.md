# OPC Platform — Organizer Tools

## Overview

The organizer tools enable tournament organizers to manage the full lifecycle of their tournaments: creating and editing events, managing player registrations, entering results, and triggering automatic points calculation. These features span Phases 3A, 3B, and 3C of the platform build.

All organizer routes are protected by middleware (`/organizer/*` requires `role = 'organizer'` or `'admin'`). Ownership checks ensure organizers can only manage their own tournaments.

## Organizer Dashboard (`/organizer/dashboard`)

The dashboard is the organizer's home screen, providing an at-a-glance summary and quick access to all tournament management actions.

### Stats Summary

| Stat | Description |
|------|-------------|
| Total Tournaments | Count of all tournaments created by the organizer |
| Total Registrations | Sum of non-cancelled registrations across all tournaments |
| Upcoming | Count of tournaments with `start_date >= today` |

### Tournament List Table

| Column | Description |
|--------|-------------|
| Name | Links to the tournament edit page |
| Date | `start_date` value |
| City | Tournament city |
| Status | `upcoming`, `ongoing`, `completed`, or `cancelled` |
| Registrations | Count from `tournament_registrations` aggregate |
| Actions | Links to Edit, Registrations, and Results pages |

### Empty State
When the organizer has no tournaments, a prompt with a link to create the first tournament is shown.

### Data Fetching
- Server Component fetches tournaments with registration counts: `select('*, tournament_registrations(count)')`
- Filtered by `organizer_id = user.id`
- Ordered by `start_date` ascending

## Tournament CRUD

### Create Tournament (`/organizer/tournaments/new`)

A simple page that renders the `TournamentForm` component without initial data. On submit, calls the `createTournament` Server Action.

### Edit Tournament (`/organizer/tournaments/[id]`)

Fetches the existing tournament by ID, verifies ownership (`organizer_id === user.id`), and renders `TournamentForm` pre-populated with current values. On submit, calls the `updateTournament` Server Action via a hidden `id` field.

### Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Tournament Name | text | Yes | |
| Club / Venue Name | text | Yes | |
| City | text | Yes | |
| Country (ISO code) | text | Yes | Two-letter ISO code |
| Series | select | Yes | Options: `OPC Main`, `OPC Open` (default: Open) |
| Description | textarea | No | |
| Venue Address | text | No | |
| Contact Email | email | No | |
| Start Date | date | Yes | |
| End Date | date | Yes | |
| Registration Deadline | date | No | |
| Entry Fee (EUR) | number | No | Displayed in euros, stored as integer cents |
| Capacity | number | No | Null means unlimited |
| Points Multiplier | number | No | Default: 1.0, step: 0.1 |
| Registration Open | checkbox | No | Default: checked |
| Requires Verification | checkbox | No | Default: unchecked |
| Status | select | Edit only | Options: `upcoming`, `ongoing`, `completed`, `cancelled` |

### Validation
- Required fields: name, club_name, city, country, start_date, end_date
- Entry fee converted from euros to cents: `Math.round(parseFloat(value) * 100)`
- Capacity parsed as integer, null if empty
- Points multiplier parsed as float, defaults to 1.0
- Checkboxes use `=== 'on'` check (HTML form behavior)

### Post-Submit Behavior
Both create and update actions:
1. Call `revalidatePath('/organizer/dashboard')` to bust the cache
2. `redirect('/organizer/dashboard')` to return to the dashboard

## Registration Management (`/organizer/tournaments/[id]/registrations`)

### Access Control
- Requires authentication
- Verifies `tournament.organizer_id === user.id`; redirects to dashboard if not the owner

### Page Layout
- Back link to tournament edit page
- Header with tournament name, registration count vs. capacity
- "Enter Results" button linking to the results page
- "Export CSV" button for downloading registration data
- Registrations table

### Registrations Table

| Column | Description |
|--------|-------------|
| Player | `display_name` from joined `profiles` |
| Nationality | First entry from `profiles.nationality` array |
| Registered | `registered_at` formatted as locale date |
| Status | Inline `RegistrationStatusSelect` dropdown |

### Status Changes
The `RegistrationStatusSelect` component allows inline status updates:

| Status | Description |
|--------|-------------|
| `registered` | Initial state when a player registers |
| `confirmed` | Organizer confirms the player's attendance |
| `no_show` | Player did not attend |

- Changes are immediate via `useTransition` (no submit button)
- Calls `updateRegistrationStatus` Server Action
- RLS enforces that only the tournament organizer can update registrations
- Path is revalidated after each status change
- Error messages displayed inline next to the dropdown

### CSV Export
The `ExportCSVButton` generates a client-side CSV download containing:

| CSV Column | Source |
|------------|--------|
| Player Name | `profiles.display_name` |
| Nationality | `profiles.nationality[0]` |
| Registered Date | `registered_at` (formatted) |
| Status | `status` |

- Filename pattern: `{tournament-name-slugified}-registrations.csv`
- Values are quoted and double-quotes escaped
- Disabled when there are zero registrations
- Cancelled registrations are excluded (filtered server-side with `.neq('status', 'cancelled')`)

### Data Fetching
- Registrations fetched with joined profiles: `select('*, profiles(display_name, nationality)')`
- Filtered by `tournament_id` and excludes cancelled status
- Ordered by `registered_at` descending (newest first)

## Results Entry (`/organizer/tournaments/[id]/results`)

### Access Control
- Requires authentication
- Verifies `tournament.organizer_id === user.id`; redirects to dashboard if not the owner

### Page Layout
- Back link to tournament edit page
- Header with tournament name, registered player count, and points multiplier
- Results entry table (or empty state if no registered players)

### Results Table

| Column | Description |
|--------|-------------|
| Player | `display_name` from joined profiles |
| Nationality | First nationality from profile |
| Placement | Editable number input (min: 1) |
| Points | Auto-calculated preview based on placement and multiplier |

### Points Calculation
Points are calculated client-side via `calculatePoints(placement, multiplier)` for instant preview, then recalculated server-side on save for accuracy.

Default points brackets (fallback when no custom brackets configured):

| Placement | Base Points |
|-----------|------------|
| 1st | 1000 |
| 2nd | 750 |
| 3rd | 500 |
| 4th | 400 |
| 5th | 350 |
| 6th-10th | 300 |
| 11th-20th | 200 |
| 21st-50th | 100 |
| 51st+ | 50 |

Final points = `floor(base_points * points_multiplier)`

### Save Flow
1. Organizer enters placement numbers for each player
2. Click "Save Results"
3. Client validates: at least one valid placement (integer >= 1) is required
4. `saveResults` Server Action is called with `tournamentId` and `results` array
5. Server verifies tournament ownership and calculates points using the tournament's `points_multiplier`
6. Results are upserted into `tournament_results` (conflict on `tournament_id, player_id`)
7. Database trigger auto-fires `compute_player_stats` and `check_achievements`
8. Path is revalidated; success/error message displayed inline

### Existing Results
When results have already been entered, the form pre-populates placement fields from existing `tournament_results` rows, allowing organizers to edit and re-save.

## Component Architecture

| Component | Type | Location | Phase |
|-----------|------|----------|-------|
| `TournamentForm` | Client | `components/organizer/tournament-form.tsx` | 3A |
| `RegistrationStatusSelect` | Client | `components/organizer/registration-status-select.tsx` | 3A |
| `ExportCSVButton` | Client | `components/organizer/export-csv-button.tsx` | 3A |
| `ResultsEntryForm` | Client | `components/organizer/results-entry-form.tsx` | 3B |
| Dashboard page | Server | `app/(organizer)/organizer/dashboard/page.tsx` | 3A |
| Create page | Server | `app/(organizer)/organizer/tournaments/new/page.tsx` | 3A |
| Edit page | Server | `app/(organizer)/organizer/tournaments/[id]/page.tsx` | 3A |
| Registrations page | Server | `app/(organizer)/organizer/tournaments/[id]/registrations/page.tsx` | 3A |
| Results page | Server | `app/(organizer)/organizer/tournaments/[id]/results/page.tsx` | 3B |

## Server Actions

### `tournament.ts`

| Action | Signature | Description |
|--------|-----------|-------------|
| `createTournament` | `(formData: FormData) => void` | Inserts a new tournament with `organizer_id` set to the authenticated user. Converts entry fee to cents. Redirects to dashboard. |
| `updateTournament` | `(formData: FormData) => void` | Updates an existing tournament by `id` (from hidden field). RLS enforces ownership. Redirects to dashboard. |

### `registration.ts`

| Action | Signature | Description |
|--------|-----------|-------------|
| `updateRegistrationStatus` | `(registrationId: string, status: string, tournamentId: string) => void` | Updates a registration's status. RLS enforces that only the tournament's organizer can modify. Revalidates the registrations page. |

### `results.ts`

| Action | Signature | Description |
|--------|-----------|-------------|
| `saveResults` | `(tournamentId: string, results: { playerId: string; placement: number }[]) => void` | Verifies tournament ownership, calculates points per player, upserts into `tournament_results`. Triggers DB functions for stats recomputation. |

## Data Flow

```
/organizer/dashboard
  ├── Server: auth check (redirect if not logged in)
  ├── Server: fetch tournaments with registration counts (filtered by organizer_id)
  ├── Server: compute stats (total, registrations, upcoming)
  └── Render: stats cards + tournament table with Edit/Registrations/Results links

/organizer/tournaments/new
  └── Render: TournamentForm (no initial data)
        └── Submit: createTournament Server Action → insert → revalidate → redirect

/organizer/tournaments/[id] (edit)
  ├── Server: auth check + ownership check
  ├── Server: fetch tournament by ID
  └── Render: TournamentForm (pre-populated)
        └── Submit: updateTournament Server Action → update → revalidate → redirect

/organizer/tournaments/[id]/registrations
  ├── Server: auth check + ownership check
  ├── Server: fetch tournament details
  ├── Server: fetch registrations with profiles (excludes cancelled)
  └── Render: registrations table
        ├── RegistrationStatusSelect → updateRegistrationStatus Server Action
        └── ExportCSVButton → client-side CSV generation + download

/organizer/tournaments/[id]/results
  ├── Server: auth check + ownership check
  ├── Server: fetch tournament (with points_multiplier)
  ├── Server: fetch non-cancelled registrations with profiles
  ├── Server: fetch existing results
  └── Render: ResultsEntryForm
        ├── Client: calculatePoints() for live preview
        └── Save: saveResults Server Action → upsert results → DB trigger
              ├── compute_player_stats (updates player_stats rankings)
              ├── compute_all_player_stats (recalculates country stats)
              └── check_achievements (awards earned badges)
```
