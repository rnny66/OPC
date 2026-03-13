# OPC Europe — Scope & Deliverables Webapplicatie

**Project:** OPC Europe — European Open Poker Championship
**Documenttype:** Scope of work — Toernooimanagement-webapplicatie
**Datum:** 12 maart 2026
**Versie:** 1.0

---

## 1. Projectsamenvatting

Ontwerp en ontwikkeling van een full-stack toernooimanagement-webapplicatie voor OPC Europe. De applicatie breidt de statische marketingwebsite uit met spelersaccounts, toernooiregistratie, organisatortools, geautomatiseerde rankings, identiteitsverificatie, adminbeheer en een contentmanagementsysteem.

Gebouwd met Next.js 15 (App Router, TypeScript), Supabase (auth, database, opslag), Payload CMS v3 en Didit identiteitsverificatie. Gehost op Vercel op `app.opc-europe.com`.

---

## 2. Scope of Work

### 2.1 Basis & Infrastructuur

Opzet van de monorepo, authenticatiesysteem en databaselaag.

**Deliverables:**

- Monorepo-structuur met npm workspaces (`site/`, `platform/`, `supabase/`)
- Next.js 15 app met App Router en TypeScript
- Design system bridge — gedeelde CSS-tokens uit statische site
- Supabase-projectsetup — database, authenticatie, opslag
- Gebruikersauthenticatie — e-mail/wachtwoord, Google OAuth, Facebook OAuth
- Sessiebeheer met `@supabase/ssr` (cookie-gebaseerd, server-side)
- Routebeveiliging via middleware (publiek, beveiligd, organisator, admin)
- `profiles` tabel automatisch aangemaakt bij registratie via trigger
- Testframework — Vitest + React Testing Library + MSW 2 + Playwright + pgTAP
- 16 voorbeeldtoernooien in 4 landen

### 2.2 Toernooiflow

Spelersgericht toernooi-ervaring.

**Deliverables:**

- Toernooi-overzichtspagina met server-side filtering (land, serie, zoeken)
- Toernooidetailpagina met volledige evenementinformatie
- Spelerregistratieflow (met capaciteitscontrole, verificatie-afdwinging)
- Spelerdashboard — geregistreerde toernooien, aankomende evenementen
- Spelersprofiel — avatar-upload, bio, social links, onboarding-flow
- Responsief ontwerp passend bij statische site-stijl

### 2.3 Organisatortools

Tools voor toernooiorganisatoren (alleen op uitnodiging).

**Deliverables:**

- Organisatordashboard met toernooioverzicht en statistieken
- Toernooi-CRUD — aanmaken, bewerken, beheren van toernooien
- Registratiebeheer — deelnemers bekijken, status bijwerken (geregistreerd, bevestigd, geannuleerd, niet verschenen)
- CSV-export van registraties
- Resultaatinvoer — plaatsingen vastleggen na afloop toernooi
- Puntberekeningsengine met configureerbare brackets en landmultipliers

### 2.4 Rankings & Spelersprofielen

Publiek klassement en uitgebreide spelersprofielen.

**Deliverables:**

- Publieke klassementpagina — doorzoekbaar, filterbaar, gepagineerd
- Rangwijzigingsindicatoren (omhoog/omlaag/gelijk)
- Slug-gebaseerde publieke spelersprofielen (`/players/[slug]`)
- Spelersstatistieken — totaal punten, gespeelde toernooien, overwinningen, top-3, gemiddelde finish
- Achievement-badgesysteem — 8 badges met automatische ontgrendelingscriteria
- Toernooigeschiedenis per speler
- Rankings per land

### 2.5 Adminpaneel

Beheertools voor platformbeheer.

**Deliverables:**

- Admindashboard met platformbrede statistieken
- Gebruikersbeheer — gebruikers zoeken, promoveren tot organisator, details bekijken
- Organisatoruitnodigingssysteem — e-mailuitnodigingen met automatische promotie bij registratie
- Toernooioverzicht — alle toernooien bekijken, annuleren, beheren
- Puntenbracketconfiguratie — bewerkbare plaatsing-naar-punten-toewijzing
- Landconfiguratie — multipliers en aangepaste brackets per land
- Bulkherberekening van statistieken

### 2.6 Identiteitsverificatie

Leeftijdsverificatie (18+) voor wettelijke naleving.

**Deliverables:**

- Didit v3 API-integratie (redirect-gebaseerd, geen client-SDK)
- Verificatiesessie-aanmaak API-route
- Webhook-handler met HMAC-SHA256 handtekeningvalidatie
- Per-toernooi verificatie-afdwinging
- Verificatiestatusbadge op profiel en dashboard

### 2.7 Contentmanagementsysteem (CMS)

Zelfgehost CMS waarmee het OPC-team dynamische content kan beheren.

**Deliverables:**

- Payload CMS v3 geïntegreerd in Next.js (geen aparte dienst)
- Beheerpaneel op `/cms` (eigen authenticatie, apart van Supabase)
- Drie contenttypes: Nieuws/Blog (met categorie), Evenementenaankondigingen (toernooi-gekoppeld), Media
- Publieke contentpagina's: `/news`, `/blog`, `/events` met SSR en SEO-metadata
- Feature flags voor CMS-routes (cms_admin, cms_news, cms_blog, cms_events)
- Aangepast toernooiselectieveld voor koppeling van aankondigingen aan toernooien

