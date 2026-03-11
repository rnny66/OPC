# OPC Europe — Scope & Deliverables Statische Website

**Project:** OPC Europe — European Open Poker Championship
**Documenttype:** Scope of work — Statische marketingwebsite
**Datum:** 11 maart 2026
**Versie:** 1.0

---

## 1. Projectsamenvatting

Ontwerp en ontwikkeling van een premium, donker-thema marketingwebsite voor het European Open Poker Championship (OPC Europe). De site dient als het publieke gezicht van het merk en presenteert toernooiinformatie, spelersrankings, landspecifieke pagina's en juridische/compliance-content.

De website wordt gebouwd als een volledig statische site (HTML, CSS, vanilla JavaScript) — geen frameworks, geen buildtools — wat zorgt voor snelle laadtijden, eenvoudige hosting en geen doorlopende infrastructuurkosten.

---

## 2. Scope of Work

### 2.1 Designsysteem & Basis

Een op maat gebouwd designsysteem dat zorgt voor een consistente visuele identiteit op alle pagina's.

**Deliverables:**

- Donker premium ontwerp (`#0c0e12` achtergrond, `#1570ef` blauw accent)
- Volledig CSS custom property (token) systeem voor kleuren, spacing, typografie, randen en schaduwen
- Typografiesysteem met Inter-lettertype (gewichten 400–700) met gedefinieerde schaal van body tot hero-koppen
- Herbruikbare componentbibliotheek: knoppen, kaarten, navigatie, dropdowns, formulierelementen, statistiekkaarten, partnerlogo's, footer
- Responsief framework met drie breakpoints (1200px, 992px, 640px — desktop, tablet, mobiel)
- Scroll-reveal animatiesysteem met IntersectionObserver (fade-in + translateY transities)
- Gestaffelde animaties voor kaartgrids en lijsten
- Geanimeerde SVG-verbindingslijnen (marcherende streepjes) voor stapsgewijze secties
- Hero-entreeanimaties met gestaffelde vertragingen
- Ondersteuning voor verminderde beweging (`prefers-reduced-motion` media query)
- Sticky header met scroll-getriggerde achtergrondtransitie
- Mobiele hamburgernavigatie met volledig scherm-overlay

### 2.2 Homepage

De hoofdlandingspagina, ontworpen om zowel spelers als toernooiorganisatoren te converteren.

**Deliverables:**

- Hero-sectie met kop, ondertitel en twee CTA-knoppen (Bekijk Rankings, Organisator CTA)
- Hero-afbeelding showcase
- Statistiekenbalk (250+ spelers, 20+ toernooien, 5 landen, avatargroep)
- "Wat is OPC?" sectie met afbeelding en beschrijving
- "Waarom OPC?" — twee voordeelkaarten (Spelers vs Organisatoren) met checklijst-items
- "Hoe het werkt" — twee-koloms stapsgewijze flow (Spelers en Organisatoren), elk met 3 stappen, geanimeerde SVG-verbindingslijnen en footer-CTA
- Laatste Nieuws-sectie met links naar Nieuws, Blog en Evenementen
- Aankomende Evenementen-sectie — 4 toernooi-eventkaarten met vlag, locatie, datum en inschrijfgeld
- Oprichterssectie — twee oprichtersprofielen (Marcel Luske, Noah Boeken) met foto's, bio's en lees-meer-links
- Partnerssectie — logorij + word-partner-CTA

### 2.3 Toernooienpagina

Een filterbare toernooilijstpagina met aankomende evenementen.

**Deliverables:**

- Paginakop met titel en beschrijving
- Zoekveld om toernooien op naam te vinden
- Landfilter-dropdown (Nederland, België, Duitsland, Engeland, Polen, Oostenrijk)
- Toernooikaart-gridlayout
- Elke kaart toont: toernooienaam, locatie/partnerlogo, landvlag, locatie, datum en inschrijfgeld
- "Bekijk details" link per kaart
- Pagineringscontrols
- Responsief grid (3 kolommen → 2 → 1)

### 2.4 Rankingspagina

Een publiek klassement met spelersrankings op basis van voorbeelddata.

**Deliverables:**

- Paginakop met titel
- Zoekveld om spelers op naam te vinden
- Landfilter-dropdown
- Rankingstabel met kolommen: positie, spelernaam, nationaliteit (vlag), punten, gespeelde toernooien, overwinningen
- 20 rijen met voorbeeldspelersdata
- "Hoe Rankings Werken" zijbalk-uitlegpaneel
- Pagineringscontrols
- Responsieve tabellayout (horizontaal scrollen op mobiel)

