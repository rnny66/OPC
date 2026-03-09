# Phase 5 — Verification, Admin & Polish ✅ COMPLETE (email notifications deferred)

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)
**Depends on:** [Phase 4 — Rankings, Profiles & Stats](phase-4-rankings-stats.md)

## Goal

Integrate Didit identity verification, build the admin panel, implement the organizer invitation system, and add email notifications.

## Tasks

### 1. Didit identity verification ✅
- Didit v3 API integration (session creation via `POST /v3/session/` with `x-api-key` auth)
- API route: `app/api/verification/create-session/route.ts`
  - Checks auth + existing verification, creates Didit session, stores `didit_session_id` on profile
- Build `/verify-identity` page (redirect-based flow, no SDK dependency)
  - Creates session via API route, redirects to Didit's hosted verification URL
- Webhook handler: `app/api/webhooks/didit/route.ts`
  - Validates HMAC-SHA256 signature (`x-signature-simple` header)
  - On "Approved" status: sets `identity_verified = true`, `identity_verified_at`, `date_of_birth`
- `VerificationStatus` component on profile (always) and dashboard (when unverified)
- `lib/didit.ts` — `createVerificationSession()` + `validateWebhookSignature()`

### 2. Per-tournament verification enforcement ✅
- Tournament detail page shows "ID verification required" notice when `requires_verification = true`
- Registration button links to `/verify-identity` when verification is required but not completed
- Organizer tournament editor already has `requires_verification` toggle (Phase 3A)

### 3. Admin dashboard (`/admin/dashboard`) ✅
- Overview stats: total users, verified users, total tournaments, active tournaments
- Recent activity feed (new signups, new registrations, results entered)

### 4. User management (`/admin/users`) ✅
- Table of all users with search and filters
- Columns: name, email, role, verified status, signup date
- Actions: view profile, change role, disable account

### 5. Organizer invitation system ✅
- Create migration: `organizer_invitations` table (email, invited_by, created_at, accepted_at)
- Admin page (`/admin/organizers`): list current organizers + invite form
- Enter email → insert into `organizer_invitations`
- DB trigger: on `profiles` INSERT, check if email exists in `organizer_invitations` → set role to 'organizer'
- For existing users: admin can directly update role from user management

### 6. Tournament oversight (`/admin/tournaments`) ✅
- Table of all tournaments across all organizers
- Filter by status, organizer, date range
- Ability to edit or cancel any tournament

### 7. Email notifications — ⏳ Deferred to future phase
- Registration confirmation — sent to player after successful tournament registration
- Registration cancellation — sent to player after cancelling
- Results published — sent to all participants when organizer enters results
- Organizer invite — sent when admin invites a new organizer
- Use Supabase Edge Functions + a transactional email service (Resend, Postmark, or similar)

## Components built
- `VerificationStatus` — shows verified/unverified badge with CTA link (`components/auth/verification-status.tsx`)
- `UserTable` — searchable, filterable user list (`components/admin/user-table.tsx`)
- `InviteOrganizerForm` — email input + send invite (`components/admin/invite-organizer-form.tsx`)
- `AdminTournamentTable` — all-tournaments view (`components/admin/admin-tournament-table.tsx`)
- `PointsConfigEditor` — bracket + country config (`components/admin/points-config-editor.tsx`)

## Verification

- [x] Didit verification flow works end-to-end (create session → verify on Didit → webhook → profile updated)
- [x] Verified status persists and is visible on profile/dashboard
- [x] Cannot register for `requires_verification` tournament without verification
- [x] Can register for non-verified tournaments without verification
- [x] Admin can view all users, change roles, disable accounts
- [x] Organizer invitation flow: invite email → user signs up → gets organizer role
- [x] Admin can directly promote existing user to organizer
- [x] Admin can view and manage all tournaments
- [ ] Email notifications are sent for registrations, cancellations, and results — ⏳ Deferred
- [x] All admin routes are restricted to admin role only
