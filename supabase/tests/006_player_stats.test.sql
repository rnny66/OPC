BEGIN;
SELECT plan(5);

SELECT has_table('public', 'player_stats', 'player_stats table exists');
SELECT has_column('public', 'player_stats', 'total_points', 'has total_points');
SELECT has_column('public', 'player_stats', 'tournament_count', 'has tournament_count');
SELECT has_column('public', 'player_stats', 'current_rank', 'has current_rank');
SELECT has_column('public', 'player_stats', 'best_finish', 'has best_finish');

SELECT * FROM finish();
ROLLBACK;
