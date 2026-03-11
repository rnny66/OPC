# OPC Europe — Static Website Scope & Deliverables

**Project:** OPC Europe — European Open Poker Championship
**Document type:** Scope of work — Static marketing website
**Date:** March 11, 2026
**Version:** 1.0

---

## 1. Project Summary

Design and development of a premium, dark-themed marketing website for the European Open Poker Championship (OPC Europe). The site serves as the public-facing brand presence, presenting tournament information, player rankings, country-specific landing pages, and legal/compliance content.

The website is built as a fully static site (HTML, CSS, vanilla JavaScript) — no frameworks, no build tools — ensuring fast load times, easy hosting, and zero ongoing infrastructure costs.

---

## 2. Scope of Work

### 2.1 Design System & Foundation

A custom design system built from scratch, providing a consistent visual identity across all pages.

**Deliverables:**

- Dark-themed premium design (`#0c0e12` background, `#1570ef` blue accent)
- Full CSS custom property (token) system for colors, spacing, typography, borders, and shadows
- Typography system using Inter font (weights 400–700) with defined scale from body to hero headings
- Reusable component library: buttons, cards, navigation, dropdowns, form elements, stat cards, partner logos, footer
- Responsive framework with three breakpoints (1200px, 992px, 640px — desktop, tablet, mobile)
- Scroll-reveal animation system with IntersectionObserver (fade-in + translateY transitions)
- Staggered child animations for card grids and lists
- Animated SVG connector lines (marching dashes) for step-by-step sections
- Hero entrance animations with staggered delays
- Reduced motion support (`prefers-reduced-motion` media query)
- Sticky header with scroll-triggered background transition
- Mobile hamburger navigation with full-screen overlay

### 2.2 Homepage

The main landing page, designed to convert both players and tournament organizers.

**Deliverables:**

- Hero section with headline, subtitle, and dual CTA buttons (View Rankings, Organizer CTA)
- Hero image showcase
- Stats bar (250+ players, 20+ tournaments, 5 countries, avatar group)
- "What is OPC?" section with image and description
- "Why Join OPC?" — two benefit cards (Players vs Organizers) with check-list items
- "How It Works" — two-column step-by-step flow (Players and Organizers), each with 3 steps, animated SVG connector lines, and footer CTA
- Latest News section with links to News, Blog, and Events
- Upcoming Events section — 4 tournament event cards with flag, venue, date, and entry info
- Founders section — two founder profiles (Marcel Luske, Noah Boeken) with photos, bios, and read-more links
- Partners section — logo row + join-network CTA

### 2.3 Tournaments Page

A filterable tournament listing page displaying upcoming events.

**Deliverables:**

- Page header with title and description
- Search input for finding tournaments by name
- Country filter dropdown (Netherlands, Belgium, Germany, England, Poland, Austria)
- Tournament card grid layout
- Each card displays: tournament name, venue/partner logo, country flag, location, date, and entry fee
- "View Details" link per card
- Pagination controls
- Responsive grid (3 columns → 2 → 1)

### 2.4 Rankings Page

A public leaderboard displaying player rankings with mock data.

**Deliverables:**

- Page header with title
- Search input for finding players by name
- Country filter dropdown
- Rankings table with columns: rank, player name, nationality (flag), points, tournaments played, wins
- 20 rows of mock player data
- "How Rankings Work" sidebar explanation panel
- Pagination controls
- Responsive table layout (horizontal scroll on mobile)

### 2.5 Country Landing Pages

Dedicated landing pages for each country where OPC operates, designed for local SEO and partner visibility.

**Countries (6 total):**

| Country | Status |
|---------|--------|
| Netherlands | Complete |
| Germany | Complete |
| England | Complete |
| Poland | Complete |
| Belgium | Complete |
| Austria | Complete |

**Each country page includes:**

- Hero section with country flag and "OPC [Country]" heading
- Local Partners section — 3-card grid for partner venues (placeholder content, ready for real partner data)
- Upcoming Events section — 2 tournament event cards with local venue details
- "Poker in [Country]" — editorial section about the local poker scene
- CTA section — "Register as Player" and "Become Partner" buttons
- All sections with scroll-reveal animations

### 2.6 Tournament Detail Page

A dedicated detail page for individual tournaments, providing full event information to prospective players.

**Deliverables:**

