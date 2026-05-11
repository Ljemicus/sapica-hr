# PetPark Design Direction for Figma

## 0. Purpose

This document is the visual source-of-truth brief for creating PetPark screens in Figma.

Goal: design PetPark as a warm Croatian pet-care platform that feels like a calm digital park — premium, local, trustworthy, service-first and community-first.

Do not treat the current production homepage as approved. Use the v3.3 green park design-lab direction as the preferred visual direction.

Reference design-lab route:

```txt
/design-lab/homepage-v3-3
```

Reference screenshots:

```txt
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v3-3-green-park-screenshots/desktop-1440.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v3-3-green-park-screenshots/tablet-1024.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v3-3-green-park-screenshots/mobile-390.png
```

---

## 1. Brand feeling

PetPark should feel like:

- a calm digital park for pet owners
- warm and human, not corporate
- premium but friendly
- local Croatian, not generic global marketplace
- service-first, not provider-directory-first
- community-first, but not social-media clutter
- trustworthy, clean, useful

PetPark must not feel like:

- a cold marketplace
- a generic SaaS template
- a childish pet cartoon site
- a messy social feed
- a provider directory with filters as the main identity
- an AI-generated landing page

---

## 2. Logo rule

Use only the official PetPark logo.

```txt
public/brand/petpark-logo.svg
```

Rules:

- Do not create a new logo.
- Do not redraw the logo.
- Do not use AI-generated logo marks.
- Do not make the logo huge.
- Header logo target:
  - Desktop: 128–150px wide
  - Mobile: 104–124px wide

---

## 3. Core visual direction

### Main aesthetic

Green park-inspired premium pet-care product.

Use:

- soft full-page green/mint background
- subtle leaf and paw line-art pattern
- warm cream cards
- dark forest green typography
- orange CTAs
- rounded generous cards
- soft depth/shadows
- friendly pet/park illustrations
- clean rounded line icons

Avoid:

- pure white sterile pages
- gray marketplace cards
- harsh black text
- too many equal cards
- emoji icons
- heavy gradients that compete with content

---

## 4. Color system

Use these as Figma color styles.

### Core colors

```txt
Forest Green / Primary Text: #123829
Deep Green / Headings: #0B2F22
Park Green / Secondary: #0F6B57
Leaf Green: #2E8B57
Mint Background: #DCEFD4
Soft Mint: #EFF8E8
Cream Surface: #FFFDF7
Warm Cream Background: #FBF1DF
Orange Accent / Primary CTA: #F97316
Muted Text: #657164
Border Warm: #E6DECA
```

### Usage

- Primary text: `#123829`
- Big headings: `#0B2F22`
- Main CTA: `#F97316`
- Secondary CTA / trusted signals: `#0F6B57`
- Page background: soft green gradient from `#E5F2D7` to `#D8EBCF` to `#EDF7E7`
- Cards: `#FFFDF7` or `rgba(255,255,255,0.86)`
- Muted body copy: `#657164`

### Background gradient

Figma approximation:

```txt
Base: linear vertical
Top: #E5F2D7
Middle: #D8EBCF
Bottom: #EDF7E7

Add soft radial highlights:
- warm cream / peach glow top-left
- mint glow top-right
```

---

## 5. Background pattern

Use subtle line-art pattern elements:

- leaves
- paws
- maybe very light park curves/path lines

Rules:

- pattern opacity: 12–18%
- never behind dense text at high contrast
- decorative only
- should feel like park atmosphere, not wallpaper
- no cartoon animals as repeated pattern

---

## 6. Typography

Use a rounded modern sans-serif.

Suggested Figma font options:

1. Nunito Sans / Nunito — warm, matches current PetPark direction
2. Plus Jakarta Sans — cleaner SaaS polish
3. Sora — modern and rounded
4. Manrope — safe, clean, readable

Recommended pairing:

