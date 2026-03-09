BEGIN;
SELECT plan(5);

SELECT has_table('public', 'achievements', 'achievements table exists');
SELECT has_table('public', 'player_achievements', 'player_achievements table exists');
SELECT has_column('public', 'achievements', 'criteria_type', 'has criteria_type');
SELECT has_column('public', 'player_achievements', 'player_id', 'has player_id');

-- Verify seed data
SELECT results_eq(
  'SELECT count(*)::integer FROM public.achievements',
  ARRAY[6],
  '6 achievements seeded'
);

SELECT * FROM finish();
ROLLBACK;
