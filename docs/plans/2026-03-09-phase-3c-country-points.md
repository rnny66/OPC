# Phase 3C — Country Points & Admin UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add per-country rankings with configurable points brackets, country multipliers for global ranking weighting, and an admin UI to manage it all.

**Architecture:** New `country_config` and `player_country_stats` tables + `default_points_brackets` table. Modified Postgres functions to compute per-country stats and weighted global rankings. Admin layout with a single configuration page. Auto-insert countries from tournaments.

**Tech Stack:** Supabase (Postgres, RLS), Next.js 15 Server Components + Server Actions, existing SidebarLayout component.

---

### Task 1: Migration — country_config & default_points_brackets tables

**Files:**
- Create: `supabase/migrations/009_country_points.sql`
- Test: `supabase/tests/009_country_points.test.sql`

**Step 1: Write the migration**

```sql
-- Country configuration for points system
CREATE TABLE public.country_config (
  country_code text PRIMARY KEY,
  country_name text NOT NULL,
  global_multiplier numeric NOT NULL DEFAULT 1.0,
  custom_brackets jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.country_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read country_config" ON public.country_config FOR SELECT USING (true);
CREATE POLICY "Admin manage country_config" ON public.country_config FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Default points brackets (replaces hardcoded CASE)
CREATE TABLE public.default_points_brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_min integer NOT NULL,
  placement_max integer,
  base_points integer NOT NULL,
  UNIQUE (placement_min)
);

ALTER TABLE public.default_points_brackets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brackets" ON public.default_points_brackets FOR SELECT USING (true);
CREATE POLICY "Admin manage brackets" ON public.default_points_brackets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default brackets
INSERT INTO public.default_points_brackets (placement_min, placement_max, base_points) VALUES
  (1, 1, 1000),
  (2, 2, 750),
  (3, 3, 500),
  (4, 4, 400),
  (5, 5, 350),
  (6, 10, 300),
  (11, 20, 200),
  (21, 50, 100),
  (51, NULL, 50);

-- Seed European poker countries
INSERT INTO public.country_config (country_code, country_name) VALUES
  ('NL', 'Netherlands'),
  ('DE', 'Germany'),
  ('BE', 'Belgium'),
  ('GB', 'United Kingdom'),
  ('FR', 'France'),
  ('ES', 'Spain'),
  ('IT', 'Italy'),
  ('PT', 'Portugal'),
  ('AT', 'Austria'),
  ('CZ', 'Czech Republic'),
  ('PL', 'Poland'),
  ('CH', 'Switzerland'),
  ('IE', 'Ireland'),
  ('DK', 'Denmark'),
  ('SE', 'Sweden');

-- Auto-insert country_config when tournament created with unknown country
CREATE OR REPLACE FUNCTION public.on_tournament_country_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.country_config (country_code, country_name)
  VALUES (NEW.country, NEW.country)
  ON CONFLICT (country_code) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tournament_country_check
BEFORE INSERT ON public.tournaments
FOR EACH ROW EXECUTE FUNCTION public.on_tournament_country_check();
```

**Step 2: Write pgTAP test**

```sql
BEGIN;
SELECT plan(5);

SELECT has_table('public', 'country_config', 'country_config table exists');
SELECT has_table('public', 'default_points_brackets', 'default_points_brackets table exists');

SELECT results_eq(
  'SELECT count(*)::integer FROM public.country_config',
  ARRAY[15],
  '15 countries seeded'
);

SELECT results_eq(
  'SELECT count(*)::integer FROM public.default_points_brackets',
  ARRAY[9],
  '9 bracket ranges seeded'
);

SELECT results_eq(
  'SELECT base_points FROM public.default_points_brackets WHERE placement_min = 1',
  ARRAY[1000],
  '1st place bracket = 1000 points'
);

SELECT * FROM finish();
ROLLBACK;
```

**Step 3: Apply migration via MCP**

Run: `mcp__ocp-supabase__apply_migration` with name `009_country_points`

**Step 4: Commit**

```
feat: add country_config and default_points_brackets tables
```

---

### Task 2: Migration — player_country_stats table

**Files:**
- Modify: `supabase/migrations/009_country_points.sql` (append)

**Step 1: Add player_country_stats to migration**

