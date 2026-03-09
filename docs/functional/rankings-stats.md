# OPC Platform — Rankings & Public Player Profiles

## Overview

Phase 4 adds two public-facing features: a **global leaderboard** at `/rankings` and **public player profiles** at `/players/[slug]`. Both pages are accessible without authentication and are Server Components that fetch data directly from Supabase.

Rankings are computed automatically from tournament results via Postgres triggers. Player profiles expose stats, achievements, and tournament history. URL slugs are auto-generated from display names to provide clean, shareable profile URLs.

## Public Leaderboard (`/rankings`)

### Page Layout

```
+--------------------------------------------------+
|  Rankings                                         |
|  Live rankings of verified players across Europe  |
+--------------------------------------------------+
|  [Search player name...]  [Country dropdown ▾]    |
+--------------------------------------------------+
|  #  | Player           | Country | Points | Tourn |
|  1  | ▲ John Smith      | Germany | 12,500 | 14   |
|  2  | — Maria Garcia    | Spain   | 11,200 | 12   |
|  3  | ▼ Luc Dupont      | France  | 10,800 | 15   |
|  ...                                              |
+----------------------------------+----------------+
|  < 1 2 3 ... >                   | How Rankings   |
|                                  | Work (sidebar) |
+----------------------------------+----------------+
```

### Features

| Feature | Description |
|---------|-------------|
| Player search | Debounced text input (300ms), filters by `display_name` via `ilike` |
| Country filter | Dropdown populated from `country_config` table, filters by `profiles.home_country` |
| Pagination | 20 players per page, URL-based (`?page=N`), resets to page 1 on filter change |
| Rank badges | Current rank number + movement indicator (up/down/unchanged) |
| Player links | Each player name links to `/players/[slug]` |
| Top 3 highlight | Rows for rank 1-3 have a subtle blue background |
| Sidebar | "How Rankings Work" explainer panel |

### Search & Filter Flow

```
User types in search box
  ↓ (300ms debounce)
URL updated: /rankings?q=john
  ↓
Server re-renders with ilike filter on profiles.display_name
  ↓
Page param reset to 1

User selects country from dropdown
  ↓
URL updated: /rankings?country=DE
  ↓
Country code mapped to country name via country_config
  ↓
Server re-renders with eq filter on profiles.home_country
```

### Rank Badge

The `RankBadge` component displays the current rank with a directional indicator:

| Indicator | Condition | Color | Symbol |
|-----------|-----------|-------|--------|
| Improved | `currentRank < previousRank` | Green (`#22c55e`) | ▲ |
| Dropped | `currentRank > previousRank` | Red (`#ef4444`) | ▼ |
| Unchanged | `currentRank === previousRank` or no previous rank | Secondary text | — |

### Data Query

The rankings page queries `player_stats` joined with `profiles` (inner join):

```
player_stats
  → profiles!inner (id, display_name, avatar_url, home_country, nationality, slug)
  → ordered by total_points DESC
  → paginated with range()
  → optional ilike filter on display_name
  → optional eq filter on home_country
```

## Public Player Profiles (`/players/[slug]`)

### Page Layout

```
+--------------------------------------------------+
| [Avatar]  John Smith               #1 Global Rank |
|           Germany | Member since March 2026       |
+--------------------------------------------------+
| 12,500      | 14          | 3                     |
| Total Points | Tournaments | Wins                 |
| 5           | 2.4         | 1                     |
| Top 3       | Avg Finish  | Best Finish           |
+--------------------------------------------------+
| Achievements                                      |
| [First Blood] [Regular] [Champion] [Point Machine]|
| [Veteran]     [Triple Crown] [Podium] [Globe]     |
+--------------------------------------------------+
| Tournament History                                |
| Tournament      | Date       | Country | # | Pts |
| Prague Open      | 12 Jan 26  | Czechia | 1 | 500 |
| Berlin Classic   | 5 Feb 26   | Germany | 3 | 200 |
+--------------------------------------------------+
```

### Profile Header

Displays the player's avatar (image or initials fallback), display name, home country, member-since date, and global rank badge. The rank is shown only if the player has one (i.e., exists in `player_stats`).

### Stats Grid

A 3-column, 2-row grid of stat cards:

| Stat | Source Field | Fallback |
|------|-------------|----------|
| Total Points | `player_stats.total_points` | `0` |
| Tournaments | `player_stats.tournament_count` | `0` |
| Wins | `player_stats.win_count` | `0` |
| Top 3 | `player_stats.top3_count` | `0` |
| Avg Finish | `player_stats.avg_finish` | `—` |
| Best Finish | `player_stats.best_finish` | `—` |

### Tournament History Table

Paginated table (10 per page via `history_page` URL param) showing past tournament results:

| Column | Source |
|--------|--------|
| Tournament | `tournaments.name` (linked to `/tournaments/[id]`) |
| Date | `tournaments.start_date` (formatted `day month year`) |
| Country | `tournaments.country` |
| Place | `tournament_results.placement` |
| Points | `tournament_results.points_awarded` |

Results are ordered by `created_at` descending (most recent first).

### Data Fetching

The profile page makes four parallel queries:

```
Promise.all([
  player_stats     → total_points, tournament_count, win_count, top3_count, avg_finish, best_finish, current_rank
  player_achievements → achievement_id, awarded_at (for this player)
  achievements     → id, name, description, icon (all achievements)
  tournament_results → id, placement, points_awarded, tournaments(id, name, country, start_date)
])
```

