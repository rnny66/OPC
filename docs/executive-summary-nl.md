# OPC Europe — Samenvatting

**Project:** OPC Europe — European Open Poker Championship
**Datum:** 11 maart 2026

---

## Visie

OPC Europe is een nieuw Europees pokerchampionship-merk, opgericht door Marcel Luske en Noah Boeken. De website dient als centraal platform voor spelers, toernooiorganisatoren en partners in heel Europa.

Het doel is een premium, moderne webpresentie die OPC Europe vanaf dag één neerzet als een geloofwaardig en professioneel championshipmerk.

---

## Wat We Bouwen

### Marketingwebsite

Een volledig op maat ontworpen, mobiel-responsieve website met een donkere premium uitstraling. Geen templates, geen WordPress — volledig op maat gebouwd passend bij de OPC-merkidentiteit.

De site bevat:

- **Homepage** — hero-sectie, waardeproposities voor spelers en organisatoren, aankomende evenementen, oprichtersprofielen, partnerlogo's
- **Toernooien** — doorzoekbare lijst van aankomende toernooien met zoek- en landfilters
- **Rankings** — publiek klassement met spelersposities, punten en toernooigeschiedenis
- **Landingspagina's per land** — specifieke pagina's voor elk land waar OPC actief is (Nederland, Duitsland, Engeland, Polen, België, Oostenrijk), met lokale partners en evenementen
- **Partnerpagina's** — individuele showcasepagina's voor elke OPC-partner (Luxon Pay, International Poker Rules, Juice Brothers, Poker Arend) met partneroverzicht
- **Juridisch & Compliance** — privacybeleid, algemene voorwaarden, verantwoord spelen
- **Contact** — contactformulier voor spelers, organisatoren en partners
- **Master Ranking** — live klassement aangedreven door Supabase, met 601+ spelers, zoekfunctie, landfilter en paginering
- **Resultaten Upload** — met wachtwoord beveiligde interne tool voor organisatoren om toernooiresultaten te uploaden (CSV/XLSX) met fuzzy spelersnaamherkenning
- **SEO** — gestructureerde data, metatags, sitemap en optimalisatie voor social media op alle pagina's

### Domeinstrategie: Eén Domein met Landenpagina's

OPC Europe gebruikt één domein (`europe-opc.com`) met landspecifieke subpagina's (bijv. `europe-opc.com/netherlands`) in plaats van aparte domeinen per land (bijv. `dutch-opc.com`, `german-opc.com`). Deze aanpak is op elk vlak superieur:

- **SEO** — Alle pagina's dragen bij aan de autoriteit van één domein. Elke backlink naar een landenpagina versterkt de gehele site. Aparte `.com`-domeinen bieden geen geo-targeting voordeel (alleen landcode-TLD's zoals `.nl` doen dat) en beginnen elk vanaf nul autoriteit.
- **Onderhoud** — Eén deployment, één SSL-certificaat, één analytics-setup, één sitemap. Aparte domeinen zouden betekenen dat 7+ websites beheerd moeten worden met gedupliceerde deployments, DNS-configuraties en updates.
- **Kosten** — Eén hostingsetup in plaats van 7. Geen extra domeinregistraties of aparte hostingkosten.
- **Merk** — `europe-opc.com/netherlands` communiceert duidelijk een verenigd Europees merk. Aparte domeinen fragmenteren het merk en verwarren gebruikers over of de sites gerelateerd zijn.

Aparte landendomeinen zijn alleen zinvol wanneer landen onafhankelijk opereren met verschillende talen, contentteams en designs — wat niet het geval is bij OPC Europe.

### Contentbeheer (Payload CMS)

Een zelfgehost beheerpaneel waarmee het OPC-team content kan publiceren en beheren zonder tussenkomst van een ontwikkelaar:

- **Nieuws** — aankondigingen, persberichten, toernooiverslagen
- **Blog** — redactionele content, strategie-artikelen, spelersinterviews
- **Evenementen** — evenementenlijsten buiten toernooien om (meet-ups, kwalificaties, etc.)

---

## Rankings & Toernooien: Statisch vs Dynamisch

De marketingwebsite bevat een **Rankings**-pagina en een **Toernooien**-pagina. De Rankings-pagina is uitgebreid met een **Master Ranking-systeem** — een lichtgewicht Supabase-oplossing die de oorspronkelijke hardgecodeerde voorbeelddata heeft vervangen door live data van 601+ echte spelers. Organisatoren kunnen toernooiresultaten uploaden via een met wachtwoord beveiligde uploadpagina (CSV- of XLSX-bestanden) met fuzzy naamherkenning, en de rankings worden automatisch bijgewerkt.