```sql
-- Per-player per-country stats and rankings
CREATE TABLE public.player_country_stats (
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country_code text NOT NULL REFERENCES public.country_config(country_code) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  tournament_count integer NOT NULL DEFAULT 0,
  win_count integer NOT NULL DEFAULT 0,
  top3_count integer NOT NULL DEFAULT 0,
  avg_finish numeric,
  best_finish integer,
  current_rank integer,
  previous_rank integer,
  last_computed timestamptz,
  PRIMARY KEY (player_id, country_code)
);

CREATE INDEX idx_player_country_stats_country ON public.player_country_stats (country_code);

ALTER TABLE public.player_country_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read player_country_stats" ON public.player_country_stats FOR SELECT USING (true);
```

**Step 2: Apply via MCP, commit**

---

### Task 3: Migration — Update Postgres functions for country-aware stats

**Files:**
- Create: `supabase/migrations/010_country_stats_functions.sql`

**Step 1: Write updated functions**

```sql
-- Calculate points using brackets table (replaces hardcoded CASE)
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

-- Calculate points with optional country custom brackets
CREATE OR REPLACE FUNCTION public.calculate_points_for_country(
  placement integer,
  p_country_code text
)
RETURNS integer
LANGUAGE plpgsql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_brackets jsonb;
  v_bracket jsonb;
  v_min integer;
  v_max integer;
BEGIN
  SELECT custom_brackets INTO v_brackets
  FROM public.country_config
  WHERE country_code = p_country_code;

  -- If no custom brackets, use defaults
  IF v_brackets IS NULL THEN
    RETURN public.calculate_points(placement);
  END IF;

  -- Search custom brackets array: [{"min":1,"max":1,"points":1000}, ...]
  FOR v_bracket IN SELECT * FROM jsonb_array_elements(v_brackets) LOOP
    v_min := (v_bracket->>'min')::integer;
    v_max := (v_bracket->>'max')::integer;
    IF v_max IS NULL THEN
      IF placement >= v_min THEN
        RETURN (v_bracket->>'points')::integer;
      END IF;
    ELSIF placement >= v_min AND placement <= v_max THEN
      RETURN (v_bracket->>'points')::integer;
    END IF;
  END LOOP;

  RETURN 0;
END;
$$;

-- Compute per-country stats for a player
CREATE OR REPLACE FUNCTION public.compute_player_country_stats(
  p_player_id uuid,
  p_country_code text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_points integer;
  v_tournament_count integer;
  v_win_count integer;
  v_top3_count integer;
  v_avg_finish numeric;
  v_best_finish integer;
BEGIN
  SELECT
    COALESCE(SUM(tr.points_awarded), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE tr.placement = 1),
    COUNT(*) FILTER (WHERE tr.placement <= 3),
    AVG(tr.placement),
    MIN(tr.placement)
  INTO
    v_total_points, v_tournament_count, v_win_count,
    v_top3_count, v_avg_finish, v_best_finish
  FROM public.tournament_results tr
  JOIN public.tournaments t ON t.id = tr.tournament_id
  WHERE tr.player_id = p_player_id AND t.country = p_country_code;

  IF v_tournament_count = 0 THEN
    DELETE FROM public.player_country_stats
    WHERE player_id = p_player_id AND country_code = p_country_code;
    RETURN;
  END IF;

  INSERT INTO public.player_country_stats (
    player_id, country_code, total_points, tournament_count, win_count,
    top3_count, avg_finish, best_finish, last_computed
  )
  VALUES (
    p_player_id, p_country_code, v_total_points, v_tournament_count, v_win_count,
    v_top3_count, v_avg_finish, v_best_finish, now()
  )
  ON CONFLICT (player_id, country_code) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    tournament_count = EXCLUDED.tournament_count,
    win_count = EXCLUDED.win_count,
    top3_count = EXCLUDED.top3_count,
    avg_finish = EXCLUDED.avg_finish,
    best_finish = EXCLUDED.best_finish,
    last_computed = EXCLUDED.last_computed;
END;
$$;

-- Updated compute_player_stats: also computes country stats + weighted global total
CREATE OR REPLACE FUNCTION public.compute_player_stats(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country RECORD;
  v_weighted_total integer := 0;
  v_tournament_count integer;
  v_win_count integer;
  v_top3_count integer;
  v_avg_finish numeric;
  v_best_finish integer;
BEGIN
  -- Compute per-country stats for each country the player has results in
  FOR v_country IN
    SELECT DISTINCT t.country
    FROM public.tournament_results tr
    JOIN public.tournaments t ON t.id = tr.tournament_id
    WHERE tr.player_id = p_player_id
  LOOP
    PERFORM public.compute_player_country_stats(p_player_id, v_country.country);
  END LOOP;

  -- Compute weighted global total
  SELECT COALESCE(SUM(
    pcs.total_points * COALESCE(cc.global_multiplier, 1.0)
  )::integer, 0)
  INTO v_weighted_total
  FROM public.player_country_stats pcs
  LEFT JOIN public.country_config cc ON cc.country_code = pcs.country_code
  WHERE pcs.player_id = p_player_id;

  -- Compute global aggregates
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE placement = 1),
    COUNT(*) FILTER (WHERE placement <= 3),
    AVG(placement),
    MIN(placement)
  INTO v_tournament_count, v_win_count, v_top3_count, v_avg_finish, v_best_finish
  FROM public.tournament_results
  WHERE player_id = p_player_id;

  INSERT INTO public.player_stats (
    player_id, total_points, tournament_count, win_count,
    top3_count, avg_finish, best_finish, last_computed
  )
  VALUES (
    p_player_id, v_weighted_total, v_tournament_count, v_win_count,
    v_top3_count, v_avg_finish, v_best_finish, now()
  )
  ON CONFLICT (player_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    tournament_count = EXCLUDED.tournament_count,
    win_count = EXCLUDED.win_count,
    top3_count = EXCLUDED.top3_count,
    avg_finish = EXCLUDED.avg_finish,
    best_finish = EXCLUDED.best_finish,
    last_computed = EXCLUDED.last_computed;
END;
$$;

-- Updated compute_all_player_stats: ranks per-country + global
CREATE OR REPLACE FUNCTION public.compute_all_player_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recompute all players
  PERFORM public.compute_player_stats(player_id)
  FROM (SELECT DISTINCT player_id FROM public.tournament_results) AS players;

  -- Global rankings
  UPDATE public.player_stats SET previous_rank = current_rank;
  UPDATE public.player_stats ps
  SET current_rank = ranked.new_rank
  FROM (
    SELECT player_id, RANK() OVER (ORDER BY total_points DESC)::integer AS new_rank
    FROM public.player_stats
  ) ranked
  WHERE ps.player_id = ranked.player_id;

  -- Per-country rankings
  UPDATE public.player_country_stats SET previous_rank = current_rank;
  UPDATE public.player_country_stats pcs
  SET current_rank = ranked.new_rank
  FROM (
    SELECT player_id, country_code,
      RANK() OVER (PARTITION BY country_code ORDER BY total_points DESC)::integer AS new_rank
    FROM public.player_country_stats
  ) ranked
  WHERE pcs.player_id = ranked.player_id AND pcs.country_code = ranked.country_code;
END;
$$;
```