---

## 3. Technische Architectuur

| Component | Technologie |
|-----------|-------------|
| Framework | Next.js 15.4.11 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL met RLS) |
| Authenticatie | Supabase Auth (e-mail + Google + Facebook) |
| Bestandsopslag | Supabase Storage (avatars-bucket) |
| Identiteitsverificatie | Didit v3 API |
| CMS | Payload CMS v3 (geïntegreerd, Lexical rich text) |
| Hosting | Vercel (Pro-abonnement) |
| E-mail | Brevo (transactioneel) |
| Unit testing | Vitest 4 + React Testing Library + MSW 2 |
| E2E testing | Playwright |
| DB testing | pgTAP |

### Database

- 15 tabellen in `public` schema met RLS op alle tabellen
- Payload CMS tabellen in apart `payload` schema
- Kernfuncties: `calculate_points`, `compute_player_stats`, `check_achievements`
- Triggers voor automatische statistiekberekening bij resultaatinvoer en automatische promotie van uitgenodigde organisatoren

### Beveiliging

- Row-Level Security op alle tabellen — geen directe datatoegang zonder beleidsovereenkomst
- Rolgebaseerde toegang: speler, organisator, admin
- Server Components standaard, `'use client'` alleen voor interactieve formulieren
- Server Actions voor alle mutaties (geen client-side API-aanroepen voor schrijfacties)
- HMAC-SHA256 webhook-handtekeningvalidatie voor Didit

---

## 4. Niet Inbegrepen

- Mobiele native app (iOS/Android)
- Betalingsverwerking of inschrijfgeld-incasso
- Live toernooiklok of tafelbeheer
- Chat of berichten tussen spelers
- E-mailmarketing of nieuwsbriefsysteem
- Meertaligheid / internationalisatie (i18n)
- Real-time notificaties (push, WebSocket)
- Geavanceerd analytisch dashboard
- Domeinregistratie (eigendom opdrachtgever)

---

## 5. Overzicht Deliverables

| # | Deliverable | Omschrijving |
|---|-------------|-------------|
| 1 | Basis & infrastructuur | Monorepo, auth, DB, testframework |
| 2 | Toernooiflow | Bladeren, detail, registreren, dashboard, profiel |
| 3 | Organisatortools | Toernooi-CRUD, registraties, resultaatinvoer, puntengine |
| 4 | Rankings & profielen | Klassement, spelersprofielen, achievements, landrankings |
| 5 | Adminpaneel | Gebruikersbeheer, organisatoruitnodigingen, toernooioverzicht, configuratie |
| 6 | Identiteitsverificatie | Didit-integratie, webhook-handler, per-toernooi afdwinging |
| 7 | CMS | Payload CMS, nieuws/blog/evenementen, feature flags |

---

## 6. Ureninschatting

> *Deze schattingen dekken alleen de webapplicatie — de statische site en het master ranking-systeem worden apart begroot.*

| Fase | Omschrijving | Geschatte uren |
|------|-------------|----------------|
| Fase 0 — Testframework | Vitest, MSW 2, Playwright, pgTAP setup | 12 |
| Fase 1 — Basis | Monorepo, auth, DB, design bridge, middleware | 40 |
| Fase 2 — Toernooiflow | Bladeren, detail, registreren, dashboard, profiel, avatar | 48 |
| Fase 3 — Organisatortools | Dashboard, toernooi-CRUD, registraties, resultaatinvoer, puntberekening, landpunten, adminconfiguratie | 64 |
| Fase 4 — Rankings & profielen | Publiek klassement, spelersprofielen, achievements, responsief | 32 |
| Fase 5 — Admin & verificatie | Adminpaneel, gebruikersbeheer, organisatoruitnodigingen, Didit-integratie | 40 |
| CMS — Payload-integratie | Payload-setup, 3 contenttypes, 3 publieke pagina's, feature flags | 24 |
| QA & overkoepelend | Integratietesten, E2E-testen, DB-testen, responsieve QA | 16 |
| **Totaal** | | **276 uur** |

---

## 7. Deployment & Infrastructuur

Gehost op dezelfde infrastructuur als de statische site — geen extra hostingkosten.

| Dienst | Rol | Reeds ingericht |
|--------|-----|-----------------|
| Vercel Pro | Next.js hosting, SSR, CMS | Ja |
| Supabase Pro | Database, auth, opslag | Ja |
| Brevo | Transactionele e-mail | Ja (gratis tier) |
| Didit | Identiteitsverificatie | Ja (op basis van gebruik) |

---

## 8. Relatie tot Statische Site

De webapplicatie en statische site bestaan naast elkaar als monorepo:

- **Statische site** (`opc-europe.com`) — marketingpagina's, master ranking, resultaten-upload
- **Webapplicatie** (`app.opc-europe.com`) — spelersaccounts, toernooimanagement, organisator-/admintools

Beide delen hetzelfde Supabase-project en dezelfde designtokens. De statische site kan onafhankelijk functioneren — de webapplicatie is aanvullend.
