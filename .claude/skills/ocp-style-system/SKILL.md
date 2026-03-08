---
name: ocp-style-system
description: Use when writing or modifying CSS for the OPC project, adding new components, adjusting layout or spacing, or when unsure which CSS token or class to use for the Open Poker Championship site
---

# OPC Style System Reference

## Overview
Quick reference for the OPC design token system and CSS conventions. Consult `docs/STYLE_GUIDE.md` for the full specification.

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

## Icon Conventions
- Format: Inline SVG
- Stroke: `stroke-width="1.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- Sizes: 16px (nav), 20px (buttons), 24px (info), 40px (stats), 46px (steps)
- Colors: `currentColor` (contextual), `#2e90fa` (brand), `#535862` (muted)