```txt
Headings: Nunito Sans ExtraBold / Black
Body: Nunito Sans Medium / SemiBold
```

### Type scale

Desktop:

```txt
Hero H1: 68–78px / line-height 0.95–1.02 / very tight tracking
Section H2: 40–48px
Card title: 22–28px
Body: 16–19px
Small meta: 12–14px
Buttons: 14–16px semibold/bold
```

Mobile:

```txt
Hero H1: 38–44px / line-height 1.03–1.08
Section H2: 28–34px
Card title: 20–24px
Body: 15–16px
Small meta: 12–13px
```

Rules:

- Headings are bold and warm, not thin.
- Body text must be readable; do not use pale gray.
- Avoid awkward one-word orphan lines.

---

## 7. Shape and spacing system

### Radius

```txt
Small pill: 999px
Small controls: 16–18px
Service cards: 22–26px
Main cards: 30–36px
Hero illustration card: 40–44px
Large banners: 38–44px
```

### Spacing

Use an 8px spacing rhythm.

```txt
Page horizontal padding desktop: 24–32px
Page horizontal padding mobile: 16px
Section vertical desktop: 44–72px
Section vertical mobile: 32–48px
Card internal padding desktop: 24–32px
Card internal padding mobile: 18–24px
Grid gaps: 12, 16, 20, 24px
```

### Shadows

Soft, green-tinted shadows:

```txt
Small card: 0 10 26 rgba(18,56,41,0.055)
Medium card: 0 24 64 rgba(18,56,41,0.095)
Hero card: 0 34 100 rgba(18,56,41,0.15)
CTA shadow: 0 18 34 rgba(249,115,22,0.24)
```

Avoid harsh black shadows.

---

## 8. Icon style

Use clean rounded line icons.

Preferred:

- Lucide-style icons
- 1.75–2px stroke
- rounded ends
- no emoji
- consistent size per area

Icon colors:

- Orange for primary service/action icons
- Park green for trust/community icons
- Dark green for neutral navigation

---

## 9. Homepage Figma direction

### Desktop homepage structure

Use 1440px frame.

Frame:

```txt
Max content width: 1280px
Horizontal margin: centered
Background: full-page green park gradient + subtle pattern
```

Sections:

1. Header
2. Hero
3. Quick access strip
4. Community + benefits section
5. Dark green brand/community banner
6. Footer

---

### Header

Structure:

```txt
[left] Official PetPark logo
[center] nav pill
[right] Prijava + Objavi uslugu
```

Nav items:

```txt
Usluge
Kako radi
Zajednica
Blog
```

Rules:

- Header height: 72–82px
- Nav is a soft white glass pill
- No duplicate actions
- No hamburger on desktop
- `Objavi uslugu` is orange primary
- `Prijava` is light green/outlined

---

### Hero

Direction: large editorial hero with service grid and park illustration.

Desktop layout:

```txt
Left: headline, copy, CTAs, service grid panel
Right: rounded park/pet illustration card
```

Hero headline:

```txt
Što treba tvom ljubimcu danas?
```

Hero body:

```txt
Sve za ljubimca na jednom zelenom mjestu: usluge, brza pomoć, savjeti i zajednica koja stvarno razumije svakodnevicu vlasnika.
```

Hero CTA examples:

```txt
Kreni od potrebe
Pogledaj usluge
```

Hero right visual:

- premium dog/cat/park illustration
- rounded card, 40–44px radius
- soft shadow
- subtle dashed line or park path detail
- can include a floating assistant card at the bottom

Do not let illustration dominate so much that product UI disappears.

---

### Service grid panel

6 cards:

```txt
Čuvanje
Šetnja
Grooming
Trening
Izgubljeni
Udomljavanje
```

Each card:

- icon
- title
- short subtitle
- warm white surface
- radius 22–26px
- equal height

Example subtitles:

