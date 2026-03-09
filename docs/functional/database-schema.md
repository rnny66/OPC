# OPC Platform — Database Schema

## Overview

The platform uses **Supabase** (hosted PostgreSQL) with Row-Level Security (RLS) on all tables. Auth is handled by Supabase Auth (`auth.users`), which the `profiles` table extends.

## Tables

### `profiles`

Extends `auth.users` — auto-created via a trigger when a user signs up.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | — | References `auth.users(id)`, cascade delete |
| `email` | text | — | Copied from auth on signup |
| `display_name` | text | null | Public display name |
| `first_name` | text | null | First name |
| `last_name` | text | null | Last name |
| `avatar_url` | text | null | Profile picture URL |
| `bio` | text | null | Short bio (max 500 chars) |
| `city` | text | null | Home city |
| `home_country` | text | null | Country of residence |
| `nationality` | text[] | `{}` | Array of nationalities |
| `social_links` | jsonb | `{}` | Social media links |
| `role` | text | `'player'` | One of: `player`, `organizer`, `admin` |
| `identity_verified` | boolean | `false` | Age verification completed |
| `identity_verified_at` | timestamptz | null | When verification was completed |
| `didit_session_id` | text | null | Didit verification session reference |
| `date_of_birth` | date | null | From verification |
| `onboarding_complete` | boolean | `false` | Profile setup finished |
| `slug` | text | — | URL-safe slug (auto-generated from display_name) |
| `created_at` | timestamptz | `now()` | Account creation time |
| `updated_at` | timestamptz | `now()` | Auto-updated via trigger |

**Indexes:** `role`, `home_country`, `slug` (unique)

**RLS Policies:**
- **Select:** Public — anyone can read profiles
- **Update:** Users can update their own profile, but cannot change `role` or `identity_verified`

**Triggers:**
- `profiles_updated_at` — auto-updates `updated_at` on change
- `on_auth_user_created` — auto-creates profile row when user signs up
- `profiles_slug` — auto-generates/updates slug from display_name on insert/update

**Functions:**
- `generate_profile_slug(display_name, id)` — creates URL-safe slug with collision handling (-2, -3, etc.)

---

### `tournaments`

Stores all tournament events. Created by organizers or admins.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Unique tournament ID |
| `name` | text | — | Tournament name (required) |
| `club_name` | text | — | Hosting venue/club (required) |
| `city` | text | — | City (required) |
| `country` | text | — | Country code, e.g. `NL`, `DE` (required) |
| `series` | text | `'OPC Open'` | Tournament series (e.g. `OPC Main`, `OPC Open`) |
| `start_date` | date | — | Start date (required) |
| `end_date` | date | — | End date (required) |
| `entry_fee` | integer | `0` | Entry fee in cents |
| `image_url` | text | null | Tournament banner image |
| `status` | text | `'upcoming'` | One of: `upcoming`, `ongoing`, `completed`, `cancelled` |
| `organizer_id` | uuid (FK) | null | References `profiles(id)` |
| `description` | text | null | Full description |
| `capacity` | integer | null | Max registrations (null = unlimited) |
| `registration_open` | boolean | `true` | Whether registration is accepted |
| `registration_deadline` | timestamptz | null | Registration cutoff time |
| `venue_address` | text | null | Full address |
| `contact_email` | text | null | Organizer contact |
| `points_multiplier` | numeric | `1.0` | Points multiplier for this tournament |
| `requires_verification` | boolean | `false` | Require age verification to register |
| `created_at` | timestamptz | `now()` | Creation time |
| `updated_at` | timestamptz | `now()` | Auto-updated via trigger |

**Indexes:** `start_date`, `country`, `series`, `status`, `organizer_id`

**RLS Policies:**
- **Select:** Public — anyone can read tournaments
- **Insert:** Organizers and admins only
- **Update:** Organizers can update their own tournaments; admins can update any
- **Delete:** Admins only

**Seed data:** 16 tournaments across NL, DE, BE, GB with varying series and entry fees.

---

### `tournament_registrations`

