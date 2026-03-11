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
- **Legal & Compliance** — privacy policy, terms & conditions, responsible gaming
- **Contact** — inquiry form for players, organizers, and partners
- **SEO** — structured data, meta tags, sitemap, and social sharing optimization across all pages

### Content Management (Payload CMS)

A self-hosted admin panel for the OPC team to publish and manage content without developer involvement:

- **News** — announcements, press releases, tournament recaps
- **Blog** — editorial content, strategy articles, player interviews
- **Events** — event listings beyond tournaments (meet-ups, qualifiers, etc.)

---

## Rankings & Tournaments: Static vs Dynamic

The marketing website includes a **Rankings** page and a **Tournaments** page. In their current form, these pages display hardcoded sample data — they look and function like real listings, but the content is manually written into the HTML.

**This means:**

- Adding a new tournament requires a developer to edit the HTML
- Updating rankings after each event is a manual process
- There is no way for players or organizers to interact with the site

**To make Rankings and Tournaments fully functional, a web application layer is needed.** This is a separate workstream that includes:

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

## Delivery Approach

The project is structured so that the static marketing site can launch independently. The CMS and web application are additive — each layer builds on the previous without requiring a rebuild.

| Layer | Purpose | Can launch independently? |
|-------|---------|--------------------------|
| **Static site** | Brand presence, SEO, partner visibility | Yes |
| **CMS** | Team-managed news, blog, events | Yes (adds to static site) |
| **Web application** | Live rankings, tournaments, user accounts | Yes (replaces static data) |

This means OPC Europe can go live quickly with the static site while the more complex functionality is developed in parallel.
