# Future Feature: Supabase Tournaments Integration

**Status:** Planned
**Depends on:** Tournaments page mockup (see `tournaments.html`)

---

## Goal

Replace hardcoded tournament cards with live data from Supabase. Enable real-time filtering by country and series, sorting, and pagination.

## Database Schema

### Table: `tournaments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Tournament display name |
| `club_name` | `text` | Hosting club/casino name |
| `city` | `text` | City name |
| `country` | `text` | ISO 3166-1 alpha-2 code |
| `series` | `text` | Series name (e.g. "OPC Main", "OPC Open") |
| `start_date` | `date` | Tournament start date |
| `end_date` | `date` | Tournament end date |
| `entry_fee` | `integer` | Entry fee in cents (0 = free) |
| `image_url` | `text` | Tournament image URL |
| `status` | `text` | 'upcoming', 'ongoing', 'completed' |
| `created_at` | `timestamptz` | Auto-set on insert |
| `updated_at` | `timestamptz` | Auto-set on update |

### Indexes
- `tournaments`: index on `start_date ASC` for sorting
- `tournaments`: index on `country` for filtering
- `tournaments`: index on `series` for filtering
- `tournaments`: index on `status` for filtering upcoming

### RLS
- `SELECT` allowed for `anon` role (public read)
- `INSERT/UPDATE/DELETE` restricted to `service_role` only

## Architecture Decision

**Search, filtering, sorting, and pagination are all server-side via Supabase queries.** No client-side filtering. Every user interaction (selecting a country, selecting a series, changing sort order, clicking a page) triggers a new Supabase query with the appropriate parameters. This scales to hundreds of tournaments without loading the full dataset into the browser.

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

### 2. Replace static card grid with dynamic rendering
- Fetch tournaments ordered by `start_date ASC` with pagination (16 per page)
- Render cards via JavaScript DOM manipulation
- Use `.eq('country', code)` for country filter
- Use `.eq('series', name)` for series filter

### 3. Search/filter function
```javascript
async function fetchTournaments(country, series, sortField = 'start_date', sortAsc = true, page = 1) {
  const PAGE_SIZE = 16;

  let request = supabase
    .from('tournaments')
    .select('*', { count: 'exact' })
    .eq('status', 'upcoming')
    .order(sortField, { ascending: sortAsc })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (country) request = request.eq('country', country);
  if (series) request = request.eq('series', series);

  const { data, count, error } = await request;
  return { tournaments: data, total: count };
}
```

### 4. Pagination
- Calculate total pages from `count`
- Update pagination UI dynamically
- Re-fetch on page change
- 16 cards per page using `.range()`

### 5. Sort options
- `.order('start_date', { ascending: true })` — soonest first (default)
- `.order('start_date', { ascending: false })` — latest first
- `.order('entry_fee', { ascending: true })` — cheapest first

### 6. "Last updated" timestamp
- Query `max(updated_at)` from `tournaments` table
- Display in the metadata line

## Migration SQL

```sql
-- Create tournaments table
CREATE TABLE tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  club_name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  series text NOT NULL DEFAULT 'OPC Open',
  start_date date NOT NULL,
  end_date date NOT NULL,
  entry_fee integer NOT NULL DEFAULT 0,
  image_url text,
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tournaments_start_date ON tournaments (start_date ASC);
CREATE INDEX idx_tournaments_country ON tournaments (country);
CREATE INDEX idx_tournaments_series ON tournaments (series);
CREATE INDEX idx_tournaments_status ON tournaments (status);

-- RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON tournaments FOR SELECT USING (true);

-- Seed mock data (same 16 tournaments from the static mockup)
INSERT INTO tournaments (name, club_name, city, country, series, start_date, end_date, entry_fee, image_url, status) VALUES
  ('Amsterdam Open',        'Holland Casino',          'Amsterdam',  'NL', 'OPC Main',  '2026-03-11', '2026-03-14', 0,     NULL, 'upcoming'),
  ('Berlin Masters',        'Casino Berlin',           'Berlin',     'DE', 'OPC Main',  '2026-03-18', '2026-03-21', 5000,  NULL, 'upcoming'),
  ('Brussels Classic',      'Grand Casino Brussels',   'Brussels',   'BE', 'OPC Open',  '2026-03-25', '2026-03-28', 0,     NULL, 'upcoming'),
  ('London Series',         'The Hippodrome',          'London',     'GB', 'OPC Main',  '2026-04-01', '2026-04-04', 10000, NULL, 'upcoming'),
  ('Rotterdam Cup',         'Holland Casino',          'Rotterdam',  'NL', 'OPC Open',  '2026-04-08', '2026-04-11', 5000,  NULL, 'upcoming'),
  ('Munich Invitational',   'Bayerischer Poker Club',  'Munich',     'DE', 'OPC Open',  '2026-04-15', '2026-04-18', 0,     NULL, 'upcoming'),
  ('Antwerp Open',          'Stardust Casino',         'Antwerp',    'BE', 'OPC Main',  '2026-04-22', '2026-04-25', 10000, NULL, 'upcoming'),
  ('Edinburgh Grand',       'Grosvenor Casino',        'Edinburgh',  'GB', 'OPC Open',  '2026-04-29', '2026-05-02', 0,     NULL, 'upcoming'),
  ('The Hague Championship','Holland Casino',          'The Hague',  'NL', 'OPC Main',  '2026-05-06', '2026-05-09', 5000,  NULL, 'upcoming'),
  ('Hamburg Open',          'Casino Esplanade',        'Hamburg',    'DE', 'OPC Open',  '2026-05-13', '2026-05-16', 0,     NULL, 'upcoming'),
  ('Ghent Classic',         'Casino de Gand',          'Ghent',      'BE', 'OPC Main',  '2026-05-20', '2026-05-23', 10000, NULL, 'upcoming'),
  ('Manchester Series',     'Manchester235',           'Manchester', 'GB', 'OPC Open',  '2026-05-27', '2026-05-30', 5000,  NULL, 'upcoming'),
  ('Utrecht Open',          'Holland Casino',          'Utrecht',    'NL', 'OPC Open',  '2026-06-03', '2026-06-06', 0,     NULL, 'upcoming'),
  ('Cologne Cup',           'Poker Club Cologne',      'Cologne',    'DE', 'OPC Main',  '2026-06-10', '2026-06-13', 5000,  NULL, 'upcoming'),
  ('Bruges Invitational',   'Casino Brugge',           'Bruges',     'BE', 'OPC Open',  '2026-06-17', '2026-06-20', 0,     NULL, 'upcoming'),
  ('Bristol Championship',  'Grosvenor Casino',        'Bristol',    'GB', 'OPC Main',  '2026-06-24', '2026-06-27', 10000, NULL, 'upcoming');
```

## Implementation Order

1. Create Supabase project (if not already done)
2. Run migration SQL
3. Seed with mock data
4. Add Supabase JS client to `tournaments.html`
5. Write `tournaments.js` with fetch/render/filter/sort/paginate functions
6. Replace static `.tournaments-grid` with JS-rendered content
7. Wire up country filter dropdown
8. Wire up series filter dropdown
9. Wire up sort toggle (soonest first / latest first)
10. Wire up pagination click handlers
11. Test with real data
12. Remove hardcoded cards from HTML