De Toernooien-pagina toont nog steeds hardgecodeerde voorbeelddata — deze ziet eruit en werkt als een echte lijst, maar de content is handmatig in de HTML geschreven.

**Dit betekent:**

- De Rankings-pagina is nu **volledig live** — data wordt opgeslagen in Supabase en bijgewerkt via resultaten-upload
- Een nieuw toernooi toevoegen vereist nog steeds dat een ontwikkelaar de HTML aanpast
- Er is geen mogelijkheid voor spelers of organisatoren om met toernooien op de site te interacteren

**Om Toernooien volledig functioneel te maken en spelersaccounts toe te voegen, is een webapplicatielaag nodig.** Dit is een apart werkpakket dat het volgende omvat:

| Functionaliteit | Wat het vereist |
|-----------------|-----------------|
| Live toernooilijsten | Organisatoraccounts, tools voor toernooi-aanmaak, goedkeuringsworkflow |
| Automatische rankings | Spelersaccounts, resultaatinvoer na elk toernooi, puntberekeningsengine |
| Spelersprofielen | Gebruikersregistratie, profielbeheer, toernooigeschiedenis |
| Registratie | Spelers schrijven zich online in voor toernooien, organisatoren beheren deelnemerslijsten |
| Identiteitsverificatie | Leeftijdsverificatie (18+) voor wettelijke naleving |

Zonder de webapplicatie blijven de Rankings- en Toernooienpagina's statisch — functioneel als marketingpagina's maar met handmatige updates voor elke wijziging. Met de webapplicatie wordt het hele systeem selfservice: organisatoren maken toernooien aan, voeren resultaten in en rankings worden automatisch bijgewerkt.

**De webapplicatie is een aanzienlijk grotere investering dan de statische site.** Het omvat backend-infrastructuur (database, authenticatie, rolgebaseerde toegang), server-side logica en doorlopende hosting. Het kan stapsgewijs worden gebouwd — beginnend met de statische site en geleidelijk dynamische functionaliteit toevoegen.

---

## Aanpak

Het project is zo opgezet dat de statische marketingsite onafhankelijk kan worden gelanceerd. Het CMS en de webapplicatie zijn aanvullend — elke laag bouwt voort op de vorige zonder dat een herbouw nodig is.

| Laag | Doel | Onafhankelijk te lanceren? |
|------|------|---------------------------|
| **Statische site** | Merkpresentie, SEO, partnerzichtbaarheid | Ja |
| **CMS** | Teambeheerd nieuws, blog, evenementen | Ja (voegt toe aan statische site) |
| **Webapplicatie** | Live rankings, toernooien, gebruikersaccounts | Ja (vervangt statische data) |

Dit betekent dat OPC Europe snel live kan gaan met de statische site terwijl de complexere functionaliteit parallel wordt ontwikkeld.

---

## Technologie

Het project maakt gebruik van drie kerndiensten. Alle zijn industriestandaard, goed ondersteund en worden wereldwijd door duizenden bedrijven gebruikt.

**Vercel** — Webhostingplatform. Vercel serveert de website aan bezoekers wereldwijd via een globaal netwerk van servers (CDN), wat zorgt voor snelle laadtijden ongeacht locatie. Het regelt SSL-certificaten, deployments en schaalbaarheid automatisch. Wanneer code wordt bijgewerkt, bouwt en publiceert Vercel de nieuwe versie binnen enkele minuten. Het is speciaal gebouwd voor moderne websites en webapplicaties.

**Supabase** — Backend-as-a-service. Supabase biedt de database (PostgreSQL), gebruikersauthenticatie (inloggen/registreren) en bestandsopslag in één beheerd platform. In plaats van eigen servers en databases op te zetten en te onderhouden, regelt Supabase dit alles met automatische back-ups, beveiliging en uptimemonitoring. Het wordt ook gebruikt door Payload CMS om content op te slaan.

**Payload CMS** — Contentmanagementsysteem. Payload biedt een beheerpaneel (vergelijkbaar in concept met WordPress) waar het OPC-team nieuwsartikelen, blogposts en evenementen kan aanmaken en beheren zonder ontwikkelaar. Het is open source en gratis — er zijn geen licentiekosten. Het draait als onderdeel van de website op Vercel en slaat data op in Supabase.

**Brevo** — Transactionele e-maildienst. Brevo verzorgt geautomatiseerde e-mails die door het platform worden verstuurd — accountverificatie, wachtwoordresets, registratiebevestigingen en notificaties. Dit zijn geen marketing-e-mails; het zijn systeeme-mails die worden getriggerd door gebruikersacties. Brevo zorgt voor betrouwbare bezorging en biedt e-mailtemplates in huisstijl.

