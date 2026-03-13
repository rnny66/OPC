# Interest Signup System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect email addresses from prospective players and organizers via a new interest signup page, and redesign the contact page to route each audience to the right funnel.

**Architecture:** Supabase migration creates `interest_signups` table with anon INSERT + admin SELECT/DELETE RLS. Contact page gets 4 cards (3 top + 1 full-width). New `interest.html` page with vanilla JS form inserts into Supabase via CDN client.

**Tech Stack:** HTML5, CSS3, vanilla JS, Supabase JS client v2 (CDN)

**Spec:** `docs/superpowers/specs/2026-03-13-interest-signup-design.md`

---

## Chunk 1: Database Migration

### Task 1: Create Supabase migration

**Files:**
- Create: `supabase/migrations/018_interest_signups.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- Interest signups table for collecting email addresses
CREATE TABLE interest_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  interest_type text NOT NULL CHECK (interest_type IN ('player', 'organizer', 'both')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate signups for same email+type (case-insensitive on email)
CREATE UNIQUE INDEX interest_signups_email_type_unique
  ON interest_signups (lower(email), interest_type);

-- RLS
ALTER TABLE interest_signups ENABLE ROW LEVEL SECURITY;

-- Anon can insert only (for the public form)
CREATE POLICY "anon_insert_interest"
  ON interest_signups FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated admins can read all (for admin dashboard/export)
CREATE POLICY "admin_read_interest"
  ON interest_signups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete spam rows
CREATE POLICY "admin_delete_interest"
  ON interest_signups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_interest_signups_type ON interest_signups (interest_type);
CREATE INDEX idx_interest_signups_created ON interest_signups (created_at DESC);
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use the `ocp-supabase` MCP tool `apply_migration` with the SQL above.

Expected: Migration applied successfully. Table `interest_signups` created with RLS policies and indexes.

- [ ] **Step 3: Verify table via SQL**

Run via `ocp-supabase` MCP `execute_sql`:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'interest_signups'
ORDER BY ordinal_position;
```

Expected: 5 columns (id, email, name, interest_type, created_at) with correct types.

- [ ] **Step 4: Verify RLS policies**

Run via `ocp-supabase` MCP `execute_sql`:
```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'interest_signups';
```

Expected: 3 policies — `anon_insert_interest` (INSERT/anon), `admin_read_interest` (SELECT/authenticated), `admin_delete_interest` (DELETE/authenticated).

- [ ] **Step 5: Test anon insert via SQL**

Run via `ocp-supabase` MCP `execute_sql`:
```sql
-- Test insert works (will be cleaned up)
INSERT INTO interest_signups (email, interest_type)
VALUES ('test@example.com', 'player');

-- Verify it inserted
SELECT * FROM interest_signups WHERE email = 'test@example.com';

-- Clean up
DELETE FROM interest_signups WHERE email = 'test@example.com';
```

Expected: Row inserts and returns, then is deleted.

- [ ] **Step 6: Test unique constraint**

Run via `ocp-supabase` MCP `execute_sql`:
```sql
INSERT INTO interest_signups (email, interest_type) VALUES ('dupe@example.com', 'player');
INSERT INTO interest_signups (email, interest_type) VALUES ('dupe@example.com', 'player');
```

Expected: Second insert fails with unique violation (23505). Clean up the first row.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/018_interest_signups.sql
git commit -m "feat: add interest_signups table with RLS policies"
```

---

## Chunk 2: Contact Page Redesign

### Task 2: Update contact page HTML

**Files:**
- Modify: `site/contact.html`

The current contact page has 3 cards. We need to:
1. Update card 1 (Players) — new copy, link to `interest.html?type=player`
2. Update card 2 (Organizers) — new copy, rename to "For Organizers", link to `interest.html?type=organizer`
3. Add card 3 (Partners) — new card with handshake icon, mailto link
4. Add card 4 (General Inquiries) — full-width spanning card with envelope icon, mailto link

- [ ] **Step 1: Replace the contact-grid section in `site/contact.html`**

Replace lines 86–113 (the `<div class="contact-grid">` through its closing `</div>`) with the following:

```html
      <div class="contact-grid">
        <div class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3>For Players</h3>
          <p>Want to compete in OPC tournaments? Sign up to express your interest and we'll notify you when registration opens.</p>
          <a href="interest.html?type=player" class="btn btn-primary">Register as Player</a>
        </div>

        <div class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3>For Organizers</h3>
          <p>Interested in hosting OPC-certified tournaments? Sign up to join our organizer network.</p>
          <a href="interest.html?type=organizer" class="btn btn-primary">Become Organizer</a>
        </div>

        <div class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <h3>For Partners</h3>
          <p>Want to sponsor or partner with OPC Europe? Get in touch to explore opportunities.</p>
          <a href="mailto:info@european-opc.com?subject=Partnership Inquiry" class="btn btn-primary">Email Us</a>
        </div>

        <div class="contact-card contact-card--full">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div class="contact-card--full-content">
            <h3>General Inquiries</h3>
            <p>Questions, press, or anything else? Drop us a line and we'll get back to you.</p>
          </div>
          <a href="mailto:info@european-opc.com" class="btn btn-outline">Email Us</a>
        </div>
      </div>
