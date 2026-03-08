# Phase 5 — Verification, Admin & Polish

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** [Phase 4 — Rankings, Profiles & Stats](phase-4-rankings-stats.md)

## Goal

Integrate Didit identity verification, build the admin panel, implement the organizer invitation system, and add email notifications.

## Tasks

### 1. Didit identity verification
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
- Add verification status to player dashboard and profile

### 2. Per-tournament verification enforcement
- On tournament detail page: show "ID verification required" notice if `requires_verification = true`
- Registration flow: check `identity_verified` before allowing registration
- Show "Verify your identity" CTA linking to `/verify-identity` if not verified
- Organizer tournament editor: toggle `requires_verification`

### 3. Admin dashboard (`/admin/dashboard`)
- Overview stats: total users, verified users, total tournaments, active tournaments
- Recent activity feed (new signups, new registrations, results entered)

### 4. User management (`/admin/users`)
- Table of all users with search and filters
- Columns: name, email, role, verified status, signup date
- Actions: view profile, change role, disable account

### 5. Organizer invitation system
- Create migration: `organizer_invitations` table (email, invited_by, created_at, accepted_at)
- Admin page (`/admin/organizers`): list current organizers + invite form
- Enter email → insert into `organizer_invitations`
- DB trigger: on `profiles` INSERT, check if email exists in `organizer_invitations` → set role to 'organizer'
- For existing users: admin can directly update role from user management

### 6. Tournament oversight (`/admin/tournaments`)
- Table of all tournaments across all organizers
- Filter by status, organizer, date range
- Ability to edit or cancel any tournament

### 7. Email notifications
- Registration confirmation — sent to player after successful tournament registration
- Registration cancellation — sent to player after cancelling
- Results published — sent to all participants when organizer enters results
- Organizer invite — sent when admin invites a new organizer
- Use Supabase Edge Functions + a transactional email service (Resend, Postmark, or similar)

## Components to build
- `VerificationStatus` — shows current verification state with CTA
- `DiditVerificationModal` — wrapper for Didit Web SDK
- `AdminStatsGrid` — overview metrics cards
- `UserTable` — searchable, filterable user list
- `InviteOrganizerForm` — email input + send invite
- `AdminTournamentTable` — all-tournaments view

## Verification

- [ ] Didit verification flow works end-to-end (create session → upload ID → webhook → profile updated)
- [ ] Verified status persists and is visible on profile/dashboard
- [ ] Cannot register for `requires_verification` tournament without verification
- [ ] Can register for non-verified tournaments without verification
- [ ] Admin can view all users, change roles, disable accounts
- [ ] Organizer invitation flow: invite email → user signs up → gets organizer role
- [ ] Admin can directly promote existing user to organizer
- [ ] Admin can view and manage all tournaments
- [ ] Email notifications are sent for registrations, cancellations, and results
- [ ] All admin routes are restricted to admin role only
