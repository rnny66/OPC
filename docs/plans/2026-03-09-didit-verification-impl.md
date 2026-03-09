# Didit Identity Verification Implementation Plan ✅ COMPLETE

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Didit Web SDK for age-gate identity verification, with a dedicated verification page, webhook handler, and registration enforcement.

**Architecture:** Next.js API routes handle session creation and webhooks. The `@didit-protocol/sdk-web` client SDK renders the verification modal. Profile fields `identity_verified`, `identity_verified_at`, `didit_session_id`, and `date_of_birth` already exist in the database — no migrations needed. The registration button already accepts `isVerified`/`requiresVerification` props.

**Tech Stack:** Next.js 15 API Routes, @didit-protocol/sdk-web, Supabase admin client, HMAC-SHA256 webhook validation.

---

### Task 1: Install Didit SDK + add environment variables

**Files:**
- Modify: `platform/package.json`
- Modify: `platform/.env.local.example`
- Modify: `platform/.env.local` (manually)

**Step 1: Install the SDK**

```bash
cd platform && npm install @didit-protocol/sdk-web
```

**Step 2: Update .env.local.example**

Add to `platform/.env.local.example`:

```
DIDIT_API_KEY=your-didit-api-key
DIDIT_WEBHOOK_SECRET=your-didit-webhook-secret
NEXT_PUBLIC_DIDIT_WORKFLOW_ID=your-didit-workflow-id
```

**Step 3: Add real values to .env.local**

Add the actual Didit credentials to `platform/.env.local` (gitignored).

**Step 4: Commit**

```bash
git add platform/package.json platform/package-lock.json platform/.env.local.example
git commit -m "feat: install Didit SDK and add env var template"
```

---

### Task 2: Create Didit utility library

**Files:**
- Create: `platform/lib/didit.ts`
- Create: `platform/lib/__tests__/didit.test.ts`

**Step 1: Write the test**

Create `platform/lib/__tests__/didit.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateWebhookSignature } from '../didit'

describe('validateWebhookSignature', () => {
  const secret = 'test-webhook-secret'

  it('returns true for valid signature', async () => {
    const crypto = await import('crypto')
    const payload = 'session-123|Approved|2026-03-09T12:00:00Z'
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    const result = validateWebhookSignature(
      { session_id: 'session-123', status: 'Approved', created_at: '2026-03-09T12:00:00Z' },
      expected,
      secret
    )
    expect(result).toBe(true)
  })

  it('returns false for invalid signature', () => {
    const result = validateWebhookSignature(
      { session_id: 'session-123', status: 'Approved', created_at: '2026-03-09T12:00:00Z' },
      'invalid-signature',
      secret
    )
    expect(result).toBe(false)
  })

  it('returns false for empty signature', () => {
    const result = validateWebhookSignature(
      { session_id: 'session-123', status: 'Approved', created_at: '2026-03-09T12:00:00Z' },
      '',
      secret
    )
    expect(result).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm -w platform run test -- lib/__tests__/didit.test.ts`
Expected: FAIL — module not found

**Step 3: Implement the utility**

Create `platform/lib/didit.ts`:

```ts
import { createHmac } from 'crypto'

const DIDIT_API_BASE = 'https://verification.didit.me'

export interface DiditSessionResponse {
  session_id: string
  session_token: string
  verification_url: string
  status: string
}

export async function createVerificationSession(
  userId: string,
  callbackUrl: string
): Promise<DiditSessionResponse> {
  const response = await fetch(`${DIDIT_API_BASE}/v3/session/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DIDIT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: process.env.NEXT_PUBLIC_DIDIT_WORKFLOW_ID,
      vendor_data: userId,
      callback: callbackUrl,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Didit API error: ${response.status} ${text}`)
  }

  return response.json()
}

export function validateWebhookSignature(
  data: { session_id: string; status: string; created_at: string },
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false

  const payload = `${data.session_id}|${data.status}|${data.created_at}`
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}
```

**Step 4: Run test to verify it passes**

Run: `npm -w platform run test -- lib/__tests__/didit.test.ts`
Expected: PASS — all 3 tests pass

**Step 5: Commit**

```bash
git add platform/lib/didit.ts platform/lib/__tests__/didit.test.ts
git commit -m "feat: add Didit utility library with webhook validation"
```

---

### Task 3: Create session API route

**Files:**
- Create: `platform/app/api/verification/create-session/route.ts`

**Step 1: Create the API route**

