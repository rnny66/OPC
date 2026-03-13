# OPC Europe — Web Application Scope & Deliverables

**Project:** OPC Europe — European Open Poker Championship
**Document type:** Scope of work — Tournament management web application
**Date:** March 12, 2026
**Version:** 1.0

---

## 1. Project Summary

Design and development of a full-stack tournament management web application for OPC Europe. The application extends the static marketing website with player accounts, tournament registration, organizer tools, automated rankings, identity verification, admin management, and a content management system.

Built with Next.js 15 (App Router, TypeScript), Supabase (auth, database, storage), Payload CMS v3, and Didit identity verification. Deployed on Vercel at `app.opc-europe.com`.

---

## 2. Scope of Work

### 2.1 Foundation & Infrastructure

Setup of the monorepo, authentication system, and database layer.

**Deliverables:**

- Monorepo structure with npm workspaces (`site/`, `platform/`, `supabase/`)
- Next.js 15 app with App Router and TypeScript
- Design system bridge — shared CSS tokens extracted from static site
- Supabase project setup — database, auth, storage
- User authentication — email/password, Google OAuth, Facebook OAuth
- Session management with `@supabase/ssr` (cookie-based, server-side)
- Route protection middleware (public, protected, organizer, admin routes)
- `profiles` table auto-created on signup via trigger
- Testing framework — Vitest + React Testing Library + MSW 2 + Playwright + pgTAP
- 16 seed tournaments across 4 countries

### 2.2 Tournament Flow

Player-facing tournament experience.

**Deliverables:**

- Tournament browse page with server-side filtering (country, series, search)
- Tournament detail page with full event information
- Player registration flow (with capacity check, verification enforcement)
- Player dashboard — registered tournaments, upcoming events
- Player profile page — avatar upload, bio, social links, onboarding flow
- Responsive design matching static site aesthetic

### 2.3 Organizer Tools

Tools for tournament organizers (invite-only role).

**Deliverables:**

- Organizer dashboard with tournament overview and stats
- Tournament CRUD — create, edit, manage tournaments
- Registration management — view registrants, update status (registered, confirmed, cancelled, no_show)
- CSV export of registrations
- Results entry — record placements after tournament completion
- Points calculation engine with configurable brackets and country multipliers

### 2.4 Rankings & Player Profiles

Public leaderboard and rich player profiles.

**Deliverables:**

- Public leaderboard page — searchable, filterable, paginated
- Rank change indicators (up/down/same)
- Slug-based public player profiles (`/players/[slug]`)
- Player stats grid — total points, tournaments played, wins, top-3, average finish
- Achievement badge system — 8 badges with automatic unlock criteria
- Tournament history table per player
- Per-country rankings

### 2.5 Admin Panel

Administrative tools for platform management.

**Deliverables:**

- Admin dashboard with platform-wide statistics
- User management — search users, promote to organizer, view details
- Organizer invitation system — email-based invites with auto-promote on signup
- Tournament oversight — view, cancel, manage all tournaments
- Points bracket configuration — editable placement-to-points mapping
- Country configuration — multipliers and custom brackets per country
- Bulk stats recomputation tool

### 2.6 Identity Verification

Age verification (18+) for regulatory compliance.

**Deliverables:**

- Didit v3 API integration (redirect-based, no client SDK)
- Verification session creation API route
- Webhook handler with HMAC-SHA256 signature validation
- Per-tournament verification enforcement
- Verification status badge on profile and dashboard

### 2.7 Content Management System (CMS)

Self-hosted CMS for the OPC team to manage dynamic content.

**Deliverables:**

- Payload CMS v3 embedded in Next.js (no separate service)
- Admin panel at `/cms` (separate auth from Supabase)
- Three content types: News/Blog posts (with category), Event Announcements (tournament-linked), Media
- Public content pages: `/news`, `/blog`, `/events` with SSR and SEO metadata
- Feature flags to gate CMS routes (cms_admin, cms_news, cms_blog, cms_events)
- Custom tournament selector field for linking announcements to tournaments

