# Phase 4 — Rankings, Profiles & Stats

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** [Phase 3 — Organizer Tools](phase-3-organizer-tools.md)

## Goal

Build the public-facing leaderboard, rich player profiles with stats and achievements, and the ranking snapshot system.

## Tasks

### 1. Public leaderboard (`/rankings`)
- Fetch from `player_stats` table, ordered by `total_points` DESC
- Table columns: rank, avatar, name, nationality, points, tournaments, rank change indicator
- Search by player name (server-side with `.ilike()`)
- Filter by country
- Pagination (20 rows per page)
- Top player highlighted (matching existing `ranking.html` design)
- Rank change arrows (up/down/same) using `current_rank` vs `previous_rank`

### 2. Public player profile (`/players/[id]`)
- Player header: avatar, display name, nationality flags, bio, social links
- Stats grid: total points, tournaments played, wins, top-3 finishes, avg finish, best finish
- Achievement badges section
- Tournament history table: tournament name, date, placement, points awarded
- Rank chart (if ranking snapshots available)

### 3. Achievement badge system
- Seed `achievements` table with initial badges:
  - First Blood — 1 tournament
  - Regular — 5 tournaments
  - Veteran — 20 tournaments
  - Champion — 1 win
  - Triple Crown — 3 wins
  - Podium Master — 10 top-3 finishes
  - Point Machine — 10,000 total points
  - Globetrotter — played in 3+ countries
- Display earned badges on player profile
- Badge component with icon, name, and earned date
- Unearned badges shown greyed out (optional)

### 4. Ranking snapshots
- Create migration: `ranking_snapshots` table (player_id, rank, points, snapshot_date)
- Postgres function or Edge Function: `take_ranking_snapshot()`
- Run daily (or after results entry) to capture current rankings
- Update `player_stats.previous_rank` from most recent snapshot before recomputing
- Use snapshots to show rank history on player profiles

### 5. Wire static site leaderboard (optional)
- Add Supabase JS client to `site/ranking.html`
- Replace hardcoded table rows with live data from `player_stats`
- Keep the same HTML structure and CSS classes
- This follows the existing plan in `future-features/supabase-ranking-integration.md`

## Components to build
- `LeaderboardTable` — sortable, searchable ranking table
- `RankBadge` — rank number with change indicator (arrow up/down)
- `PlayerProfileHeader` — avatar, name, flags, bio, social links
- `StatsGrid` — 6-card grid of key stats
- `AchievementBadge` — individual badge with icon and tooltip
- `AchievementGrid` — grid of all badges (earned + unearned)
- `TournamentHistoryTable` — paginated history of results

## Verification

- [ ] Leaderboard loads from `player_stats`, search and filter work
- [ ] Rank change indicators show correct up/down/same
- [ ] Player profile shows all stats, achievements, and tournament history
- [ ] Achievement badges display correctly (earned vs unearned)
- [ ] Ranking snapshots are created and `previous_rank` updates correctly
- [ ] Pagination works on both leaderboard and tournament history
- [ ] Static site leaderboard shows live data (if wired up)