Create `platform/app/api/verification/create-session/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createVerificationSession } from '@/lib/didit'

export async function POST() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if already verified
    const { data: profile } = await supabase
      .from('profiles')
      .select('identity_verified')
      .eq('id', user.id)
      .single()

    if (profile?.identity_verified) {
      return NextResponse.json({ error: 'Already verified' }, { status: 400 })
    }

    // Determine callback URL for webhook
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/webhooks/didit`

    // Create Didit session
    const session = await createVerificationSession(user.id, callbackUrl)

    // Store session ID on profile
    const adminClient = createSupabaseAdmin()
    await adminClient
      .from('profiles')
      .update({ didit_session_id: session.session_id })
      .eq('id', user.id)

    return NextResponse.json({ url: session.verification_url })
  } catch (err: any) {
    console.error('Failed to create verification session:', err)
    return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: 500 })
  }
}
```

**Step 2: Verify it compiles**

Run: `npm -w platform run build`
Expected: Build succeeds, `/api/verification/create-session` in route list

**Step 3: Commit**

```bash
git add platform/app/api/verification/create-session/route.ts
git commit -m "feat: add verification session creation API route"
```

---

### Task 4: Create webhook handler API route

**Files:**
- Create: `platform/app/api/webhooks/didit/route.ts`

**Step 1: Update route classification**

In `platform/lib/auth/routes.ts`, the webhook must be accessible without auth. The current middleware matcher already skips API routes that start with `/api/webhooks/` — but check: the middleware matcher `/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)` matches ALL routes including `/api/`. So we need to add `/api/webhooks` as a public route.

Modify `platform/lib/auth/routes.ts` — add webhook check before the protected route check:

```ts
// Add near the top of classifyRoute:
if (pathname.startsWith('/api/webhooks/')) return 'public'
```

**Step 2: Create the webhook route**

Create `platform/app/api/webhooks/didit/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { validateWebhookSignature } from '@/lib/didit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-signature-simple') || ''

    const secret = process.env.DIDIT_WEBHOOK_SECRET
    if (!secret) {
      console.error('DIDIT_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Validate signature
    const isValid = validateWebhookSignature(
      {
        session_id: body.session_id,
        status: body.status,
        created_at: body.created_at,
      },
      signature,
      secret
    )

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Only process approved verifications
    if (body.status !== 'Approved') {
      return NextResponse.json({ received: true })
    }

    // Find user by session ID and update
    const adminClient = createSupabaseAdmin()

    const updateData: Record<string, any> = {
      identity_verified: true,
      identity_verified_at: new Date().toISOString(),
    }

    // Extract date_of_birth from decision data if available
    if (body.decision?.document?.date_of_birth) {
      updateData.date_of_birth = body.decision.document.date_of_birth
    }

    const { error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('didit_session_id', body.session_id)

    if (error) {
      console.error('Failed to update profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }
}
```

**Step 3: Update route classification test**

Add test to `platform/lib/__tests__/middleware-routes.test.ts`:

```ts
it('classifies webhook routes as public', () => {
  expect(classifyRoute('/api/webhooks/didit')).toBe('public')
})
```

**Step 4: Run tests**

Run: `npm -w platform run test -- lib/__tests__/middleware-routes.test.ts`
Expected: All tests pass

**Step 5: Commit**

```bash
git add platform/app/api/webhooks/didit/route.ts platform/lib/auth/routes.ts platform/lib/__tests__/middleware-routes.test.ts
git commit -m "feat: add Didit webhook handler with signature validation"
```

---

### Task 5: Create verify-identity page

**Files:**
- Create: `platform/app/(player)/verify-identity/page.tsx`

**Step 1: Create the page**

This is a client component that loads the Didit SDK. Create `platform/app/(player)/verify-identity/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '2rem',
    lineHeight: 1.6,
  } as React.CSSProperties,
  card: {
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  button: {
    padding: '0.75rem 2rem',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  status: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
    marginTop: '1rem',
  } as React.CSSProperties,
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
  } as React.CSSProperties,
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  } as React.CSSProperties,
  pending: {
    backgroundColor: 'rgba(21, 112, 239, 0.1)',
    border: '1px solid rgba(21, 112, 239, 0.3)',
    color: '#1570ef',
  } as React.CSSProperties,
  info: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    marginTop: '1rem',
    lineHeight: 1.5,
  } as React.CSSProperties,
}

type VerifyState = 'idle' | 'loading' | 'verifying' | 'completed' | 'cancelled' | 'error'