- Breadcrumb navigation (Home > Tournaments > Tournament Name)
- Hero section with country flag, tournament name, series badge, and key meta info (date, venue, entry type)
- "Register Now" and "All Tournaments" CTA buttons
- About This Tournament section — 2-3 paragraphs describing the event
- Schedule & Format section — 4-day schedule grid (Day 1–4 with event breakdown) and format info cards (blind levels, starting stack, structure)
- Venue section — two-column layout with venue name, address, description, and placeholder image
- Related Tournaments section — 3 tournament cards linking to other events, plus "View All Tournaments" button
- CTA section — "Register as Player" and "View All Tournaments" buttons
- JSON-LD structured data (`Event` schema with start/end date, location, organizer)
- All tournament cards on the Tournaments page, homepage, and country pages link to this detail page
- Responsive at all three breakpoints (desktop, tablet, mobile)
- CSS classes use `.td-*` prefix (tournament detail)

### 2.7 About Us Page

A dedicated page introducing OPC Europe, its mission, and its founders.

**Deliverables:**

- About OPC section with mission statement and background
- Founder profiles (Marcel Lüske, Noah Boeken) with photos and bios
- Consistent header/footer
- Linked from the "About OPC" dropdown and founder "Read full story" buttons on the homepage

### 2.8 Contact Page

**Deliverables:**

- Contact form with input fields
- Support/partnership information
- Consistent header/footer

### 2.9 Legal & Compliance Pages

Three legal pages required for regulatory compliance.

**Deliverables:**

- **Privacy Policy** — GDPR-compliant privacy policy covering data collection, usage, and user rights
- **Terms & Conditions** — Platform terms of use, user responsibilities, and disclaimers
- **Responsible Gaming** — Educational content about responsible gambling, self-exclusion resources, and age verification policy

### 2.10 SEO & Technical Optimization

Search engine optimization and technical best practices applied across all pages.

**Deliverables:**

- Unique `<title>` and `<meta description>` tags per page
- Canonical URLs (`<link rel="canonical">`) on every page
- Open Graph meta tags (title, description, image, URL, type, site_name) for social sharing on Facebook, LinkedIn, etc.
- Twitter Card meta tags (summary_large_image) for Twitter/X sharing
- JSON-LD structured data:
  - `Organization` schema on homepage
  - `WebSite` schema on homepage
  - `BreadcrumbList` schema on country pages
- `sitemap.xml` covering all 13 public URLs with appropriate change frequencies and priority values
- `robots.txt` with sitemap reference and blocked draft pages
- Semantic HTML5 throughout (`<header>`, `<nav>`, `<section>`, `<footer>`, `<main>`)
- Alt text on all images
- `loading="lazy"` on below-fold images
- Font preconnect hints for Google Fonts
- Favicon configuration

### 2.11 Global Components

Shared components consistent across every page.

**Deliverables:**

- **Header navigation** — logo, 6 nav items (Home, Rankings, Tournaments, News, Countries dropdown, About OPC dropdown), "How to join" CTA button
- **Countries dropdown** — 6 country links in mega-menu style
- **About OPC dropdown** — About, Contact, Responsible Gaming links
- **Mobile navigation** — hamburger toggle, full-screen overlay menu, auto-close on link tap
- **Footer** — 4-column link grid (About, For Players, For Organizers, Legal), brand logo, copyright

---

## 3. Phase 2 — Content Management System (CMS) & Dynamic Content

A headless CMS integration using Payload CMS v3, providing a self-hosted admin interface for managing dynamic content. This is Phase 2 of the project, to be implemented after the static site is complete.

**Phase 2 replaces the current placeholder pages (news.html, blog.html, events.html) with dynamic CMS-powered pages.**

### 3.1 CMS Setup

- Payload CMS v3 installation and configuration
- Admin panel for content editors
- Integration with the existing site design system

### 3.2 Content Types

- **News** — articles with title, body, date, featured image, and category
- **Blog** — long-form posts with rich text editor, author, tags, and publish date
- **Events** — event listings with date, location, description, and registration links

### 3.3 Public Pages

- `/news` — News listing page with latest articles (replaces `news.html` placeholder)
- `/blog` — Blog listing page (replaces `blog.html` placeholder)
- `/events` — Events listing page (replaces `events.html` placeholder)
- Individual detail pages for each content type

### 3.4 Navigation Integration

- News, Blog, and Events nav links updated to point to CMS-powered pages
- Links from the homepage Latest News section updated accordingly

---

## 4. Deployment & Go-Live

Setup and configuration of production infrastructure to launch the website.

**Deliverables:**