**Step 2: Apply via MCP, run pgTAP tests**

**Step 3: Commit**

```
feat: update Postgres functions for country-aware stats and weighted global ranking
```

---

### Task 4: Admin layout and points config page (server component)

**Files:**
- Create: `platform/app/(admin)/admin/layout.tsx` (admin route group — note: no `layout.tsx` at `(admin)/` level, only inside `admin/`)
- Create: `platform/app/(admin)/layout.tsx`
- Create: `platform/app/(admin)/admin/points-config/page.tsx`

**Step 1: Create admin layout** (follows organizer pattern exactly)

`platform/app/(admin)/layout.tsx`:
```typescript
import { SidebarLayout, type NavItem } from '@/components/layout/sidebar-layout'

const items: NavItem[] = [
  { href: '/admin/points-config', label: 'Points Config', icon: '🎯' },
  { href: '/organizer/dashboard', label: 'Organizer', icon: '⚙️' },
  { href: '/dashboard', label: 'Player View', icon: '🔙' },
]

const bottomItems: NavItem[] = [
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout items={items} bottomItems={bottomItems} title="OPC Admin">
      {children}
    </SidebarLayout>
  )
}
```

**Step 2: Create points config page** — server component that fetches brackets + countries, passes to client component

`platform/app/(admin)/admin/points-config/page.tsx`:
- `generateMetadata` → title "Points Config — OPC Europe"
- Auth check + admin role verification
- Fetch `default_points_brackets` ordered by `placement_min`
- Fetch `country_config` ordered by `country_name`
- Render `<PointsConfigEditor>` client component

**Step 3: Commit**

```
feat: add admin layout and points config page
```

---

### Task 5: PointsConfigEditor client component

**Files:**
- Create: `platform/components/admin/points-config-editor.tsx`
- Create: `platform/lib/actions/admin.ts`

**Step 1: Create server actions**

