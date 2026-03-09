-- Points calculation and stats computation functions for Phase 3B

-- Calculate base points from placement
CREATE OR REPLACE FUNCTION public.calculate_points(placement integer)
RETURNS integer
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN placement = 1 THEN 1000
    WHEN placement = 2 THEN 750
    WHEN placement = 3 THEN 500
    WHEN placement = 4 THEN 400
    WHEN placement = 5 THEN 350
    WHEN placement BETWEEN 6 AND 10 THEN 300
    WHEN placement BETWEEN 11 AND 20 THEN 200
    WHEN placement BETWEEN 21 AND 50 THEN 100
    WHEN placement > 50 THEN 50
    ELSE 0
  END;
$$;

-- Calculate points with tournament multiplier
CREATE OR REPLACE FUNCTION public.calculate_points_with_multiplier(
  placement integer,
  multiplier numeric
)
RETURNS integer
LANGUAGE sql IMMUTABLE
AS $$
  SELECT (public.calculate_points(placement) * multiplier)::integer;
$$;

-- Compute stats for a single player from their tournament results
CREATE OR REPLACE FUNCTION public.compute_player_stats(p_player_id uuid)
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
    COALESCE(SUM(points_awarded), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE placement = 1),
    COUNT(*) FILTER (WHERE placement <= 3),
    AVG(placement),
    MIN(placement)
  INTO
    v_total_points,
    v_tournament_count,
    v_win_count,
    v_top3_count,
    v_avg_finish,
    v_best_finish
  FROM public.tournament_results
  WHERE player_id = p_player_id;

  INSERT INTO public.player_stats (
    player_id, total_points, tournament_count, win_count,
    top3_count, avg_finish, best_finish, last_computed
  )
  VALUES (
    p_player_id, v_total_points, v_tournament_count, v_win_count,
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

-- Recompute stats for all players and update rankings
CREATE OR REPLACE FUNCTION public.compute_all_player_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recompute stats for every player with results
  PERFORM public.compute_player_stats(player_id)
  FROM (SELECT DISTINCT player_id FROM public.tournament_results) AS players;

  -- Preserve previous rank before updating
  UPDATE public.player_stats
  SET previous_rank = current_rank;

  -- Assign new ranks based on total points
  UPDATE public.player_stats ps
  SET current_rank = ranked.new_rank
  FROM (
    SELECT player_id, RANK() OVER (ORDER BY total_points DESC)::integer AS new_rank
    FROM public.player_stats
  ) ranked
  WHERE ps.player_id = ranked.player_id;
END;
$$;

-- Check and award achievements for a player
CREATE OR REPLACE FUNCTION public.check_achievements(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats public.player_stats%ROWTYPE;
  v_achievement RECORD;
BEGIN
  SELECT * INTO v_stats FROM public.player_stats WHERE player_id = p_player_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR v_achievement IN SELECT id, criteria_type, criteria_threshold FROM public.achievements LOOP
    IF (v_achievement.criteria_type = 'tournament_count' AND v_stats.tournament_count >= v_achievement.criteria_threshold)
    OR (v_achievement.criteria_type = 'win_count' AND v_stats.win_count >= v_achievement.criteria_threshold)
    OR (v_achievement.criteria_type = 'top3_count' AND v_stats.top3_count >= v_achievement.criteria_threshold)
    THEN
      INSERT INTO public.player_achievements (player_id, achievement_id)
      VALUES (p_player_id, v_achievement.id)
      ON CONFLICT (player_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Trigger function: auto-compute stats and check achievements on result changes
CREATE OR REPLACE FUNCTION public.on_result_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.compute_player_stats(OLD.player_id);
    RETURN OLD;
  ELSE
    PERFORM public.compute_player_stats(NEW.player_id);
    PERFORM public.check_achievements(NEW.player_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trg_result_change
AFTER INSERT OR UPDATE OR DELETE ON public.tournament_results
FOR EACH ROW EXECUTE FUNCTION public.on_result_change();
