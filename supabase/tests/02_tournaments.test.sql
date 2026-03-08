BEGIN;

SELECT plan(5);

SELECT has_table('public', 'tournaments', 'tournaments table should exist');
SELECT has_column('public', 'tournaments', 'organizer_id', 'should have organizer_id');
SELECT has_column('public', 'tournaments', 'requires_verification', 'should have requires_verification');
SELECT has_column('public', 'tournaments', 'capacity', 'should have capacity');
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'tournaments'),
  true,
  'tournaments should have RLS enabled'
);

SELECT * FROM finish();

ROLLBACK;