`platform/lib/actions/admin.ts`:
```typescript
'use server'

export async function updateDefaultBrackets(
  brackets: { placementMin: number; placementMax: number | null; basePoints: number }[]
)
// Auth + admin check, delete all existing, insert new rows

export async function updateCountryConfig(
  countryCode: string,
  globalMultiplier: number,
  customBrackets: { min: number; max: number | null; points: number }[] | null
)
// Auth + admin check, update country_config row

export async function recomputeAllStats()
// Auth + admin check, call compute_all_player_stats() via RPC
```

**Step 2: Create PointsConfigEditor component**

Two sections:
1. **Default Brackets** — editable table (placement_min, placement_max, base_points) + Save
2. **Countries** — table with inline multiplier editing + expandable custom brackets per country

Follow inline styles pattern from organizer pages.

**Step 3: Write tests**

`platform/components/admin/__tests__/points-config-editor.test.tsx`:
- Renders bracket table with seed data
- Renders country table
- Editing multiplier updates state
- Save button triggers server action

**Step 4: Commit**

```
feat: add points config editor with bracket and country management
```

---

### Task 6: Update TypeScript points utility for custom brackets

**Files:**
- Modify: `platform/lib/points.ts`
- Modify: `platform/lib/__tests__/points.test.ts`

**Step 1: Add bracket-aware calculation**

```typescript
export interface PointsBracket {
  min: number
  max: number | null
  points: number
}

export function calculateBasePoints(placement: number, brackets?: PointsBracket[]): number {
  if (!brackets) {
    // Hardcoded defaults (fallback when brackets not loaded)
    // ... keep existing logic
  }
  for (const b of brackets) {
    if (b.max === null) {
      if (placement >= b.min) return b.points
    } else if (placement >= b.min && placement <= b.max) {
      return b.points
    }
  }
  return 0
}
```

**Step 2: Update tests, run `npm run test:unit`**

**Step 3: Commit**

```
feat: support custom brackets in TypeScript points utility
```

---

### Task 7: Add admin link to player sidebar (for admin users)

**Files:**
- Modify: `platform/app/(player)/layout.tsx`

**Step 1: Add admin check and nav item**

After the organizer check, also check for admin role:
```typescript
const isAdmin = profile?.role === 'admin'

// In items array:
if (isAdmin) {
  items.push({ href: '/admin/points-config', label: 'Admin', icon: '🛡️' })
}
```

**Step 2: Commit**

```
feat: add admin nav link for admin users in player sidebar
```

---

### Task 8: Verification & final tests

**Step 1: Run all unit tests**

```bash
cd platform && npm run test:unit
```

**Step 2: Verify admin page loads**

- Set a test user to admin: `UPDATE profiles SET role = 'admin' WHERE email = '...'`
- Navigate to `/admin/points-config`
- Verify brackets table renders with 9 rows
- Verify country table renders with 15+ countries
- Edit a multiplier, save, reload — verify persistence
- Edit default brackets, save, reload — verify persistence

**Step 3: Verify country stats computation**

```sql
-- Insert a test result and check player_country_stats was populated
SELECT * FROM player_country_stats LIMIT 10;
SELECT * FROM player_stats LIMIT 10;
```

**Step 4: Commit**

```
feat: Phase 3C — country points system and admin UI complete
```

---

## Execution Order

| # | Task | Type | Dependencies |
|---|------|------|-------------|
| 1 | country_config + brackets tables | DB | — |
| 2 | player_country_stats table | DB | Task 1 |
| 3 | Updated Postgres functions | DB | Tasks 1-2 |
| 4 | Admin layout + page | Platform | — |
| 5 | PointsConfigEditor + server actions | Platform | Task 4 |
| 6 | Update TS points utility | Platform | — |
| 7 | Admin nav link | Platform | Task 4 |
| 8 | Verification | All | Tasks 1-7 |

Tasks 4-7 can run in parallel with DB tasks 1-3.

## Files Summary

**New (8):**
- `supabase/migrations/009_country_points.sql`
- `supabase/migrations/010_country_stats_functions.sql`
- `supabase/tests/009_country_points.test.sql`
- `platform/app/(admin)/layout.tsx`
- `platform/app/(admin)/admin/points-config/page.tsx`
- `platform/components/admin/points-config-editor.tsx`
- `platform/components/admin/__tests__/points-config-editor.test.tsx`
- `platform/lib/actions/admin.ts`

**Modified (3):**
- `platform/lib/points.ts`
- `platform/lib/__tests__/points.test.ts`
- `platform/app/(player)/layout.tsx`