### 2.5 Landingspagina's per Land

Specifieke landingspagina's voor elk land waar OPC actief is, ontworpen voor lokale SEO en partnerzichtbaarheid.

**Landen (6 totaal):**

| Land | Status |
|------|--------|
| Nederland | Gereed |
| Duitsland | Gereed |
| Engeland | Gereed |
| Polen | Gereed |
| België | Gereed |
| Oostenrijk | Gereed |

**Elke landenpagina bevat:**

- Hero-sectie met landvlag en "OPC [Land]" kop
- Lokale Partners-sectie — 3-kaarten grid voor partnerlocaties (placeholder-content, klaar voor echte partnerdata)
- Aankomende Evenementen-sectie — 2 toernooi-eventkaarten met lokale locatiedetails
- "Poker in [Land]" — redactionele sectie over de lokale pokerscene
- CTA-sectie — "Registreer als Speler" en "Word Partner" knoppen
- Alle secties met scroll-reveal animaties

### 2.6 Toernooidetailpagina

Een speciale detailpagina voor individuele toernooien, met volledige evenementinformatie voor potentiële spelers.

**Deliverables:**

- Breadcrumb-navigatie (Home > Toernooien > Toernooinaam)
- Hero-sectie met landvlag, toernooinaam, seriebadge en kerninfo (datum, locatie, inschrijftype)
- "Nu Registreren" en "Alle Toernooien" CTA-knoppen
- Over Dit Toernooi-sectie — 2-3 alinea's met beschrijving van het evenement
- Schema & Format-sectie — 4-daags schemagrid (Dag 1–4 met programma-overzicht) en formatinfokaarten (blindniveaus, startstack, structuur)
- Locatie-sectie — twee-koloms layout met locatienaam, adres, beschrijving en placeholder-afbeelding
- Gerelateerde Toernooien-sectie — 3 toernooikaarten met links naar andere evenementen, plus "Alle Toernooien" knop
- CTA-sectie — "Registreer als Speler" en "Alle Toernooien" knoppen
- JSON-LD gestructureerde data (`Event` schema met start-/einddatum, locatie, organisator)
- Alle toernooikaarten op de toernooienpagina, homepage en landenpagina's linken naar deze detailpagina
- Responsief op alle drie breakpoints (desktop, tablet, mobiel)
- CSS-classes gebruiken `.td-*` prefix (toernooidetail)

### 2.7 Over Ons-pagina

Een speciale pagina die OPC Europe, haar missie en oprichters presenteert.

**Deliverables:**

- Over OPC-sectie met missieverklaring en achtergrond
- Oprichtersprofielen (Marcel Lüske, Noah Boeken) met foto's en bio's
- Consistente header/footer
- Gelinkt vanuit de "Over OPC" dropdown en "Lees het volledige verhaal" knoppen op de homepage

### 2.8 Contactpagina

**Deliverables:**

- Contactformulier met invoervelden
- Ondersteunings-/partnerinformatie
- Consistente header/footer

### 2.9 Juridische & Compliance-pagina's

Drie juridische pagina's vereist voor wettelijke naleving.

**Deliverables:**

- **Privacybeleid** — AVG-conform privacybeleid over gegevensverzameling, gebruik en gebruikersrechten
- **Algemene Voorwaarden** — Platformvoorwaarden, gebruikersverantwoordelijkheden en disclaimers
- **Verantwoord Spelen** — Educatieve content over verantwoord gokken, zelfuitsluiting en leeftijdsverificatiebeleid

### 2.10 SEO & Technische Optimalisatie

Zoekmachineoptimalisatie en technische best practices toegepast op alle pagina's.

**Deliverables:**

- Unieke `<title>` en `<meta description>` tags per pagina
- Canonical URLs (`<link rel="canonical">`) op elke pagina
- Open Graph metatags (titel, beschrijving, afbeelding, URL, type, site_name) voor social sharing op Facebook, LinkedIn, etc.
- Twitter Card metatags (summary_large_image) voor Twitter/X sharing
- JSON-LD gestructureerde data:
  - `Organization` schema op homepage
  - `WebSite` schema op homepage
  - `BreadcrumbList` schema op landenpagina's
