-- Create player_stats table (computed, populated by functions in Phase 3B)
CREATE TABLE public.player_stats (
  player_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  tournament_count integer NOT NULL DEFAULT 0,
  win_count integer NOT NULL DEFAULT 0,
  top3_count integer NOT NULL DEFAULT 0,
  avg_finish numeric,
  best_finish integer,
  current_rank integer,
  previous_rank integer,
  last_computed timestamptz
);

-- Index for leaderboard queries
CREATE INDEX idx_player_stats_rank ON public.player_stats (current_rank ASC NULLS LAST);
CREATE INDEX idx_player_stats_points ON public.player_stats (total_points DESC);

-- Enable RLS
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read stats
CREATE POLICY "Public read player stats" ON public.player_stats
  FOR SELECT USING (true);