Links players to tournaments they've registered for.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Registration ID |
| `tournament_id` | uuid (FK) | — | References `tournaments(id)`, cascade delete |
| `player_id` | uuid (FK) | — | References `profiles(id)`, cascade delete |
| `status` | text | `'registered'` | One of: `registered`, `confirmed`, `cancelled`, `no_show` |
| `registered_at` | timestamptz | `now()` | When they registered |
| `cancelled_at` | timestamptz | null | When they cancelled (if applicable) |

**Constraints:** Unique on `(tournament_id, player_id)` — one registration per player per tournament.

**Indexes:** `tournament_id`, `player_id`, `status`

**RLS Policies:**
- **Select (players):** Can view their own registrations
- **Select (organizers):** Can view registrations for their tournaments
- **Select (admins):** Can view all registrations
- **Insert:** Authenticated users can register themselves (requires `onboarding_complete = true`)
- **Update (players):** Can update their own registration (e.g. cancel)
- **Update (organizers):** Can update status for registrations in their tournaments

## Storage Buckets

### `avatars`

Public storage bucket for user profile pictures.

| Property | Value |
|----------|-------|
| Bucket ID | `avatars` |
| Public | Yes (public read) |
| Path pattern | `{user_id}/avatar.{ext}` |

**RLS Policies:**
- **Insert:** Authenticated users can upload to their own `{user_id}/` folder
- **Update:** Users can update files in their own folder
- **Delete:** Users can delete files in their own folder
- **Select:** Public — anyone can read avatars

**Migration:** `004_avatar_storage.sql`

---

### `tournament_results`

Stores player placements and points for completed tournaments.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Result ID |
| `tournament_id` | uuid (FK) | — | References `tournaments(id)`, cascade delete |
| `player_id` | uuid (FK) | — | References `profiles(id)`, cascade delete |
| `placement` | integer | — | Final placement (1st, 2nd, etc.) |
| `points_earned` | numeric | `0` | Points earned (base x multiplier) |
| `prize_amount` | integer | `0` | Prize money in cents |
| `notes` | text | null | Optional notes |
| `created_at` | timestamptz | `now()` | When result was recorded |
| `updated_at` | timestamptz | `now()` | Auto-updated via trigger |

**Constraints:** Unique on `(tournament_id, player_id)` — one result per player per tournament. Unique on `(tournament_id, placement)` — one player per placement.

**Indexes:** `tournament_id`, `player_id`, `points_earned DESC`

**RLS Policies:**
- **Select:** Public — anyone can read results
- **Insert:** Organizers can insert results for their own tournaments; admins can insert any
- **Update:** Organizers can update results for their own tournaments; admins can update any
- **Delete:** Admins only

---

### `player_stats`

Computed/aggregated player statistics. Updated by Postgres functions (Phase 3B).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Stats ID |
| `player_id` | uuid (FK) | — | References `profiles(id)`, cascade delete, unique |
| `total_points` | numeric | `0` | Sum of all points earned |
| `tournaments_played` | integer | `0` | Number of tournaments with results |
| `tournaments_won` | integer | `0` | Number of 1st place finishes |
| `best_placement` | integer | null | Best ever placement |
| `average_placement` | numeric | null | Average placement across tournaments |
| `current_rank` | integer | null | Current leaderboard position |
| `updated_at` | timestamptz | `now()` | Last recompute time |

**RLS Policies:**
- **Select:** Public — anyone can read stats
- **Insert/Update/Delete:** Restricted to Postgres functions only (no direct user writes)

---

### `achievements`

Definitions for badges/achievements players can earn.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Achievement ID |
| `slug` | text | — | Unique identifier (e.g. `first_tournament`) |
| `name` | text | — | Display name |
| `description` | text | — | How to earn it |
| `icon` | text | null | Icon identifier |
| `category` | text | `'general'` | Category (general, milestone, special) |
| `criteria` | jsonb | `{}` | Machine-readable unlock criteria |
| `created_at` | timestamptz | `now()` | Creation time |

**Constraints:** Unique on `slug`.

**Seed data:** 8 achievements (First Blood, Regular, Veteran, Champion, Triple Crown, Podium Master, Point Machine, Globetrotter)

**RLS Policies:**
- **Select:** Public — anyone can read achievement definitions

---

### `player_achievements`

