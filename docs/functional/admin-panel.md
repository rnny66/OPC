# OPC Platform — Admin Panel

## Overview

The admin panel provides platform-wide oversight for users with the **admin** role. It is accessible under the `/admin/*` route prefix and is protected by both Next.js middleware (route classification) and server-side role checks on every page and server action.

Administrators can:
- View platform-wide statistics and recent activity
- Search, filter, and manage user accounts and roles
- Invite new organizers (pre-signup) and promote existing players
- Oversee all tournaments across all organizers, with cancel authority
- Configure the points system (default brackets, country multipliers)
- Trigger a full recomputation of all player stats

### Access Control (3-layer)

```
Request
  |
  v
[Middleware] classifyRoute('/admin/*') => 'admin'
  |          — checks auth session exists
  |          — checks profile.role === 'admin'
  |          — redirects to /dashboard if wrong role
  v
[Page-level] Server Component reads profile.role
  |          — redirects to /dashboard if not admin
  v
[Server Action] requireAdmin() helper
  |             — throws if not authenticated
  |             — throws if role !== 'admin'
  v
[RLS] Database policies restrict data at the row level
```

---

## Admin Dashboard (`/admin/dashboard`)

**Page:** `platform/app/(admin)/admin/dashboard/page.tsx` (Server Component)

Displays a real-time statistics overview and recent activity tables. All data is fetched in parallel via `Promise.all`.

### Stats Grid (3-column)

| Stat | Source |
|------|--------|
| Total Users | `profiles` count |
| Organizers | `profiles` where `role = 'organizer'` |
| Verified Users | `profiles` where `identity_verified = true` |
| Total Tournaments | `tournaments` count |
| Active Tournaments | `tournaments` where `status IN ('upcoming', 'ongoing')` |
| Registrations | `tournament_registrations` where `status != 'cancelled'` |

### Recent Activity Tables

| Table | Columns | Data |
|-------|---------|------|
| Recent Signups | Name, Email, Role (badge), Joined | Last 10 profiles by `created_at` DESC |
| Recent Registrations | Player, Tournament, Status (badge), Date | Last 10 registrations by `created_at` DESC |

Role badges are color-coded: admin (red), organizer (yellow), player (blue). Registration status badges: confirmed (green), pending (yellow), waitlisted (blue), rejected (red).

---

## User Management (`/admin/users`)

**Page:** `platform/app/(admin)/admin/users/page.tsx` (Server Component)
**Component:** `platform/components/admin/user-table.tsx` (Client Component)

### Search & Filter

The page provides a GET form with:
- **Text search** (`q` param) — matches `display_name` or `email` via `ilike`
- **Role filter** (`role` param) — dropdown for All / Player / Organizer / Admin
- Results limited to 100 rows, ordered by `created_at` DESC

### User Table

| Column | Description |
|--------|-------------|
| Name | `display_name` or dash |
| Email | User email |
| Role | Color-coded badge (admin/organizer/player) |
| Verified | Checkmark if `identity_verified = true` |
| Joined | Formatted date (`en-GB`, day month year) |
| Actions | "Promote to Organizer" button (players only) |

### Promote Action

The "Promote to Organizer" button appears only for users with `role = 'player'`. It calls the `promoteToOrganizer` server action which uses the **service role client** (bypasses RLS) to update the user's role directly in the `profiles` table.

```
Admin clicks "Promote to Organizer"
  |
  v
promoteToOrganizer(userId) — Server Action
  |— requireAdmin() check
  |— createSupabaseAdmin() (service role client)
  |— UPDATE profiles SET role = 'organizer' WHERE id = userId
  |— revalidatePath('/admin')
  v
Page refreshes with updated role
```

---

## Organizer Invitations (`/admin/organizers`)

**Page:** `platform/app/(admin)/admin/organizers/page.tsx` (Server Component)
**Component:** `platform/components/admin/invite-organizer-form.tsx` (Client Component)

This page manages the organizer invitation pipeline: invite by email before they sign up, and the system auto-promotes them on account creation.

### Page Sections

1. **Send Invitation** — email input form
2. **Pending & Accepted Invitations** — table of all invitations with status
3. **Current Organizers** — table of all users with `role = 'organizer'`

### Invitation Flow

```
Admin enters email and clicks "Send Invite"
  |
  v
inviteOrganizer(email) — Server Action
  |— requireAdmin() check
  |— createSupabaseAdmin() (service role client)
  |— INSERT INTO organizer_invitations (email, invited_by)
  v
Invitation stored with status "pending" (accepted_at = NULL)
  |
  v
[Later] Invited user signs up with that email
  |
  v
DB trigger: trg_handle_organizer_invitation fires BEFORE INSERT on profiles
  |— Checks if email exists in organizer_invitations with accepted_at IS NULL
  |— If match: sets NEW.role = 'organizer'
  |— Updates invitation: accepted_at = now()
  v
User account created with organizer role automatically
```