```txt
Čuvanje — Mir kad nisi doma
Šetnja — Aktivan dan za psa
Grooming — Njega bez stresa
Trening — Bolje navike
Izgubljeni — Brza objava
Udomljavanje — Novi dom
```

---

### Quick access strip

4 cards recommended:

```txt
Pronađi uslugu
Objavi hitno
Pitaj zajednicu
Rezerviraj termin
```

Rules:

- Strip/card container should look like one premium grouped component
- Not too many equal buttons
- Icons aligned
- Arrow affordance
- Mobile: stack or 2-column grid with large tap targets

---

### Community + benefits section

Use two strong panels, not many weak cards.

Left panel:

```txt
Aktualno u zajednici
```

Rows:

```txt
Netko traži čuvanje za vikend — Zagreb · prije 8 min
Savjet za prvu dugu šetnju — Split · odgovoreno
Luna traži novi dom — Rijeka · udomljavanje
```

Right panel:

```txt
Zašto ovakav PetPark?
```

Benefit cards:

```txt
Service-first
Sigurnije odluke
Lokalni kontekst
Topliji osjećaj
```

---

### Dark green banner

Title:

```txt
Sve bitno za ljubimca, u jednom mirnijem toku.
```

Copy:

```txt
Od šetnje i čuvanja do hitne objave i savjeta — PetPark treba djelovati kao park kroz koji znaš kamo ideš.
```

Pills:

```txt
Brza pomoć
Pouzdane usluge
Zajednica vlasnika
```

Rules:

- Dark green gradient
- White text
- Warm accent detail
- Rounded 38–44px
- Mobile stacks cleanly

---

## 10. Mobile homepage direction

Mobile frame: 390px.

Order:

1. Compact header
2. Hero eyebrow
3. H1
4. Body copy
5. Primary/secondary CTA
6. Service grid
7. Pet/park illustration
8. Quick access
9. Community panel
10. Benefits panel
11. Dark banner
12. Footer

Rules:

- No squeezed desktop
- No tiny text
- Tap targets 44px+
- Service cards can be 2-column
- CTAs can stack full-width
- Illustration must not cover text
- Avoid excessive repeated card stacks

---

## 11. Pages to design in Figma

Design the following pages as one consistent product system.

### 11.1 Homepage

Use the v3.3 green park direction.

Frames:

```txt
Desktop 1440
Tablet 1024
Mobile 390
```

---

### 11.2 Search / Services page

Goal: service-first discovery, not cold provider directory.

Structure:

- Header
- Search hero with question: `Što treba tvom ljubimcu?`
- Filter bar:
  - service type
  - pet type
  - city
  - date
- Featured service categories
- Provider/service cards
- Soft map/list toggle if needed

Provider card should include:

- image/avatar
- service type
- location
- short trust signal
- availability
- CTA: `Pogledaj opciju`

Avoid fake provider counts.

---

### 11.3 Provider profile / Service detail

Structure:

- Hero profile card
- provider photo/gallery
- service type and location
- CTA: `Pošalji upit` or `Rezerviraj`
- About section
- Services/pricing cards
- Availability preview
- Reviews section placeholder
- FAQ

Feel:

- personal and trustworthy
- warm cards
- not a cold listing page

---

### 11.4 Booking flow

3-step assistant-like flow:

1. Pet + service
2. Date/time/location
3. Review/confirmation

Design:

- left/main step card
- right summary card
- progress indicator
- clear back/continue buttons
- orange primary CTA
- calm green support copy

Do not over-focus payment UI.

---

### 11.5 Community page

Goal: useful local community, not chaotic social network.

Content types:

- question
- recommendation
- lost pet alert
- adoption highlight
- advice share

Layout:

- feed column
- right sidebar / desktop with categories and quick actions
- mobile simple stacked feed

Use warm cards, status pills, city metadata.

---

### 11.6 Lost pet page

Tone: urgent but calm.

Structure:

