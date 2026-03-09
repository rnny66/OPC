-- Add 2 new achievements
INSERT INTO public.achievements (name, description, icon, criteria_type, criteria_threshold) VALUES
  ('Point Machine',  'Earned 10,000 total points',         '💰', 'total_points',      10000),
  ('Globetrotter',   'Played in 3 or more countries',      '🌍', 'countries_played',   3);

-- Update check_achievements to handle new criteria types
CREATE OR REPLACE FUNCTION public.check_achievements(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats public.player_stats%ROWTYPE;
  v_achievement RECORD;
  v_countries_played integer;
BEGIN
  SELECT * INTO v_stats FROM public.player_stats WHERE player_id = p_player_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Count distinct countries the player has played in
  SELECT COUNT(DISTINCT t.country) INTO v_countries_played
  FROM public.tournament_results tr
  JOIN public.tournaments t ON t.id = tr.tournament_id
  WHERE tr.player_id = p_player_id;

  FOR v_achievement IN SELECT id, criteria_type, criteria_threshold FROM public.achievements LOOP
    IF (v_achievement.criteria_type = 'tournament_count' AND v_stats.tournament_count >= v_achievement.criteria_threshold)
    OR (v_achievement.criteria_type = 'win_count' AND v_stats.win_count >= v_achievement.criteria_threshold)
    OR (v_achievement.criteria_type = 'top3_count' AND v_stats.top3_count >= v_achievement.criteria_threshold)
    OR (v_achievement.criteria_type = 'total_points' AND v_stats.total_points >= v_achievement.criteria_threshold)
    OR (v_achievement.criteria_type = 'countries_played' AND v_countries_played >= v_achievement.criteria_threshold)
    THEN
      INSERT INTO public.player_achievements (player_id, achievement_id)
      VALUES (p_player_id, v_achievement.id)
      ON CONFLICT (player_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;
