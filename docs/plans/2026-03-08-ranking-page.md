# Ranking Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static ranking page that displays an international poker player leaderboard matching the Figma design, with hardcoded mock data.

**Architecture:** New `ranking.html` page using the same shared styles from `styles.css`. The ranking section includes a search bar, country filter dropdown, a data table with 20 rows, a "How Rankings Work" sidebar, and pagination. All data is hardcoded in HTML for now; a future-feature plan covers the Supabase migration.

**Tech Stack:** HTML, CSS (no JS frameworks). Vanilla JS only for search filter and dropdown toggle interactions.

---

## Design Analysis (from `designs/Ranking_Desktop.png`)

**Layout:** Two-column below the header — left (wide) has the ranking table, right (narrow) has the "How Rankings Work" explainer card.

**Header section:**
- Title: "International European OPC Rating"
- Subtitle: "Live rankings of verified players across Europe"
- Metadata line: "250+ Verified Players · 20+ Tournaments/Player · Last updated: 25 Jan 2025, 13:12"

**Controls row:**
- Left: Search input with magnifying glass icon and placeholder "Search name"
- Right: "All Countries" dropdown with chevron

**Table columns:**
| # | Column | Content |
|---|--------|---------|
| 1 | Rank | Number (1–20 per page) |
| 2 | Name | Player name (text, truncated if long) |
| 3 | Home | Country flag icon |
| 4 | Nationality | Country flag icon(s) |
| 5 | Points in events | Number (e.g. 10000) |
| 6 | Tournaments | Text label (e.g. "Netherlands") |

**Row styling:** Dark rows alternating with slightly lighter rows. Row 1 (top rank) has a subtle highlight/glow.

**Sidebar — "How Rankings work":**
- Heading + bulleted explanation paragraphs
- "Read full rules" CTA link with arrow icon

**Pagination:** "< Previous 1 2 3 ... 7 Next >"

**Footer:** Extended footer matching the design — columns: Open Poker Championship, About, For Players, For organizers, Legal.

---

### Task 1: Create ranking.html with page structure and header

**Files:**
- Create: `ranking.html`

**Step 1: Create the base HTML file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rankings — OPC Europe</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" type="image/png" href="assets/img/opc_logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

  <!-- Header Navigation (same as index.html) -->
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <a href="index.html" class="logo">
          <img src="assets/img/opc_logo.png" alt="OPC Europe" width="76" height="56">
        </a>
        <nav class="nav">
          <a href="index.html#rankings" class="nav-link">Rankings</a>
          <a href="index.html#tournaments" class="nav-link">Tournaments</a>
          <div class="nav-dropdown">
            <a href="index.html#about" class="nav-link">About OPC
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </nav>
      </div>
      <a href="index.html#join" class="btn btn-primary">How to join</a>
    </div>
  </header>

  <!-- Ranking page content goes here -->

  <!-- Footer (extended version from design) -->

</body>
</html>
```

**Step 2: Verify it renders**

Open `ranking.html` in browser. Confirm: header renders correctly, links point to `index.html` sections.

**Step 3: Commit**

```bash
git add ranking.html
git commit -m "feat: add ranking page skeleton with shared header"
```

---

### Task 2: Build the ranking page title section

**Files:**
- Modify: `ranking.html`

**Step 1: Add the title section markup after the header**

Insert inside `ranking.html` after `</header>`:

```html
<section class="ranking-page">
  <div class="ranking-container">
    <div class="ranking-header">
      <h1 class="ranking-title">International European OPC Rating</h1>
      <p class="ranking-subtitle">Live rankings of verified players across Europe</p>
      <p class="ranking-meta">250+ Verified Players · 20+ Tournaments/Player · Last updated: 25 Jan 2025, 13:12</p>
    </div>
  </div>
</section>
```

**Step 2: Add CSS styles**

Append to `styles.css`:

```css
/* --- Ranking Page --- */
.ranking-page {
  padding: 48px 80px 96px;
}

.ranking-container {
  max-width: 1440px;
  margin: 0 auto;
}

