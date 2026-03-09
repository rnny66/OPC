# OPC Platform — Points Calculation & Stats System

## Overview

The OPC points system converts tournament placements into ranking points, aggregates them into player stats (global and per-country), and awards achievements based on milestones. The pipeline runs server-side in Postgres via triggers and functions, with a client-side mirror in TypeScript for instant preview in the results entry form.

Key components:
- **`calculate_points`** — maps placement to base points via configurable brackets
- **`calculate_points_for_country`** — applies country-specific custom brackets
- **`compute_player_stats`** — aggregates a single player's results into `player_stats` and `player_country_stats`
- **`compute_all_player_stats`** — recomputes all players and assigns global + per-country rankings
- **`check_achievements`** — awards badges when stat thresholds are met
- **`on_result_change`** trigger — fires the pipeline automatically on result insert/update/delete

## Points Calculation

### Default Brackets

The `default_points_brackets` table stores 9 configurable placement ranges:

| Placement | Base Points |
|-----------|-------------|
| 1st       | 1,000       |
| 2nd       | 750         |
| 3rd       | 500         |
| 4th       | 400         |
| 5th       | 350         |
| 6th-10th  | 300         |
| 11th-20th | 200         |
| 21st-50th | 100         |
| 51st+     | 50          |

These are seeded in migration `009_country_points.sql` and can be edited by admins via the points config UI.

### `calculate_points` Function

Reads from the `default_points_brackets` table at runtime (replaced the original hardcoded `CASE` statement in migration `010`):

```sql
CREATE OR REPLACE FUNCTION public.calculate_points(placement integer)
RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (SELECT base_points FROM public.default_points_brackets
     WHERE placement >= placement_min
     AND (placement_max IS NULL OR placement <= placement_max)
     ORDER BY placement_min DESC
     LIMIT 1),
    0
  );
$$;
```

The `ORDER BY placement_min DESC LIMIT 1` ensures the most specific matching bracket wins (e.g., placement 5 matches the `5-5` bracket, not `6-10`).

### Tournament Points Multiplier

Each tournament has a `points_multiplier` column (default `1.0`). Final points awarded are:

```
points_awarded = calculate_points(placement) * tournament.points_multiplier
```

This is computed at result entry time and stored in `tournament_results.points_awarded`.

### Country-Specific Custom Brackets

Countries can override the default brackets via the `custom_brackets` JSONB column on `country_config`. The `calculate_points_for_country` function checks for a country override first, falling back to the default:

```sql
CREATE OR REPLACE FUNCTION public.calculate_points_for_country(
  placement integer,
  p_country_code text
)
RETURNS integer
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_brackets jsonb;
  v_bracket jsonb;
BEGIN
  SELECT custom_brackets INTO v_brackets
  FROM public.country_config
  WHERE country_code = p_country_code;

  IF v_brackets IS NULL THEN
    RETURN public.calculate_points(placement);
  END IF;

  FOR v_bracket IN SELECT * FROM jsonb_array_elements(v_brackets) LOOP
    -- Match placement against {min, max, points} objects
    ...
  END LOOP;
  RETURN 0;
END;
$$;
```

Custom brackets are stored as a JSON array of `{min, max, points}` objects, where `max: null` means "this placement and above."

## Stats Computation Pipeline

### `compute_player_stats(p_player_id uuid)`

This is the core function, called per-player. It performs three steps:

1. **Per-country stats** — iterates over each country the player has results in and calls `compute_player_country_stats` for each
2. **Weighted global total** — sums country-level `total_points * country.global_multiplier` across all countries
3. **Global aggregates** — computes `tournament_count`, `win_count`, `top3_count`, `avg_finish`, `best_finish` from all results

The result is upserted into `player_stats` (INSERT ... ON CONFLICT DO UPDATE).

