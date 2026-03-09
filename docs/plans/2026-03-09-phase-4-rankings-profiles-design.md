# Phase 4 Design — Rankings, Profiles & Stats

**Date:** 2026-03-09
**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Phase plan:** [phase-4-rankings-stats.md](phase-4-rankings-stats.md)

## Scope

- Public leaderboard (`/rankings`)
- Public player profile with slug URLs (`/players/[slug]`)
- 8 achievement badges (6 existing + 2 new), all shown on profiles (greyed if unearned)

**Deferred to later:** ranking snapshots (cron/Edge Function), static site wiring.

## Database Changes

### Migration: `011_profile_slugs.sql`
- Add `slug` column to `profiles` — `text UNIQUE NOT NULL`
- Create function `generate_profile_slug(display_name text)`:
  - Lowercase, replace spaces/special chars with hyphens
  - On collision, append `-2`, `-3`, etc.
- Trigger on `profiles` INSERT to auto-generate slug from `display_name`
- Trigger on `profiles` UPDATE of `display_name` to regenerate slug
- Backfill existing profiles with slugs

### Migration: `012_additional_achievements.sql`
- Insert 2 new achievements:
  - **Point Machine** — `criteria_type: 'total_points'`, `criteria_threshold: 10000`
  - **Globetrotter** — `criteria_type: 'countries_played'`, `criteria_threshold: 3`
- Update `check_achievements()` function to handle new criteria types:
  - `total_points`: check `player_stats.total_points >= threshold`
  - `countries_played`: count distinct `tournaments.country` from `tournament_results`

## Routes

| Route | Type | Route Group |
|---|---|---|
| `/rankings` | public | `(player)` |
| `/players/[slug]` | public | `(player)` |

Both added to `PUBLIC` array in `lib/auth/routes.ts`.

## Components

### Leaderboard (`platform/components/rankings/`)

**`LeaderboardTable`** (Server Component)
- Fetches `player_stats` JOIN `profiles` ordered by `total_points DESC`
- Accepts search query, country filter, page number as props
- Renders table matching `site/ranking.html` design
- 20 rows per page
- Top 3 rows get highlight styling

**`LeaderboardSearch`** (Client Component — `'use client'`)
- Search input + country dropdown
- Updates URL search params (`?q=`, `?country=`, resets `?page=1`)
- Pattern: `useSearchParams()` + `useRouter()` + `usePathname()`
- Wrapped in `<Suspense>` boundary

**`RankBadge`** (Server Component)
- Props: `currentRank`, `previousRank`
- Green up arrow: `currentRank < previousRank`
- Red down arrow: `currentRank > previousRank`
- Grey dash: equal or no previous rank

### Player Profile (`platform/components/players/`)

**`PlayerProfileHeader`** (Server Component)
- Large avatar, display name, nationality flag(s), member since
- Links back to rankings

**`StatsGrid`** (Server Component)
- 6 cards: Total Points, Tournaments Played, Wins, Top-3, Avg Finish, Best Finish
- Responsive: 3×2 grid on desktop, 2×3 on tablet, 1×6 on mobile

**`AchievementBadge`** (Server Component)
- Props: `achievement`, `earned: boolean`, `awardedAt?: Date`
- Earned: full color with icon + name + earned date
- Unearned: greyed out (opacity + desaturate)

**`AchievementGrid`** (Server Component)
- Fetches all 8 achievements + player's earned ones
- Renders grid of `AchievementBadge` components
- Earned badges first, unearned after

**`TournamentHistoryTable`** (Server Component)
- Fetches `tournament_results` JOIN `tournaments` for player
- Columns: tournament name (linked to `/tournaments/[id]`), date, country, placement, points
- Paginated: 10 per page via URL param `?history_page=`

## Page Structure

### `/rankings` page
```
LeaderboardSearch (client, in Suspense)
LeaderboardTable (server)
  └── RankBadge per row
Pagination (client, existing component)
Sidebar: "How Rankings Work" card
```

### `/players/[slug]` page
```
PlayerProfileHeader
StatsGrid
AchievementGrid
  └── AchievementBadge × 8
TournamentHistoryTable
Pagination (for history)
```

## Sidebar Navigation

Add "Rankings" link (🏅 icon) to base player section in `AppSidebar`, between Dashboard and Tournaments.

## Styling

- All inline styles with `var(--color-*)` tokens (matches existing platform pattern)
- Leaderboard table mirrors `site/ranking.html` CSS classes/layout
- Dark theme, card-based stats grid
- Achievement badges use icon field from DB + CSS filter for greyed state

## Data Flow

### Leaderboard
```
/rankings?q=john&country=NL&page=2
  → Server component reads searchParams
  → Query: player_stats JOIN profiles
    WHERE display_name ILIKE '%john%'
    AND home_country = 'NL'
    ORDER BY total_points DESC
    LIMIT 20 OFFSET 20
  → Count query for pagination
```

### Player Profile
```
/players/john-doe
  → Server component reads slug param
  → Query profiles WHERE slug = 'john-doe'
  → Parallel queries:
    - player_stats WHERE player_id = id
    - player_achievements JOIN achievements WHERE player_id = id
    - All achievements (for unearned display)
    - tournament_results JOIN tournaments WHERE player_id = id
      ORDER BY created_at DESC LIMIT 10
```

## Testing

- Unit tests for all new components (Vitest + RTL)
- Unit tests for slug generation logic
- pgTAP tests for slug trigger + new achievements + updated check_achievements
- E2E tests for leaderboard search/filter/pagination and player profile navigation