---

## Kostenopbouw

### Eenmalig: Ontwikkeling

| Fase | Omschrijving | Geschatte uren |
|------|-------------|----------------|
| Designsysteem & basis | Tokens, componenten, responsief framework, animaties | 24 |
| Homepage | Volledige landingspagina met 8 secties | 16 |
| Toernooienpagina | Overzicht, filters, kaarten, paginering | 10 |
| Rankingspagina | Tabel, filters, zijbalk, paginering | 10 |
| Master ranking-systeem | Databaseschema, datamigratie (601 spelers), live rankingpagina, resultaten-uploadpagina met fuzzy matching | 18 |
| Landenpagina's (6) | Template + 6 landvarianten | 14 |
| Contactpagina | Formulier en layout | 4 |
| Juridische pagina's (3) | Privacy, voorwaarden, verantwoord spelen | 6 |
| SEO & technisch | Metatags, gestructureerde data, sitemap, robots.txt | 8 |
| CMS-integratie (Payload) | Setup, 3 contenttypes, 3 publieke pagina's, beheerpaneel | 20 |
| QA & cross-browser testen | Desktop, tablet, mobiel in alle browsers | 8 |
| Deployment & livegang | Vercel-setup, DNS-configuratie, Supabase-provisioning, Brevo-integratie, SSL, productielancering | 6 |
| **Totaal** | | **144 uur** |

> Ontwikkeling van de webapplicatie (live rankings, toernooien, gebruikersaccounts) wordt apart begroot.

### Doorlopend: Hosting & Infrastructuur

| Dienst | Wat het dekt | Abonnement | Maandelijkse kosten |
|--------|-------------|------------|---------------------|
| **Vercel** | Websitehosting, Next.js server-side rendering, CMS-deployment | Pro (1 seat) | $20/mnd |
| **Supabase** | PostgreSQL-database, gebruikersauthenticatie, bestandsopslag | Pro (met uitgavenlimiet) | $25/mnd |
| **Payload CMS** | Beheerpaneel voor content | Open source (gratis) | $0 |
| **Totaal** | | | **$45/mnd** |

**Toelichting op hostingkosten:**

- **Vercel Pro** bevat 1 TB bandbreedte en 10M edge requests/maand — ruim voldoende voor een site met enkele duizenden maandelijkse bezoekers. Aangezien OPC een commercieel project is, is de gratis tier niet toegestaan.
- **Supabase Pro** bevat 8 GB database, 100K maandelijks actieve gebruikers voor authenticatie, 100 GB bestandsopslag en dagelijkse back-ups. De uitgavenlimiet-optie beperkt de rekening tot exact $25/mnd (gebruik wordt beperkt in plaats van extra gefactureerd).
- **Payload CMS** is open source (MIT-licentie) en draait als onderdeel van de Next.js-app op Vercel — geen extra hosting- of licentiekosten.
- Deze kosten dekken zowel de statische site/CMS **als** de toekomstige webapplicatie. Er is geen extra infrastructuur nodig wanneer de webapp wordt gelanceerd.

### Overige Kosten

| Item | Kosten | Toelichting |
|------|--------|-------------|
| **Domeinnaam** | ~€10–15/jr | Reeds in bezit van de opdrachtgever. Alleen jaarlijkse verlenging. |
| **Transactionele e-mail (Brevo)** | $0 | Gratis tier bevat 300 e-mails/dag (9.000/mnd). Dekt accountverificatie, wachtwoordresets en notificaties. Ruim voldoende bij lancering. Starter-abonnement vanaf $9/mnd bij groei boven 300/dag. |
| **Analytics** | $0 | Vercel Analytics is inbegrepen bij Pro. Alternatief: gratis opties zoals Plausible Cloud ($9/mnd) of zelfgehost Umami ($0). |
| **SSL-certificaat** | $0 | Inbegrepen bij Vercel. |
| **CDN** | $0 | Inbegrepen bij Vercel (wereldwijd edge-netwerk). |
| **Identiteitsverificatie** | Op basis van gebruik | Alleen nodig voor de webapplicatiefase. Kosten van providers (bijv. Didit, Onfido) variëren per volume — doorgaans €0,50–2,00 per verificatie. |

### Kostenoverzicht

| Categorie | Kosten |
|-----------|--------|
| Ontwikkeling (eenmalig) | 144 uur |
| Hosting & infrastructuur (maandelijks) | ~$45/mnd |
| Transactionele e-mail (Brevo) | $0 (gratis tier) |
| Domein (jaarlijks) | ~€10–15/jr (eigendom opdrachtgever) |