- `sitemap.xml` met alle 13 publieke URL's met passende wijzigingsfrequenties en prioriteitswaarden
- `robots.txt` met sitemap-verwijzing en geblokkeerde conceptpagina's
- Semantische HTML5 doorheen de hele site (`<header>`, `<nav>`, `<section>`, `<footer>`, `<main>`)
- Alt-tekst op alle afbeeldingen
- `loading="lazy"` op afbeeldingen onder de vouw
- Font preconnect hints voor Google Fonts
- Favicon-configuratie

### 2.11 Globale Componenten

Gedeelde componenten die consistent zijn op elke pagina.

**Deliverables:**

- **Headernavigatie** — logo, 6 navigatie-items (Home, Rankings, Toernooien, Nieuws, Landen-dropdown, Over OPC-dropdown), "Hoe mee te doen" CTA-knop
- **Landen-dropdown** — 6 landenlinks in mega-menustijl
- **Over OPC-dropdown** — Over ons, Contact, Verantwoord Spelen links
- **Mobiele navigatie** — hamburgertoggle, volledig scherm overlay-menu, automatisch sluiten bij linktap
- **Footer** — 4-koloms linkgrid (Over ons, Voor Spelers, Voor Organisatoren, Juridisch), merklogo, copyright

---

## 3. Fase 2 — Contentmanagementsysteem (CMS) & Dynamische Content

Een headless CMS-integratie met Payload CMS v3, die een zelfgehoste beheerinterface biedt voor het beheren van dynamische content. Dit is Fase 2 van het project, te implementeren nadat de statische site is afgerond.

**Fase 2 vervangt de huidige placeholder-pagina's (news.html, blog.html, events.html) door dynamische CMS-gestuurde pagina's.**

### 3.1 CMS-setup

- Payload CMS v3 installatie en configuratie
- Beheerpaneel voor contentredacteuren
- Integratie met het bestaande site-designsysteem

### 3.2 Contenttypes

- **Nieuws** — artikelen met titel, tekst, datum, uitgelichte afbeelding en categorie
- **Blog** — lange artikelen met rich text editor, auteur, tags en publicatiedatum
- **Evenementen** — evenementenlijsten met datum, locatie, beschrijving en registratielinks

### 3.3 Publieke Pagina's

- `/news` — Nieuwsoverzichtspagina met laatste artikelen (vervangt `news.html` placeholder)
- `/blog` — Blogoverzichtspagina (vervangt `blog.html` placeholder)
- `/events` — Evenementenoverzichtspagina (vervangt `events.html` placeholder)
- Individuele detailpagina's voor elk contenttype

### 3.4 Navigatie-integratie

- Nieuws-, Blog- en Evenementen-navlinks bijgewerkt naar CMS-gestuurde pagina's
- Links vanuit de homepage Laatste Nieuws-sectie dienovereenkomstig bijgewerkt

---

## 4. Deployment & Livegang

Setup en configuratie van productie-infrastructuur om de website te lanceren.

**Deliverables:**

- Vercel-projectaanmaak en productie-deploymentconfiguratie
- DNS-configuratie — domein van de opdrachtgever koppelen aan Vercel (A/CNAME records)
- SSL-certificaat provisioning (automatisch via Vercel)
- Supabase-projectprovisioning — productiedatabase, authenticatieconfiguratie, RLS-policies
- Brevo-accountsetup — transactionele e-mailtemplates (verificatie, wachtwoordreset), SMTP-integratie, afzenderdomeinauthenticatie (SPF/DKIM)
- Omgevingsvariabelen en secrets-configuratie
- Productie-smoketest en lanceringsverificatie

---

## 5. Overzicht Deliverables

### Fase 1 — Statische Site

| # | Deliverable | Pagina's/Items |
|---|-------------|----------------|
| 1 | Designsysteem & CSS-framework | 1 stylesheet (~2.700 regels) |
| 2 | Homepage | 1 pagina, 8 secties |
| 3 | Toernooienpagina | 1 pagina |
| 4 | Toernooidetailpagina | 1 pagina, 6 secties |
| 5 | Rankingspagina | 1 pagina |
| 6 | Landingspagina's per land | 6 pagina's |
| 7 | Over Ons-pagina | 1 pagina |
| 8 | Contactpagina | 1 pagina |
| 9 | Privacybeleid | 1 pagina |
| 10 | Algemene Voorwaarden | 1 pagina |
| 11 | Verantwoord Spelen | 1 pagina |
| 12 | Coming-soon placeholders (Nieuws, Blog, Evenementen) | 3 pagina's |
| 13 | SEO-optimalisatie | Alle pagina's + sitemap + robots.txt |
| 14 | Deployment & livegang | Vercel, DNS, SSL |
| **Fase 1 Totaal** | | **19 statische pagina's + deployment** |

