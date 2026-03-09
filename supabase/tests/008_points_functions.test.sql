BEGIN;
SELECT plan(20);

-- ============================================================
-- Test calculate_points: all bracket boundaries
-- ============================================================
SELECT is(
  public.calculate_points(1), 1000,
  '1st place = 1000 points'
);
SELECT is(
  public.calculate_points(2), 750,
  '2nd place = 750 points'
);
SELECT is(
  public.calculate_points(3), 500,
  '3rd place = 500 points'
);
SELECT is(
  public.calculate_points(4), 400,
  '4th place = 400 points'
);
SELECT is(
  public.calculate_points(5), 350,
  '5th place = 350 points'
);
SELECT is(
  public.calculate_points(6), 300,
  '6th place = 300 points'
);
SELECT is(
  public.calculate_points(10), 300,
  '10th place = 300 points'
);
SELECT is(
  public.calculate_points(11), 200,
  '11th place = 200 points'
);
SELECT is(
  public.calculate_points(20), 200,
  '20th place = 200 points'
);
SELECT is(
  public.calculate_points(21), 100,
  '21st place = 100 points'
);
SELECT is(
  public.calculate_points(50), 100,
  '50th place = 100 points'
);
SELECT is(
  public.calculate_points(51), 50,
  '51st place = 50 points'
);

-- ============================================================
-- Test calculate_points_with_multiplier
-- ============================================================
SELECT is(
  public.calculate_points_with_multiplier(1, 1.5),
  1500,
  '1st place with 1.5x multiplier = 1500'
);
SELECT is(
  public.calculate_points_with_multiplier(2, 2.0),
  1500,
  '2nd place with 2.0x multiplier = 1500'
);

-- ============================================================
-- Test compute_player_stats via trigger (INSERT into tournament_results)
-- ============================================================

-- Create test users in auth.users and profiles
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'player1@test.com'),
  ('aaaaaaaa-0000-0000-0000-000000000002'::uuid, 'player2@test.com'),
  ('aaaaaaaa-0000-0000-0000-000000000003'::uuid, 'organizer1@test.com');

-- Profiles are auto-created by trigger; update organizer role
UPDATE public.profiles SET role = 'organizer' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000003'::uuid;

-- Create a test tournament
INSERT INTO public.tournaments (id, name, club_name, city, country, start_date, end_date, entry_fee, organizer_id, points_multiplier)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001'::uuid,
  'Test Tournament', 'Test Club', 'Amsterdam', 'NL',
  '2026-01-01', '2026-01-02', 100,
  'aaaaaaaa-0000-0000-0000-000000000003'::uuid,
  1.0
);

-- Insert results — trigger should auto-compute stats
INSERT INTO public.tournament_results (tournament_id, player_id, placement, points_awarded)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 1, 1000),
  ('bbbbbbbb-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-0000-0000-0000-000000000002'::uuid, 3, 500);

-- Verify player 1 stats were auto-computed by trigger
SELECT results_eq(
  $$SELECT total_points, tournament_count, win_count, top3_count, best_finish
    FROM public.player_stats
    WHERE player_id = 'aaaaaaaa-0000-0000-0000-000000000001'::uuid$$,
  $$VALUES (1000, 1, 1, 1, 1)$$,
  'player1 stats computed correctly by trigger (1st place, 1000 pts)'
);

-- Verify player 2 stats
SELECT results_eq(
  $$SELECT total_points, tournament_count, win_count, top3_count, best_finish
    FROM public.player_stats
    WHERE player_id = 'aaaaaaaa-0000-0000-0000-000000000002'::uuid$$,
  $$VALUES (500, 1, 0, 1, 3)$$,
  'player2 stats computed correctly by trigger (3rd place, 500 pts)'
);

-- ============================================================
-- Test check_achievements via trigger
-- ============================================================

-- Player 1 won, so should have "First Blood" (tournament_count >= 1) and "Champion" (win_count >= 1)
SELECT results_eq(
  $$SELECT count(*)::integer FROM public.player_achievements
    WHERE player_id = 'aaaaaaaa-0000-0000-0000-000000000001'::uuid$$,
  ARRAY[2],
  'player1 earned 2 achievements (First Blood + Champion)'
);

-- Player 2 placed 3rd, should have "First Blood" only
SELECT results_eq(
  $$SELECT count(*)::integer FROM public.player_achievements
    WHERE player_id = 'aaaaaaaa-0000-0000-0000-000000000002'::uuid$$,
  ARRAY[1],
  'player2 earned 1 achievement (First Blood)'
);

-- ============================================================
-- Test compute_all_player_stats (rankings)
-- ============================================================
SELECT public.compute_all_player_stats();

SELECT results_eq(
  $$SELECT current_rank FROM public.player_stats
    WHERE player_id = 'aaaaaaaa-0000-0000-0000-000000000001'::uuid$$,
  ARRAY[1],
  'player1 ranked 1st (1000 points)'
);

SELECT results_eq(
  $$SELECT current_rank FROM public.player_stats
    WHERE player_id = 'aaaaaaaa-0000-0000-0000-000000000002'::uuid$$,
  ARRAY[2],
  'player2 ranked 2nd (500 points)'
);

SELECT * FROM finish();
ROLLBACK;
