---
name: ocp-style-system
description: Use when writing or modifying CSS for the OPC project, adding new components, adjusting layout or spacing, or when unsure which CSS token or class to use for the Open Poker Championship site
---

# OPC Style System Reference

## Overview
Quick reference for the OPC design token system, CSS conventions, and animation patterns. Consult `docs/STYLE_GUIDE.md` for the full specification.

## Token Quick Reference

### Colors
```
Backgrounds:  --color-bg-primary (#0c0e12) | --color-bg-secondary (#161b26) | --color-bg-card (#1f242f)
Text:         --color-text-primary (#f5f5f6) | --color-text-secondary (#94969c) | --color-text-tertiary (#535862)
Brand:        --color-brand (#1570ef) | --color-brand-dark (#194185) | --color-brand-light (#53b1fd)
Borders:      --color-border (#1f242f) | --color-border-brand (#2e90fa) | --color-border-light (#d5d7da)
```

### Radius & Shadows
```
Radius: --radius-sm (6px) | --radius-md (8px) | --radius-lg (12px) | --radius-xl (16px)
Shadow: --shadow-xs | --shadow-sm | --shadow-lg
```

### Typography
```
Hero:    60px / 700 / 72px line-height / -1.2px tracking
H2:      36px / 600 / 44px line-height
H3:      20px / 600 / 30px line-height
Body:    16px / 400 / 24px line-height
Small:   14px / 400-500 / 20px line-height
Tiny:    12px / 500 / 16px line-height
```

## CSS Rules

1. **Never hardcode colors** — always use `var(--color-*)`
2. **BEM naming** — `.component`, `.component-element`, `.component--modifier`
3. **Section comments** — `/* --- Section Name --- */`
4. **Single file** — all styles in `styles.css`, no additional CSS files
5. **Transitions** — `0.2s ease` for all interactive states
6. **Responsive styles** — grouped at the end of `styles.css` by breakpoint
7. **Breakpoints** — 1200px (large tablet), 992px (tablet), 640px (mobile)

## Animation System

All animations live in the `/* --- Animations --- */` section at the end of `styles.css`.

### Hero Entrance (page load)
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-title    { animation: fadeInUp 0.6s ease both; }
.hero-subtitle { animation: fadeInUp 0.6s ease 0.15s both; }
.hero-actions  { animation: fadeInUp 0.6s ease 0.3s both; }
```

### Scroll Reveal
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}
```
- Add `.reveal` to any element that should animate on scroll
- JS IntersectionObserver adds `.reveal--visible` when element enters viewport

### Staggered Children
```css
.reveal-stagger > .reveal:nth-child(2) { transition-delay: 0.08s; }
.reveal-stagger > .reveal:nth-child(3) { transition-delay: 0.12s; }
.reveal-stagger > .reveal:nth-child(4) { transition-delay: 0.16s; }
```
- Wrap grid/card containers with `.reveal-stagger` for cascading entrance

### Animated SVG Lines
```css
@keyframes marchDown {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -24; }
}
.how-steps-line path { animation: marchDown 1.2s linear infinite; }
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .reveal { opacity: 1; transform: none; }
}
```
**Always** ensure the reduced-motion media query covers any new animations.

## Existing Components

| Class | Use For |
|-------|---------|
| `.btn .btn-primary` | Blue filled button |
| `.btn .btn-outline` | White outlined button |
| `.link-arrow` | Text link with arrow icon |
| `.section-header` | Centered section title block |
| `.section-label` | Small colored label above heading |
| `.stat-card` | Stat with icon + number |
| `.benefit-card` | Feature card with check list |
| `.event-card` | Tournament card |
| `.how-card` | Step-by-step process card |
| `.check-list` | List with check circle icons |
| `.ranking-table` | Data table for leaderboard |
| `.ranking-sidebar-card` | Info card in sidebar |
| `.pagination-*` | Pagination controls |
| `.reveal` | Scroll-reveal animation target |
| `.reveal-stagger` | Container for staggered reveal children |

## Icon Conventions
- Format: Inline SVG
- Stroke: `stroke-width="1.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- Sizes: 16px (nav), 20px (buttons), 24px (info), 40px (stats), 46px (steps)
- Colors: `currentColor` (contextual), `#2e90fa` (brand), `#535862` (muted)