Profile is looked up by `slug` column. If no profile matches, the page returns `notFound()`.

### Dynamic Metadata

Page title is set dynamically: `{display_name} — OPC Europe` (or `Player — OPC Europe` if not found).

## Achievements System

### Achievement Types

8 achievements are seeded across two migrations:

| Name | Icon | Criteria Type | Threshold | Description |
|------|------|--------------|-----------|-------------|
| First Blood | :dart: | `tournament_count` | 1 | Played in your first tournament |
| Regular | :flower_playing_cards: | `tournament_count` | 5 | Played in 5 tournaments |
| Veteran | :sports_medal: | `tournament_count` | 20 | Played in 20 tournaments |
| Champion | :trophy: | `win_count` | 1 | Won a tournament |
| Triple Crown | :crown: | `win_count` | 3 | Won 3 tournaments |
| Podium Master | :1st_place_medal: | `top3_count` | 10 | Finished top 3 in 10 tournaments |
| Point Machine | :moneybag: | `total_points` | 10,000 | Earned 10,000 total points |
| Globetrotter | :earth_africa: | `countries_played` | 3 | Played in 3 or more countries |

### Auto-Check Trigger

```
Tournament result inserted/updated
  ↓
Trigger fires: compute_player_stats(player_id)
  ↓
player_stats row updated (points, win_count, etc.)
  ↓
check_achievements(player_id) called
  ↓
Loops through all achievements
  ↓
Compares criteria_type against player stats
  (countries_played counted via DISTINCT tournament countries)
  ↓
Awards any unearned achievements (ON CONFLICT DO NOTHING)
```

### Display Logic

The `AchievementGrid` component renders all 8 achievements for every player:

- **Earned achievements** appear first (sorted), full opacity, with "Earned {date}" label
- **Unearned achievements** appear after, at 40% opacity with grayscale filter
- Grid layout: 4 columns on desktop

Each `AchievementBadge` shows the icon, name, description, and (if earned) the award date formatted as `day month year`.

## Component Architecture

| Component | File | Type | Description |
|-----------|------|------|-------------|
| Rankings Page | `app/(player)/rankings/page.tsx` | Server | Leaderboard with search, filter, pagination |
| Player Profile Page | `app/(player)/players/[slug]/page.tsx` | Server | Full player profile with stats, achievements, history |
| `LeaderboardSearch` | `components/rankings/leaderboard-search.tsx` | Client | Search input + country dropdown with URL-based state |
| `RankBadge` | `components/rankings/rank-badge.tsx` | Server | Rank number + movement indicator |
| `PlayerProfileHeader` | `components/players/player-profile-header.tsx` | Server | Avatar, name, country, member-since, rank |
| `StatsGrid` | `components/players/stats-grid.tsx` | Server | 6-card stat grid |
| `AchievementGrid` | `components/players/achievement-grid.tsx` | Server | All achievements with earned/unearned state |
| `AchievementBadge` | `components/players/achievement-badge.tsx` | Server | Single achievement card |
| `TournamentHistoryTable` | `components/players/tournament-history-table.tsx` | Server | Paginated results table |
| `Pagination` | `components/tournaments/pagination.tsx` | Client | Shared pagination (reused from tournaments) |

## Data Sources

### Database Tables

| Table | Role in Rankings/Profiles |
|-------|--------------------------|
| `player_stats` | Computed rankings: total_points, tournament_count, win_count, top3_count, avg_finish, best_finish, current_rank, previous_rank |
| `player_country_stats` | Per-country per-player rankings (used for country-weighted scoring) |
| `achievements` | Achievement definitions: name, description, icon, criteria_type, criteria_threshold |
| `player_achievements` | Player-to-achievement mapping with `awarded_at` timestamp |
| `profiles` | Player identity: display_name, avatar_url, home_country, nationality, slug, created_at |
| `tournament_results` | Per-player tournament placements and points awarded |
| `tournaments` | Tournament metadata (name, country, dates) joined for history display |
| `country_config` | Country codes and names for the filter dropdown |

### RLS Policies

All tables used by rankings and profiles have public read access:

| Table | Read Policy |
|-------|-------------|
| `player_stats` | Public read (all rows) |
| `achievements` | Public read (all rows) |
| `player_achievements` | Public read (all rows) |
| `profiles` | Public read (all rows) |
| `tournament_results` | Public read (all rows) |
| `country_config` | Public read (all rows) |

## URL Slugs

### Generation

Profile slugs are auto-generated from `display_name` via the `generate_profile_slug` Postgres function:

```
"John Smith"      → "john-smith"
"María García"    → "mara-garca"        (non-ASCII stripped)
"Player 123"      → "player-123"
""                → "player"             (fallback)
NULL              → "player"             (fallback)
"John Smith" (dup)→ "john-smith-2"       (collision suffix)
```

### Trigger

The `profiles_slug` trigger fires `BEFORE INSERT OR UPDATE` on the `profiles` table. It regenerates the slug only when `display_name` changes (or on insert).

### Constraints

- `NOT NULL` — every profile has a slug
- `UNIQUE INDEX` on `slug` — no duplicates
- Collision handling appends `-2`, `-3`, etc.

### Migration

Migration `011_profile_slugs.sql` added the slug column, trigger, and backfilled all existing profiles.
