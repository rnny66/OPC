BEGIN;
SELECT plan(5);

SELECT has_table('public', 'tournament_results', 'tournament_results table exists');
SELECT has_column('public', 'tournament_results', 'tournament_id', 'has tournament_id');
SELECT has_column('public', 'tournament_results', 'player_id', 'has player_id');
SELECT has_column('public', 'tournament_results', 'placement', 'has placement');
SELECT has_column('public', 'tournament_results', 'points_awarded', 'has points_awarded');

SELECT * FROM finish();
ROLLBACK;
