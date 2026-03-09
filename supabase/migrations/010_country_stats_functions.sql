-- Country-aware points calculation and stats functions

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

  IF v_brackets IS NULL THEN
    RETURN public.calculate_points(placement);
  END IF;

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