### Invitations Table

| Column | Description |
|--------|-------------|
| Email | Invited email address |
| Invited By | Admin who sent the invite (via `profiles.display_name` join) |
| Date | Invitation creation date |
| Status | Badge: "Pending" (yellow) or "Accepted" (green), derived from `accepted_at` |

### Current Organizers Table

| Column | Description |
|--------|-------------|
| Name | `display_name` or "Unnamed" |
| Email | Organizer email |
| Since | `created_at` formatted date |

### Database Table: `organizer_invitations`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key (auto-generated) |
| `email` | `text` | Unique, invited email address |
| `invited_by` | `uuid` | FK to `profiles.id` (admin who invited) |
| `created_at` | `timestamptz` | Auto-set on insert |
| `accepted_at` | `timestamptz` | NULL = pending, non-null = accepted |

---

## Tournament Oversight (`/admin/tournaments`)

**Page:** `platform/app/(admin)/admin/tournaments/page.tsx` (Server Component)
**Component:** `platform/components/admin/admin-tournament-table.tsx` (Client Component)

Provides a global view of all tournaments across all organizers, with filtering and administrative actions.

### Filters (GET form)

| Filter | Options |
|--------|---------|
| Status | All / Upcoming / Ongoing / Completed / Cancelled |
| Organizer | Dropdown of all users with role `organizer` or `admin` |

### Tournament Table

| Column | Description |
|--------|-------------|
| Name | Link to `/organizer/tournaments/[id]` (detail/edit page) |
| Location | City, Country |
| Date | `start_date` |
| Organizer | `profiles.display_name` via `organizer_id` join |
| Status | Color-coded badge (upcoming=blue, ongoing=green, completed=grey, cancelled=red) |
| Regs | Registration count (aggregated from `tournament_registrations`) |
| Actions | "Regs" link, "Results" link, "Cancel" button |

### Action Links & Buttons

| Action | Destination / Behavior |
|--------|----------------------|
| Regs | Link to `/organizer/tournaments/[id]/registrations` |
| Results | Link to `/organizer/tournaments/[id]/results` |
| Cancel | Calls `cancelTournamentAdmin(tournamentId)` with confirmation dialog |

The Cancel button is shown only for tournaments with status `upcoming` or `ongoing` (hidden for `completed` and `cancelled`).

### Cancel Flow

```
Admin clicks "Cancel" on a tournament row
  |
  v
Browser confirm() dialog: "Cancel tournament 'Name'?"
  |— If user cancels: no action
  v
cancelTournamentAdmin(tournamentId) — Server Action
  |— requireAdmin() check
  |— createSupabaseAdmin() (service role client)
  |— UPDATE tournaments SET status = 'cancelled' WHERE id = tournamentId
  |— revalidatePath('/admin')
  |— revalidatePath('/tournaments')  (public listing)
  v
Table updates with "cancelled" status badge
```

---

## Points Configuration (`/admin/points-config`)

**Page:** `platform/app/(admin)/admin/points-config/page.tsx` (Server Component)
**Component:** `platform/components/admin/points-config-editor.tsx` (Client Component)

Manages the points system that drives player rankings. The editor has three sections:

### 1. Default Brackets

Editable table of placement-to-points mappings. Each row defines a range of finishing positions and the base points awarded.

| Column | Input | Description |
|--------|-------|-------------|
| Placement Min | Number input | Start of placement range (e.g., 1) |
| Placement Max | Number input (nullable) | End of range, or null for exact placement |
| Base Points | Number input | Points awarded for this placement range |

**Actions:**
- **Add Row** — appends a new empty bracket row
- **Remove** — deletes a specific bracket row (red button)
- **Save Brackets** — replaces all existing brackets (delete + insert)

The save operation is atomic: it deletes all existing rows from `default_points_brackets`, then inserts the new set.

### 2. Country Configuration

Table of per-country settings (15 countries seeded). Each country has:

| Column | Input | Description |
|--------|-------|-------------|
| Country | Display only | Country name |
| Code | Display only | ISO country code |
| Multiplier | Number input (step 0.1) | Global points multiplier for this country |
| Custom Brackets | Display only | "Yes" / "No" indicator |
| Save | Button | Saves that country's multiplier individually |

### 3. Maintenance

- **Recompute All Stats** — calls `compute_all_player_stats()` Postgres function via RPC
- Used after changing brackets or multipliers to recalculate all player rankings

### Points Calculation Flow

```
Admin edits brackets / country multipliers
  |
  v
Save action updates database tables
  |
  v
Admin clicks "Recompute All Stats"
  |
  v
recomputeAllStats() — Server Action
  |— requireAdmin()
  |— supabase.rpc('compute_all_player_stats')
  v
All player_stats and player_country_stats rows are recalculated
```

