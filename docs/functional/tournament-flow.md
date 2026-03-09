# OPC Platform — Tournament Flow

## Overview

The tournament flow covers the player-facing experience: browsing tournaments, viewing details, registering, managing registrations from the dashboard, and maintaining a player profile.

## Tournament Browse (`/tournaments`)

### Filtering
Players can filter tournaments by:
- **Country** — dropdown populated from distinct tournament countries in the database
- **Series** — dropdown populated from distinct tournament series (e.g. `OPC Main`, `OPC Open`)

### Sorting
- **Soonest first** (default) — `start_date` ascending
- **Latest first** — `start_date` descending
- **Cheapest first** — `entry_fee` ascending

### Pagination
- 16 tournaments per page
- Previous/Next navigation with page numbers
- All filter, sort, and page state stored in URL search params (shareable, bookmarkable)

### Registration Badge
If the logged-in user is registered for a tournament, a "Registered" badge appears on the card.

### Implementation
- **Server Component** — data fetched on the server via `createSupabaseServer()`
- `searchParams` is awaited (Next.js 15 async params)
- Filter options (countries, series) fetched as distinct values from the database
- User registrations checked if authenticated (to show badges)

## Tournament Detail (`/tournaments/[id]`)

### Information Displayed
- Tournament name, series, dates (formatted range)
- Venue: club name, city, country, full address
- Entry fee (formatted as currency, stored as integer cents)
- Description
- Organizer contact email
- Registration count vs. capacity (e.g. "12 / 50 registered")
- `requires_verification` notice if applicable

### Registration Button States
The `RegistrationButton` component handles 8 states with priority ordering:

| Priority | State | Display |
|----------|-------|---------|
| 1 | Already registered | "Registered" (disabled, green) |
| 2 | Not logged in | "Log in to Register" (links to `/login`) |
| 3 | Not onboarded | "Complete Profile First" (links to `/profile`) |
| 4 | Verification required | "Verification Required" (disabled) |
| 5 | Registration closed | "Registration Closed" (disabled) |
| 6 | Deadline passed | "Deadline Passed" (disabled) |
| 7 | Capacity full | "Tournament Full" (disabled) |
| 8 | Eligible | "Register" (active, clickable) |

### Registration Action
When an eligible player clicks "Register":
1. Client-side insert into `tournament_registrations` via `createBrowserClient()`
2. Status set to `registered`, `registered_at` set to current time
3. Page refreshes to show updated state

### Metadata
- Dynamic page title via `generateMetadata`: `"Tournament Name — OPC Europe"`
- Returns `notFound()` for invalid tournament IDs

## Player Dashboard (`/dashboard`)

### Stats Summary
- Total tournaments registered
- Upcoming tournaments count

### Upcoming Registrations Table
| Column | Description |
|--------|-------------|
| Tournament name | Links to tournament detail page |
| Dates | Formatted date range |
| City | Tournament city |
| Status | Registration status badge |
| Action | Cancel button (two-step confirmation) |

### Past Registrations Table
Same columns as upcoming, minus the cancel action.

### Cancel Registration Flow
1. Player clicks "Cancel" button
2. Confirmation prompt appears: "Are you sure?"
3. Player confirms → registration status updated to `cancelled` with `cancelled_at` timestamp
4. Page refreshes to reflect the change

### Data Fetching
- Server Component fetches registrations with joined tournament data: `select('*, tournaments(*)')`
- Registrations split into upcoming (tournament `start_date` >= today) and past

## Player Profile (`/profile`)

### Editable Fields
| Field | Type | Notes |
|-------|------|-------|
| Display name | text | Required for onboarding |
| City | text | Optional |
| Country | select | Dropdown of country codes |
| Bio | textarea | Optional, max 500 chars |
| Avatar | file upload | Image uploaded to Supabase Storage |

### Avatar Upload
- Uploaded to Supabase Storage `avatars` bucket
- Path pattern: `{user_id}/avatar.{ext}`
- Public read access, user-scoped write access (RLS)
- Displayed as circular preview on the form

### Onboarding
- First profile save sets `onboarding_complete = true`
- This flag is required by RLS policy to register for tournaments
- Profile page is accessible to all authenticated users

## Component Architecture

| Component | Type | Location |
|-----------|------|----------|
| `TournamentCard` | Server | `components/tournaments/tournament-card.tsx` |
| `TournamentGrid` | Server | `components/tournaments/tournament-grid.tsx` |
| `FilterBar` | Client | `components/tournaments/filter-bar.tsx` |
| `Pagination` | Client | `components/tournaments/pagination.tsx` |
| `RegistrationButton` | Client | `components/tournaments/registration-button.tsx` |
| `CancelRegistrationButton` | Client | `components/dashboard/cancel-registration-button.tsx` |
| `ProfileForm` | Client | `components/profile/profile-form.tsx` |

## Data Flow

```
/tournaments (browse)
  ├── Server: fetch tournaments with filters from Supabase
  ├── Server: fetch user registrations (if logged in)
  ├── Server: fetch distinct countries/series for filter options
  └── Render: TournamentGrid → TournamentCard (with registration badges)
              FilterBar (updates URL params → triggers server refetch)
              Pagination (updates URL params → triggers server refetch)

/tournaments/[id] (detail)
  ├── Server: fetch tournament by ID
  ├── Server: count registrations
  ├── Server: fetch user registration status + profile
  └── Render: Tournament info + RegistrationButton (client-side insert)

/dashboard
  ├── Server: fetch user registrations with joined tournaments
  ├── Split into upcoming/past based on start_date
  └── Render: Stats + tables with CancelRegistrationButton

/profile
  ├── Server: fetch user profile
  └── Render: ProfileForm (client-side update + avatar upload)
```
