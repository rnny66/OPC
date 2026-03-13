# OPC Europe — Executive Summary

**Project:** OPC Europe — European Open Poker Championship
**Date:** March 11, 2026

---

## Vision

OPC Europe is a new European poker championship brand founded by Marcel Luske and Noah Boeken. The website serves as the central hub for players, tournament organizers, and partners across Europe.

The goal is a premium, modern web presence that establishes OPC Europe as a credible and professional championship brand from day one.

---

## What We're Building

### Marketing Website

A fully custom-designed, mobile-responsive website with a dark premium aesthetic. No templates, no WordPress — built from scratch to match the OPC brand identity.

The site includes:

- **Homepage** — hero section, value propositions for players and organizers, upcoming events, founder profiles, partner logos
- **Tournaments** — browsable listing of upcoming tournaments with search and country filters
- **Rankings** — public leaderboard showing player standings, points, and tournament history
- **Country Pages** — dedicated landing pages for each country OPC operates in (Netherlands, Germany, England, Poland, Belgium, Austria), highlighting local partners and events
- **Partner Pages** — individual showcase pages for each OPC partner (Luxon Pay, International Poker Rules, Juice Brothers, Poker Arend) with partner overview listing
- **Legal & Compliance** — privacy policy, terms & conditions, responsible gaming
- **Contact** — dedicated cards for players, organizers, partners, and general inquiries, with mailto links for partner/general contact
- **Interest Signup** — email collection page for players and organizers to express interest, with type pre-selection via URL parameters, honeypot spam protection, and data stored in Supabase
- **Master Ranking** — live leaderboard powered by Supabase, displaying 601+ players with search, country filter, and pagination
- **Results Upload** — password-protected internal tool for organizers to upload tournament results (CSV/XLSX) with fuzzy player name matching
- **SEO** — structured data, meta tags, sitemap, and social sharing optimization across all pages

### Domain Strategy: Single Domain with Country Pages

OPC Europe uses a single domain (`europe-opc.com`) with country-specific subpages (e.g., `europe-opc.com/netherlands`) rather than separate domains per country (e.g., `dutch-opc.com`, `german-opc.com`). This approach is superior in every dimension:

- **SEO** — All pages contribute to one domain's authority. Every backlink to any country page strengthens the entire site. Separate `.com` domains provide zero geo-targeting benefit (only country-code TLDs like `.nl` do) and would each start from zero authority.
- **Maintenance** — One deployment, one SSL certificate, one analytics setup, one sitemap. Separate domains would mean managing 7+ websites with duplicated deployments, DNS configurations, and updates.
- **Cost** — One hosting setup instead of 7. No extra domain registrations or separate hosting bills.
- **Brand** — `europe-opc.com/netherlands` clearly communicates a unified European brand. Separate domains fragment the brand and confuse users about whether the sites are related.

Separate country domains only make sense when countries operate independently with different languages, content teams, and designs — which is not the case for OPC Europe.

### Content Management (Payload CMS)

A self-hosted admin panel for the OPC team to publish and manage content without developer involvement:

- **News** — announcements, press releases, tournament recaps
- **Blog** — editorial content, strategy articles, player interviews
- **Events** — event listings beyond tournaments (meet-ups, qualifiers, etc.)

---

## Rankings & Tournaments: Static vs Dynamic

The marketing website includes a **Rankings** page and a **Tournaments** page. The Rankings page has been upgraded with a **Master Ranking system** — a lightweight Supabase-backed solution that replaced the original hardcoded mock data with live data from 601+ real players. Organizers can upload tournament results via a password-protected upload page (CSV or XLSX files) with fuzzy name matching, and rankings update automatically.

The Tournaments page still displays hardcoded sample data — it looks and functions like a real listing, but the content is manually written into the HTML.

**This means:**

- The Rankings page is now **fully live** — data is stored in Supabase and updated via results upload
- Adding a new tournament still requires a developer to edit the HTML
- There is no way for players or organizers to interact with tournaments on the site

**To make Tournaments fully functional and to add player accounts, a web application layer is needed.** This is a separate workstream that includes:

| Capability | What It Requires |
|------------|-----------------|
| Live tournament listings | Organizer accounts, tournament creation tools, approval workflow |
| Automatic rankings | Player accounts, result entry after each tournament, points calculation engine |
| Player profiles | User registration, profile management, tournament history |
| Registration | Players register for tournaments online, organizers manage attendee lists |
| Identity verification | Age verification (18+) for regulatory compliance |

Without the web application, the Rankings and Tournaments pages remain static — functional as marketing pages but requiring manual updates for every change. With the web application, the entire system becomes self-service: organizers create tournaments, enter results, and rankings update automatically.

