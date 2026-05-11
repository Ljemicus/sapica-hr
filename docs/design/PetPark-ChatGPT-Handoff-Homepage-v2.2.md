# PetPark ChatGPT Handoff — Homepage v2.2 Correction Pass

## Status

Homepage v2.2 correction pass is implemented locally, but **not deployed** and **not visually approved yet**.

Recommended next step: **NEEDS MINOR POLISH** — do human visual review of the homepage screenshots before moving to any other PetPark page.

## Scope

This pass was **homepage-only**.

Do not continue to other routes until Ljemicus explicitly approves the homepage.

Do not touch:

- auth/session logic
- Supabase schema or RLS
- Stripe/payment logic
- booking logic
- messages logic
- API routes
- middleware
- deployment config
- non-homepage route implementations

## Design Direction

Approved direction to preserve:

- Smart Assistant + Service Circle
- service-first + community-first
- warm cream / green / orange PetPark system
- official PetPark logo only
- no provider-directory-first framing
- no emoji as final UI icons

## Current Implementation Summary

Main implementation file:

```txt
components/shared/petpark/homepage-redesign.tsx
```

New hero visual asset:

```txt
public/images/petpark-home-hero-pets.svg
```

The homepage now includes:

1. Homepage-specific clean header
   - official logo left
   - nav: Usluge, Kako radi, Zajednica, Blog
   - actions: Prijava, Objavi uslugu

2. Balanced hero
   - eyebrow: ODABERI ŠTO TREBAŠ
   - H1: Što treba tvom ljubimcu danas?
   - subtitle: PetPark povezuje ljubimce s pouzdanim ljudima i uslugama koje im olakšavaju svaki dan. Brzo, sigurno i s ljubavlju.
   - compact Smart Assistant card

3. Smart Assistant card
   - title: Reci nam što trebaš
   - pet chips: Pas, Mačka, Mali ljubimci
   - service chips: Čuvanje, Šetnja, Grooming, Trening, Izgubljeni, Udomljavanje
   - location: Zagreb
   - CTA: Nastavi

4. Desktop Service Circle
   - only visible on desktop / XL
   - lucide icons, no emoji
   - six nodes: Čuvanje, Šetnja, Grooming, Trening, Izgubljeni, Udomljavanje
   - center uses `public/images/petpark-home-hero-pets.svg`

5. Mobile Service Grid
   - replaces desktop orbit
   - compact 2x3 grid
   - no horizontal overflow in automated checks

6. Quick Actions
   - desktop: clean rail/grid
   - mobile: 2-column card grid
   - actions:
     - Rezerviraj šetnju
     - Pronađi čuvanje
     - Naruči grooming
     - Trening & savjeti
     - Hitno: izgubljen?
     - Udomi ljubav

7. Content Cards
   - Live zajednica
   - Najnoviji savjeti
   - Zašto PetPark?
   - each card has internal rows/icons/status metadata

8. Community / Brand Strip
   - title: PetPark zajednica
   - headline: Sve na jednom mjestu, bez hladnog marketplace dojma.
   - supporting copy included

9. Homepage-specific footer
   - visually integrated with homepage
   - global footer is hidden on this homepage only

## Important Technical Notes

The implementation uses a local inline homepage CSS scope with `body:has(#petpark-homepage-v2)` to hide global shell elements only on the homepage render:

- global header/footer
- mobile bottom nav
- fixed chat widgets/debug-style fixed elements that overlap screenshots

This was done as a smallest homepage-safe change, without editing global layout components.

## Files Changed in v2.2 Pass

```txt
components/shared/petpark/homepage-redesign.tsx
public/images/petpark-home-hero-pets.svg
```

There are other existing dirty files from earlier Homepage v2 work in the repo. Do not assume they are part of this v2.2 correction unless inspecting the diff.

Known pre-existing dirty/unrelated file:

```txt
components/shared/petpark/service-hub-overview.tsx
```

Do not overwrite it accidentally.

## Validation Results

Commands run successfully:

```txt
npm run lint
npm run type-check
npm run build
```

Notes:

- lint passes with existing repo warnings
- no new fatal lint/type/build issue from homepage v2.2
- build passes

Automated screenshot metrics passed:

- no horizontal overflow at 1440, 1280, 1024, 430, 390, 375
- no clipped homepage elements in DOM bounding checks
- desktop orbit visible at 1440 and 1280
- desktop orbit hidden at 1024 and mobile widths
- fixed overlays count: 0 in screenshots
- emoji count in rendered page: 0
- homepage footer visible: true

## Screenshot Paths

Generated screenshots:

```txt
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-2-screenshots/desktop-1440.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-2-screenshots/desktop-1280.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-2-screenshots/tablet-1024.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-2-screenshots/mobile-430.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-2-screenshots/mobile-390.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-2-screenshots/mobile-375.png
```

## Known Limitations / Review Focus

Human review should focus on visual taste, not functional correctness:

- Is the SVG dog/cat center premium enough, or should it be replaced with a better approved illustration/photo?
- Is tablet 1024 acceptable using the mobile-style service grid instead of a smaller orbit?
- Are content cards dense enough without feeling cramped?
- Is the homepage footer good enough as a temporary homepage-specific solution, or should a future Global Shell task redesign footer/nav globally?

## If Continuing in ChatGPT

Ask ChatGPT to review only the homepage screenshots and provide specific polish instructions. Do not ask it to redesign other pages.

Suggested prompt:

```txt
Review the PetPark Homepage v2.2 screenshots only. The homepage direction is Smart Assistant + Service Circle, service-first + community-first, warm cream/green/orange system, official logo only. Do not propose changes to auth, payments, APIs, Supabase, global navigation, or other routes.

Focus on: desktop hero balance, premium feel of service circle, mobile hierarchy, quick action/card rhythm, community strip/footer integration. Return only concrete homepage polish notes, grouped by Desktop, Tablet, Mobile, and Priority.
```

## Recommendation

**NEEDS MINOR POLISH**

Do not move to other pages until Ljemicus approves homepage visuals.
