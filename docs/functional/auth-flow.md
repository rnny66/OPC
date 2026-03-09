# OPC Platform — Authentication Flow

## Overview

Authentication is handled by **Supabase Auth** with three providers: email/password, Google OAuth, and Facebook OAuth. Sessions are managed via cookies using `@supabase/ssr`, refreshed on every request by Next.js middleware.

## Signup Flow

### Email/Password

```
User fills signup form (/signup)
  ↓
POST to Supabase Auth (signUp)
  ↓
Supabase sends confirmation email
  ↓
User sees "Check your email" message
  ↓
User clicks email link
  ↓
Redirects to /auth/callback?code=...
  ↓
Server exchanges code for session (exchangeCodeForSession)
  ↓
Session cookies set
  ↓
Redirect to /dashboard
  ↓
Trigger fires: profiles row auto-created (id, email)
```

### Google / Facebook OAuth

```
User clicks "Continue with Google/Facebook" on /signup or /login
  ↓
Supabase redirects to OAuth provider
  ↓
User authorizes the app
  ↓
Provider redirects to /auth/callback?code=...
  ↓
Server exchanges code for session
  ↓
Session cookies set
  ↓
Redirect to /dashboard (or original redirect URL)
  ↓
Trigger fires: profiles row auto-created (if new user)
```

## Login Flow

### Email/Password

```
User fills login form (/login)
  ↓
POST to Supabase Auth (signInWithPassword)
  ↓
If success: session cookies set, redirect to /dashboard
If error: show error message (invalid credentials)
```

### OAuth (same as signup — Supabase handles both)

## Session Management

### Middleware (`platform/middleware.ts`)

Every request passes through middleware which:

1. Calls `updateSession()` to refresh the Supabase session via cookies
2. Classifies the route (public, protected, organizer, admin)
3. Applies access rules:

| Route Type | No User | Authenticated | Wrong Role |
|-----------|---------|---------------|------------|
| Public | Allow | Allow (redirect away from /login, /signup) | N/A |
| Protected | Redirect to /login | Allow | N/A |
| Organizer | Redirect to /login | Check role | Redirect to /dashboard |
| Admin | Redirect to /login | Check role | Redirect to /dashboard |

### Route Classification (`lib/auth/routes.ts`)

```
/login, /signup, /verify-*        → public
/dashboard, /profile, /profile/*  → protected
/tournaments/*/register           → protected
/organizer/*                      → organizer
/admin/*                          → admin
/ , /tournaments, /about, etc.    → public (default)
```

### Redirect Handling

- When redirecting to `/login`, the original path is preserved as `?redirect=/original-path`
- After successful login, the user is redirected back to their intended destination
- Logged-in users visiting `/login` or `/signup` are redirected to `/dashboard`

## OAuth Callback Route (`/auth/callback`)

Server-side route handler that:
1. Extracts `code` parameter from URL
2. Creates a Supabase server client with cookie access
3. Calls `exchangeCodeForSession(code)` to complete the OAuth flow
4. Redirects to the `redirect` parameter (default: `/dashboard`)
5. On error, redirects to `/login?error=auth_failed`

## Profile Auto-Creation

A PostgreSQL trigger on `auth.users` automatically creates a `profiles` row:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

The trigger copies `id` and `email` from the auth user. All other profile fields start as null/default. The player must complete their profile (`onboarding_complete = true`) before they can register for tournaments.

## Supabase Client Usage

| Client | File | Use Case |
|--------|------|----------|
| Browser | `lib/supabase/client.ts` | Client Components (forms, buttons) |
| Server | `lib/supabase/server.ts` | Server Components (data fetching) |
| Admin | `lib/supabase/admin.ts` | Admin operations (service role, bypasses RLS) |
| Middleware | `lib/supabase/middleware.ts` | Session refresh in Next.js middleware |
