# OPC Style Guide

> Design system reference for the European Open Poker Championship website.

---

## Brand Identity

- **Project:** OPC — European Open Poker Championship
- **Tone:** Professional, premium, trustworthy
- **Theme:** Dark mode with blue accent

---

## Color Palette

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#0c0e12` | Page background |
| `--color-bg-secondary` | `#161b26` | Section/card backgrounds |
| `--color-bg-card` | `#1f242f` | Card surfaces, hover states |
| `--color-bg-white` | `#ffffff` | Light sections (rare) |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#f5f5f6` | Headings, primary body text |
| `--color-text-secondary` | `#94969c` | Descriptions, secondary info |
| `--color-text-tertiary` | `#535862` | Metadata, muted labels, icon strokes |
| `--color-text-dark` | `#181d27` | Text on light backgrounds |

### Brand Blues
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand` | `#1570ef` | Primary buttons, CTAs |
| `--color-brand-dark` | `#194185` | Step icons, check circles |
| `--color-brand-secondary` | `#175cd3` | Section labels |
| `--color-brand-light` | `#53b1fd` | Links, hover accents |

### Borders
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-border` | `#1f242f` | Default borders |
| `--color-border-light` | `#d5d7da` | Light-context borders |
| `--color-border-brand` | `#2e90fa` | Focus states, highlighted cards |

---

## Typography

**Font:** Inter (Google Fonts)
**Fallback:** `-apple-system, BlinkMacSystemFont, sans-serif`

### Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Hero title | 60px | 700 | 72px | -1.2px |
| Section heading (h2) | 36px | 600 | 44px | -0.72px |
| Card title (h3) | 20px | 600 | 30px | — |
| Body text | 16px | 400 | 24px | — |
| Small text | 14px | 400/500 | 20px | — |
| Tiny/meta | 12px | 500 | 16px | 0.05em |

### Weights
- **400** — Body text, descriptions
- **500** — Navigation, buttons (secondary), labels
- **600** — Headings, button text, emphasis
- **700** — Hero title only

---

## Spacing

Use multiples of **4px** for consistency:

| Token | Values |
|-------|--------|
| Micro | 4px, 8px |
| Small | 12px, 16px |
| Medium | 24px, 32px |
| Large | 48px, 64px |
| XL | 80px, 96px, 112px |

**Section padding:** `96px 80px` (desktop), `64px 40px` (tablet), `48px 16px` (mobile)

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 8px | Buttons, inputs, cards |
| `--radius-lg` | 12px | Large cards, sidebar |
| `--radius-xl` | 16px | Hero/about images |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(10,13,18,0.05)` | Buttons |
| `--shadow-sm` | `0 1px 3px rgba(10,13,18,0.1), ...` | Cards |
| `--shadow-lg` | `0 12px 16px -4px rgba(10,13,18,0.08), ...` | Elevated elements |

---

## Components

### Buttons

```css
/* Base */        .btn          — inline-flex, 12px 20px padding, 16px font, 600 weight, radius-md
/* Primary */     .btn-primary  — brand blue bg, white text, subtle inset shadow
/* Outline */     .btn-outline  — transparent bg, brand blue border, light text (#cecfd2)
```

All buttons: `transition: all 0.2s ease`, 2px border, `cursor: pointer`

### Cards

- Background: `var(--color-bg-card)` or `var(--color-bg-secondary)`
- Border: `1px solid var(--color-border)`
- Radius: `var(--radius-lg)` (12px)
- Highlighted variant: `border-color: var(--color-border-brand)` (blue border)

### Links

- `.link-arrow` — text link with inline SVG arrow, color: `var(--color-brand-light)`
- Hover: underline or color shift

### Section Headers

```html
<div class="section-header">
  <span class="section-label">Label Text</span>
  <h2>Section Title</h2>
  <p class="section-description">Optional subtitle</p>
</div>
```

- Centered text alignment
- Label: 14px, 600 weight, brand-secondary color, uppercase-style

---

## Icons

- **Format:** Inline SVG (no icon fonts, no external sprites)
- **Sizes:** 16x16 (nav chevrons), 20x20 (button arrows), 24x24 (info icons), 40x40 (stat icons), 46x46 (step icons)
- **Stroke style:** `stroke-width: 1.5`, `stroke-linecap: round`, `stroke-linejoin: round`
- **Colors:** `currentColor` for contextual, `#2e90fa` for brand, `#535862` for muted

---

## Layout

- **Max width:** 1440px centered (`margin: 0 auto`)
- **Grid:** CSS Flexbox primary, CSS Grid for event cards (4-column)
- **Container padding:** 80px horizontal (desktop), 40px (tablet), 16px (mobile)

---

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `max-width: 1200px` | Large tablet / small desktop |
| `max-width: 992px` | Tablet — stacks columns, hides complex layouts |
| `max-width: 640px` | Mobile — single column, nav hidden, reduced type |

### Key responsive changes:
- **992px:** Flex columns switch to `flex-direction: column`
- **640px:** Navigation hidden, hero title drops to 32px, grids become single-column

---

## CSS Conventions

1. **CSS Custom Properties** for all design tokens (colors, radius, shadows)
2. **BEM-inspired naming:** `.component`, `.component-element`, `.component--modifier`
3. **Section comments:** `/* --- Section Name --- */`
4. **Single stylesheet:** `styles.css` (no preprocessor)
5. **Responsive styles** consolidated at end of file, grouped by breakpoint
6. **Transitions:** `0.2s ease` for all interactive states
7. **Reset:** Universal box-sizing, margin/padding zero
8. **Font smoothing:** `-webkit-font-smoothing: antialiased`

---

## HTML Conventions

1. **Semantic elements:** `<header>`, `<section>`, `<footer>`, `<nav>`, `<aside>`
2. **Alt text** on all images
3. **Inline SVGs** for icons (no external icon libraries)
4. **Page structure:** Header → Sections → Footer
5. **Shared header/footer** duplicated per page (no templating engine)
6. **Google Fonts loaded** with `preconnect` hints
7. **Title format:** `Page Name — OPC Europe`
8. **Navigation dropdowns:** "Countries" (6 countries) and "About OPC" dropdowns in header nav

## Country Pages

Country-specific pages (`country-{name}.html`) follow a standard template:

| Section | Class | Description |
|---------|-------|-------------|
| Hero | `.country-hero` | Flag + country name + subtitle |
| Partners | `.country-partners-grid` | 3-column grid of `.country-partner-card` |
| Tournaments | `.country-section--alt` | Reuses `.events-grid` + `.event-card` |
| Info | `.country-info-content` | Prose about poker in the country |
| CTA | `.country-cta` | Register/partner call-to-action |

Responsive breakpoints: 992px (2-col partners, reduced padding), 640px (1-col, smaller type)
