# Phase 1 — Foundation

**Parent plan:** [2026-03-08-tournament-platform-design.md](2026-03-08-tournament-platform-design.md)

## Goal

Set up the monorepo structure, initialize the Next.js app, create Supabase database tables, and implement authentication.

## Tasks

### 1. Monorepo setup
- Move all existing static files (HTML, CSS, assets) into `site/`
- Initialize `platform/` with Next.js (App Router, TypeScript)
- Create root `package.json` with npm workspaces
- Create `supabase/` directory for shared migrations and edge functions
- Update any relative paths in the static site after the move

### 2. Design system bridge
- Extract CSS custom properties from `styles.css` lines 13-36 into a shared `tokens.css`
- Import `tokens.css` in the Next.js app's root layout
- Set up Inter font (400, 500, 600, 700) via `next/font/google`
- Ensure dark theme (`#0c0e12` bg, `#1570ef` accent) carries over

### 3. Supabase migrations
- Create migration: `profiles` table (linked to `auth.users` via trigger)
- Create migration: `tournaments` table (expanded from existing plan with organizer_id, capacity, registration fields, requires_verification)
- Create migration: `tournament_registrations` table
- Create migration: RLS policies for all three tables
- Create DB trigger: auto-create `profiles` row on `auth.users` insert

### 4. Supabase Auth setup
- Configure email/password provider
- Configure Google OAuth provider
- Configure Facebook OAuth provider
- Set up email templates (confirmation, password reset)

### 5. Auth pages
- Build `/login` page (email/password + social login buttons)
- Build `/signup` page (email/password + social login buttons)
- Build `/verify-email` page (confirmation pending state)
- Shared auth layout with OPC branding

### 6. Next.js middleware
- Create `middleware.ts` with route protection rules
- Public routes: `/login`, `/signup`, `/verify-*`
- Protected routes: `/dashboard`, `/profile`, `/tournaments/*/register`
- Role-gated routes: `/organizer/*`, `/admin/*`
- Session refresh via `@supabase/ssr`

### 7. Supabase client setup
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server component client (cookies)
- `lib/supabase/admin.ts` — service role client
- `lib/supabase/middleware.ts` — session refresh helper

## Verification

- [ ] Static site works from `site/` folder with no broken links or assets
- [ ] Next.js app runs at `localhost:3000`
- [ ] Can sign up with email/password, receive confirmation email
- [ ] Can sign up with Google OAuth
- [ ] Email verification flow works end-to-end
- [ ] Middleware blocks unauthenticated users from protected routes
- [ ] Middleware blocks non-organizers from `/organizer/*` routes
- [ ] `profiles` row is auto-created on signup
- [ ] RLS policies prevent unauthorized access (test via Supabase MCP)