**The web application is a significantly larger investment than the static site.** It involves backend infrastructure (database, authentication, role-based access), server-side logic, and ongoing hosting. It can be built incrementally — starting with the static site and layering in dynamic functionality over time.

---

## Phased Roadmap

The project is structured so that each phase can launch independently. Every layer builds on the previous without requiring a rebuild.

| Phase | Purpose | Can launch independently? |
|-------|---------|--------------------------|
| **Phase 1 — Marketing Website** | Brand presence, SEO, partner visibility, live rankings | Yes |
| **Phase 2 — Tournament Platform** | Organizer tools, player accounts, live tournaments | Yes (replaces static data) |
| **Phase 3 — Marketing & Gamification** | Email campaigns, engagement mechanics, partner value | Yes (adds to platform) |

### Phase 1 — Marketing Website *(being delivered)*

A fully custom-designed, mobile-responsive website covering all pages described above — homepage, tournaments, rankings, country pages, partner pages, legal, contact, and CMS.

The site includes a **dynamic ranking system** connected to a Supabase database with 601+ real players. Tournament organizers (such as Poker Arend) can upload results via a password-protected tool that accepts CSV and XLSX files. The system automatically matches player names, calculates points, and updates the live leaderboard — no developer involvement needed.

**Demo:** [Ranking system walkthrough](https://www.loom.com/share/38445dc55b7a4cfdaf57acf2f0caee82)

The Tournaments page is currently populated with sample data. It looks and functions like a real listing, but tournament content is static — this becomes fully dynamic in Phase 2 once the tournament database and organizer tools are in place.

**Remaining to complete:** deployment to Cloudflare Pages, DNS configuration, and SEO optimization.

### Phase 2 — Tournament Organization Platform

This phase turns the static site into a self-service platform for organizers and players.

- **Organizer accounts** — tournament organizers can create and manage their own tournaments
- **Tournament publishing** — tournaments can be published on the organizer's own website or automatically listed on the OPC tournaments page, so players can discover and register for events through either channel
- **Player accounts** — players create an account to track their stats, view the leaderboard, and register for tournaments
- **Registration** — players register online through the OPC site or the organizer's site; organizers manage attendee lists and can manually add walk-in participants who don't have an account
- **Results management** — after a tournament, organizers upload results directly from the platform by selecting registered players, with support for manually added participants. Points and rankings update automatically

This phase replaces the static tournaments page with a fully live, self-service system.

### Phase 3 — Marketing, Gamification & Partner Value

- **Marketing emails & reminders** — automated communications around upcoming tournaments, registration confirmations, results notifications, and re-engagement campaigns
- **Gamified experience** — achievements, streaks, and engagement mechanics that keep players active on the platform and coming back for more
- **Partner value** — with a growing database of players and organizers, OPC can offer measurable reach and engagement to current and prospective partners. The sooner this database is built (Phase 2), the sooner partner relationships deliver concrete commercial value

This means OPC Europe can go live quickly with the marketing website (Phase 1) while the tournament platform and engagement features are developed in parallel.

---

## Technology Stack

The project uses a small set of core services. All are industry-standard, well-supported, and used by thousands of companies worldwide.

**Cloudflare Pages** *(Phase 1)* — Static site hosting. Cloudflare Pages serves the marketing website via one of the world's largest CDN networks (275+ edge locations), with particularly strong coverage across Europe. It handles SSL certificates, deployments, and caching automatically. When code is pushed to GitHub, the new version is published within seconds. The free tier includes unlimited bandwidth, unlimited requests, and 500 builds per month — more than sufficient for the marketing site. There is no cost.

**Vercel** *(Phase 2+)* — Application hosting platform. When the tournament platform and CMS launch, Vercel will host the Next.js application including server-side rendering, API routes, and the Payload CMS admin panel. It is purpose-built for Next.js and handles scaling automatically.

**Supabase** — Backend-as-a-service. Supabase provides the database (PostgreSQL), user authentication (login/signup), and file storage in a single managed platform. Instead of setting up and maintaining our own servers and database, Supabase handles all of this with automatic backups, security, and uptime monitoring. It is also used by Payload CMS to store content. The free tier covers Phase 1 (ranking data, results upload); Pro is needed from Phase 2 onward.

**Payload CMS** — Content management system. Payload provides an admin panel (similar in concept to WordPress) where the OPC team can create and manage news articles, blog posts, and events without needing a developer. It is open source and free — there is no license fee. It runs as part of the website on Vercel and stores its data in Supabase.

**Brevo** — Transactional email service. Brevo handles automated emails sent by the platform — account verification, password resets, registration confirmations, and notifications. These are not marketing emails; they are system emails triggered by user actions. Brevo ensures reliable delivery and provides branded email templates.

---

## Cost Breakdown

### One-Time: Development

| Phase | Description | Estimated Hours |
|-------|-------------|-----------------|
| Design system & foundation | Tokens, components, responsive framework, animations | 24 |
| Homepage | Full landing page with 8 sections | 16 |
| Tournaments page | Listing, filters, cards, pagination | 10 |
| Rankings page | Table, filters, sidebar, pagination | 10 |
| Master ranking system | Database schema, data migration (601 players), live ranking page, results upload page with fuzzy matching | 18 |
| Country pages (6) | Template + 6 country variants | 14 |
| Contact page | Form and layout | 4 |
| Legal pages (3) | Privacy, terms, responsible gaming | 6 |
| SEO & technical | Meta tags, structured data, sitemap, robots.txt | 8 |
| CMS integration (Payload) | Setup, 3 content types, 3 public pages, admin panel | 20 |
| QA & cross-browser testing | Desktop, tablet, mobile across browsers | 8 |
| Deployment & go-live | Cloudflare Pages setup, DNS configuration, Supabase provisioning, SSL, production launch | 6 |
| **Total** | | **144 hours** |

> Web application development (live rankings, tournaments, user accounts) is scoped separately.

### Recurring: Hosting & Infrastructure

Hosting costs are structured by phase. Phase 1 (marketing website) runs entirely on free tiers — **there are no hosting costs until the tournament platform launches**.

#### Phase 1 — Marketing Website: $0/mo

| Service | What It Covers | Plan | Monthly Cost |
|---------|---------------|------|-------------|
| **Cloudflare Pages** | Static site hosting, global CDN, SSL | Free | $0 |
| **Supabase** | PostgreSQL database (ranking data, results upload) | Free | $0 |
| **Total** | | | **$0/mo** |

- **Cloudflare Pages Free** includes unlimited bandwidth, unlimited requests, and 500 builds/month. The site is served from 275+ edge locations worldwide with automatic SSL. There are no commercial-use restrictions on the free tier.
- **Supabase Free** includes 500 MB database, 50K monthly active users, and 1 GB file storage. More than sufficient for the ranking system (601 players, results upload).

#### Phase 2+ — Tournament Platform: ~$45/mo

| Service | What It Covers | Plan | Monthly Cost |
|---------|---------------|------|-------------|
| **Vercel** | Next.js hosting, server-side rendering, CMS deployment | Pro (1 seat) | $20/mo |
| **Supabase** | PostgreSQL database, user authentication, file storage | Pro (with spend cap) | $25/mo |
| **Payload CMS** | Content management admin panel | Open source (free) | $0 |
| **Cloudflare Pages** | Static marketing site (continues) | Free | $0 |
| **Total** | | | **$45/mo** |

- **Vercel Pro** is needed for the Next.js application (server-side rendering, API routes, CMS). Includes 1 TB bandwidth and 10M edge requests/month.
- **Supabase Pro** is needed for user authentication, increased storage, and daily backups. The spend cap locks the bill at exactly $25/mo.
- **Payload CMS** is open source (MIT license) and runs as part of the Next.js app on Vercel — no additional hosting or license cost.
- The static marketing site continues to run on Cloudflare Pages at no cost.

### Other Costs

| Item | Cost | Notes |
|------|------|-------|
| **Domain name** | ~€10–15/yr | Already owned by client. Annual renewal only. |
| **Transactional email (Brevo)** | $0 | Free tier includes 300 emails/day (9,000/mo). Covers account verification, password resets, and notifications. More than sufficient at launch. Starter plan at $9/mo if volume grows beyond 300/day. Only needed from Phase 2. |
| **Analytics** | $0 | Cloudflare Web Analytics (free, privacy-friendly) for Phase 1. Vercel Analytics included on Pro from Phase 2. |
| **SSL certificate** | $0 | Included with Cloudflare (Phase 1) and Vercel (Phase 2+). |
| **CDN** | $0 | Included with Cloudflare Pages (275+ global edge locations). |
| **Identity verification** | Usage-based | Required only for the web application phase. Provider costs (e.g., Didit, Onfido) vary by volume — typically €0.50–2.00 per verification. |

### Cost Summary

| Category | Cost |
|----------|------|
| Development (one-time) | 144 hours |
| Phase 1 hosting (monthly) | **$0/mo** |
| Phase 2+ hosting (monthly) | ~$45/mo |
| Transactional email (Brevo) | $0 (free tier) |
| Domain (annual) | ~€10–15/yr (client-owned) |
