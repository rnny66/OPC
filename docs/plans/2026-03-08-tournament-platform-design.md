# OPC Tournament Management Platform — Masterplan

## Context

The OPC project is currently a static marketing website (7 HTML pages, single CSS file, no backend). The goal is to build a **tournament management platform** where:

- **Players** can sign up, verify their identity (age 18+), create a profile, view the leaderboard, and register for tournaments
- **Organizers** (invite-only) can manage tournaments, view registrations, and enter results
- **Admins** can invite organizers and oversee the platform

This plan transforms OPC from a static site into a full-stack application while preserving the existing marketing pages.

---

## Architecture: Monorepo + Subdomain

```
OCP/
├── site/                   # Existing static HTML pages (moved here)
│   ├── index.html
│   ├── ranking.html
│   ├── tournaments.html
│   ├── contact.html, privacy.html, terms.html, responsible-gaming.html
│   ├── styles.css
│   └── assets/
├── platform/               # New Next.js app
│   ├── package.json
│   ├── next.config.js
│   ├── middleware.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── (auth)/         # login, signup, verify-email, verify-identity
│   │   ├── (player)/       # dashboard, profile, tournaments
│   │   ├── (organizer)/    # organizer dashboard, registrations, results
│   │   ├── (admin)/        # admin dashboard, users, organizers
│   │   └── api/webhooks/   # didit webhook
│   ├── components/
│   │   ├── ui/             # Design system components
│   │   ├── auth/
│   │   ├── tournaments/
│   │   ├── player/
│   │   └── organizer/
│   ├── lib/
│   │   ├── supabase/       # client.ts, server.ts, admin.ts, middleware.ts
│   │   ├── didit.ts        # Identity verification wrapper
│   │   └── utils.ts
│   └── types/database.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── functions/          # Edge Functions (didit-webhook, compute-rankings)
├── docs/
├── designs/
└── package.json            # Workspace root (npm workspaces)
```

**Deployment:**
- Static site → `opc-europe.com` (GitHub Pages / Netlify)
- Next.js app → `app.opc-europe.com` (Vercel)
- Both share the same Supabase project

---

## Database Schema

### `profiles` (extends Supabase Auth)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, FK → auth.users.id |
| email | text | Denormalized from auth |
| display_name | text | Player's chosen name |
| first_name, last_name | text | Legal name (from verification) |
| avatar_url | text | Supabase Storage |
| bio | text | Max 500 chars |
| city | text | City of residence |
| home_country | text | ISO alpha-2 |
| nationality | text[] | Array of ISO codes |
| social_links | jsonb | { twitter, instagram, hendonmob } |
| role | text | 'player' (default), 'organizer', 'admin' |
| identity_verified | boolean | Set true after Didit passes |
| identity_verified_at | timestamptz | When verification completed |
| didit_session_id | text | Didit session reference |
| date_of_birth | date | From Didit verification |
| onboarding_complete | boolean | All steps done |
| created_at, updated_at | timestamptz | Auto |

### `tournaments` (expanded from existing plan)
Existing fields from `future-features/supabase-tournaments-integration.md` plus:
| Column | Type | Notes |
|--------|------|-------|
| organizer_id | uuid | FK → profiles.id |
| description | text | Full description |
| capacity | integer | Max players |
| registration_open | boolean | Whether signups accepted |
| registration_deadline | timestamptz | Cutoff |
| venue_address | text | Full address |
| contact_email | text | Organizer contact |
| points_multiplier | numeric | Main = 1.5, Open = 1.0 |
| requires_verification | boolean | Organizer setting — only verified players can register |

### `tournament_registrations`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tournament_id | uuid | FK → tournaments |
| player_id | uuid | FK → profiles |
| status | text | registered, confirmed, cancelled, no_show |
| registered_at | timestamptz | Auto |
| cancelled_at | timestamptz | Null unless cancelled |

Unique: (tournament_id, player_id)

### `tournament_results`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tournament_id | uuid | FK → tournaments |
| player_id | uuid | FK → profiles |
| placement | integer | Final position |
| points_awarded | integer | Calculated from placement x multiplier |
| entered_by | uuid | FK → profiles (organizer) |
| created_at | timestamptz | Auto |