### Fase 2 — CMS & Dynamische Content

| # | Deliverable | Pagina's/Items |
|---|-------------|----------------|
| 1 | CMS (Payload v3) | Beheerpaneel + 3 contenttypes |
| 2 | Nieuws-, Blog-, Evenementenpagina's | 3 dynamische pagina's (vervangen placeholders) |
| 3 | Supabase & Brevo setup | Database, authenticatie, transactionele e-mail |
| **Fase 2 Totaal** | | **CMS-beheerpaneel + 3 dynamische pagina's** |

---

## 6. Technische Specificaties

| Kenmerk | Detail |
|---------|--------|
| Technologie | HTML5, CSS3, vanilla JavaScript |
| Frameworks | Geen (nul afhankelijkheden) |
| CMS | Payload CMS v3 (zelfgehost, headless) |
| Lettertypen | Google Fonts (Inter 400–700) |
| Hosting | Elke statische host (GitHub Pages, Netlify, Vercel, S3, etc.) |
| Browserondersteuning | Moderne browsers (Chrome, Firefox, Safari, Edge — laatste 2 versies) |
| Responsief | Desktop, tablet (992px), mobiel (640px) |
| Toegankelijkheid | Semantische HTML, alt-tekst, toetsenbordnavigatie, WCAG AA contrast |
| Prestaties | Geen buildstap, geen JS-frameworks, lazy-loaded afbeeldingen |

---

## 7. Niet Inbegrepen

- Gebruikersauthenticatie of inlogfunctionaliteit
- Database- of backend-API-ontwikkeling
- Toernooiregistratie of boekingssysteem
- Betalingsverwerking
- Spelerdashboard of accountbeheer
- E-mailmarketing of nieuwsbriefsysteem
- Meertaligheid / internationalisatie (i18n)
- Doorlopende contentcreatie (tekst wordt aangeleverd door opdrachtgever of als apart traject)
- Fotografie of op maat gemaakte illustraties
- Domeinregistratie (aangenomen in bezit van opdrachtgever)
- Doorlopende hostingkosten (apart begroot)

---

## 8. Ureninschatting

> *Deze sectie is indicatief en kan worden aangepast op basis van overleg.*

### Fase 1 — Statische Site

| Taak | Omschrijving | Geschatte uren |
|------|-------------|----------------|
| Designsysteem & basis | Tokens, componenten, responsief framework, animaties | 24 |
| Homepage | Volledige landingspagina met 8 secties | 16 |
| Toernooienpagina | Overzicht, filters, kaarten, paginering | 10 |
| Toernooidetailpagina | Hero, schema, locatie, gerelateerde toernooien, CTA | 8 |
| Rankingspagina | Tabel, filters, zijbalk, paginering | 10 |
| Landenpagina's (6) | Template + 6 landvarianten | 14 |
| Over Ons-pagina | Missie, oprichtersprofielen | 4 |
| Contactpagina | Formulier en layout | 4 |
| Juridische pagina's (3) | Privacy, voorwaarden, verantwoord spelen | 6 |
| Coming-soon pagina's (3) | Nieuws, blog, evenementen placeholders | 2 |
| SEO & technisch | Metatags, gestructureerde data, sitemap, robots.txt | 8 |
| QA & cross-browser testen | Desktop, tablet, mobiel in alle browsers | 8 |
| Deployment & livegang | Vercel-setup, DNS, SSL, lancering | 4 |
| **Fase 1 Totaal** | | **118 uur** |

### Fase 2 — CMS & Dynamische Content

| Taak | Omschrijving | Geschatte uren |
|------|-------------|----------------|
| CMS-integratie (Payload) | Setup, 3 contenttypes, 3 publieke pagina's, beheerpaneel | 20 |
| Supabase & Brevo setup | Databaseprovisioning, authenticatie, transactionele e-mail | 6 |
| QA & testen | CMS-contentflow, publieke paginarendering | 4 |
| **Fase 2 Totaal** | | **30 uur** |
