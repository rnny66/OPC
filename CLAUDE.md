# OPC — European Open Poker Championship

## Project Overview
Static website for a European poker championship platform. Dark-themed, premium design built with vanilla HTML/CSS.

## Tech Stack
- **HTML5** — semantic markup, no frameworks
- **CSS3** — custom properties, flexbox, grid, media queries
- **Vanilla JS** — minimal, only for dropdown/filter interactions
- **Google Fonts** — Inter (400, 500, 600, 700)
- **No build tools** — static files served directly

## Project Structure
```
OCP/
├── index.html              # Landing page
├── styles.css              # Single shared stylesheet
├── assets/
│   ├── img/                # Images, logos, photos
│   ├── flag-eu.svg         # Flag icons (root-level)
│   └── flag-nl.svg
├── designs/                # Figma design screenshots (reference only)
├── docs/
│   ├── STYLE_GUIDE.md      # Design system reference
│   └── plans/              # Implementation plans
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

### HTML
- Semantic elements: `<header>`, `<section>`, `<footer>`, `<nav>`, `<aside>`
- Inline SVG for icons — no icon fonts or external sprite sheets
- Alt text required on all images
- Page title format: `Page Name — OPC Europe`
- Header and footer are duplicated per page (no templating)

### General
- No external CSS frameworks (Bootstrap, Tailwind, etc.)
- No JavaScript frameworks (React, Vue, etc.)
- Keep it simple — this is a static marketing site
- All mock data is hardcoded in HTML for now
- Future database: Supabase (not yet integrated)

## Creating New Pages
1. Copy the `<head>` block from `index.html` (includes fonts, favicon, viewport)
2. Reuse the same `<header>` and `<footer>` markup
3. Add page-specific styles to `styles.css` under a new section comment
4. Link from the navigation in all existing pages
5. Follow the design in `designs/` folder if a Figma screenshot exists

## Figma Integration
- Design screenshots live in `designs/`
- MCP Figma tools are available for fetching design context
- Always match the Figma design as closely as possible

## Plans
- Implementation plans go in `docs/plans/` with format `YYYY-MM-DD-feature-name.md`
- Plans should be detailed enough for task-by-task execution
- Use `superpowers:executing-plans` skill to implement plans

## Git Conventions
- Commit format: `type: description` (e.g., `feat: add ranking page`, `fix: adjust spacing`)
- Types: `feat`, `fix`, `refactor`, `docs`, `style`
- One logical change per commit
