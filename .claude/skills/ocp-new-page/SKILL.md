---
name: ocp-new-page
description: Use when creating a new HTML page for the OPC project, adding a route or view, or when the user says "create a page" or "build the X page" for the Open Poker Championship site
---

# OPC New Page Creation

## Overview
Step-by-step process for adding new pages to the OPC static site while maintaining design system consistency.

## When to Use
- User asks to create a new page (ranking, tournaments, about, etc.)
- A Figma design exists in `designs/` for a new view
- An implementation plan references creating a new HTML file

## Page Creation Checklist

### 1. Setup HTML skeleton
Copy this base from `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Name] — OPC Europe</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" type="image/png" href="assets/img/opc_logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

### 2. Reuse shared components
- Copy the `<header>` block exactly from `index.html`
- Update nav links to use relative paths (`index.html#about`, `ranking.html`, etc.)
- Copy the `<footer>` block — use extended footer if design calls for it

### 3. Add page-specific CSS
- Append to `styles.css` under a new section comment: `/* --- Page Name Page --- */`
- Use existing CSS custom properties (`var(--color-*)`, `var(--radius-*)`, `var(--shadow-*)`)
- Never hardcode colors — always reference tokens
- Follow BEM naming: `.pagename-component`, `.pagename-component--modifier`

### 4. Add responsive styles
Add breakpoints inside existing media query blocks or at the end:
- `1200px` — reduce sidebar widths, adjust grid columns
- `992px` — stack columns vertically (`flex-direction: column`)
- `640px` — full-width stacking, reduce font sizes, horizontal scroll for tables

### 5. Link from navigation
Update the `<nav>` in ALL existing HTML pages to include the new page link.

### 6. Check Figma design
If a design exists in `designs/`, use Figma MCP tools (`get_design_context`, `get_screenshot`) to match the design precisely.

## Common Mistakes
- Forgetting to update nav links in ALL pages (not just the new one)
- Hardcoding colors instead of using CSS variables
- Adding CSS to a new file instead of the shared `styles.css`
- Missing `preconnect` hints for Google Fonts in the `<head>`