Links players to earned achievements.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Record ID |
| `player_id` | uuid (FK) | — | References `profiles(id)`, cascade delete |
| `achievement_id` | uuid (FK) | — | References `achievements(id)`, cascade delete |
| `earned_at` | timestamptz | `now()` | When the achievement was earned |

**Constraints:** Unique on `(player_id, achievement_id)` — one award per achievement per player.

**RLS Policies:**
- **Select:** Public — anyone can see earned achievements

---

### `country_config`

Configuration for country-specific points and ranking weights. Seeded with 15 European countries.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `country_code` | text (PK) | — | ISO country code |
| `country_name` | text | — | Display name |
| `global_multiplier` | numeric | `1.0` | Weight for global ranking |
| `custom_brackets` | jsonb | null | Per-country bracket overrides |
| `created_at` | timestamptz | `now()` | Creation time |
| `updated_at` | timestamptz | `now()` | Auto-updated via trigger |

**Seed data:** 15 European countries (NL, DE, BE, GB, FR, ES, IT, PT, AT, CH, SE, DK, NO, FI, PL).

**RLS Policies:**
- **Select:** Public — anyone can read country config
- **Insert/Update/Delete:** Admins only

**Triggers:**
- Auto-insert trigger for new tournament countries (adds new country_config row when a tournament uses an unknown country code)

---

### `default_points_brackets`

Defines base points awarded per placement range. Editable by admins.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Bracket ID |
| `placement_min` | integer | — | Start of placement range |
| `placement_max` | integer | null | End of range (null = unbounded) |
| `base_points` | integer | — | Points awarded for this range |

**Seed data:** 9 bracket ranges (1st: 1000, 2nd: 750, 3rd: 500, etc.)

**RLS Policies:**
- **Select:** Public — anyone can read brackets
- **Insert/Update/Delete:** Admins only

---

### `player_country_stats`

Per-player per-country ranking statistics. Updated by Postgres functions.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `player_id` | uuid (FK) | — | References `profiles(id)` |
| `country_code` | text (FK) | — | References `country_config(country_code)` |
| `total_points` | integer | `0` | Sum of points in this country |
| `tournament_count` | integer | `0` | Tournaments played in this country |
| `win_count` | integer | `0` | 1st place finishes in this country |
| `top3_count` | integer | `0` | Top 3 finishes in this country |
| `avg_finish` | numeric | null | Average placement in this country |
| `best_finish` | integer | null | Best placement in this country |
| `current_rank` | integer | null | Current rank in this country |
| `previous_rank` | integer | null | Previous rank in this country |
| `last_computed` | timestamptz | null | Last recompute time |

**Primary Key:** `(player_id, country_code)`

**RLS Policies:**
- **Select:** Public — anyone can read country stats

---

## Future Tables (Phase 5)

| Table | Phase | Purpose |
|-------|-------|---------|
| `admin_invitations` | 5 | Organizer invitation tracking |

## Postgres Functions

| Function | Description |
|----------|-------------|
| `calculate_points(placement, multiplier, country)` | Calculate points for a placement using brackets + multiplier |
| `compute_player_stats(player_uuid)` | Recompute aggregated stats for a single player |
| `compute_all_player_stats()` | Recompute stats for all players |
| `check_achievements(player_uuid)` | Check and award achievements for a player (handles all 8 criteria types) |
| `generate_profile_slug(display_name, id)` | Generate URL-safe slug with collision handling |

**Triggers:**
- On `tournament_results` insert/update: auto-calls `compute_player_stats` and `check_achievements` for the affected player

## Entity Relationship

```
auth.users ──(trigger)──> profiles
                            │
                            ├── tournaments (organizer_id)
                            │     │
                            │     ├── tournament_registrations (tournament_id)
                            │     │     │
                            │     └── tournament_results (tournament_id)
                            │           │
                            ├───────────┘ (player_id)
                            │
                            ├── player_stats (player_id)
                            │
                            ├── player_country_stats (player_id)
                            │     │
                            │     └── country_config (country_code)
                            │
                            └── player_achievements (player_id)
                                  │
                                  └── achievements (achievement_id)

country_config ←── default_points_brackets (standalone config)
```
