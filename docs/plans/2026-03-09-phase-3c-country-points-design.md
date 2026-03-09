# Phase 3C — Country Points System & Admin UI

## Context
Phase 3B delivered results entry, global points calculation, and achievement tracking. Phase 3C adds per-country rankings with configurable points brackets and a global ranking weighted by country multipliers.

## Data Model

### `country_config` table
| Column | Type | Description |
|--------|------|-------------|
| country_code | text PK | ISO country code (e.g., 'NL', 'DE') |
| country_name | text NOT NULL | Display name |
| global_multiplier | numeric DEFAULT 1.0 | Weight for global ranking |
| custom_brackets | jsonb NULL | Per-country bracket overrides; null = use defaults |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Seeded with ~15 European poker countries at multiplier 1.0.

### `default_points_brackets` table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| placement_min | integer NOT NULL | Start of range (inclusive) |
| placement_max | integer NULL | End of range (null = unbounded) |
| base_points | integer NOT NULL | Points awarded |

Replaces the hardcoded CASE statement in `calculate_points()`. Seeded with current brackets.

### `player_country_stats` table
| Column | Type | Description |
|--------|------|-------------|
| player_id | uuid FK profiles | |
| country_code | text FK country_config | |
| total_points | integer DEFAULT 0 | Sum of points from this country's tournaments |
| tournament_count | integer DEFAULT 0 | |
| win_count | integer DEFAULT 0 | |
| top3_count | integer DEFAULT 0 | |
| avg_finish | numeric | |
| best_finish | integer | |
| current_rank | integer | Rank within this country |
| previous_rank | integer | |
| last_computed | timestamptz | |
| PK | (player_id, country_code) | |

### Modified existing tables/functions
- `player_stats.total_points` becomes weighted: SUM(country_points x country_multiplier)
- `calculate_points()` reads from `default_points_brackets` or country `custom_brackets`
- `compute_player_stats()` also writes to `player_country_stats`
- `compute_all_player_stats()` ranks per-country + global weighted
- Auto-insert trigger on `tournaments` for new country codes

## Admin UI

### Access
Admin role only (`/admin/*` routes, middleware enforced).

### Admin layout
Sidebar with admin-specific nav items. Follows the same `SidebarLayout` component.

### `/admin/points-config` page
Single page with two sections:

1. **Default Brackets** — editable table of placement ranges and base points. Save updates `default_points_brackets` table.

2. **Country Configuration** — table showing all countries with: name, code, multiplier (editable), custom brackets indicator. Expandable row to edit per-country custom brackets (overrides defaults).

### Server Actions
- `updateDefaultBrackets(brackets[])` — replaces all default brackets
- `updateCountryConfig(code, multiplier, customBrackets?)` — updates a country's settings

## Key Behaviors
- Players can play in multiple countries; they appear on each country's leaderboard
- Global ranking = SUM(country_points x country_multiplier) across all countries played
- When a tournament is created in a new country, `country_config` row is auto-inserted with multiplier 1.0
- Changing brackets/multipliers does not retroactively recalculate existing results (admin can trigger `compute_all_player_stats()` manually)
