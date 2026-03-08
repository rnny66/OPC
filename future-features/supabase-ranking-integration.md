# Future Feature: Supabase Ranking Integration

**Status:** Planned
**Depends on:** Ranking page mockup (see `docs/plans/2026-03-08-ranking-page.md`)

---

## Goal

Replace the hardcoded HTML ranking table with live data from a Supabase PostgreSQL database. Enable real-time search, country filtering, and pagination via the Supabase JS client.

## Database Schema

### Table: `players`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Player display name |
| `home_country` | `text` | ISO 3166-1 alpha-2 code (e.g. "NL") |
| `nationality` | `text[]` | Array of ISO country codes |
| `total_points` | `integer` | Accumulated ranking points |
| `tournament_count` | `integer` | Number of tournaments played |
| `verified` | `boolean` | Age/identity verification status |
| `created_at` | `timestamptz` | Auto-set on insert |
| `updated_at` | `timestamptz` | Auto-set on update |

### Table: `ranking_snapshots`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `player_id` | `uuid` | FK → `players.id` |
| `rank` | `integer` | Position at snapshot time |
| `points` | `integer` | Points at snapshot time |
| `snapshot_date` | `date` | When the ranking was computed |

### Indexes
- `players`: index on `total_points DESC` for ranking queries
- `players`: index on `home_country` for filtering
- `ranking_snapshots`: composite index on `(snapshot_date, rank)`

### Row Level Security (RLS)
- `players`: `SELECT` allowed for `anon` role (public read)
- `players`: `INSERT/UPDATE/DELETE` restricted to `service_role` only
- Same pattern for `ranking_snapshots`

## Architecture Decision

**Search, filtering, and pagination are all server-side via Supabase queries.** No client-side filtering. Every user interaction (typing in search, selecting a country, clicking a page) triggers a new Supabase query with the appropriate parameters. This scales to thousands of players without loading the full dataset into the browser.

## Frontend Changes

### 1. Add Supabase JS Client
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
  );
</script>
```

### 2. Replace static table with dynamic rendering
- Fetch players ordered by `total_points DESC` with pagination (20 per page)
- Render rows via JavaScript DOM manipulation
- Use `.ilike()` for name search
- Use `.eq('home_country', code)` for country filter

### 3. Search (debounced)
```javascript
async function searchPlayers(query, country, page = 1) {
  let request = supabase
    .from('players')
    .select('*', { count: 'exact' })
    .order('total_points', { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);

  if (query) request = request.ilike('name', `%${query}%`);
  if (country) request = request.eq('home_country', country);

  const { data, count, error } = await request;
  return { players: data, total: count };
}
```

### 4. Pagination
- Calculate total pages from `count`
- Update pagination UI dynamically
- Re-fetch on page change

### 5. "Last updated" timestamp
- Query `max(updated_at)` from `players` table
- Display in the metadata line

## Migration SQL

```sql
-- Create players table
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  home_country text NOT NULL,
  nationality text[] NOT NULL DEFAULT '{}',
  total_points integer NOT NULL DEFAULT 0,
  tournament_count integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create ranking snapshots table
CREATE TABLE ranking_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  points integer NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Indexes
CREATE INDEX idx_players_points ON players (total_points DESC);
CREATE INDEX idx_players_country ON players (home_country);
CREATE INDEX idx_snapshots_date_rank ON ranking_snapshots (snapshot_date, rank);

-- RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ranking_snapshots FOR SELECT USING (true);

-- Seed mock data (same 20 players from the static mockup)
INSERT INTO players (name, home_country, nationality, total_points, tournament_count, verified) VALUES
  ('Jane Doe', 'NL', ARRAY['NL', 'GB'], 10000, 15, true),
  ('Player with a Long name version', 'NL', ARRAY['DE', 'GB'], 9800, 14, true),
  ('Jane Doe', 'DE', ARRAY['NL'], 9600, 13, true),
  ('Jane Doe', 'NL', ARRAY['NL'], 9400, 12, true),
  ('Jane Doe', 'BE', ARRAY['BE'], 9200, 11, true),
  ('Jane Doe', 'NL', ARRAY['NL'], 9000, 10, true),
  ('Jane Doe', 'DE', ARRAY['DE'], 8800, 9, true),
  ('Jane Doe', 'NL', ARRAY['NL'], 8600, 8, true),
  ('Jane Doe', 'NL', ARRAY['NL'], 8400, 7, true),
  ('Jane Doe', 'BE', ARRAY['BE'], 8200, 6, true);
```

## Implementation Order

1. Create Supabase project (if not already done)
2. Run migration SQL
3. Seed with mock data
4. Add Supabase JS client to `ranking.html`
5. Write `ranking.js` with fetch/render/search/filter/paginate functions
6. Replace static `<tbody>` with JS-rendered content
7. Wire up search input with debounced handler
8. Wire up country filter dropdown
9. Wire up pagination click handlers
10. Test with real data
11. Remove hardcoded rows from HTML
