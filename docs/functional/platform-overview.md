# OPC Platform — Functional Overview

## What is OPC?

The **European Open Poker Championship (OPC)** platform is a tournament management system for European poker events. It connects **players**, **tournament organizers**, and **administrators** through a web application.

## User Roles

### Player
- Sign up with email/password or social login (Google, Facebook)
- Complete profile (display name, city, country, bio, avatar)
- Browse and filter upcoming tournaments
- Register for tournaments (with optional age verification requirement)
- View personal dashboard with upcoming and past registrations
- Cancel registrations for upcoming tournaments
- View public leaderboard and player rankings

### Organizer (invite-only)
- Invited by administrators — cannot self-register as organizer
- Create and manage tournaments (dates, venue, capacity, entry fee, rules)
- Toggle `requires_verification` per tournament (age 18+ check)
- View registered players for their tournaments
- Enter tournament results and placements
- Points are automatically calculated based on placement and tournament multiplier

### Administrator
- Invite users to become organizers
- Oversee all tournaments and registrations
- Manage user accounts and roles
- Configure points brackets and country multipliers
- Recompute all player stats
- Access admin dashboard with platform-wide statistics

## Core Features

### Authentication
- **Email/password** signup with email confirmation
- **Google OAuth** login
- **Facebook OAuth** login
- Session management with automatic refresh
- Protected routes (dashboard, profile, registration) require login
- Role-gated routes (organizer panel, admin panel) require specific roles

### Tournament Management
- Tournament listing with filters (country, series) and sorting
- Tournament detail pages with full venue/schedule information
- Registration with capacity limits and deadlines
- Per-tournament verification toggle (`requires_verification`)
- Tournament statuses: upcoming, ongoing, completed, cancelled

### Registration Flow
1. Player browses tournaments at `/tournaments`
2. Player clicks into tournament detail page
3. Player clicks "Register" button
4. System checks: authenticated, onboarded, verified (if required), capacity not full
5. Registration created with status `registered`
6. Player sees registration in their dashboard
7. Player can cancel registration before the tournament starts

### Age Verification (Phase 5)
- Third-party verification via **Didit** Web SDK
- Once verified, the player is trusted for all future tournaments
- Organizers can require verification per tournament via `requires_verification` flag
- Verification status stored on player profile (`identity_verified`, `identity_verified_at`)

### Points & Rankings
- Points awarded based on configurable placement brackets (default 9 ranges)
  - Brackets stored in `default_points_brackets` table, editable by admins
  - Multiplied by tournament's `points_multiplier`
- Country-aware weighted global ranking via `country_config` table
  - 15 European countries seeded with global multipliers
  - Per-country custom bracket overrides supported
- Per-country player stats tracked in `player_country_stats`
- Automatic stats recomputation via Postgres triggers on result entry
- Achievement checking triggered automatically after stats update
- Admin UI at `/admin/points-config` for managing brackets and country multipliers
- Public leaderboard with country-based filtering
- Player stats: total points, tournaments played, wins, current rank

## Pages

### Public (no login required)
| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | Email/password + social login |
| Signup | `/signup` | Account creation |
| Verify Email | `/verify-email` | Email confirmation pending |
| Tournaments | `/tournaments` | Browse all tournaments with filters |
| Tournament Detail | `/tournaments/[id]` | Single tournament info + registration |
| Rankings | `/rankings` | Public leaderboard with search/filter/pagination |
| Player Profile | `/players/[slug]` | Public player profile with stats, achievements, history |

### Player (login required)
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Personal registrations and stats |
| Profile | `/profile` | View/edit profile with avatar upload |

### Organizer (organizer role required)
| Page | URL | Description |
|------|-----|-------------|
| Organizer Dashboard | `/organizer/dashboard` | Tournament overview with stats |
| Create Tournament | `/organizer/tournaments/new` | Create new tournament |
| Manage Tournament | `/organizer/tournaments/[id]` | Edit tournament details |
| View Registrations | `/organizer/tournaments/[id]/registrations` | Player list + status management + CSV export |
| Enter Results | `/organizer/tournaments/[id]/results` | Placement entry (Phase 3B) |

### Admin (admin role required)
| Page | URL | Description |
|------|-----|-------------|
| Points Config | `/admin/points-config` | Configure default brackets, country multipliers |
| Admin Dashboard | `/admin/dashboard` | Platform statistics (Phase 5) |
| User Management | `/admin/users` | Manage accounts (Phase 5) |
| Organizer Invites | `/admin/organizers` | Invite organizers (Phase 5) |

## Implementation Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Testing framework setup | ✅ Complete |
| 1 | Foundation — auth, database, middleware | ✅ Complete |
| 2 | Tournament browse, register, dashboard, profile | ✅ Complete |
| 3A | Organizer tools — dashboard, tournament CRUD, registration management | ✅ Complete |
| 3B | Results entry, points calculation, achievement logic | ✅ Complete |
| 3C | Country points, admin points config UI | ✅ Complete |
| 4 | Rankings, player profiles, achievements, leaderboard | ✅ Complete |
| 5 | Didit verification, admin panel, email notifications | Planned |