.ranking-header {
  margin-bottom: 32px;
}

.ranking-title {
  font-size: 30px;
  font-weight: 600;
  line-height: 38px;
  margin-bottom: 8px;
}

.ranking-subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 24px;
  margin-bottom: 4px;
}

.ranking-meta {
  font-size: 14px;
  color: var(--color-text-tertiary);
  line-height: 20px;
}
```

**Step 3: Verify in browser**

Title, subtitle, and meta line render correctly with proper spacing and colors.

**Step 4: Commit**

```bash
git add ranking.html styles.css
git commit -m "feat: add ranking page title section with styles"
```

---

### Task 3: Build search bar and country filter controls

**Files:**
- Modify: `ranking.html`
- Modify: `styles.css`

**Step 1: Add controls markup**

Insert after `.ranking-header` div, still inside `.ranking-container`:

```html
<div class="ranking-controls">
  <div class="ranking-search">
    <svg class="ranking-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94969c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21L16.65 16.65"/>
    </svg>
    <input type="text" class="ranking-search-input" placeholder="Search name">
  </div>
  <div class="ranking-filter">
    <button class="ranking-filter-btn" type="button">
      All Countries
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
</div>
```

**Step 2: Add CSS styles**

```css
.ranking-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.ranking-search {
  position: relative;
  width: 320px;
}

.ranking-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.ranking-search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 0.2s;
}

.ranking-search-input::placeholder {
  color: var(--color-text-tertiary);
}

.ranking-search-input:focus {
  border-color: var(--color-border-brand);
}

.ranking-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.2s;
}

.ranking-filter-btn:hover {
  border-color: var(--color-border-brand);
}
```

**Step 3: Verify in browser**

Search field shows with icon placeholder. Filter button shows "All Countries" with chevron. Both are on the same row, search left, filter right.

**Step 4: Commit**

```bash
git add ranking.html styles.css
git commit -m "feat: add ranking search bar and country filter controls"
```

---

### Task 4: Build the two-column layout (table + sidebar)

**Files:**
- Modify: `ranking.html`
- Modify: `styles.css`

**Step 1: Add the two-column wrapper markup**

Insert after `.ranking-controls` div:

```html
<div class="ranking-layout">
  <div class="ranking-table-wrapper">
    <!-- Table goes here (Task 5) -->
  </div>
  <aside class="ranking-sidebar">
    <div class="ranking-sidebar-card">
      <h3>How Rankings work</h3>
      <ul>
        <li>Explanation text will be placed here, separated into bullet points for better readability.</li>
        <li>Explanation text will be placed here, separated into bullet points for better readability.</li>
        <li>Explanation text will be placed here, separated into bullet points for better readability.</li>
        <li>Explanation text will be placed here, separated into bullet points for better readability.</li>
        <li>Explanation text will be placed here, separated into bullet points for better readability.</li>
      </ul>
      <a href="#" class="link-arrow">
        Read full rules
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5.83 14.17L14.17 5.83M14.17 5.83H7.5M14.17 5.83V12.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>
  </aside>
</div>
```

**Step 2: Add CSS styles**

```css
.ranking-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.ranking-table-wrapper {
  flex: 1;
  min-width: 0;
}

.ranking-sidebar {
  flex: 0 0 320px;
}

.ranking-sidebar-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.ranking-sidebar-card h3 {
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  margin-bottom: 16px;
}

.ranking-sidebar-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.ranking-sidebar-card li {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  line-height: 20px;
  color: var(--color-text-secondary);
}

