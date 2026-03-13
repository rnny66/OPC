# Partner Detail Page

## Context
Partners need individual showcase pages that make them proud to be listed. This spec covers creating the first partner page (Juice Brothers) for design review/iteration before building the remaining 3.

## Scope
- **This spec:** Juice Brothers partner page only (design validation)
- **After approval:** Remaining 3 partner pages (Luxon Pay, IPR, Arend Klein)
- **Separate spec:** Folder restructure (`partners/`, `countries/`) — deferred to reduce risk

## File Structure
```
site/
├── partners/
│   └── juice-brothers.html    # This spec
├── index.html                 # Update: wrap partner logos in <a> links
└── styles.css                 # Update: add .pp-* styles
```

## Partner Page Layout

**File:** `site/partners/juice-brothers.html`

### Section 1: Breadcrumb
- Pattern: `Home / Partners / Juice Brothers`
- "Home" links to `../index.html`, "Partners" is non-linked text (no partners listing page yet)
- Reuses `.td-breadcrumb` styling

### Section 2: Partner Hero (split layout)
- **Left:** Large logo on white card background (~200px, `border-radius: 16px`, padding)
- **Right:** Partner name (h1), one-liner tagline (p), "Visit Website" outline button (opens in new tab)
- Dark background, full-width section
- **Distinct from tournament detail:** Horizontal split vs. centered; no badge, no meta items, no date/location

### Section 3: About
- Section label: "ABOUT" (`.section-label` pattern — uppercase, brand blue, 14px)
- Heading: "Juice Brothers"
- 2-3 paragraphs of placeholder description text
- Single column, `max-width: 800px`, centered
- `.reveal` class for scroll animation
- **Distinct from tournament detail:** Flowing prose, no schedule/format grids

### Section 4: CTA
- Background: `var(--color-bg-secondary)` for visual separation
- Heading: "Interested in partnering with OPC?"
- Subtext: brief sentence about partnership benefits
- Primary button: "Get in touch" linking to `../contact.html`
- `.reveal` class for scroll animation

### HTML Meta
- `<title>`: `Juice Brothers — OPC Europe`
- `<meta name="description">`: brief partner description
- Asset paths use `../` prefix (stylesheet, favicon, header logo, nav links, footer links)

## CSS
- **Prefix:** `.pp-*` (partner page) — consistent with `.td-*`, `.country-*`, `.upload-*`
- **New classes:**
  - `.pp-hero` — section wrapper, `padding: 80px`
  - `.pp-hero-inner` — flex row, `gap: 48px`, `align-items: center`, `max-width: 1280px`
  - `.pp-hero-logo` — white card with logo img, `width: 200px`, `height: 200px`, `border-radius: 16px`, `padding: 24px`, `background: #fff`, `object-fit: contain`
  - `.pp-hero-content` — flex column for name, tagline, button
  - `.pp-about` — section wrapper, `padding: 80px`
  - `.pp-about-container` — `max-width: 800px`, `margin: 0 auto`
  - `.pp-cta` — section with alt background, centered text + button
- **Reused:** `.btn`, `.btn-primary`, `.btn-outline`, `.reveal`, `.td-breadcrumb`, `.section-label`
- **Responsive:**
  - `992px`: `.pp-hero-inner` stacks vertically (flex-direction: column, center-aligned), `.pp-hero-logo` shrinks to 160px
  - `640px`: section padding reduces to 40px/20px

## Homepage Update
- Wrap each `<img class="partner-logo">` in `<a href="partners/*.html">` tag
- Only Juice Brothers links to its page initially; other 3 logos remain unlinked until their pages exist

## Content (Juice Brothers)
- **Tagline:** "Fueling champions with cold-pressed nutrition"
- **About:** Placeholder text about the Juice Brothers x OPC partnership, their mission in wellness, and why they support competitive poker
- **Logo:** `../assets/img/logos/JuiceBrothers.png`
- **Website:** https://juicebro.com

## Scroll-Reveal
- Include the standard IntersectionObserver JS snippet (same as all other pages)
- `.reveal` on: about section, CTA section
- Hero section does NOT get `.reveal` (immediately visible on load)
