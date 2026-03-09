# Phase 4 — Rankings, Profiles & Stats ✅ COMPLETE

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** [Phase 3 — Organizer Tools](phase-3-organizer-tools.md)

## Goal

Build the public-facing leaderboard, rich player profiles with stats and achievements, and the ranking snapshot system.

## Tasks

### 1. Public leaderboard (`/rankings`) ✅
- Fetch from `player_stats` table, ordered by `total_points` DESC
- Table columns: rank, avatar, name, nationality, points, tournaments, rank change indicator
- Search by player name (server-side with `.ilike()`)
- Filter by country
- Pagination (20 rows per page)
- Top player highlighted (matching existing `ranking.html` design)
- Rank change arrows (up/down/same) using `current_rank` vs `previous_rank`

### 2. Public player profile (`/players/[slug]`) ✅
- Slug-based URLs (auto-generated from display_name)
- Player header: avatar, display name, nationality, member since, global rank
- Stats grid: total points, tournaments played, wins, top-3 finishes, avg finish, best finish
- Achievement badges section (all 8, earned highlighted, unearned greyed)
- Tournament history table: tournament name, date, country, placement, points awarded

### 3. Achievement badge system ✅
- 8 achievements total (6 existing + 2 new):
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
- Unearned badges shown greyed out

### 4. Ranking snapshots — DEFERRED
- Deferred to a future phase (requires cron/Edge Function infrastructure)

### 5. Wire static site leaderboard — DEFERRED
- Deferred to a future phase

## Components to build
- `LeaderboardTable` — sortable, searchable ranking table
- `RankBadge` — rank number with change indicator (arrow up/down)
- `PlayerProfileHeader` — avatar, name, flags, bio, social links
- `StatsGrid` — 6-card grid of key stats
- `AchievementBadge` — individual badge with icon and tooltip
- `AchievementGrid` — grid of all badges (earned + unearned)
- `TournamentHistoryTable` — paginated history of results

## Verification

- [x] Leaderboard loads from `player_stats`, search and filter work
- [x] Rank change indicators show correct up/down/same
- [x] Player profile shows all stats, achievements, and tournament history
- [x] Achievement badges display correctly (earned vs unearned)
- [ ] ~~Ranking snapshots~~ — deferred
- [x] Pagination works on both leaderboard and tournament history
- [ ] ~~Static site leaderboard~~ — deferred
- [x] 128 unit tests passing (28 files)
- [x] Build succeeds with `/rankings` and `/players/[slug]` routes