.ranking-sidebar-card li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-text-tertiary);
}
```

**Step 3: Verify in browser**

Two-column layout visible. Sidebar card on the right with bullet points and "Read full rules" link.

**Step 4: Commit**

```bash
git add ranking.html styles.css
git commit -m "feat: add two-column ranking layout with sidebar"
```

---

### Task 5: Build the ranking table with 20 mock data rows

**Files:**
- Modify: `ranking.html`

**Step 1: Add the table markup inside `.ranking-table-wrapper`**

Replace the `<!-- Table goes here (Task 5) -->` comment with:

```html
<table class="ranking-table">
  <thead>
    <tr>
      <th class="ranking-col-rank">Rank</th>
      <th class="ranking-col-name">Name</th>
      <th class="ranking-col-home">Home</th>
      <th class="ranking-col-nationality">Nationality</th>
      <th class="ranking-col-points">Points in events</th>
      <th class="ranking-col-tournaments">Tournaments</th>
    </tr>
  </thead>
  <tbody>
    <tr class="ranking-row ranking-row--top">
      <td>1</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"><img src="assets/flags/gb.svg" alt="GB" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>2</td>
      <td>Player with a Long name ver...</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"><img src="assets/flags/gb.svg" alt="GB" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>3</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>4</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>5</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>6</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>7</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"></td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>8</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>9</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>10</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>11</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>12</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"></td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>13</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>14</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>15</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>16</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>17</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"></td>
      <td><img src="assets/flags/de.svg" alt="DE" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>18</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>19</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td><img src="assets/flags/nl.svg" alt="NL" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
    <tr class="ranking-row">
      <td>20</td>
      <td>Jane Doe</td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td><img src="assets/flags/be.svg" alt="BE" class="ranking-flag"></td>
      <td>10000</td>
      <td>Netherlands</td>
    </tr>
  </tbody>
