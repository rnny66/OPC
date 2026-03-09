# UI Polish — Design Document

**Goal:** Add loading indicators, navigation hover animations, and toast notifications to make the platform feel responsive, premium, and communicative.

**Architecture:** Pure CSS animations + React context (no external libraries). Three layers implemented in order: loading system, navigation polish, toast feedback.

**Tech:** CSS keyframes in `globals.css`, reusable React components in `components/ui/`, Next.js `loading.tsx` convention, React context for toasts.

---

## Layer A: Skeleton & Loading System

### Shimmer Skeleton Component

Reusable `Skeleton` component at `components/ui/skeleton.tsx`:
- Props: `width`, `height`, `borderRadius`, `style`
- Renders a `<div>` with shimmer animation
- CSS `@keyframes shimmer` in `globals.css` — diagonal gradient sweep using `--color-bg-secondary` base with `rgba(255,255,255,0.04)` highlight

### Route-Level Loading States

Next.js `loading.tsx` files for automatic loading UI during navigation:

| Route | Skeleton Layout |
|-------|----------------|
| `/dashboard` | Stat cards + table rows |
| `/tournaments` | Filter bar + card grid |
| `/tournaments/[id]` | Detail block + button |
| `/organizer/dashboard` | Stat cards + table |
| `/admin/dashboard` | Stat cards |

Each `loading.tsx` composes multiple `<Skeleton>` elements to approximate the page layout.

### Button Loading Spinner

Inline CSS spinner (border-based, no SVG) for buttons during loading:
- Small spinner + loading text (e.g., "Registering...")
- `cursor: not-allowed` + dimmed background
- Replaces current opacity-only approach

### Reduced Motion

`@media (prefers-reduced-motion: reduce)` — shimmer and spinner animations disabled, skeleton renders as static grey block.

---

## Layer B: Navigation Polish

### Sidebar Hover Effect

Three-state background progression on nav links in `sidebar-layout.tsx`:
- Default: `transparent`
- Hover: `rgba(21, 112, 239, 0.08)` — fades in over `0.2s ease`
- Active: `rgba(21, 112, 239, 0.1)` + brand blue text (existing)

### Collapse Button Hover

Same subtle background fill on sidebar toggle button (currently no hover state).

### Focus-Visible States

`outline: 2px solid var(--color-brand)` with `outline-offset: 2px` on all nav links and buttons via `:focus-visible`. Only shows for keyboard users.

### Reduced Motion

Transitions set to `0s` duration under `prefers-reduced-motion`.

---

## Layer C: Toast Notifications

### Toast Provider

`ToastProvider` context + `useToast()` hook at `components/ui/toast.tsx`:
- API: `toast({ type: 'success' | 'error' | 'warning', message: string })`
- Provider wraps the app in root `layout.tsx`

### Toast Appearance

- Fixed bottom-right corner (`z-index: 1000`)
- Dark background (`--color-bg-card`) with left color bar (green/red/amber by type)
- Slides up + fades in on enter, fades out on exit (CSS animation)
- Auto-dismisses after 3 seconds
- Multiple toasts stack vertically

### Integration Points

| Action | Toast Message |
|--------|--------------|
| Register for tournament | "Registered successfully" |
| Cancel registration | "Registration cancelled" |
| Save profile | "Profile updated" |
| Create/edit tournament | "Tournament saved" |
| Save brackets | "Brackets updated" |
| Invite organizer | "Organizer invited" |
| Promote user | "Role updated" |

### Reduced Motion

Toast appears/disappears instantly (no slide/fade) under `prefers-reduced-motion`.

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/ui/skeleton.tsx` | Reusable shimmer skeleton component |
| `components/ui/spinner.tsx` | Inline button loading spinner |
| `components/ui/toast.tsx` | Toast provider, hook, and renderer |
| `app/(player)/dashboard/loading.tsx` | Dashboard skeleton |
| `app/(player)/tournaments/loading.tsx` | Tournament list skeleton |
| `app/(player)/tournaments/[id]/loading.tsx` | Tournament detail skeleton |
| `app/(organizer)/organizer/dashboard/loading.tsx` | Organizer dashboard skeleton |
| `app/(admin)/admin/dashboard/loading.tsx` | Admin dashboard skeleton |

## Files to Modify

| File | Change |
|------|--------|
| `app/globals.css` | Add shimmer keyframe, spinner keyframe, toast animations, reduced motion media query |
| `app/layout.tsx` | Wrap children in `<ToastProvider>` |
| `components/layout/sidebar-layout.tsx` | Add hover background, collapse button hover, focus-visible states |
| `components/tournaments/registration-button.tsx` | Add spinner, cursor, better disabled styling |
| `components/dashboard/cancel-registration-button.tsx` | Add spinner, cursor |
| `components/auth/login-form.tsx` | Add spinner to submit button |
| `components/auth/signup-form.tsx` | Add spinner to submit button |
| `components/organizer/tournament-form.tsx` | Add spinner + toast on save |
| `components/organizer/results-entry-form.tsx` | Add toast on save |
| `components/admin/points-config-editor.tsx` | Add toast on save |
| `components/admin/invite-organizer-form.tsx` | Add toast on invite |
| `components/profile/profile-form.tsx` | Add toast on save |