export default function VerifyIdentityPage() {
  const [state, setState] = useState<VerifyState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  async function startVerification() {
    setState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/verification/create-session', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'Already verified') {
          setState('completed')
          return
        }
        throw new Error(data.error || 'Failed to create session')
      }

      // Load and start Didit SDK
      const { DiditSdk } = await import('@didit-protocol/sdk-web')

      DiditSdk.shared.onComplete = (result) => {
        switch (result.type) {
          case 'completed':
            setState('completed')
            // Refresh after a delay to allow webhook to process
            setTimeout(() => router.refresh(), 3000)
            break
          case 'cancelled':
            setState('cancelled')
            break
          case 'failed':
            setState('error')
            setErrorMsg(result.error?.message || 'Verification failed')
            break
        }
      }

      setState('verifying')
      DiditSdk.shared.startVerification({
        url: data.url,
        configuration: {
          showCloseButton: true,
          showExitConfirmation: true,
        },
      })
    } catch (err: any) {
      setState('error')
      setErrorMsg(err.message || 'Something went wrong')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Identity Verification</h1>
      <p style={styles.subtitle}>
        Verify your identity to register for tournaments that require age verification (18+).
        You only need to do this once.
      </p>

      <div style={styles.card}>
        {state === 'idle' && (
          <>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              You will need a valid government-issued ID and your device camera.
            </p>
            <button style={styles.button} onClick={startVerification}>
              Start Verification
            </button>
          </>
        )}

        {state === 'loading' && (
          <p style={{ color: 'var(--color-text-secondary)' }}>Preparing verification...</p>
        )}

        {state === 'verifying' && (
          <div style={{ ...styles.status, ...styles.pending }}>
            Verification in progress. Please complete the steps in the popup.
          </div>
        )}

        {state === 'completed' && (
          <div style={{ ...styles.status, ...styles.success }}>
            Verification submitted successfully! Your identity will be verified shortly.
            <p style={styles.info}>
              You will be able to register for verified tournaments once approved.
            </p>
          </div>
        )}

        {state === 'cancelled' && (
          <>
            <div style={{ ...styles.status, ...styles.pending }}>
              Verification was cancelled.
            </div>
            <button
              style={{ ...styles.button, marginTop: '1rem' }}
              onClick={() => { setState('idle'); startVerification() }}
            >
              Try Again
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ ...styles.status, ...styles.error }}>
              {errorMsg || 'An error occurred during verification.'}
            </div>
            <button
              style={{ ...styles.button, marginTop: '1rem' }}
              onClick={() => { setState('idle'); startVerification() }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Add `/verify-identity` as a protected route**

In `platform/lib/auth/routes.ts`, add to `PROTECTED_ROUTES`:

```ts
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/verify-identity']
```

**Step 3: Verify build**

Run: `npm -w platform run build`
Expected: Build succeeds, `/verify-identity` in route list

**Step 4: Commit**

```bash
git add platform/app/(player)/verify-identity/page.tsx platform/lib/auth/routes.ts
git commit -m "feat: add verify-identity page with Didit SDK integration"
```

---

### Task 6: Create VerificationStatus component

**Files:**
- Create: `platform/components/auth/verification-status.tsx`
- Create: `platform/components/auth/__tests__/verification-status.test.tsx`

**Step 1: Write the test**

Create `platform/components/auth/__tests__/verification-status.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { VerificationStatus } from '../verification-status'

afterEach(() => cleanup())

describe('VerificationStatus', () => {
  it('shows verified badge when verified', () => {
    render(<VerificationStatus isVerified={true} verifiedAt="2026-01-15T10:00:00Z" />)
    expect(screen.getByText(/verified/i)).toBeInTheDocument()
  })

  it('shows verify button when not verified', () => {
    render(<VerificationStatus isVerified={false} verifiedAt={null} />)
    expect(screen.getByRole('link', { name: /verify/i })).toBeInTheDocument()
  })

  it('links to verify-identity page', () => {
    render(<VerificationStatus isVerified={false} verifiedAt={null} />)
    const link = screen.getByRole('link', { name: /verify/i })
    expect(link).toHaveAttribute('href', '/verify-identity')
  })

  it('shows verification date when verified', () => {
    render(<VerificationStatus isVerified={true} verifiedAt="2026-01-15T10:00:00Z" />)
    expect(screen.getByText(/jan/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm -w platform run test -- components/auth/__tests__/verification-status.test.tsx`
Expected: FAIL

**Step 3: Implement the component**

Create `platform/components/auth/verification-status.tsx`:

```tsx
import Link from 'next/link'

const statusStyles = {
  container: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  verified: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  } as React.CSSProperties,
  unverified: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties,
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  verifiedText: {
    color: '#22c55e',
  } as React.CSSProperties,
  unverifiedText: {
    color: '#f59e0b',
  } as React.CSSProperties,
  date: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  link: {
    display: 'inline-block',
    padding: '0.4rem 0.75rem',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: 600,
  } as React.CSSProperties,
}

export function VerificationStatus({
  isVerified,
  verifiedAt,
}: {
  isVerified: boolean
  verifiedAt: string | null
}) {
  if (isVerified) {
    return (
      <div style={{ ...statusStyles.container, ...statusStyles.verified }}>
        <div style={statusStyles.row}>
          <span style={{ ...statusStyles.badge, ...statusStyles.verifiedText }}>
            ✅ Identity Verified
          </span>
          {verifiedAt && (
            <span style={statusStyles.date}>
              Verified {new Date(verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...statusStyles.container, ...statusStyles.unverified }}>
      <div style={statusStyles.row}>
        <span style={{ ...statusStyles.badge, ...statusStyles.unverifiedText }}>
          ⚠️ Identity Not Verified
        </span>
        <Link href="/verify-identity" style={statusStyles.link}>
          Verify Now
        </Link>
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm -w platform run test -- components/auth/__tests__/verification-status.test.tsx`
Expected: PASS — all 4 tests pass

**Step 5: Commit**

```bash
git add platform/components/auth/verification-status.tsx platform/components/auth/__tests__/verification-status.test.tsx
git commit -m "feat: add VerificationStatus component"
```

---

### Task 7: Add verification status to profile page and dashboard

**Files:**
- Modify: `platform/app/(player)/profile/page.tsx`
- Modify: `platform/app/(player)/dashboard/page.tsx`

**Step 1: Update profile page**

In `platform/app/(player)/profile/page.tsx`, add the VerificationStatus component between the title and the ProfileForm:

1. Add import: `import { VerificationStatus } from '@/components/auth/verification-status'`
2. After the `<h2>` title and before `<ProfileForm>`, add:

```tsx
<VerificationStatus
  isVerified={profile.identity_verified}
  verifiedAt={profile.identity_verified_at}
/>
```

**Step 2: Update dashboard page**

In `platform/app/(player)/dashboard/page.tsx`:

1. Add import: `import { VerificationStatus } from '@/components/auth/verification-status'`
2. Fetch profile data — add after the user auth check:

```tsx
const { data: profile } = await supabase
  .from('profiles')
  .select('identity_verified, identity_verified_at')
  .eq('id', user.id)
  .single()
```

3. After `<h2 style={styles.title}>Dashboard</h2>` and before the stats div, add:

```tsx
{!profile?.identity_verified && (
  <VerificationStatus
    isVerified={false}
    verifiedAt={null}
  />
)}
```

Note: Only show on dashboard when NOT verified (as a prompt to verify). Profile page always shows the status.

**Step 3: Verify build**

Run: `npm -w platform run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add platform/app/(player)/profile/page.tsx platform/app/(player)/dashboard/page.tsx
git commit -m "feat: add verification status to profile and dashboard"
```

---

### Task 8: Update registration button with verify link

**Files:**
- Modify: `platform/components/tournaments/registration-button.tsx`

**Step 1: Update the requires-verification-not-verified case**

In `platform/components/tournaments/registration-button.tsx`, find the block at lines 97-99:

```tsx
if (requiresVerification && !isVerified) {
  return <div style={styles.status}>Identity verification required to register for this tournament.</div>
}
```

Replace with:

```tsx
if (requiresVerification && !isVerified) {
  return (
    <div style={styles.status}>
      Identity verification required.{' '}
      <Link href="/verify-identity" style={styles.link}>Verify your identity</Link> to register.
    </div>
  )
}
```

The `Link` import and `styles.link` already exist in the file.

**Step 2: Run existing registration button tests**

Run: `npm -w platform run test -- components/tournaments/__tests__/registration-button.test.tsx`
Expected: All 8 tests pass (the test for this state checks for text content, the added link should still match)

**Step 3: Commit**

```bash
git add platform/components/tournaments/registration-button.tsx
git commit -m "feat: add verify identity link to registration button"
```

---

### Task 9: Run all tests and verify build

**Step 1: Run all unit tests**

Run: `npm run test:unit`
Expected: All tests pass (~155+ tests, 35+ files)

**Step 2: Run build**

Run: `npm -w platform run build`
Expected: Build succeeds with all new routes

**Step 3: Fix any issues**

---

### Task 10: Update documentation

Use the `ocp-phase-docs` skill to update all documentation:

**Files to update:**
- `docs/plans/future-features/admin-features.md` — remove Didit section (now implemented)
- `docs/functional/platform-overview.md` — add verify-identity page, update verification flow
- `docs/technical/architecture.md` — add new files to tree
- `docs/technical/testing.md` — update test counts
- `CLAUDE.md` — add Didit env vars, new routes, update structure
- `.claude/skills/ocp-platform-dev/SKILL.md` — update
- `MEMORY.md` — update

**Commit:**

```bash
git add -A
git commit -m "docs: update documentation after Didit verification implementation"
```
