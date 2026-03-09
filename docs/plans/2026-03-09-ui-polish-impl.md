# UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add shimmer skeleton loaders, navigation hover animations, button spinners, toast notifications, and reduced-motion support to the OPC platform.

**Architecture:** CSS keyframe animations in `globals.css`, reusable React components in `components/ui/`, Next.js `loading.tsx` convention for route-level skeletons, React context for toast state management. No external libraries.

**Tech Stack:** Next.js 15, React 19, CSS keyframes, React context API, inline styles with CSS custom properties.

---

### Task 1: CSS Animations Foundation

Add shimmer, spinner, and toast keyframe animations to `globals.css`, plus reduced-motion media query.

**Files:**
- Modify: `platform/app/globals.css`

**Step 1: Add animation keyframes and reduced-motion to globals.css**

Append the following after the existing `@media (max-width: 640px)` block at end of file:

```css
/* --- Animations --- */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(0.5rem); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes toast-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(0.5rem); }
}

/* --- Reduced Motion --- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 2: Verify the dev server compiles without errors**

Run: `cd platform && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds (or at least no CSS parse errors).

**Step 3: Commit**

```bash
git add platform/app/globals.css
git commit -m "style: add shimmer, spinner, toast keyframes and reduced-motion"
```

---

### Task 2: Skeleton Component

Create a reusable shimmer skeleton building block.

**Files:**
- Create: `platform/components/ui/skeleton.tsx`
- Create: `platform/components/ui/__tests__/skeleton.test.tsx`

**Step 1: Write the test**

```tsx
// platform/components/ui/__tests__/skeleton.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders with default styles', () => {
    render(<Skeleton data-testid="skel" />)
    const el = screen.getByTestId('skel')
    expect(el).toBeInTheDocument()
    expect(el.style.borderRadius).toBe('0.375rem')
  })

  it('applies custom width and height', () => {
    render(<Skeleton width="200px" height="1.5rem" data-testid="skel" />)
    const el = screen.getByTestId('skel')
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('1.5rem')
  })

  it('renders as circle when circle prop is set', () => {
    render(<Skeleton width="48px" height="48px" circle data-testid="skel" />)
    const el = screen.getByTestId('skel')
    expect(el.style.borderRadius).toBe('50%')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/ui/__tests__/skeleton.test.tsx`
Expected: FAIL — cannot find module `../skeleton`

**Step 3: Implement the Skeleton component**

```tsx
// platform/components/ui/skeleton.tsx
import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?: string
  height?: string
  circle?: boolean
  style?: CSSProperties
  'data-testid'?: string
}

const baseStyle: CSSProperties = {
  background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, rgba(255,255,255,0.04) 50%, var(--color-bg-secondary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  borderRadius: '0.375rem',
}

export function Skeleton({ width = '100%', height = '1rem', circle = false, style, ...props }: SkeletonProps) {
  return (
    <div
      style={{
        ...baseStyle,
        width,
        height,
        borderRadius: circle ? '50%' : '0.375rem',
        ...style,
      }}
      {...props}
    />
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/ui/__tests__/skeleton.test.tsx`
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add platform/components/ui/skeleton.tsx platform/components/ui/__tests__/skeleton.test.tsx
git commit -m "feat: add reusable Skeleton shimmer component"
```

---

### Task 3: Spinner Component

Create a small inline CSS spinner for buttons.

**Files:**
- Create: `platform/components/ui/spinner.tsx`
- Create: `platform/components/ui/__tests__/spinner.test.tsx`

**Step 1: Write the test**

```tsx
// platform/components/ui/__tests__/spinner.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from '../spinner'

