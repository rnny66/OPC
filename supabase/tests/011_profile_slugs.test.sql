BEGIN;
SELECT plan(4);

-- Test 1: slug column exists
SELECT has_column('public', 'profiles', 'slug', 'profiles has slug column');

-- Test 2: slug index exists
SELECT has_index('public', 'profiles', 'idx_profiles_slug', 'profiles has slug index');

-- Test 3: generate_profile_slug function exists
SELECT has_function('public', 'generate_profile_slug', 'generate_profile_slug function exists');

-- Test 4: handle_profile_slug trigger function exists
SELECT has_function('public', 'handle_profile_slug', 'handle_profile_slug trigger function exists');

SELECT * FROM finish();
ROLLBACK;
