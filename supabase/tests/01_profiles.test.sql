BEGIN;

SELECT plan(5);

-- Test 1: profiles table exists
SELECT has_table('public', 'profiles', 'profiles table should exist');

-- Test 2: profiles has expected columns
SELECT has_column('public', 'profiles', 'id', 'profiles should have id column');
SELECT has_column('public', 'profiles', 'role', 'profiles should have role column');
SELECT has_column('public', 'profiles', 'identity_verified', 'profiles should have identity_verified column');

-- Test 3: RLS is enabled
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles'),
  true,
  'profiles should have RLS enabled'
);

SELECT * FROM finish();

ROLLBACK;