- large alert hero
- pet photo
- location/map placeholder
- last seen info
- share CTA
- contact CTA
- community updates

Colors:

- use orange/red carefully
- do not make it panic-heavy
- keep readability high

---

### 11.7 Adoption page

Tone: warm, hopeful, emotional but not sad.

Structure:

- intro hero
- filters: city, species, age
- pet card grid
- shelter/association highlight

Pet cards:

- photo
- name
- age
- city
- temperament chips
- CTA: `Upoznaj me`

---

### 11.8 Blog / Advice page

Editorial and useful.

Structure:

- featured article
- category pills
- latest cards
- popular guides

Categories:

```txt
Njega
Ponašanje
Zdravlje
Putovanja
Sigurnost
Udomljavanje
```

---

### 11.9 Dashboard overview

Owner dashboard.

Structure:

- greeting
- pet cards
- upcoming bookings
- reminders
- messages preview
- quick actions

Tone:

- calm and functional
- fewer decorations
- still same green/cream system

---

## 12. Component library to create in Figma

Create reusable components:

```txt
Header desktop
Header mobile
Nav pill
Primary button
Secondary button
Icon button
Service card
Quick action card
Community row
Status pill
Provider card
Pet card
Article card
Dashboard stat card
Booking step card
Dark green banner
Footer
```

Component states:

```txt
Default
Hover
Selected
Disabled
Urgent
```

---

## 13. Figma frame list

Create these frames:

```txt
00 Design System
01 Homepage Desktop 1440
02 Homepage Tablet 1024
03 Homepage Mobile 390
04 Services/Search Desktop
05 Services/Search Mobile
06 Provider Profile Desktop
07 Provider Profile Mobile
08 Booking Flow Desktop
09 Booking Flow Mobile
10 Community Desktop
11 Community Mobile
12 Lost Pet Desktop
13 Lost Pet Mobile
14 Adoption Desktop
15 Adoption Mobile
16 Blog Desktop
17 Blog Mobile
18 Dashboard Desktop
19 Dashboard Mobile
```

---

## 14. Stitch / Figma prompt

Use this if generating first drafts in Stitch or Figma Make:

```txt
Create a complete visual design system and multi-page product concept for PetPark, a Croatian pet-care platform.

Use a warm green park-inspired design direction: soft mint/olive full-page gradient background, subtle leaf and paw line-art pattern, dark forest green typography, orange primary CTAs, cream cards, generous rounded corners, premium soft shadows, clean rounded line icons, and friendly pet/park illustration style.

Use the official PetPark logo as a placeholder. Do not create or redesign the logo. Do not use emoji icons.

PetPark should feel like a calm digital park for pet owners: warm, trustworthy, local, premium, friendly, service-first and community-first. It must not feel like a cold marketplace, generic SaaS template, childish cartoon site, or provider directory.

Design desktop and mobile screens for:
1. Homepage
2. Services/Search page
3. Provider profile/service detail
4. Booking flow
5. Community page
6. Lost pet page
7. Adoption page
8. Blog/advice page
9. Owner dashboard

Homepage direction:
- Header with official logo, nav pill, Prijava, Objavi uslugu
- Hero headline: “Što treba tvom ljubimcu danas?”
- Body copy about services, help, advice and community
- Primary CTA: “Kreni od potrebe”
- Secondary CTA: “Pogledaj usluge”
- Service grid: Čuvanje, Šetnja, Grooming, Trening, Izgubljeni, Udomljavanje
- Right-side premium pet/park illustration card
- Quick access: Pronađi uslugu, Objavi hitno, Pitaj zajednicu, Rezerviraj termin
- Community and benefits panels
- Dark green brand banner
- Calm footer

Keep visual hierarchy strong. Avoid too many equal cards. Make mobile intentionally designed, not squeezed desktop.
```

---

## 15. Approval rule

Figma design must be reviewed and approved before production implementation.

Do not move design-lab prototypes into production homepage until approval.