```

- [ ] **Step 2: Verify HTML renders in browser**

Open `site/contact.html` in a browser. Verify:
- 3 cards visible in a row (Players, Organizers, Partners)
- 1 full-width card below (General Inquiries)
- "Register as Player" links to `interest.html?type=player`
- "Become Organizer" links to `interest.html?type=organizer`
- Both "Email Us" buttons open mailto links

- [ ] **Step 3: Commit**

```bash
git add site/contact.html
git commit -m "feat: redesign contact page with 4-card layout"
```

### Task 3: Add CSS for full-width contact card

**Files:**
- Modify: `site/styles.css`

- [ ] **Step 1: Add `.contact-card--full` styles**

Insert the following CSS immediately after the `.contact-card p` rule block in `styles.css`, before the `/* --- Contact Page Responsive --- */` comment:

```css
.contact-card--full {
  grid-column: 1 / -1;
  flex-direction: row;
  text-align: left;
  padding: 32px 40px;
  gap: 24px;
}

.contact-card--full .contact-card-icon {
  flex-shrink: 0;
}

.contact-card--full-content {
  flex: 1;
}

.contact-card--full-content h3 {
  margin-bottom: 4px;
}

.contact-card--full .btn {
  flex-shrink: 0;
  align-self: center;
}
```

- [ ] **Step 2: Update 992px responsive rule**

The existing 992px rule for `.contact-grid` uses `repeat(2, 1fr)`. The full-width card already has `grid-column: 1 / -1` so it will span both columns. No change needed at 992px.

Verify: the 3 top cards show as 2+1 at 992px and the full-width card spans the full width. Acceptable per spec.

- [ ] **Step 3: Update 640px responsive rule**

At 640px, `.contact-grid` already becomes `grid-template-columns: 1fr`. Add stacking for the full-width card:

Insert inside the existing `@media (max-width: 640px)` block, after the `.contact-grid` rule:

```css
  .contact-card--full {
    flex-direction: column;
    text-align: center;
  }
```

- [ ] **Step 4: Visual QA at all breakpoints**

Open `site/contact.html` in browser and test at:
- Desktop (>1200px): 3 cards in row + full-width horizontal card below
- Tablet (992px): 2+1 cards + full-width card
- Mobile (640px): all 4 cards stacked vertically, full-width card text centered

- [ ] **Step 5: Commit**

```bash
git add site/styles.css
git commit -m "style: add full-width contact card layout with responsive"
```

---

## Chunk 3: Interest Signup Page

### Task 4: Create interest.html page

**Files:**
- Create: `site/interest.html`

- [ ] **Step 1: Create the full HTML page**

Create `site/interest.html` with the standard header/footer from `site/contact.html` as the template. Key differences from template:
- Title: `Express Interest — OPC Europe`
- Meta description: "Sign up to express your interest in OPC Europe tournaments. Register as a player, organizer, or both."
- Canonical URL: `https://opc-europe.com/interest.html`
- Add `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` in `<head>`
- OG/Twitter meta tags updated for this page

The page content between header and footer:

```html
  <!-- Interest Signup -->
  <section class="interest-page">
    <div class="interest-container">
      <div class="interest-header">
        <h1>Express Your Interest</h1>
        <p>Sign up to be notified when OPC Europe opens for registration.</p>
      </div>

      <form class="interest-form" id="interest-form" novalidate>
        <div class="interest-toggles" role="radiogroup" aria-label="Interest type">
          <button type="button" class="interest-toggle interest-toggle--active" role="radio" aria-checked="true" data-type="player">Player</button>
          <button type="button" class="interest-toggle" role="radio" aria-checked="false" data-type="organizer">Organizer</button>
          <button type="button" class="interest-toggle" role="radio" aria-checked="false" data-type="both">Both</button>
        </div>

        <div class="interest-field">
          <label for="interest-email">Email address <span class="interest-required">*</span></label>
          <input type="email" id="interest-email" name="email" class="interest-input" placeholder="you@example.com" required>
        </div>

        <div class="interest-field">
          <label for="interest-name">Name</label>
          <input type="text" id="interest-name" name="name" class="interest-input" placeholder="Your name (optional)">
        </div>

        <!-- Honeypot — hidden from real users -->
        <div class="interest-hp" aria-hidden="true">
          <label for="interest-website">Website</label>
          <input type="text" id="interest-website" name="website" tabindex="-1" autocomplete="off">
        </div>

        <button type="submit" class="btn btn-primary interest-submit" id="interest-submit">Sign Up</button>

        <p class="interest-error" id="interest-error" role="alert"></p>
      </form>

      <div class="interest-success" id="interest-success">
        <div class="interest-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2e90fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2>Thanks for your interest!</h2>
        <p>We'll be in touch when registration opens.</p>
        <a href="index.html" class="btn btn-outline">Back to Home</a>
      </div>
    </div>
  </section>
```

The page JS goes in a `<script>` block before `</body>` (after the standard mobile nav/scroll JS):

```javascript
    // --- Interest Signup Form ---
    const SUPABASE_URL = 'https://uxlnhyeijfeiurwleecy.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bG5oeWVpamZlaXVyd2xlZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDEzNzMsImV4cCI6MjA4ODU3NzM3M30.eTN24hvQjitsLvOXo7hAs92YIQprgjks6rfhzkmdbgY';
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const form = document.getElementById('interest-form');
    const submitBtn = document.getElementById('interest-submit');
    const errorEl = document.getElementById('interest-error');
    const successEl = document.getElementById('interest-success');
    const toggles = document.querySelectorAll('.interest-toggle');
    let selectedType = 'player';

    // Pre-select from URL param
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    if (['player', 'organizer', 'both'].includes(typeParam)) {
      selectedType = typeParam;
      toggles.forEach(t => {
        const isActive = t.dataset.type === selectedType;
        t.classList.toggle('interest-toggle--active', isActive);
        t.setAttribute('aria-checked', isActive);
      });
    }

    // Toggle button click
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        selectedType = toggle.dataset.type;
        toggles.forEach(t => {
          const isActive = t === toggle;
          t.classList.toggle('interest-toggle--active', isActive);
          t.setAttribute('aria-checked', isActive);
        });
      });
    });

    // Keyboard navigation for radio group
    document.querySelector('.interest-toggles').addEventListener('keydown', (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const arr = Array.from(toggles);
      const idx = arr.findIndex(t => t.classList.contains('interest-toggle--active'));
      let next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (idx + 1) % arr.length;
      } else {
        next = (idx - 1 + arr.length) % arr.length;
      }
      arr[next].click();
      arr[next].focus();
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';

      const email = document.getElementById('interest-email').value.trim().toLowerCase();
      const name = document.getElementById('interest-name').value.trim() || null;
      const honeypot = document.getElementById('interest-website').value;

      // Validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = 'Please enter a valid email address.';
        return;
      }

      // Disable button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing up...';

      // Honeypot check — fake success
      if (honeypot) {
        form.style.display = 'none';
        successEl.style.display = 'flex';
        return;
      }

      // Insert into Supabase
      const { error } = await sb
        .from('interest_signups')
        .insert({ email, name, interest_type: selectedType });

      if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';

        if (error.code === '23505') {
          // Duplicate — still a success from user perspective
          form.style.display = 'none';
          successEl.style.display = 'flex';
          successEl.querySelector('h2').textContent = "You're already signed up for this.";
          successEl.querySelector('p').textContent = "We'll be in touch!";
          return;
        }

        errorEl.textContent = 'Something went wrong. Please try again or email us at info@european-opc.com.';
        return;
      }

      // Success
      form.style.display = 'none';
      successEl.style.display = 'flex';
    });
```

- [ ] **Step 2: Verify page loads in browser**

Open `site/interest.html` in browser. Verify:
- Header/footer render correctly
- Form visible with 3 toggle buttons, email input, name input, submit button
- Honeypot field is NOT visible
- "Player" toggle is active by default

- [ ] **Step 3: Test URL parameter pre-selection**

Open `site/interest.html?type=organizer` — verify "Organizer" toggle is active.
Open `site/interest.html?type=both` — verify "Both" toggle is active.
Open `site/interest.html?type=invalid` — verify "Player" is still active (fallback).

- [ ] **Step 4: Commit**

```bash
git add site/interest.html
git commit -m "feat: add interest signup page with Supabase form"
```

### Task 5: Add interest page CSS

**Files:**
- Modify: `site/styles.css`

