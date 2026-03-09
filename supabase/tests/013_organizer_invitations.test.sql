BEGIN;
SELECT plan(5);

SELECT has_table('public', 'organizer_invitations', 'organizer_invitations table exists');

SELECT has_column('public', 'organizer_invitations', 'id', 'has id column');
SELECT has_column('public', 'organizer_invitations', 'email', 'has email column');
SELECT has_column('public', 'organizer_invitations', 'invited_by', 'has invited_by column');

SELECT row_eq(
  $$SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizer_invitations'$$,
  ROW(true),
  'RLS is enabled on organizer_invitations'
);

SELECT * FROM finish();
ROLLBACK;