Unique: (tournament_id, player_id)

### `player_stats` (computed table)
| Column | Type | Notes |
|--------|------|-------|
| player_id | uuid | PK, FK → profiles |
| total_points | integer | Sum of points_awarded |
| tournament_count | integer | Count of results |
| win_count | integer | Placements = 1 |
| top3_count | integer | Placements <= 3 |
| avg_finish | numeric | Average placement |
| best_finish | integer | Best placement |
| current_rank | integer | Computed |
| previous_rank | integer | Rank at last snapshot |
| last_computed | timestamptz | When refreshed |

### `achievements` + `player_achievements`
Badge definitions with criteria (type + threshold). Auto-awarded when stats are recomputed.

### `organizer_invitations`
Email-based invite table. When an invited email signs up, a trigger sets their role to 'organizer'.

### `ranking_snapshots`
From existing plan — historical rank tracking.

---

## Auth Flow

1. **Signup** → email/password or Google/Facebook (Supabase Auth)
2. **Email confirmation** → click link
3. **Profile creation** → display name, country, bio, avatar
4. **Identity verification** (optional, once-then-trusted) → Didit Web SDK
5. **Ready to play** → browse and register for tournaments

Verification is **not** required for all tournaments — organizers can toggle `requires_verification` per tournament. Once a player is verified, they stay verified permanently.

### Middleware Route Protection
- `/login`, `/signup`, `/verify-*` → public
- `/dashboard`, `/profile`, `/tournaments/*/register` → auth + onboarded
- Tournaments with `requires_verification=true` → also check `identity_verified`
- `/organizer/*` → auth + role=organizer
- `/admin/*` → auth + role=admin

---

## Role System & RLS

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Public (basic), own (full) | Trigger only | Own profile (not role/verified) | Admin |
| tournaments | Public | Organizer, Admin | Own (organizer_id), Admin | Admin |
| registrations | Own + organizer's tournaments | Auth + verified (if required) | Own cancel, organizer status | Admin |
| results | Public | Tournament organizer, Admin | Same | Admin |
| player_stats | Public | Postgres function | Postgres function | — |

---

## Didit Integration

1. **Edge Function: `create-didit-session`** → creates session via Didit API, stores session_id in profiles
2. **Frontend** → loads Didit Web SDK modal (ID upload + selfie)
3. **Edge Function: `didit-webhook`** → receives result, validates, checks age >= 18, sets identity_verified=true

---

## Points & Achievements

**Points formula:**
```
1st: 1000, 2nd: 750, 3rd: 500, 4th: 400, 5th: 350
6th-10th: 300, 11th-20th: 200, 21st-50th: 100, 51st+: 50
Final = base_points x tournament.points_multiplier
```

**Stats recomputation:** Postgres function triggered after INSERT on `tournament_results`. Recomputes `player_stats` and checks achievement criteria.

**Example achievements:** First Blood (1 tournament), Regular (5), Veteran (20), Champion (1 win), Triple Crown (3 wins), Podium Master (10 top-3), Globetrotter (3+ countries).

---

## Implementation Phases

| Phase | Name | Plan |
|-------|------|------|
| 0 | Testing Framework | [phase-0-testing-framework.md](phase-0-testing-framework.md) |
| 1 | Foundation | [phase-1-foundation.md](phase-1-foundation.md) |
| 2 | Core Tournament Flow | [phase-2-tournament-flow.md](phase-2-tournament-flow.md) |
| 3 | Organizer Tools | [phase-3-organizer-tools.md](phase-3-organizer-tools.md) |
| 4 | Rankings, Profiles & Stats | [phase-4-rankings-stats.md](phase-4-rankings-stats.md) |
| 5 | Verification, Admin & Polish | [phase-5-verification-admin.md](phase-5-verification-admin.md) |

---

## Key Files to Reference

- `site/styles.css` lines 13-36 — CSS design tokens to extract and share
- `future-features/supabase-tournaments-integration.md` — existing tournaments schema to extend
- `future-features/supabase-ranking-integration.md` — existing players/rankings schema to align with
- `tournaments.html` lines 77-136 — tournament card HTML to replicate in React
- `docs/STYLE_GUIDE.md` — full design system reference
