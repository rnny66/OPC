-- Country-specific points configuration and player country stats

-- country_config table
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

-- default_points_brackets table
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

-- player_country_stats table
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

-- Seed default points brackets
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

-- Seed country configs
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

-- Auto-insert trigger for new tournament countries
CREATE OR REPLACE FUNCTION public.on_tournament_country_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.country IS NOT NULL THEN
    INSERT INTO public.country_config (country_code, country_name)
    VALUES (NEW.country, NEW.country)
    ON CONFLICT (country_code) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tournament_country_check
BEFORE INSERT ON public.tournaments
FOR EACH ROW EXECUTE FUNCTION public.on_tournament_country_check();