```sql
-- Compute weighted global total
SELECT COALESCE(SUM(
  pcs.total_points * COALESCE(cc.global_multiplier, 1.0)
)::integer, 0)
INTO v_weighted_total
FROM public.player_country_stats pcs
LEFT JOIN public.country_config cc ON cc.country_code = pcs.country_code
WHERE pcs.player_id = p_player_id;
```

### `compute_player_country_stats(p_player_id, p_country_code)`

Aggregates a player's results filtered by tournament country. If no results exist for that country, the row is deleted from `player_country_stats`. Otherwise, it upserts the stats.

### `compute_all_player_stats()`

Bulk recomputation used by the admin "Recompute All Stats" action:

1. Calls `compute_player_stats` for every distinct `player_id` in `tournament_results`
2. Preserves `previous_rank` before reassigning `current_rank`
3. Assigns global rankings via `RANK() OVER (ORDER BY total_points DESC)`
4. Assigns per-country rankings via `RANK() OVER (PARTITION BY country_code ORDER BY total_points DESC)`

### Trigger: `on_result_change`

Fires `AFTER INSERT OR UPDATE OR DELETE` on `tournament_results`, per row:

```sql
CREATE TRIGGER trg_result_change
AFTER INSERT OR UPDATE OR DELETE ON public.tournament_results
FOR EACH ROW EXECUTE FUNCTION public.on_result_change();
```

The trigger function:
- On DELETE: recomputes stats for `OLD.player_id`
- On INSERT/UPDATE: recomputes stats for `NEW.player_id`, then calls `check_achievements`

Note: the trigger updates individual player stats but does **not** recompute global rankings (which require comparing all players). Rankings are updated when `compute_all_player_stats` is called explicitly.

## Country Stats

### `player_country_stats` Table

Tracks per-player, per-country aggregates with composite primary key `(player_id, country_code)`:

| Column | Type | Description |
|--------|------|-------------|
| `player_id` | uuid | FK to `profiles` |
| `country_code` | text | FK to `country_config` |
| `total_points` | integer | Sum of `points_awarded` for this country |
| `tournament_count` | integer | Number of tournaments in this country |
| `win_count` | integer | 1st place finishes |
| `top3_count` | integer | Top 3 finishes |
| `avg_finish` | numeric | Average placement |
| `best_finish` | integer | Best placement (lowest) |
| `current_rank` | integer | Rank within this country |
| `previous_rank` | integer | Previous rank (for movement display) |

### Country Multipliers

Each country in `country_config` has a `global_multiplier` (default `1.0`). When computing a player's global `total_points`, each country's points are weighted:

```
global_total = SUM(country_points * country.global_multiplier)
```

This allows certain countries (e.g., with stronger competition) to contribute more to global rankings.

### `country_config` Table

| Column | Type | Description |
|--------|------|-------------|
| `country_code` | text (PK) | ISO 2-letter code |
| `country_name` | text | Display name |
| `global_multiplier` | numeric | Weight for global rankings (default 1.0) |
| `custom_brackets` | jsonb | Optional bracket overrides |

15 European countries are seeded. New countries are auto-inserted via a trigger on `tournaments` when a tournament uses a new country code.

## Achievement Checking

### `check_achievements` Function

Called after stats are computed for a player. Iterates over all rows in the `achievements` table and awards any whose threshold is met:

```sql
FOR v_achievement IN SELECT id, criteria_type, criteria_threshold FROM public.achievements LOOP
  IF (criteria_type = 'tournament_count' AND stats.tournament_count >= threshold)
  OR (criteria_type = 'win_count'        AND stats.win_count >= threshold)
  OR (criteria_type = 'top3_count'       AND stats.top3_count >= threshold)
  OR (criteria_type = 'total_points'     AND stats.total_points >= threshold)
  OR (criteria_type = 'countries_played' AND countries_played >= threshold)
  THEN
    INSERT INTO player_achievements ... ON CONFLICT DO NOTHING;
  END IF;
END LOOP;
```

### Achievement Types (8 seeded)