---

## 3. Technical Architecture

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15.4.11 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL with RLS) |
| Authentication | Supabase Auth (email + Google + Facebook) |
| File storage | Supabase Storage (avatars bucket) |
| Identity verification | Didit v3 API |
| CMS | Payload CMS v3 (embedded, Lexical rich text) |
| Hosting | Vercel (Pro plan) |
| Email | Brevo (transactional) |
| Unit testing | Vitest 4 + React Testing Library + MSW 2 |
| E2E testing | Playwright |
| DB testing | pgTAP |

### Database

- 15 tables in `public` schema with RLS on all tables
- Payload CMS tables in separate `payload` schema
- Key functions: `calculate_points`, `compute_player_stats`, `check_achievements`
- Triggers for auto-computing stats on results entry and auto-promoting invited organizers

### Security

- Row-Level Security on all tables — no direct data access without policy match
- Role-based access: player, organizer, admin
- Server Components by default, `'use client'` only for interactive forms
- Server Actions for all mutations (no client-side API calls for writes)
- HMAC-SHA256 webhook signature validation for Didit

---

## 4. What Is Not Included

- Mobile native app (iOS/Android)
- Payment processing or entry fee collection
- Live tournament clock or table management
- Chat or messaging between players
- Email marketing or newsletter system
- Multi-language / internationalization (i18n)
- Real-time notifications (push, WebSocket)
- Advanced analytics dashboard
- Domain registration (client-owned)

---

## 5. Summary of Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | Foundation & infrastructure | Monorepo, auth, DB, testing framework |
| 2 | Tournament flow | Browse, detail, register, dashboard, profile |
| 3 | Organizer tools | Tournament CRUD, registrations, results entry, points engine |
| 4 | Rankings & profiles | Leaderboard, player profiles, achievements, country rankings |
| 5 | Admin panel | User management, organizer invitations, tournament oversight, config |
| 6 | Identity verification | Didit integration, webhook handler, per-tournament enforcement |
| 7 | CMS | Payload CMS, news/blog/events, feature flags |

---

## 6. Estimates

> *These estimates cover the web application only — the static site and master ranking system are scoped separately.*

| Phase | Description | Estimated Hours |
|-------|-------------|-----------------|
| Phase 0 — Testing framework | Vitest, MSW 2, Playwright, pgTAP setup | 12 |
| Phase 1 — Foundation | Monorepo, auth, DB, design bridge, middleware | 40 |
| Phase 2 — Tournament flow | Browse, detail, register, dashboard, profile, avatar | 48 |
| Phase 3 — Organizer tools | Dashboard, tournament CRUD, registrations, results entry, points calculation, country points, admin config | 64 |
| Phase 4 — Rankings & profiles | Public leaderboard, player profiles, achievements, responsive | 32 |
| Phase 5 — Admin & verification | Admin panel, user management, organizer invitations, Didit integration | 40 |
| CMS — Payload integration | Payload setup, 3 content types, 3 public pages, feature flags | 24 |
| QA & cross-cutting | Integration testing, E2E tests, DB tests, responsive QA | 16 |
| **Total** | | **276 hours** |

---

## 7. Deployment & Infrastructure

Deployed on the same infrastructure as the static site — no additional hosting costs.

| Service | Role | Already provisioned |
|---------|------|---------------------|
| Vercel Pro | Next.js hosting, SSR, CMS | Yes |
| Supabase Pro | Database, auth, storage | Yes |
| Brevo | Transactional email | Yes (free tier) |
| Didit | Identity verification | Yes (usage-based) |

---

## 8. Relationship to Static Site

The web application and static site coexist as a monorepo:

- **Static site** (`opc-europe.com`) — marketing pages, master ranking, results upload
- **Web application** (`app.opc-europe.com`) — player accounts, tournament management, organizer/admin tools

Both share the same Supabase project and design tokens. The static site can operate independently — the web application is additive.
