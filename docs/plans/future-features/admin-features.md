# OPC Platform — Future Features

Deferred features from completed phases, tracked for future implementation.

---

## Didit Identity Verification (deferred from Phase 5)

**Purpose:** Age-gate verification (18+) for tournament registration.

**What to build:**
- Research Didit Web SDK and API documentation
- Create Supabase Edge Function: `create-didit-session`
  - Called when user navigates to `/verify-identity`
  - Creates a Didit verification session via their API
  - Stores `didit_session_id` in `profiles`
  - Returns SDK token to frontend
- Build `/verify-identity` page
  - Load Didit Web SDK
  - Show verification modal (ID upload + selfie)
  - Show "Verifying..." state while waiting
  - Poll for completion or wait for redirect
- Create Supabase Edge Function: `didit-webhook`
  - Receive webhook from Didit on check completion
  - Validate webhook signature
  - If check passes and age >= 18: set `identity_verified = true`, `identity_verified_at`, `date_of_birth`
  - If check fails: leave `identity_verified = false`
- Add verification status badge to player dashboard and profile page

**Per-tournament enforcement:**
- Tournament detail page: show "ID verification required" notice if `requires_verification = true`
- Registration flow: check `identity_verified` before allowing registration
- Show "Verify your identity" CTA linking to `/verify-identity` if not verified
- Organizer tournament editor: toggle `requires_verification` (field already exists in DB)

**Prerequisites:** Didit API account and credentials.

**Database:** Schema already supports this — `profiles` has `identity_verified`, `identity_verified_at`, `didit_session_id`, `date_of_birth` columns. `tournaments` has `requires_verification` column.

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