describe('Spinner', () => {
  it('renders with spin animation', () => {
    render(<Spinner data-testid="spinner" />)
    const el = screen.getByTestId('spinner')
    expect(el).toBeInTheDocument()
    expect(el.style.animation).toContain('spin')
  })

  it('accepts custom size', () => {
    render(<Spinner size="1.5rem" data-testid="spinner" />)
    const el = screen.getByTestId('spinner')
    expect(el.style.width).toBe('1.5rem')
    expect(el.style.height).toBe('1.5rem')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/ui/__tests__/spinner.test.tsx`
Expected: FAIL

**Step 3: Implement the Spinner component**

```tsx
// platform/components/ui/spinner.tsx
import type { CSSProperties } from 'react'

interface SpinnerProps {
  size?: string
  color?: string
  'data-testid'?: string
}

export function Spinner({ size = '1rem', color = 'currentColor', ...props }: SpinnerProps) {
  const style: CSSProperties = {
    display: 'inline-block',
    width: size,
    height: size,
    border: `2px solid transparent`,
    borderTopColor: color,
    borderRightColor: color,
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    flexShrink: 0,
  }

  return <span style={style} role="status" aria-label="Loading" {...props} />
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/ui/__tests__/spinner.test.tsx`
Expected: 2 tests PASS

**Step 5: Commit**

```bash
git add platform/components/ui/spinner.tsx platform/components/ui/__tests__/spinner.test.tsx
git commit -m "feat: add inline Spinner component for buttons"
```

---

### Task 4: Dashboard Loading Skeleton

Create `loading.tsx` for the player dashboard route.

**Files:**
- Create: `platform/app/(player)/dashboard/loading.tsx`

**Step 1: Create the dashboard loading skeleton**

This file uses the `Skeleton` component to approximate the dashboard layout: 2 stat cards + a table with 5 rows.

```tsx
// platform/app/(player)/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton width="180px" height="1.5rem" style={{ marginBottom: '1.5rem' }} />

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <Skeleton width="100px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="60px" height="1.5rem" />
        </div>
        <div style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <Skeleton width="80px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="40px" height="1.5rem" />
        </div>
      </div>

      {/* Table skeleton */}
      <Skeleton width="200px" height="1rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="2.5rem" />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Verify it renders by starting dev server**

Run: `cd platform && npx next build --no-lint 2>&1 | tail -5`
Expected: Build compiles successfully.

**Step 3: Commit**

```bash
git add "platform/app/(player)/dashboard/loading.tsx"
git commit -m "feat: add dashboard loading skeleton"
```

---

### Task 5: Tournaments List Loading Skeleton

**Files:**
- Create: `platform/app/(player)/tournaments/loading.tsx`

**Step 1: Create the tournaments loading skeleton**

Approximates: filter bar + 8-card grid (4x2).

```tsx
// platform/app/(player)/tournaments/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function TournamentsLoading() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton width="280px" height="1.5rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="320px" height="0.875rem" />
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Skeleton width="140px" height="2.25rem" />
        <Skeleton width="140px" height="2.25rem" />
        <Skeleton width="140px" height="2.25rem" />
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', padding: '1rem' }}>
            <Skeleton width="80%" height="1rem" style={{ marginBottom: '0.75rem' }} />
            <Skeleton width="60%" height="0.875rem" style={{ marginBottom: '0.375rem' }} />
            <Skeleton width="50%" height="0.875rem" style={{ marginBottom: '0.375rem' }} />
            <Skeleton width="40%" height="0.875rem" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add "platform/app/(player)/tournaments/loading.tsx"
git commit -m "feat: add tournaments list loading skeleton"
```

---

### Task 6: Tournament Detail Loading Skeleton

**Files:**
- Create: `platform/app/(player)/tournaments/[id]/loading.tsx`

**Step 1: Create the tournament detail skeleton**

```tsx
// platform/app/(player)/tournaments/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function TournamentDetailLoading() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <Skeleton width="60%" height="1.75rem" style={{ marginBottom: '1rem' }} />

      {/* Meta rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
            <Skeleton width="120px" height="0.875rem" />
            <Skeleton width="200px" height="0.875rem" />
          </div>
        ))}
      </div>

      {/* Description */}
      <Skeleton height="3rem" style={{ marginBottom: '1.5rem' }} />

      {/* Capacity */}
      <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        <Skeleton width="200px" height="0.875rem" />
      </div>

      {/* Register button */}
      <Skeleton height="2.75rem" style={{ borderRadius: 'var(--radius-md)' }} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add "platform/app/(player)/tournaments/[id]/loading.tsx"
git commit -m "feat: add tournament detail loading skeleton"
```

---

### Task 7: Organizer & Admin Dashboard Loading Skeletons

**Files:**
- Create: `platform/app/(organizer)/organizer/dashboard/loading.tsx`
- Create: `platform/app/(admin)/admin/dashboard/loading.tsx`

**Step 1: Create organizer dashboard skeleton**

```tsx
// platform/app/(organizer)/organizer/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function OrganizerDashboardLoading() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Skeleton width="220px" height="1.5rem" />
        <Skeleton width="140px" height="2.25rem" style={{ borderRadius: 'var(--radius-md)' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <Skeleton width="100px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="50px" height="1.5rem" />
          </div>
        ))}
      </div>

      <Skeleton width="160px" height="1rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="2.5rem" />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Create admin dashboard skeleton**

```tsx
// platform/app/(admin)/admin/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardLoading() {
  return (
    <div>
      <Skeleton width="200px" height="1.75rem" style={{ marginBottom: '2rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <Skeleton width="90px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="50px" height="1.5rem" />
          </div>
        ))}
      </div>

      <Skeleton width="140px" height="1rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="2.5rem" />
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add "platform/app/(organizer)/organizer/dashboard/loading.tsx" "platform/app/(admin)/admin/dashboard/loading.tsx"
git commit -m "feat: add organizer and admin dashboard loading skeletons"
```

---

### Task 8: Button Spinner Integration

Update all action buttons to use the Spinner component and `cursor: not-allowed`.

**Files:**
- Modify: `platform/components/tournaments/registration-button.tsx`
- Modify: `platform/components/dashboard/cancel-registration-button.tsx`
- Modify: `platform/components/auth/login-form.tsx`
- Modify: `platform/components/auth/signup-form.tsx`

**Step 1: Update RegistrationButton**

In `platform/components/tournaments/registration-button.tsx`:

Add import at top:
```tsx
import { Spinner } from '@/components/ui/spinner'
```

Replace the button element (lines 143-149):
```tsx
// Old:
<button
  style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
  onClick={handleRegister}
  disabled={loading}
>
  {loading ? 'Registering...' : 'Register for this tournament'}
</button>

// New:
<button
  style={{
    ...styles.button,
    opacity: loading ? 0.7 : 1,
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  }}
  onClick={handleRegister}
  disabled={loading}
>
  {loading && <Spinner size="0.875rem" color="#fff" />}
  {loading ? 'Registering...' : 'Register for this tournament'}
</button>
```

**Step 2: Update CancelRegistrationButton**

In `platform/components/dashboard/cancel-registration-button.tsx`:

Add import at top:
```tsx
import { Spinner } from '@/components/ui/spinner'
```

Replace the confirm button (line 55-57):
```tsx
// Old:
<button style={styles.confirmButton} onClick={handleCancel} disabled={loading}>
  {loading ? '...' : 'Yes, cancel'}
</button>

// New:
<button
  style={{ ...styles.confirmButton, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
  onClick={handleCancel}
  disabled={loading}
>
  {loading && <Spinner size="0.75rem" color="#fff" />}
  {loading ? 'Cancelling...' : 'Yes, cancel'}
</button>
```

**Step 3: Update LoginForm**

In `platform/components/auth/login-form.tsx`:

Add import at top:
```tsx
import { Spinner } from '@/components/ui/spinner'
```

Replace the submit button (line 153-155):
```tsx
// Old:
<button type="submit" disabled={loading} style={formStyles.button}>
  {loading ? 'Logging in...' : 'Log in'}
</button>

// New:
<button
  type="submit"
  disabled={loading}
  style={{ ...formStyles.button, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
>
  {loading && <Spinner size="0.875rem" color="#fff" />}
  {loading ? 'Logging in...' : 'Log in'}
</button>
```

**Step 4: Update SignupForm**

In `platform/components/auth/signup-form.tsx`:

Add import at top:
```tsx
import { Spinner } from '@/components/ui/spinner'
```

Replace the submit button (line 168-170):
```tsx
// Old:
<button type="submit" disabled={loading} style={formStyles.button}>
  {loading ? 'Creating account...' : 'Sign up'}
</button>

// New:
<button
  type="submit"
  disabled={loading}
  style={{ ...formStyles.button, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
>
  {loading && <Spinner size="0.875rem" color="#fff" />}
  {loading ? 'Creating account...' : 'Sign up'}
</button>
```

**Step 5: Run all tests to verify nothing broke**

Run: `cd platform && npx vitest run`
Expected: All tests pass.

**Step 6: Commit**

```bash
git add platform/components/tournaments/registration-button.tsx platform/components/dashboard/cancel-registration-button.tsx platform/components/auth/login-form.tsx platform/components/auth/signup-form.tsx
git commit -m "feat: add spinner and cursor styling to action buttons"
```

---

### Task 9: Sidebar Navigation Hover Effects

Add hover background transition and focus-visible states to the sidebar.

**Files:**
- Modify: `platform/components/layout/sidebar-layout.tsx`

**Step 1: Update the linkStyle function**

In `platform/components/layout/sidebar-layout.tsx`, the `linkStyle` function (lines 25-44) currently has `backgroundColor` that is either active or transparent. We need to keep this as the base but the hover effect needs to be handled differently since inline styles can't handle `:hover`.

Replace the entire `linkStyle` function and add a `NavLink` sub-component that handles hover state:

At the top of the file, after the existing imports, add `useCallback` to the React import. Then replace the `linkStyle` function with:

```tsx
const getLinkStyle = (
  isActive: boolean,
  isHovered: boolean,
  collapsed: boolean
): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: collapsed ? '0.625rem 0' : '0.625rem 0.75rem',
  justifyContent: collapsed ? 'center' : 'flex-start',
  borderRadius: '0.375rem',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: isActive ? 600 : 500,
  color: isActive || isHovered
    ? 'var(--color-brand, #1570ef)'
    : 'var(--color-text-secondary, #8b8b8b)',
  backgroundColor: isActive
    ? 'rgba(21, 112, 239, 0.1)'
    : isHovered
      ? 'rgba(21, 112, 239, 0.08)'
      : 'transparent',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.2s ease, color 0.2s ease',
  outline: 'none',
})
```

Add a `NavLink` component inside the file (before `SidebarLayout`):

```tsx
function NavLink({ href, title, isActive, collapsed, children }: {
  href: string
  title?: string
  isActive: boolean
  collapsed: boolean
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      title={title}
      style={getLinkStyle(isActive, hovered, collapsed)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  )
}
```

Then update all the `<Link>` elements in the nav sections (line 173-183) to use `<NavLink>`:

```tsx
// Replace the Link in the nav sections map:
<NavLink
  key={item.href}
  href={item.href}
  title={collapsed ? item.label : undefined}
  isActive={isActive(item.href)}
  collapsed={collapsed}
>
  <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{item.icon}</span>
  {!collapsed && item.label}
</NavLink>
```

Do the same for bottomItems (line 200-210):

```tsx
<NavLink
  key={item.href}
  href={item.href}
  title={collapsed ? item.label : undefined}
  isActive={isActive(item.href)}
  collapsed={collapsed}
>
  <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{item.icon}</span>
  {!collapsed && item.label}
</NavLink>
```

Also update the collapse toggle button (lines 114-132) to have hover:

Add a `NavButton` component for the sign-out button and collapse button:

```tsx
function NavButton({ onClick, title, collapsed, children, style: extraStyle }: {
  onClick: () => void
  title?: string
  collapsed: boolean
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...getLinkStyle(false, hovered, collapsed),
        background: hovered ? 'rgba(21, 112, 239, 0.08)' : 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}
```

Replace the sign-out button (lines 212-226) with:

```tsx
<NavButton
  onClick={handleSignOut}
  title={collapsed ? 'Sign Out' : undefined}
  collapsed={collapsed}
>
  <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>🚪</span>
  {!collapsed && 'Sign Out'}
</NavButton>
```

Update the collapse button (lines 114-132) to add hover effect:

Replace the existing collapse `<button>` with a version that tracks hover:

Inside `SidebarLayout`, add state:
```tsx
const [collapseHovered, setCollapseHovered] = useState(false)
```

Replace the collapse button:
```tsx
<button
  onClick={() => setCollapsed(!collapsed)}
  onMouseEnter={() => setCollapseHovered(true)}
  onMouseLeave={() => setCollapseHovered(false)}
  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  style={{
    background: collapseHovered ? 'rgba(21, 112, 239, 0.08)' : 'none',
    border: 'none',
    color: collapseHovered ? 'var(--color-brand, #1570ef)' : 'var(--color-text-secondary, #8b8b8b)',
    cursor: 'pointer',
    padding: '0.375rem',
    fontSize: '1.125rem',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '0.375rem',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  }}
>
  {collapsed ? '☰' : '✕'}
</button>
```

**Step 2: Run existing sidebar-related tests**

Run: `cd platform && npx vitest run`
Expected: All tests pass.

**Step 3: Commit**

```bash
git add platform/components/layout/sidebar-layout.tsx
git commit -m "feat: add hover effects and focus states to sidebar navigation"
```

---

### Task 10: Toast Provider & Hook

Create the toast notification system.

**Files:**
- Create: `platform/components/ui/toast.tsx`
- Create: `platform/components/ui/__tests__/toast.test.tsx`

**Step 1: Write the test**

```tsx
// platform/components/ui/__tests__/toast.test.tsx
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ToastProvider, useToast } from '../toast'

function TestComponent() {
  const { toast } = useToast()
  return (
    <button onClick={() => toast({ type: 'success', message: 'It worked!' })}>
      Show toast
    </button>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows toast message when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      screen.getByText('Show toast').click()
    })

    expect(screen.getByText('It worked!')).toBeInTheDocument()
  })

  it('auto-dismisses after 3 seconds', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      screen.getByText('Show toast').click()
    })
    expect(screen.getByText('It worked!')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(3500)
    })
    expect(screen.queryByText('It worked!')).not.toBeInTheDocument()
  })

  it('supports error type', async () => {
    function ErrorTest() {
      const { toast } = useToast()
      return <button onClick={() => toast({ type: 'error', message: 'Failed!' })}>Error</button>
    }

    render(
      <ToastProvider>
        <ErrorTest />
      </ToastProvider>
    )

    await act(async () => {
      screen.getByText('Error').click()
    })
    expect(screen.getByText('Failed!')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd platform && npx vitest run components/ui/__tests__/toast.test.tsx`
Expected: FAIL

**Step 3: Implement the Toast system**

```tsx
// platform/components/ui/toast.tsx
'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: number
  type: ToastType
  message: string
  exiting?: boolean
}

interface ToastContextValue {
  toast: (opts: { type: ToastType; message: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 3000
const EXIT_DURATION = 300

const typeColors: Record<ToastType, string> = {
  success: '#10b981',
  error: '#f04438',
  warning: '#f59e0b',
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ type, message }: { type: ToastType; message: string }) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, EXIT_DURATION)
    }, TOAST_DURATION)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {toasts.map(t => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--color-bg-card, #1f242f)',
                border: '1px solid var(--color-border, #23272f)',
                boxShadow: 'var(--shadow-lg)',
                borderLeft: `3px solid ${typeColors[t.type]}`,
                fontSize: '0.875rem',
                color: 'var(--color-text-primary, #f0f0f0)',
                animation: t.exiting ? 'toast-out 0.3s ease forwards' : 'toast-in 0.3s ease',
                pointerEvents: 'auto',
                minWidth: '240px',
                maxWidth: '400px',
              }}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
```

**Step 4: Run test to verify it passes**

Run: `cd platform && npx vitest run components/ui/__tests__/toast.test.tsx`
Expected: 3 tests PASS

**Step 5: Commit**

```bash
git add platform/components/ui/toast.tsx platform/components/ui/__tests__/toast.test.tsx
git commit -m "feat: add toast notification provider and useToast hook"
```

---

### Task 11: Wire ToastProvider into Root Layout

**Files:**
- Modify: `platform/app/layout.tsx`

**Step 1: Update the root layout**

In `platform/app/layout.tsx`, wrap `{children}` with `<ToastProvider>`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'OPC Europe — Tournament Platform',
  description: 'European Open Poker Championship tournament management platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
```

**Step 2: Run all tests**

Run: `cd platform && npx vitest run`
Expected: All tests pass.

**Step 3: Commit**

```bash
git add platform/app/layout.tsx
git commit -m "feat: wrap root layout with ToastProvider"
```

---

### Task 12: Add Toast to Key User Actions

Integrate `useToast()` into components that perform actions without navigation feedback.

**Files:**
- Modify: `platform/components/tournaments/registration-button.tsx`
- Modify: `platform/components/dashboard/cancel-registration-button.tsx`
- Modify: `platform/components/profile/profile-form.tsx`

**Step 1: Add toast to RegistrationButton**

In `platform/components/tournaments/registration-button.tsx`, add import:
```tsx
import { useToast } from '@/components/ui/toast'
```

Inside the component, add:
```tsx
const { toast } = useToast()
```

After `setRegistered(true)` on line 136, add:
```tsx
toast({ type: 'success', message: 'Registered successfully!' })
```

After `setError(regError.message)` on line 131, add:
```tsx
toast({ type: 'error', message: regError.message })
```

**Step 2: Add toast to CancelRegistrationButton**

In `platform/components/dashboard/cancel-registration-button.tsx`, add import:
```tsx
import { useToast } from '@/components/ui/toast'
```

Inside the component, add:
```tsx
const { toast } = useToast()
```

After `router.refresh()` in `handleCancel`, add before it:
```tsx
toast({ type: 'success', message: 'Registration cancelled' })
```

**Step 3: Add toast to ProfileForm**

In `platform/components/profile/profile-form.tsx`, add import:
```tsx
import { useToast } from '@/components/ui/toast'
```

Inside the component, add:
```tsx
const { toast } = useToast()
```

Replace the success/error message handling in `handleSubmit` (lines 143-148):
```tsx
if (error) {
  setMessage({ type: 'error', text: error.message })
  toast({ type: 'error', message: error.message })
} else {
  setMessage({ type: 'success', text: 'Profile saved!' })
  toast({ type: 'success', message: 'Profile updated' })
  router.refresh()
}
```

**Step 4: Run all tests**

Run: `cd platform && npx vitest run`
Expected: All tests pass. (Toast context will need mocking in some tests — if tests fail because `useToast` is called outside provider, wrap test renders with `<ToastProvider>`. Update the test utility `renderWithProviders` if it exists, or wrap individually.)

**Step 5: Commit**

```bash
git add platform/components/tournaments/registration-button.tsx platform/components/dashboard/cancel-registration-button.tsx platform/components/profile/profile-form.tsx
git commit -m "feat: add toast notifications to registration and profile actions"
```

---

### Task 13: Add Toast to Organizer & Admin Actions

**Files:**
- Modify: `platform/components/organizer/tournament-form.tsx`
- Modify: `platform/components/organizer/results-entry-form.tsx`
- Modify: `platform/components/admin/invite-organizer-form.tsx`
- Modify: `platform/components/admin/points-config-editor.tsx`

**Step 1: Add toast to each component**

For each file, the pattern is the same:
1. Add `import { useToast } from '@/components/ui/toast'`
2. Add `const { toast } = useToast()` inside the component
3. Call `toast({ type: 'success', message: '...' })` after successful actions
4. Call `toast({ type: 'error', message: '...' })` after errors

Specific messages:
- **TournamentForm**: `"Tournament saved"` / `"Tournament created"`
- **ResultsEntryForm**: `"Results saved"`
- **InviteOrganizerForm**: `"Invitation sent to {email}"`
- **PointsConfigEditor**: `"Brackets updated"` / `"Country config updated"` / `"Stats recomputed"`

Read each file fully before making changes. The existing inline feedback messages should remain (they provide immediate visual feedback on the form itself), and toasts add persistent feedback that survives page transitions.

**Step 2: Run all tests**

Run: `cd platform && npx vitest run`
Expected: All tests pass. If toast context errors appear, wrap test components in `<ToastProvider>`.

**Step 3: Commit**

```bash
git add platform/components/organizer/tournament-form.tsx platform/components/organizer/results-entry-form.tsx platform/components/admin/invite-organizer-form.tsx platform/components/admin/points-config-editor.tsx
git commit -m "feat: add toast notifications to organizer and admin actions"
```

---

### Task 14: Fix Any Test Failures from ToastProvider

If any tests failed in Tasks 12-13 because components call `useToast()` outside of a `ToastProvider`, fix them here.

**Files:**
- Possibly modify: test files that render components using `useToast()`

**Step 1: Run full test suite**

Run: `cd platform && npx vitest run`

**Step 2: If tests fail with "useToast must be used within ToastProvider"**

For each failing test file, wrap the render call:

```tsx
import { ToastProvider } from '@/components/ui/toast'

// In the test:
render(
  <ToastProvider>
    <ComponentUnderTest {...props} />
  </ToastProvider>
)
```

**Step 3: Run tests again to verify all pass**

Run: `cd platform && npx vitest run`
Expected: All tests pass.

**Step 4: Commit (only if changes were needed)**

```bash
git add platform/components/**/__tests__/*.test.tsx
git commit -m "test: wrap components in ToastProvider for toast integration"
```

---

### Task 15: Final Verification & Build Check

**Step 1: Run full test suite**

Run: `cd platform && npx vitest run`
Expected: All tests pass (155+ tests).

**Step 2: Run build**

Run: `cd platform && npx next build --no-lint 2>&1 | tail -10`
Expected: Build succeeds.

**Step 3: Visual smoke test**

Start dev server (`npm run dev`) and verify:
- Navigate to `/dashboard` — shimmer skeleton appears briefly
- Navigate to `/tournaments` — card grid skeleton appears
- Hover sidebar nav links — background fades in with blue tint
- Click a register button — spinner appears
- After registration — toast appears in bottom-right, auto-dismisses

**Step 4: Commit any remaining fixes**

If anything needed fixing during visual QA, commit those fixes.
