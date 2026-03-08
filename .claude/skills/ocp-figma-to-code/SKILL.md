---
name: ocp-figma-to-code
description: Use when translating a Figma design into HTML/CSS for the OPC project, when the user shares a Figma URL or references a design screenshot in the designs folder, or when building UI that must match a visual spec
---

# OPC Figma to Code

## Overview
Workflow for converting Figma designs into OPC-compliant HTML and CSS, mapping design elements to the existing token system.

## When to Use
- User shares a Figma URL (`figma.com/design/...`)
- User references a design file in `designs/`
- Building any UI component that has a visual spec

## Workflow

### 1. Get the design
- If Figma URL: use `get_design_context` with fileKey and nodeId
- If screenshot in `designs/`: read the image file directly
- Note all measurements, colors, spacing, and typography

### 2. Map to existing tokens

| Design Value | Map To |
|-------------|--------|
| `#0c0e12` background | `var(--color-bg-primary)` |
| `#161b26` background | `var(--color-bg-secondary)` |
| `#1f242f` card bg | `var(--color-bg-card)` |
| `#f5f5f6` text | `var(--color-text-primary)` |
| `#94969c` text | `var(--color-text-secondary)` |
| `#535862` text | `var(--color-text-tertiary)` |
| `#1570ef` blue | `var(--color-brand)` |
| `#2e90fa` blue border | `var(--color-border-brand)` |
| 6px radius | `var(--radius-sm)` |
| 8px radius | `var(--radius-md)` |
| 12px radius | `var(--radius-lg)` |
| 16px radius | `var(--radius-xl)` |

### 3. Identify reusable components
Before building new markup, check if these existing components match:
- `.btn` / `.btn-primary` / `.btn-outline` — buttons
- `.section-header` + `.section-label` — section titles
- `.link-arrow` — text links with arrow
- `.stat-card` — icon + number + label
- `.benefit-card` — feature cards with check lists
- `.event-card` — tournament/event card
- `.check-list` — bulleted list with check icons

### 4. Build HTML
- Use semantic elements (`<section>`, `<aside>`, `<nav>`)
- Inline SVG for icons (stroke-width: 1.5, round caps/joins)
- Alt text on all images
- Follow existing patterns from `index.html`

### 5. Write CSS
- Add under section comment in `styles.css`
- Use CSS custom properties for ALL colors, radii, shadows
- BEM naming: `.component`, `.component-element`, `.component--modifier`
- Match Figma spacing exactly using the 4px grid system

### 6. Responsive adaptation
Design is desktop-first. Add responsive overrides for:
- **992px**: Stack columns, reduce padding
- **640px**: Single column, smaller type, hide nav

## Common Mistakes
- Creating new color values instead of mapping to tokens
- Using `px` colors that are 1-2 values off from tokens (e.g., `#93959b` instead of `--color-text-secondary`)
- Forgetting responsive styles
- Building a new component when an existing one matches
