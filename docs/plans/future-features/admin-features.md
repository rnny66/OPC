# OPC Platform — Future Features

Deferred features from completed phases, tracked for future implementation.

---

## Email Notifications (deferred from Phase 5)

**Purpose:** Transactional emails for key platform events.

**What to build:**
- Choose transactional email service (Resend, Postmark, or similar)
- Create Supabase Edge Functions for each email type:
  1. **Registration confirmation** — sent to player after successful tournament registration
  2. **Registration cancellation** — sent to player after cancelling
  3. **Results published** — sent to all participants when organizer enters results
  4. **Organizer invite** — sent when admin invites a new organizer (currently out-of-band)
- Email templates with OPC branding
- Environment variables for email service API key

**Prerequisites:** Email service account and API key.

---

## Account Disable/Ban (not yet planned)

**Purpose:** Allow admins to suspend problematic accounts.

**What to build:**
- Add `is_disabled` boolean column to `profiles`
- Middleware check: redirect disabled users to a "Account suspended" page
- Admin UI: disable/enable toggle on user management page
- Prevent disabled users from registering for tournaments

---

## Admin-to-Admin Promotion (not yet planned)

**Purpose:** Allow admins to create other admins from the UI.

**Current state:** Admin role can only be set directly in the database. The `promoteToOrganizer` action only promotes to organizer.

**What to build:**
- New server action: `promoteToAdmin(userId)` with extra confirmation
- UI confirmation dialog (more prominent than organizer promotion)
- Consider requiring a second admin to approve

---

## Ranking Snapshots (deferred from Phase 4)

**Purpose:** Track ranking history over time for trend analysis.

**What to build:**
- `ranking_snapshots` table: player_id, rank, points, snapshot_date
- Scheduled function to capture weekly/monthly snapshots
- Rank history chart on player profile page
- "Rank over time" visualization

---

## Static Site Wiring (deferred from Phase 4)

**Purpose:** Connect the static marketing site (`site/`) to the live platform.

**What to build:**
- Update `site/ranking.html` to fetch real data from Supabase or platform API
- Update `site/tournaments.html` to show live tournament data
- Add "Sign up" / "Log in" CTAs linking to platform
- Consider SSR or API routes to serve data to the static site
