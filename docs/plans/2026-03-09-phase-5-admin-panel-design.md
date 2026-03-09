# Phase 5 — Admin Panel & Organizer Invitations Design

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** Phase 4 — Rankings, Profiles & Stats (complete)

## Goal

Build the admin panel with dashboard, user management, organizer invitations, and tournament oversight. Didit verification and email notifications are deferred to a future phase.

## Scope

### This phase
1. **Admin dashboard** (`/admin/dashboard`) — stats cards + recent activity table
2. **User management** (`/admin/users`) — searchable user table, promote to organizer
3. **Organizer invitations** (`/admin/organizers`) — invite table with auto-role trigger, no emails
4. **Tournament oversight** (`/admin/tournaments`) — all tournaments across organizers, edit/cancel any
5. **Sidebar update** — add new admin nav items

### Deferred (future phases)
- Didit identity verification (needs API keys + Edge Functions)
- Email notifications (needs transactional email service)
- Disable/ban accounts
- Admin-to-admin promotion

## Database

### New table: `organizer_invitations`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid (PK) | `gen_random_uuid()` | Invitation ID |
| `email` | text | — | Invited email (required, unique) |
| `invited_by` | uuid (FK) | — | References `profiles(id)` |
| `created_at` | timestamptz | `now()` | When invitation was created |
| `accepted_at` | timestamptz | null | When user signed up and was promoted |

**RLS Policies:**
- Select: admin only
- Insert: admin only
- Update: admin only (for marking accepted)
- Delete: admin only

**Trigger:** On `profiles` INSERT, check if email exists in `organizer_invitations` where `accepted_at IS NULL`. If found, set role to `organizer` and mark `accepted_at = now()`.

### Updated RLS: `profiles`

New admin policy: admins can update `role` field on any profile (for promoting existing users to organizer). Restricted to setting role = `organizer` only (no admin self-replication).

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Admin Dashboard | `/admin/dashboard` | 6 stats cards + recent activity (last 10 signups + last 10 registrations) |
| User Management | `/admin/users` | Searchable/filterable table. Columns: name, email, role, verified, joined. Action: promote to organizer |
| Organizer Invitations | `/admin/organizers` | Invite form (email input) + invitation table + current organizer list |
| Tournament Oversight | `/admin/tournaments` | All tournaments table with status/organizer filters. Links to existing edit/registrations/results pages |

## Components

| Component | Type | Description |
|-----------|------|-------------|
| `AdminStatsCard` | Server | Reusable stat card (label + value + optional icon) |
| `AdminActivityTable` | Server | Recent signups/registrations table |
| `UserTable` | Client | User list with search, role filter, promote action |
| `InviteOrganizerForm` | Client | Email input + submit button |
| `AdminTournamentTable` | Client | All tournaments with status/organizer filters |

## Server Actions (`lib/actions/admin.ts`)

Extend existing admin actions with:
- `promoteToOrganizer(userId)` — sets role to `organizer` via service role client
- `inviteOrganizer(email)` — inserts into `organizer_invitations`
- `cancelTournamentAdmin(tournamentId)` — sets tournament status to `cancelled`

## Route Updates

- Add `/admin/dashboard`, `/admin/users`, `/admin/organizers`, `/admin/tournaments` to route classification as `admin` routes
- These are already covered by the `/admin/*` wildcard pattern in `lib/auth/routes.ts`
- Update `AppSidebar` with new admin nav items: Dashboard, Users, Organizers, Tournaments, Points Config

## Design Decisions

- **No email sending:** Admin tells organizers out-of-band to sign up. The invitation table tracks pending/accepted state.
- **Promote to organizer only:** Admins cannot create other admins from the UI. Admin role is set directly in the database.
- **No disable/ban:** Not needed yet. Can be added in a future phase.
- **Reuse existing pages:** Tournament oversight links to existing organizer edit/registrations/results pages rather than duplicating them.
- **Service role client:** All admin mutations use `createSupabaseAdmin()` to bypass RLS, with server-side role checks.
