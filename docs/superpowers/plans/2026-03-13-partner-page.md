# Partner Detail Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Juice Brothers partner detail page at `site/partners/juice-brothers.html` with new `.pp-*` CSS styles and link it from the homepage partner logos.

**Architecture:** New HTML page in `site/partners/` subdirectory using existing site patterns (header, footer, breadcrumb, scroll-reveal). All asset/nav paths use `../` prefix since the page is one directory deep. New `.pp-*` CSS section added to `site/styles.css`.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JS (scroll-reveal)

**Spec:** `docs/superpowers/specs/2026-03-13-partner-pages-design.md`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `site/partners/juice-brothers.html` | Create | Partner detail page |
| `site/styles.css` | Modify | Add `.pp-*` CSS section + responsive rules |
| `site/index.html` | Modify | Wrap Juice Brothers logo in `<a>` link |

---

## Task 1: Add `.pp-*` CSS styles to styles.css

**Files:**
- Modify: `site/styles.css` (add new section before responsive breakpoints)

- [ ] **Step 1: Add partner page CSS section**

Add the following after the existing `/* --- Upload Page --- */` section and BEFORE the first `@media` query. Find the comment pattern to insert before responsive styles.

```css
/* --- Partner Page --- */

.pp-hero {
  padding: 32px 80px 64px;
}

.pp-hero-inner {
  display: flex;
  align-items: center;
  gap: 48px;
  max-width: 1280px;
  margin: 0 auto;
}

.pp-hero-logo {
  width: 200px;
  height: 200px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  object-fit: contain;
  flex-shrink: 0;
}

.pp-hero-content h1 {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.pp-hero-content p {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.pp-about {
  padding: 80px 80px;
}

.pp-about-container {
  max-width: 800px;
  margin: 0 auto;
}

.pp-about-container .section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-brand);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.pp-about-container h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}

.pp-about-container p {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.pp-cta {
  padding: 80px;
  background: var(--color-bg-secondary);
  text-align: center;
}

.pp-cta h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.pp-cta p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}
```

- [ ] **Step 2: Add responsive styles for 992px breakpoint**

Inside the existing `@media (max-width: 992px)` block, add:

```css
  .pp-hero {
    padding: 24px 40px 48px;
  }

  .pp-hero-inner {
    flex-direction: column;
    text-align: center;
    gap: 32px;
  }

  .pp-hero-logo {
    width: 160px;
    height: 160px;
  }

  .pp-hero-content h1 {
    font-size: 36px;
  }

  .pp-about {
    padding: 60px 40px;
  }

  .pp-cta {
    padding: 60px 40px;
  }
```

- [ ] **Step 3: Add responsive styles for 640px breakpoint**

Inside the existing `@media (max-width: 640px)` block, add:

```css
  .pp-hero {
    padding: 20px 20px 40px;
  }

  .pp-hero-logo {
    width: 120px;
    height: 120px;
    padding: 16px;
  }

  .pp-hero-content h1 {
    font-size: 28px;
  }

  .pp-about {
    padding: 40px 20px;
  }

  .pp-cta {
    padding: 40px 20px;
  }
```

- [ ] **Step 4: Commit**

```bash
git add site/styles.css
git commit -m "style: add partner page CSS (.pp-* prefix)"
```

---

## Task 2: Create Juice Brothers partner page

**Files:**
- Create: `site/partners/juice-brothers.html`

- [ ] **Step 1: Create `site/partners/` directory**

```bash
mkdir -p site/partners
```

- [ ] **Step 2: Create `site/partners/juice-brothers.html`**

The full page uses the standard header/footer from other pages but with ALL relative paths prefixed with `../` since it's in a subdirectory. Key sections:

1. `<head>` — title, meta, stylesheet (`../styles.css`), favicon (`../assets/img/opc_logo.png`), Google Fonts
2. `<header>` — identical nav but all `href` values prefixed with `../` (e.g., `../index.html`, `../ranking.html`, `../country-netherlands.html`)
3. Breadcrumb — `Home / Partners / Juice Brothers`
4. Partner hero — split layout (logo left, content right)
5. About section — section label + heading + paragraphs
6. CTA section — partnership callout
7. `<footer>` — identical footer but all `href` values prefixed with `../`
8. `<script>` — scroll-reveal, header scroll, mobile nav toggle (identical JS)

Important path changes from root-level pages:
- `href="index.html"` → `href="../index.html"`
- `src="assets/img/..."` → `src="../assets/img/..."`
- `href="country-netherlands.html"` → `href="../country-netherlands.html"`
- `href="styles.css"` → `href="../styles.css"`

- [ ] **Step 3: Verify the page renders**

Open `site/partners/juice-brothers.html` in a browser. Check:
- Logo loads (white card with Juice Brothers logo)
- Styles load (dark theme, correct fonts)
- Nav links work (all point to `../` paths)
- Hero layout: logo left, text right
- About section: centered text, brand blue section label
- CTA: alt background, centered
- Responsive: resize to 992px (hero stacks), 640px (padding reduces)

- [ ] **Step 4: Commit**

```bash
git add site/partners/juice-brothers.html
git commit -m "feat: add Juice Brothers partner page"
```

---

## Task 3: Link homepage partner logo to partner page

**Files:**
- Modify: `site/index.html` (lines 482-487, the `.logo-row` section)

- [ ] **Step 1: Wrap Juice Brothers logo in an `<a>` tag**

Change:
```html
<img src="assets/img/logos/JuiceBrothers.png" alt="Juice Brothers" class="partner-logo" loading="lazy">
```

To:
```html
<a href="partners/juice-brothers.html"><img src="assets/img/logos/JuiceBrothers.png" alt="Juice Brothers" class="partner-logo" loading="lazy"></a>
```

Only wrap Juice Brothers — the other 3 logos stay unlinked until their pages are created.

- [ ] **Step 2: Verify the link works**

Open `site/index.html` in browser, scroll to Partners section, click the Juice Brothers logo → should navigate to the partner page.

- [ ] **Step 3: Commit**

```bash
git add site/index.html
git commit -m "feat: link Juice Brothers logo to partner page"
```

---

## Verification Checklist

After all tasks are complete:

- [ ] Partner page loads at `site/partners/juice-brothers.html`
- [ ] Stylesheet, favicon, and all images load correctly (no broken paths)
- [ ] All nav links work from the partner page (Home, Rankings, Tournaments, etc.)
- [ ] Country dropdown links work from the partner page
- [ ] Footer links work from the partner page
- [ ] Hero: logo on left, name + tagline + button on right
- [ ] "Visit Website" button opens https://juicebro.com in new tab
- [ ] About section has brand blue "ABOUT" label, heading, paragraphs
- [ ] CTA section has alt background with "Get in touch" button → links to contact page
- [ ] Scroll-reveal animations work on about and CTA sections
- [ ] Responsive at 992px: hero stacks vertically, logo shrinks
- [ ] Responsive at 640px: padding reduces further
- [ ] Homepage Juice Brothers logo is clickable → navigates to partner page
- [ ] Other 3 homepage partner logos are NOT wrapped in links (unchanged)
