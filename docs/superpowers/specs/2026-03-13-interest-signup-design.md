# Interest Signup System — Design Spec

**Date:** 2026-03-13
**Status:** Approved

## Goal

Allow visitors to express interest in OPC as a player, organizer, or both by collecting email addresses. Redesign the contact page to clearly separate these funnels from partner/general inquiries (which use email).

## 1. Contact Page Redesign (`site/contact.html`)

### Layout

Three cards in the top row + one full-width card spanning below:

```
┌─────────────┬─────────────┬─────────────┐
│  For Players │ For Organizers│ For Partners │
│             │             │             │
│ [Register]  │ [Become Org]│ [Email Us]  │
└─────────────┴─────────────┴─────────────┘
┌─────────────────────────────────────────────┐
│          General Inquiries                  │
│                                             │
│          [Email Us]                         │
└─────────────────────────────────────────────┘
```

### Card Details

| Card | Title | Description | Button | Target |
|------|-------|-------------|--------|--------|
| Players | For Players | "Want to compete in OPC tournaments? Sign up to express your interest and we'll notify you when registration opens." | "Register as Player" (btn-primary) | `interest.html?type=player` |
| Organizers | For Organizers | "Interested in hosting OPC-certified tournaments? Sign up to join our organizer network." | "Become Organizer" (btn-primary) | `interest.html?type=organizer` |
| Partners | For Partners | "Want to sponsor or partner with OPC Europe? Get in touch to explore opportunities." | "Email Us" (btn-primary) | `mailto:info@european-opc.com?subject=Partnership Inquiry` |
| General (full-width) | General Inquiries | "Questions, press, or anything else? Drop us a line and we'll get back to you." | "Email Us" (btn-outline) | `mailto:info@european-opc.com` |

### CSS Changes

- `.contact-grid`: keep existing 3-column grid
- New `.contact-card--full`: `grid-column: 1 / -1`, horizontal layout (icon + text left, button right) at desktop, stacks on mobile
- Partners card gets a new icon (handshake/partnership SVG)
- General inquiries card uses the existing envelope icon
- Responsive: at 992px, top row goes to 2+1 layout (acceptable), full-width card stays full-width. At 640px, everything stacks to single column.

## 2. Interest Signup Page (`site/interest.html`)

### URL Parameters

- `?type=player` — pre-selects Player
- `?type=organizer` — pre-selects Organizer
- `?type=both` — pre-selects Both
- No param or invalid param — defaults to Player

### Page Structure

```
Header (standard site nav)

Section: "Express Your Interest"
  Subtitle: "Sign up to be notified when OPC Europe opens for registration."

  Form:
    Interest type: 3 toggle buttons [Player] [Organizer] [Both]
    Email: text input (required)
    Name: text input (optional, placeholder "Your name (optional)")
    [Submit: "Sign Up"]

  Success state: replaces form with confirmation message
  Error state: inline error below form

Footer (standard site footer)
```

### Form Behavior

1. **On load:** parse `?type=` from URL, activate matching toggle. Default to "Player" if missing/invalid.
2. **Email normalization:** `email.trim().toLowerCase()` before insert to prevent case-sensitive duplicates.
3. **Validation:** email required (HTML5 `type="email"` + basic regex check). Interest type always has a value.
4. **Honeypot spam check:** a hidden field (`name="website"`, hidden via CSS `display: none` on wrapper). If filled, silently skip the Supabase insert and show the success message (don't reveal the check to bots).
5. **On submit:**
   - Disable button, show loading state ("Signing up...")
   - If honeypot is filled → show fake success, return early
   - Insert into Supabase `interest_signups` via anon client (CDN, same pattern as `ranking.html`)
   - **Success:** hide form, show confirmation: "Thanks for your interest! We'll be in touch when registration opens."
   - **Duplicate** (`error.code === '23505'` from Supabase): show friendly message: "You're already signed up for this. We'll be in touch!"
   - **Error:** show inline error: "Something went wrong. Please try again or email us at info@european-opc.com."

### Overlap Semantics

A user can sign up as "player" and later as "organizer" — both rows are kept. This is semantically similar to "both" but stored as separate rows. This is acceptable; deduplication happens at query time if needed. The unique constraint only prevents the exact same `(email, interest_type)` pair.

### Accessibility

Toggle buttons use `role="radiogroup"` on the container and `role="radio"` + `aria-checked` on each toggle. Keyboard navigation: arrow keys switch between toggles.

### CSS Classes

- `.interest-page` — page wrapper
- `.interest-form` — form container (max-width ~480px, centered)
- `.interest-toggles` — flex row of toggle buttons
- `.interest-toggle` — individual toggle, `.interest-toggle--active` for selected state
- `.interest-input` — styled text inputs (consistent with site design)
- `.interest-submit` — submit button (reuses `.btn .btn-primary`)
- `.interest-success` — confirmation message container
- `.interest-error` — inline error text

### Supabase Client Setup

Same CDN pattern as `ranking.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
Uses the existing anon key. Insert only — no reads from client.

### Page Boilerplate

Follow "Creating New Static Pages" from CLAUDE.md: standard `<head>` (OG/Twitter meta tags, title "Express Interest — OPC Europe"), header nav, footer, scroll-reveal JS, mobile nav toggle JS.

## 3. Supabase Migration

**Migration file:** `supabase/migrations/018_interest_signups.sql`

### Table: `interest_signups`

```sql
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
```

### Index

```sql
CREATE INDEX idx_interest_signups_type ON interest_signups (interest_type);
CREATE INDEX idx_interest_signups_created ON interest_signups (created_at DESC);
```

## 4. Pages That Link to Contact/Interest

No changes needed to other pages. The existing flow is:

- Homepage buttons → `contact.html` → contact page funnels to `interest.html`
- Country CTA buttons → `contact.html` or `index.html#join`
- Tournament detail → `index.html#join`

The contact page is the single funnel point. All existing links remain valid.

## 5. Out of Scope

- Email notifications/welcome emails on signup
- Admin UI to view signups (use Supabase dashboard for now)
- Rate limiting beyond the unique constraint
- Cloudflare Turnstile / reCAPTCHA (upgrade path if honeypot proves insufficient)
