BEGIN;

SELECT plan(4);

SELECT has_table('public', 'tournament_registrations', 'tournament_registrations table should exist');
SELECT has_column('public', 'tournament_registrations', 'tournament_id', 'should have tournament_id');
SELECT has_column('public', 'tournament_registrations', 'player_id', 'should have player_id');
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'tournament_registrations'),
  true,
  'tournament_registrations should have RLS enabled'
);

SELECT * FROM finish();

ROLLBACK;