- Vercel project creation and production deployment configuration
- DNS configuration — pointing the client's domain to Vercel (A/CNAME records)
- SSL certificate provisioning (automatic via Vercel)
- Supabase project provisioning — production database, auth configuration, RLS policies
- Brevo account setup — transactional email templates (verification, password reset), SMTP integration, sender domain authentication (SPF/DKIM)
- Environment variables and secrets configuration
- Production smoke testing and launch verification

---

## 5. Summary of Deliverables

### Phase 1 — Static Site

| # | Deliverable | Pages/Items |
|---|-------------|-------------|
| 1 | Design system & CSS framework | 1 stylesheet (~2,700 lines) |
| 2 | Homepage | 1 page, 8 sections |
| 3 | Tournaments page | 1 page |
| 4 | Tournament detail page | 1 page, 6 sections |
| 5 | Rankings page | 1 page |
| 6 | Country landing pages | 6 pages |
| 7 | About Us page | 1 page |
| 8 | Contact page | 1 page |
| 9 | Privacy Policy | 1 page |
| 10 | Terms & Conditions | 1 page |
| 11 | Responsible Gaming | 1 page |
| 12 | Coming-soon placeholders (News, Blog, Events) | 3 pages |
| 13 | SEO optimization | All pages + sitemap + robots.txt |
| 14 | Deployment & go-live | Vercel, DNS, SSL |
| **Phase 1 Total** | | **19 static pages + deployment** |

### Phase 2 — CMS & Dynamic Content

| # | Deliverable | Pages/Items |
|---|-------------|-------------|
| 1 | CMS (Payload v3) | Admin panel + 3 content types |
| 2 | News, Blog, Events pages | 3 dynamic pages (replace placeholders) |
| 3 | Supabase & Brevo setup | Database, auth, transactional email |
| **Phase 2 Total** | | **CMS admin + 3 dynamic pages** |

---

## 6. Technical Specifications

| Attribute | Detail |
|-----------|--------|
| Technology | HTML5, CSS3, vanilla JavaScript |
| Frameworks | None (zero dependencies) |
| CMS | Payload CMS v3 (self-hosted, headless) |
| Fonts | Google Fonts (Inter 400–700) |
| Hosting | Any static host (GitHub Pages, Netlify, Vercel, S3, etc.) |
| Browser support | Modern browsers (Chrome, Firefox, Safari, Edge — last 2 versions) |
| Responsive | Desktop, tablet (992px), mobile (640px) |
| Accessibility | Semantic HTML, alt text, keyboard navigation, WCAG AA contrast |
| Performance | No build step, no JS frameworks, lazy-loaded images |

---

## 7. What Is Not Included

- User authentication or login functionality
- Database or backend API development
- Tournament registration or booking system
- Payment processing
- Player dashboard or account management
- Email marketing or newsletter system
- Multi-language / internationalization (i18n)
- Ongoing content writing (copy provided by client or as separate engagement)
- Photography or custom illustration
- Domain registration (assumed client-owned)
- Ongoing hosting costs (estimated separately)

---

## 8. Estimates

> *This section is provided as a guideline and can be adjusted based on discussion.*

### Phase 1 — Static Site

| Task | Description | Estimated Hours |
|------|-------------|-----------------|
| Design system & foundation | Tokens, components, responsive framework, animations | 24 |
| Homepage | Full landing page with 8 sections | 16 |
| Tournaments page | Listing, filters, cards, pagination | 10 |
| Tournament detail page | Hero, schedule, venue, related tournaments, CTA | 8 |
| Rankings page | Table, filters, sidebar, pagination | 10 |
| Country pages (6) | Template + 6 country variants | 14 |
| About Us page | Mission, founder profiles | 4 |
| Contact page | Form and layout | 4 |
| Legal pages (3) | Privacy, terms, responsible gaming | 6 |
| Coming-soon pages (3) | News, blog, events placeholders | 2 |
| SEO & technical | Meta tags, structured data, sitemap, robots.txt | 8 |
| QA & cross-browser testing | Desktop, tablet, mobile across browsers | 8 |
| Deployment & go-live | Vercel setup, DNS, SSL, launch | 4 |
| **Phase 1 Total** | | **118 hours** |

### Phase 2 — CMS & Dynamic Content

| Task | Description | Estimated Hours |
|------|-------------|-----------------|
| CMS integration (Payload) | Setup, 3 content types, 3 public pages, admin panel | 20 |
| Supabase & Brevo setup | Database provisioning, auth, transactional email | 6 |
| QA & testing | CMS content flow, public page rendering | 4 |
| **Phase 2 Total** | | **30 hours** |
