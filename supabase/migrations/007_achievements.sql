-- Achievements definition table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  criteria_type text NOT NULL,
  criteria_threshold integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Player achievements (awarded badges)
CREATE TABLE public.player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_player ON public.player_achievements (player_id);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

-- Public read on both
CREATE POLICY "Public read achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Public read player achievements" ON public.player_achievements
  FOR SELECT USING (true);

-- Seed achievement definitions
INSERT INTO public.achievements (name, description, icon, criteria_type, criteria_threshold) VALUES
  ('First Blood',    'Played in your first tournament',      '🎯', 'tournament_count', 1),
  ('Regular',        'Played in 5 tournaments',              '🃏', 'tournament_count', 5),
  ('Veteran',        'Played in 20 tournaments',             '🏅', 'tournament_count', 20),
  ('Champion',       'Won a tournament',                     '🏆', 'win_count',        1),
  ('Triple Crown',   'Won 3 tournaments',                    '👑', 'win_count',        3),
  ('Podium Master',  'Finished top 3 in 10 tournaments',     '🥇', 'top3_count',       10);
