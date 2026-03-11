-- Migration 016: Master Ranking System
-- Standalone player pool + points audit log for the European OPC Master Ranking.
-- Independent of auth/profiles — players are managed via a password-protected RPC.

-- Config table (no public access — only SECURITY DEFINER functions can read)
CREATE TABLE master_config (
  key text PRIMARY KEY,
  value text NOT NULL
);
ALTER TABLE master_config ENABLE ROW LEVEL SECURITY;
-- No SELECT policy = no public reads.
INSERT INTO master_config (key, value) VALUES ('upload_password', 'changeme');

-- Master player pool
CREATE TABLE master_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_normalized text NOT NULL,
  nationality text NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  rank integer,
  linked_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_master_players_normalized ON master_players(name_normalized);
CREATE INDEX idx_master_players_rank ON master_players(rank);
CREATE INDEX idx_master_players_nationality ON master_players(nationality);

-- Points audit log
CREATE TABLE points_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES master_players(id) ON DELETE CASCADE,
  points integer NOT NULL,
  event_label text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by text
);

CREATE INDEX idx_points_entries_player ON points_entries(player_id);

-- RLS: public read, no direct writes
ALTER TABLE master_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read master_players" ON master_players FOR SELECT USING (true);

ALTER TABLE points_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read points_entries" ON points_entries FOR SELECT USING (true);

-- Password-protected RPC for submitting results
CREATE OR REPLACE FUNCTION submit_results(
  p_password text,
  p_event_label text,
  p_uploaded_by text,
  p_results jsonb  -- [{player_id, name, nationality, points}]
) RETURNS jsonb AS $$
DECLARE
  v_config_password text;
  v_entry jsonb;
  v_player_id uuid;
  v_created integer := 0;
  v_updated integer := 0;
BEGIN
  -- Validate password
  SELECT value INTO v_config_password FROM master_config WHERE key = 'upload_password';
  IF p_password IS DISTINCT FROM v_config_password THEN
    RETURN jsonb_build_object('error', 'Invalid password');
  END IF;

  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_results)
  LOOP
    v_player_id := (v_entry->>'player_id')::uuid;

    IF v_player_id IS NULL THEN
      -- Create new player
      INSERT INTO master_players (name, name_normalized, nationality)
      VALUES (
        v_entry->>'name',
        lower(trim(regexp_replace(v_entry->>'name', '\s+', ' ', 'g'))),
        v_entry->>'nationality'
      )
      RETURNING id INTO v_player_id;
      v_created := v_created + 1;
    ELSE
      v_updated := v_updated + 1;
    END IF;

    -- Insert points entry
    INSERT INTO points_entries (player_id, points, event_label, uploaded_by)
    VALUES (v_player_id, (v_entry->>'points')::int, p_event_label, p_uploaded_by);
  END LOOP;

  -- Recompute totals for all players
  UPDATE master_players mp SET
    total_points = COALESCE(sub.total, 0)
  FROM (
    SELECT player_id, SUM(points) as total
    FROM points_entries GROUP BY player_id
  ) sub
  WHERE mp.id = sub.player_id;

  -- Recompute all ranks
  WITH ranked AS (
    SELECT id, DENSE_RANK() OVER (ORDER BY total_points DESC) as new_rank
    FROM master_players
  )
  UPDATE master_players mp SET rank = r.new_rank
  FROM ranked r WHERE mp.id = r.id;

  RETURN jsonb_build_object(
    'success', true,
    'created', v_created,
    'updated', v_updated
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