- [ ] **Step 1: Add interest page styles**

Insert the following CSS in `site/styles.css` immediately before the `/* --- Legal / Text Pages --- */` section comment:

```css
/* --- Interest Signup Page --- */
.interest-page {
  padding: 96px 80px;
}

.interest-container {
  max-width: 1440px;
  margin: 0 auto;
}

.interest-header {
  text-align: center;
  margin-bottom: 48px;
}

.interest-header h1 {
  font-size: 36px;
  font-weight: 600;
  line-height: 44px;
  margin-bottom: 12px;
}

.interest-header p {
  font-size: 18px;
  line-height: 28px;
  color: var(--color-text-secondary);
}

.interest-form {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.interest-toggles {
  display: flex;
  gap: 8px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 4px;
}

.interest-toggle {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.interest-toggle:hover {
  color: var(--color-text-primary);
}

.interest-toggle--active {
  background-color: var(--color-brand);
  color: #fff;
}

.interest-field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--color-text-secondary);
}

.interest-required {
  color: var(--color-brand-light);
}

.interest-input {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.interest-input::placeholder {
  color: #555;
}

.interest-input:focus {
  border-color: var(--color-brand);
}

.interest-hp {
  display: none;
}

.interest-submit {
  width: 100%;
  margin-top: 8px;
}

.interest-error {
  color: #f04438;
  font-size: 14px;
  text-align: center;
  min-height: 20px;
}

.interest-success {
  display: none;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  max-width: 480px;
  margin: 0 auto;
  padding: 48px 0;
}

.interest-success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-brand-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.interest-success h2 {
  font-size: 24px;
  font-weight: 600;
}

.interest-success p {
  font-size: 16px;
  color: var(--color-text-secondary);
}

/* --- Interest Signup Page Responsive --- */
@media (max-width: 992px) {
  .interest-page {
    padding: 64px 40px;
  }
}

@media (max-width: 640px) {
  .interest-page {
    padding: 48px 16px;
  }

  .interest-header h1 {
    font-size: 28px;
    line-height: 36px;
  }

  .interest-toggles {
    flex-direction: column;
  }
}
```

- [ ] **Step 2: Visual QA at all breakpoints**

Open `site/interest.html` in browser and test at:
- Desktop (>1200px): form centered at 480px max-width, toggles in a row
- Tablet (992px): reduced padding, still looks good
- Mobile (640px): toggles stack vertically, inputs full width

- [ ] **Step 3: Commit**

```bash
git add site/styles.css
git commit -m "style: add interest signup page styles with responsive"
```

### Task 6: End-to-end manual test

- [ ] **Step 1: Test full signup flow**

1. Open `site/contact.html`
2. Click "Register as Player" → should navigate to `interest.html?type=player` with Player toggle active
3. Enter an email and click "Sign Up"
4. Verify success message appears
5. Check Supabase dashboard — row should exist in `interest_signups`

- [ ] **Step 2: Test organizer flow**

1. Open `site/contact.html`
2. Click "Become Organizer" → should navigate to `interest.html?type=organizer` with Organizer toggle active
3. Enter same email and click "Sign Up"
4. Verify success (different type, so no duplicate error)

- [ ] **Step 3: Test duplicate detection**

1. Open `interest.html?type=player`
2. Enter the same email used in Step 1
3. Click "Sign Up"
4. Verify "You're already signed up!" message appears

- [ ] **Step 4: Test partner/general mailto buttons**

1. On `contact.html`, click "Email Us" on Partners card — should open email client with `info@european-opc.com` and subject "Partnership Inquiry"
2. Click "Email Us" on General Inquiries card — should open email client with `info@european-opc.com`

- [ ] **Step 5: Test validation**

1. On `interest.html`, leave email empty and click "Sign Up"
2. Verify error message "Please enter a valid email address."
3. Enter invalid email (e.g. "notanemail") and submit
4. Verify same error message

- [ ] **Step 6: Test toggle keyboard navigation**

1. Focus on a toggle button
2. Press ArrowRight — next toggle should activate
3. Press ArrowLeft — previous toggle should activate
4. Verify `aria-checked` attributes update correctly

- [ ] **Step 7: Clean up test data**

Via `ocp-supabase` MCP `execute_sql`:
```sql
DELETE FROM interest_signups WHERE email IN ('test@example.com', 'dupe@example.com');
```

- [ ] **Step 8: Final commit (if any files changed during testing)**

Only commit if manual testing revealed issues that were fixed. Stage specific changed files:

```bash
git add site/interest.html site/contact.html site/styles.css
git commit -m "fix: address issues found during E2E testing"
```
