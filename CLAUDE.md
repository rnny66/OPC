# OPC — European Open Poker Championship

## Project Overview
Static marketing website for a European poker championship platform, evolving into a full-stack tournament management platform. Dark-themed, premium design built with vanilla HTML/CSS (static site) and Next.js (platform app).

## Tech Stack

### Static Site (current)
- **HTML5** — semantic markup, no frameworks
- **CSS3** — custom properties, flexbox, grid, media queries
- **Vanilla JS** — minimal, for dropdowns, filters, scroll-reveal animations
- **Google Fonts** — Inter (400, 500, 600, 700)
- **No build tools** — static files served directly

### Platform (planned — see `docs/plans/2026-03-08-tournament-platform-design.md`)
- **Next.js** (App Router, TypeScript) — `platform/` directory
- **Supabase** — auth, database, storage, edge functions
- **Didit** — identity verification (age 18+)
- Phases 1–5 detailed in `docs/plans/phase-*.md`

## Project Structure
```
OCP/
├── index.html              # Landing page
├── ranking.html            # Player rankings / leaderboard
├── tournaments.html        # Tournament listing
├── contact.html            # Contact page
├── privacy.html            # Privacy policy
├── terms.html              # Terms & conditions
├── responsible-gaming.html # Responsible gaming
├── styles.css              # Single shared stylesheet
├── assets/
│   ├── img/                # Images, logos, photos
│   ├── flags/              # Country flag SVGs
│   ├── flag-eu.svg         # Flag icons (root-level)
│   └── flag-nl.svg
├── designs/                # Figma design screenshots (reference only)
├── docs/
│   ├── STYLE_GUIDE.md      # Design system reference
│   └── plans/              # Implementation plans (phases 1–5 + feature plans)
└── future-features/        # Placeholder for upcoming work
```

## Design System
- **Theme:** Dark mode (`#0c0e12` bg) with blue accent (`#1570ef`)
- **Font:** Inter, weights 400–700
- **All design tokens** live as CSS custom properties in `:root` of `styles.css`
- **Full reference:** See `docs/STYLE_GUIDE.md`

## Code Conventions

### CSS
- Use CSS custom properties (`var(--color-*)`) — never hardcode colors
- BEM-inspired class naming: `.component`, `.component-element`, `.component--modifier`
- Section comments: `/* --- Section Name --- */`
- Responsive styles grouped at the end of `styles.css`, by breakpoint
- Breakpoints: 1200px, 992px, 640px
- Transitions: `0.2s ease` for interactive states

### Animations
- **Hero entrance:** `fadeInUp` keyframe animation on `.hero-title`, `.hero-subtitle`, `.hero-actions` with staggered delays (0s, 0.15s, 0.3s)
- **Scroll reveal:** `.reveal` class (opacity 0, translateY 24px) → `.reveal--visible` added via JS IntersectionObserver
- **Staggered children:** `.reveal-stagger > .reveal:nth-child(n)` with incremental `transition-delay` (0.08s steps)
- **Marching dashes:** `marchDown` keyframe on `.how-steps-line path` for animated SVG connector lines
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all animations and transitions
- All animation CSS lives in the `/* --- Animations --- */` section at the end of `styles.css`

### HTML
- Semantic elements: `<header>`, `<section>`, `<footer>`, `<nav>`, `<aside>`
- Inline SVG for icons — no icon fonts or external sprite sheets
- Alt text required on all images
- Page title format: `Page Name — OPC Europe`
- Header and footer are duplicated per page (no templating)

### General
- No external CSS frameworks (Bootstrap, Tailwind, etc.)
- No JavaScript frameworks (React, Vue, etc.) for the static site
- Keep it simple — this is a static marketing site
- All mock data is hardcoded in HTML for now
- Future database: Supabase (integration planned in platform phases)

## Creating New Pages
1. Copy the `<head>` block from `index.html` (includes fonts, favicon, viewport)
2. Reuse the same `<header>` and `<footer>` markup
3. Add page-specific styles to `styles.css` under a new section comment
4. Link from the navigation in all existing pages
5. Follow the design in `designs/` folder if a Figma screenshot exists
6. Add `.reveal` classes to content sections for scroll-reveal animations
7. Include the scroll-reveal JS snippet (IntersectionObserver) if the page has reveal elements

## Testing & Verification
- **Always use TDD:** Use the `superpowers:test-driven-development` skill for all feature work
- **Test before done:** No feature is considered complete until it has been properly tested and verified
- **Visual QA:** Compare implementation against Figma designs side-by-side
- **Responsive testing:** Verify at all three breakpoints (1200px, 992px, 640px)
- **Cross-page consistency:** Check header, footer, and nav links work across all pages
- **Animation testing:** Verify scroll-reveal triggers, reduced-motion fallback works
- **Accessibility:** Alt text present, keyboard navigation works, color contrast meets WCAG AA

## Documentation Requirements
- **Document every feature** after implementation — update relevant docs and plans
- **Update CLAUDE.md and skills after every phase** — keep project knowledge current
- If a new pattern or component is introduced, add it to the style guide and relevant skills
- Mark completed plan tasks/phases as done in the plan documents

## Figma Integration
- Design screenshots live in `designs/`
- MCP Figma tools are available for fetching design context
- Always match the Figma design as closely as possible

## Plans
- **Masterplan:** `docs/plans/2026-03-08-tournament-platform-design.md` — full platform architecture
- **Phase plans:** `docs/plans/phase-{1..5}-*.md` — detailed implementation phases
- **Feature plans:** `docs/plans/YYYY-MM-DD-feature-name.md` — individual feature plans
- Plans should be detailed enough for task-by-task execution
- Use `superpowers:executing-plans` skill to implement plans

## Git Conventions
- Commit format: `type: description` (e.g., `feat: add ranking page`, `fix: adjust spacing`)
- Types: `feat`, `fix`, `refactor`, `docs`, `style`
- One logical change per commit