---

## Component Architecture

| Component | File | Type | Purpose |
|-----------|------|------|---------|
| Admin Dashboard | `app/(admin)/admin/dashboard/page.tsx` | Server | Stats overview, recent activity tables |
| User Management | `app/(admin)/admin/users/page.tsx` | Server | Search/filter form, data fetching |
| `UserTable` | `components/admin/user-table.tsx` | Client | User list with promote action |
| Organizer Invitations | `app/(admin)/admin/organizers/page.tsx` | Server | Invitation list, organizer list |
| `InviteOrganizerForm` | `components/admin/invite-organizer-form.tsx` | Client | Email input form with feedback |
| Tournament Oversight | `app/(admin)/admin/tournaments/page.tsx` | Server | Filter form, data fetching/shaping |
| `AdminTournamentTable` | `components/admin/admin-tournament-table.tsx` | Client | Tournament list with cancel action |
| Points Configuration | `app/(admin)/admin/points-config/page.tsx` | Server | Data fetching for brackets/countries |
| `PointsConfigEditor` | `components/admin/points-config-editor.tsx` | Client | Editable brackets, country config, recompute |

---

## Server Actions (`lib/actions/admin.ts`)

All server actions are marked `'use server'` and begin with the `requireAdmin()` guard.

| Action | Parameters | Client Used | Description |
|--------|-----------|-------------|-------------|
| `requireAdmin()` | (none) | Server (RLS) | Helper: verifies auth + admin role, throws on failure |
| `updateDefaultBrackets` | `brackets[]` | Server (RLS) | Deletes all existing brackets, inserts new set |
| `updateCountryConfig` | `countryCode, multiplier, customBrackets` | Server (RLS) | Updates a single country's multiplier and custom brackets |
| `recomputeAllStats` | (none) | Server (RLS) | Calls `compute_all_player_stats()` RPC |
| `promoteToOrganizer` | `userId` | Admin (service role) | Updates user role to `organizer`, bypasses RLS |
| `inviteOrganizer` | `email` | Admin (service role) | Inserts into `organizer_invitations` |
| `cancelTournamentAdmin` | `tournamentId` | Admin (service role) | Sets tournament status to `cancelled` |

**Note:** Actions that modify rows the admin's RLS policies would normally block (e.g., updating another user's profile, cancelling another organizer's tournament) use the **service role client** (`createSupabaseAdmin()`) which bypasses all RLS policies. Actions that operate on admin-accessible tables (brackets, country config, RPC) use the standard server client.

---

## Security

### Middleware Protection

All `/admin/*` routes are classified as `admin` by `classifyRoute()` in `lib/auth/routes.ts`. The middleware:

1. Refreshes the session (via `@supabase/ssr`)
2. Reads `profile.role` from the database
3. Redirects to `/dashboard` if the user is not an admin
4. Redirects to `/login` if the user is not authenticated

### Page-Level Guards

Every admin page independently verifies the admin role as a Server Component:

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles').select('role').eq('id', user.id).single()

if (profile?.role !== 'admin') redirect('/dashboard')
```

### Server Action Guards

The `requireAdmin()` helper is called at the start of every server action:

```typescript
async function requireAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Not authorized')
  return { supabase, userId: user.id }
}
```

### Row-Level Security (RLS)

| Table | Admin Policy |
|-------|-------------|
| `profiles` | "Admins can update user roles" — full UPDATE for admins |
| `organizer_invitations` | Admin-only SELECT, INSERT, UPDATE, DELETE |
| `default_points_brackets` | Admin write access (via standard RLS) |
| `country_config` | Admin write access (via standard RLS) |
| `tournaments` | Public read; admin DELETE; cancel uses service role client |

### Service Role Client

Three server actions use `createSupabaseAdmin()` (service role key, bypasses all RLS):
- `promoteToOrganizer` — modifies another user's `profiles.role`
- `inviteOrganizer` — inserts into `organizer_invitations`
- `cancelTournamentAdmin` — modifies tournament owned by another organizer

This client is server-only and the service role key is never exposed to the browser.

---

## Sidebar Navigation

Admin pages appear in the unified sidebar (built by `AppSidebar` server component in `components/layout/app-sidebar.tsx`). The admin section is only visible to users with `role = 'admin'` and includes:

- Dashboard (`/admin/dashboard`)
- Users (`/admin/users`)
- Organizers (`/admin/organizers`)
- Tournaments (`/admin/tournaments`)
- Points Config (`/admin/points-config`)

The sidebar uses `NavSection[]` with a labeled "Admin" section, rendered by the shared `SidebarLayout` client component.