</table>
```

**Step 2: Create flag SVG placeholder assets**

Create simple SVG flag files in `assets/flags/` for: `nl.svg`, `de.svg`, `be.svg`, `gb.svg`. These can be simple colored rectangles representing flag colors. Alternatively, use emoji flags or a flag CDN — adapt to project preference.

> **Note:** The design uses small circular flag icons. If flag SVGs are unavailable, use placeholder colored circles as a stopgap.

**Step 3: Commit**

```bash
git add ranking.html assets/flags/
git commit -m "feat: add ranking table with 20 mock data rows and flag assets"
```

---

### Task 6: Style the ranking table

**Files:**
- Modify: `styles.css`

**Step 1: Add table CSS**

```css
.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table thead th {
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.ranking-col-rank {
  width: 60px;
}

.ranking-col-name {
  min-width: 200px;
}

.ranking-col-home,
.ranking-col-nationality {
  width: 100px;
}

.ranking-col-points {
  width: 130px;
}

.ranking-col-tournaments {
  width: 140px;
}

.ranking-row td {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 20px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.ranking-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.ranking-row--top {
  background: rgba(46, 144, 250, 0.06);
}

.ranking-row--top td {
  color: var(--color-text-primary);
  font-weight: 500;
}

.ranking-row td:first-child {
  font-weight: 600;
  color: var(--color-text-primary);
}

.ranking-row td:nth-child(2) {
  color: var(--color-text-primary);
  font-weight: 500;
}

.ranking-flag {
  width: 24px;
  height: 18px;
  border-radius: 2px;
  object-fit: cover;
  display: inline-block;
  vertical-align: middle;
}

.ranking-flag + .ranking-flag {
  margin-left: 4px;
}
```

**Step 2: Verify in browser**

Table has proper column widths, row heights, alternating subtle backgrounds, top-rank highlight, and flag sizing.

**Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: style ranking table with row highlights and flag icons"
```

---

### Task 7: Build pagination

**Files:**
- Modify: `ranking.html`
- Modify: `styles.css`

**Step 1: Add pagination markup**

Insert after `.ranking-layout` closing div, still inside `.ranking-container`:

```html
<nav class="ranking-pagination">
  <a href="#" class="pagination-btn pagination-prev">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Previous
  </a>
  <div class="pagination-pages">
    <a href="#" class="pagination-page pagination-page--active">1</a>
    <a href="#" class="pagination-page">2</a>
    <a href="#" class="pagination-page">3</a>
    <span class="pagination-ellipsis">...</span>
    <a href="#" class="pagination-page">7</a>
  </div>
  <a href="#" class="pagination-btn pagination-next">
    Next
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>
</nav>
```

**Step 2: Add CSS styles**

```css
.ranking-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: color 0.2s;
}

.pagination-btn:hover {
  color: var(--color-text-primary);
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: background 0.2s, color 0.2s;
}

.pagination-page:hover {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
}

.pagination-page--active {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
}

.pagination-ellipsis {
  width: 36px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 14px;
}
```

**Step 3: Verify in browser**

Pagination row shows Previous / 1 2 3 ... 7 / Next correctly spaced.

**Step 4: Commit**

```bash
git add ranking.html styles.css
git commit -m "feat: add ranking pagination with active state"
```

---

### Task 8: Build the extended footer

**Files:**
- Modify: `ranking.html`

**Step 1: Add the extended footer markup**

The footer in the ranking design is more detailed than the index page. Add this before `</body>`:

```html
<footer class="footer">
  <div class="footer-container">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="assets/img/opc_logo.png" alt="OPC Europe" width="76" height="56">
        <p>Open Poker Championship</p>
        <p class="footer-copyright-inline">OPC &copy; 2026. All rights reserved.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>About</h4>
          <a href="index.html#about">What is OPC</a>
          <a href="#">How it works</a>
          <a href="#">Our mission</a>
        </div>
        <div class="footer-col">
          <h4>For Players</h4>
          <a href="ranking.html">Rankings</a>
          <a href="index.html#tournaments">Tournaments</a>
          <a href="#">Get verified</a>
        </div>
        <div class="footer-col">
          <h4>For organizers</h4>
          <a href="#">Partner with us</a>
          <a href="#">Partnership benefits</a>
          <a href="#">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="#">Responsible Gaming</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 OPC Europe. All rights reserved.</p>
    </div>
  </div>
</footer>
```

**Step 2: Verify in browser**

Footer renders with 5 columns matching the design.

**Step 3: Commit**

```bash
git add ranking.html
git commit -m "feat: add extended footer to ranking page"
```

---

### Task 9: Add responsive styles for ranking page

**Files:**
- Modify: `styles.css`

**Step 1: Add responsive breakpoints**

Append inside existing media queries or at the end:

```css
@media (max-width: 1200px) {
  .ranking-sidebar {
    flex: 0 0 280px;
  }
}

@media (max-width: 992px) {
  .ranking-page {
    padding: 32px 40px 64px;
  }

  .ranking-layout {
    flex-direction: column;
  }

  .ranking-sidebar {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .ranking-page {
    padding: 24px 16px 48px;
  }

  .ranking-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .ranking-search {
    width: 100%;
  }

  .ranking-table-wrapper {
    overflow-x: auto;
  }

  .ranking-table {
    min-width: 700px;
  }

  .ranking-pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
}
```

**Step 2: Test at 1200px, 992px, and 640px widths**

- At 992px: sidebar moves below table
- At 640px: table scrolls horizontally, search stacks on filter

**Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add responsive styles for ranking page"
```

---

### Task 10: Link ranking page from index.html

**Files:**
- Modify: `index.html`

**Step 1: Update "View Rankings" link in hero**

Change the hero CTA `href="#rankings"` to `href="ranking.html"`:

```html
<a href="ranking.html" class="btn btn-primary">
```

**Step 2: Update the Rankings nav link**

Change `href="#rankings"` in the header nav to `href="ranking.html"`.

**Step 3: Verify both pages link correctly**

Click "View Rankings" on index → opens ranking.html. Click logo/nav links on ranking → goes back to index.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: link ranking page from index hero and navigation"
```

---

### Task 11: Final visual QA pass

**Files:**
- Possibly modify: `styles.css`, `ranking.html`

**Step 1: Compare side-by-side with `designs/Ranking_Desktop.png`**

Check:
- [ ] Column widths and spacing match design
- [ ] Row heights and padding match
- [ ] Flag icon sizes correct (small circular/rounded in design)
- [ ] Search bar styling matches
- [ ] Sidebar card background, border, and typography match
- [ ] Pagination spacing matches
- [ ] Footer columns match design layout
- [ ] Top-rank row highlight visible

**Step 2: Fix any discrepancies found**

Adjust CSS values as needed.

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: visual QA adjustments for ranking page"
```
