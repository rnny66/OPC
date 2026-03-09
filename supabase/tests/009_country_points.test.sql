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