| Name | Criteria Type | Threshold | Description |
|------|--------------|-----------|-------------|
| First Blood | `tournament_count` | 1 | Played in your first tournament |
| Regular | `tournament_count` | 5 | Played in 5 tournaments |
| Veteran | `tournament_count` | 20 | Played in 20 tournaments |
| Champion | `win_count` | 1 | Won a tournament |
| Triple Crown | `win_count` | 3 | Won 3 tournaments |
| Podium Master | `top3_count` | 10 | Finished top 3 in 10 tournaments |
| Point Machine | `total_points` | 10,000 | Earned 10,000 total points |
| Globetrotter | `countries_played` | 3 | Played in 3 or more countries |

The `countries_played` criteria type counts distinct `tournaments.country` values for the player (computed dynamically, not stored in `player_stats`).

Achievements use `ON CONFLICT DO NOTHING`, so they are idempotent and safe to re-run.

## Client-Side Calculation

`platform/lib/points.ts` provides a TypeScript mirror of the server-side logic for instant preview in the results entry form:

```typescript
export interface PointsBracket {
  min: number
  max: number | null
  points: number
}

export function calculateBasePoints(placement: number, brackets?: PointsBracket[]): number {
  if (brackets && brackets.length > 0) {
    for (const b of brackets) {
      if (b.max === null) {
        if (placement >= b.min) return b.points
      } else if (placement >= b.min && placement <= b.max) {
        return b.points
      }
    }
    return 0
  }
  // Default hardcoded brackets (fallback)
  if (placement === 1) return 1000
  // ... same 9 ranges as server
  return 0
}

export function calculatePoints(placement: number, multiplier: number, brackets?: PointsBracket[]): number {
  return Math.floor(calculateBasePoints(placement, brackets) * multiplier)
}
```

The results entry form (`components/organizer/results-entry-form.tsx`) loads the current brackets from `default_points_brackets` and passes them to `calculatePoints` for live point previews as the organizer enters placements.

## Admin Configuration

### Points Config Page

Located at `/admin/points-config`, the admin UI (`components/admin/points-config-editor.tsx`) provides:

1. **Default Brackets Editor** — edit `placement_min`, `placement_max`, `base_points` for each bracket row
2. **Country Config Editor** — edit `global_multiplier` and `custom_brackets` per country
3. **Recompute All Stats** button — calls `compute_all_player_stats()` to recalculate everything

### Server Actions (`lib/actions/admin.ts`)

| Action | Description |
|--------|-------------|
| `updateDefaultBrackets` | Replaces all rows in `default_points_brackets` |
| `updateCountryConfig` | Updates `global_multiplier` and `custom_brackets` for a country |
| `recomputeAllStats` | Calls `compute_all_player_stats()` via Supabase admin client |

All admin actions verify the caller has `role = 'admin'` before executing.

### When to Recompute

Stats are automatically updated per-player via the trigger, but a full recompute is needed when:
- Default brackets are changed (affects all existing points)
- Country multipliers are changed (affects weighted global totals)
- Country custom brackets are changed
- Data corrections require a fresh calculation

## Related Files

| File | Purpose |
|------|---------|
| `supabase/migrations/008_points_functions.sql` | Original points functions and trigger |
| `supabase/migrations/009_country_points.sql` | Country config, brackets, and country stats tables |
| `supabase/migrations/010_country_stats_functions.sql` | Country-aware function replacements |
| `supabase/migrations/012_additional_achievements.sql` | Added `total_points` and `countries_played` achievements |
| `platform/lib/points.ts` | Client-side points calculation |
| `platform/lib/actions/admin.ts` | Admin server actions for config changes |
| `platform/lib/actions/results.ts` | Results entry server action |
| `platform/components/admin/points-config-editor.tsx` | Admin config UI |
| `platform/components/organizer/results-entry-form.tsx` | Results entry with live point preview |
| `supabase/tests/008_points_functions.test.sql` | pgTAP tests for points functions |
| `supabase/tests/009_country_points.test.sql` | pgTAP tests for country points tables |
