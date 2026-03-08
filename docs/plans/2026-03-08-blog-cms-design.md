# Blog/News CMS Design — Payload CMS

**Date:** 2026-03-08
**Status:** Approved

## Problem

The OPC site needs a blog/news section where non-technical editors can publish content (tournament news, player stories, strategy articles) using a visual editor. Content is a mix of short news updates (1-3/week) and longer blog articles (1-4/month).

## Decision

**Payload CMS v3** embedded in the Next.js platform (`/platform/`), using Supabase Postgres as the database.

### Why Payload CMS

- **Next.js-native** — embeds directly in the platform app, no separate service to host
- **Supabase Postgres** — uses the database already planned for the platform
- **Rich text editor** — Lexical-based visual editor, suitable for non-technical users
- **Free & open source** — no monthly fees
- **Built-in features** — draft/publish workflow, media library, user roles, REST API
- **SSR** — blog pages rendered server-side for SEO and social sharing

### Alternatives considered

1. **n8n form + Supabase + client-side rendering** — Fastest to ship but poor SEO and basic editor experience
2. **Eleventy + Decap CMS** — Good static output but introduces a build tool and requires editors to have GitHub accounts
3. **Ghost / Strapi / Directus** — Requires separate hosting for another service
4. **Supabase + custom admin UI** — More work to build what Payload provides out of the box

## Architecture

```
platform/
  payload.config.ts              ← Payload config
  collections/
    Posts.ts                     ← Blog/news posts
    Media.ts                     ← Image uploads
    Users.ts                     ← Admin/editor users
  app/
    (payload)/admin/             ← Admin panel (editors use this)
    (frontend)/news/             ← Public news listing (SSR)
    (frontend)/news/[slug]/      ← Individual post pages (SSR)

site/
  index.html                     ← "Latest News" section added
  *.html                         ← "News" link added to nav
```

## Content Model: Posts

| Field | Type | Notes |
|-------|------|-------|
| title | text (required) | |
| slug | text (unique) | Auto-generated from title |
| excerpt | textarea | Card preview text |
| content | richText (Lexical) | Visual editor with bold, italic, headings, lists, images |
| coverImage | upload (Media) | |
| category | select: news / blog | |
| tags | text array | e.g. tournament, strategy, results |
| isFeatured | checkbox | Pinned to top of listing |
| author | text | Display name |
| publishedAt | date | |
| _status | draft / published | Built-in Payload drafts |

## Public Pages

### News listing (`/news`)
- Filter tabs: All / News / Blog
- Featured posts displayed prominently at top
- Card grid matching static site's dark theme and event card pattern
- Tag filtering, pagination

### Single post (`/news/[slug]`)
- Full post with rich text content
- SEO metadata via `generateMetadata()` — title, description, og:image
- Author, date, tags, category

### Static site homepage
- "Latest News" section showing 3 most recent posts
- Fetched client-side via Payload REST API
- Links to full news page on the platform

## Editor Experience

Non-technical editors:
1. Go to `app.opc-europe.com/admin`
2. Log in with email/password
3. Click "Posts" → "Create New"
4. Fill in title, category, tags, author
5. Write content in the visual rich text editor (bold, italic, headings, lists, images)
6. Upload a cover image
7. Save as draft or publish immediately

## Design Tokens

Blog pages match the static site using these tokens from `site/styles.css`:
- Background: `#0c0e12` (primary), `#161b22` (secondary), `#161b26` (cards)
- Text: `#f5f5f6` (primary), `#94969c` (secondary)
- Brand: `#1570ef`
- Font: Inter 400/500/600/700
- Breakpoints: 1200px, 992px, 640px
