# Didit Identity Verification — Design

**Goal:** Integrate Didit Web SDK for age-gate verification (18+) so organizers can require verified identity for tournament registration.

## Flow

1. User clicks "Verify Identity" (from profile, dashboard, or tournament detail page)
2. Redirected to `/verify-identity` (protected route, requires login)
3. Page calls `POST /api/verification/create-session` (Next.js API route)
4. API route creates a Didit session via `POST https://verification.didit.me/v3/session/` with the user's ID as `vendor_data`
5. API route stores `didit_session_id` on the user's profile
6. Frontend receives session URL, initializes `@didit-protocol/sdk-web` modal
7. User completes ID upload + selfie in the Didit modal
8. On completion/cancel, SDK fires `onComplete` callback — page shows result status
9. Didit sends webhook to `POST /api/webhooks/didit`
10. Webhook validates HMAC signature (`X-Signature-Simple`), checks status = "Approved"
11. Updates profile: `identity_verified = true`, `identity_verified_at = now()`, `date_of_birth` (if available)

## Environment Variables

| Variable | Description | Where Used |
|----------|-------------|------------|
| `DIDIT_API_KEY` | API key from Didit dashboard | Server only (API routes) |
| `DIDIT_WEBHOOK_SECRET` | Webhook signature secret | Server only (webhook route) |
| `NEXT_PUBLIC_DIDIT_WORKFLOW_ID` | Verification workflow ID | Client + server |

## New Files

| File | Type | Purpose |
|------|------|---------|
| `app/api/verification/create-session/route.ts` | API Route | Creates Didit session, stores session_id in profile |
| `app/api/webhooks/didit/route.ts` | API Route | Receives webhook, validates signature, updates profile |
| `app/(player)/verify-identity/page.tsx` | Page (client) | Hosts Didit SDK modal, shows status |
| `components/auth/verification-status.tsx` | Component | Verified/unverified badge + CTA link |
| `lib/didit.ts` | Utility | Didit API helpers (create session, validate signature) |

## Modified Files

| File | Change |
|------|--------|
| `app/(player)/profile/page.tsx` | Add VerificationStatus section |
| `app/(player)/dashboard/page.tsx` | Add verification banner if not verified |
| `app/(player)/tournaments/[id]/page.tsx` | Show "Verification required" notice |
| `components/tournaments/registration-button.tsx` | Block registration if verification required but not verified |
| `lib/auth/routes.ts` | Add `/verify-identity` as protected, `/api/webhooks/*` as public |

## API Routes

### POST `/api/verification/create-session`
- **Auth:** Requires authenticated user (session cookie)
- **Request:** No body needed (user ID from session)
- **Flow:**
  1. Get authenticated user
  2. Call Didit API: `POST https://verification.didit.me/v3/session/`
     - Headers: `Authorization: Bearer {DIDIT_API_KEY}`, `Content-Type: application/json`
     - Body: `{ workflow_id, vendor_data: user.id, callback: webhook_url }`
  3. Store `didit_session_id` on profile via admin client
  4. Return `{ url: session.verification_url }` to frontend
- **Response:** `{ url: string }` or `{ error: string }`

### POST `/api/webhooks/didit`
- **Auth:** None (public endpoint), validated via HMAC signature
- **Signature:** `X-Signature-Simple` header — HMAC-SHA256 of `session_id|status|created_at` with `DIDIT_WEBHOOK_SECRET`
- **Flow:**
  1. Read raw request body
  2. Validate signature
  3. If status = "Approved":
     - Look up profile by `didit_session_id`
     - Set `identity_verified = true`, `identity_verified_at = now()`
     - Extract `date_of_birth` from decision data if available
  4. Return 200

## Registration Enforcement

When `tournament.requires_verification = true`:
- **Verified user:** Normal registration flow
- **Unverified user:** Registration button shows "Verify Identity to Register" linking to `/verify-identity`
- Tournament detail page shows a notice: "This tournament requires identity verification (age 18+)"

## VerificationStatus Component

Shows on profile page and dashboard:
- **Not verified:** Yellow banner — "Identity not verified" + "Verify Now" button
- **Verified:** Green badge — "Identity Verified" + date
- **Pending:** Blue badge — "Verification in progress" (session exists but no result yet)

## Deferred

- Email notification on verification completion
- Admin ability to manually verify/unverify users
- Verification expiry/renewal
