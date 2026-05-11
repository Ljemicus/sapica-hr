# PetPark v2 Redesign — External ChatGPT Handoff

**Project:** PetPark.hr  
**Repo:** `/Users/ljemicus/Projects/petpark`  
**Date:** 2026-05-07  
**Status:** documentation + brand foundation prepared; UI implementation must stay phase-gated.

## Purpose

Use this handoff to brief an external ChatGPT session about the current PetPark v2 redesign state, the approved design direction, and what has already been created inside the repo.

Do not ask external ChatGPT to implement code directly unless a phase is explicitly approved. The next work should remain controlled, scoped, and reviewed phase-by-phase.

## Approved product direction

PetPark v2 is:

```txt
service-first + community-first
```

PetPark v2 is not:

```txt
provider-directory-first
```

Primary homepage question:

```txt
Što treba tvom ljubimcu danas?
```

Signature homepage direction:

```txt
Smart Assistant + Service Circle
```

Core visual system:

- official PetPark logo only
- warm cream backgrounds
- deep green typography/structure
- orange primary CTA accents
- rounded cards
- soft shadows
- consistent shared components
- mobile-first layouts

Hard visual rule:

- desktop homepage may use the right-side circular service hub
- mobile must not use the full desktop orbit; use wizard/grid/stacked cards instead

## Absolute restrictions

Do not modify or propose changes to these areas unless a later explicit phase allows it:

```txt
lib/supabase/*
contexts/auth-context.tsx
app/api/auth/*
app/api/payments/*
app/api/bookings/*
app/api/groomer-bookings/*
app/api/trainer-bookings/*
app/api/calendar/*
app/api/messages/*
lib/payments/*
lib/stripe.ts
lib/bookings/*
lib/calendar/*
lib/db/messages.ts
supabase/migrations/*
supabase/seed.sql
.env*
middleware.ts
next.config.ts
```

Also do not:

- deploy
- run database migrations
- expose env values
- change Supabase schema/RLS
- change Stripe/payment logic
- change auth/session/role logic
- change booking/availability/message business logic
- create fake counts or fake platform statistics
- invent or generate a new logo
- redesign everything at once

## Files already created in repo

### Phase 1 — Design Book import

Created/imported:

```txt
docs/design/README.md
docs/design/PetPark-Official-Design-Book-v2.0.md
docs/design/PetPark-Design-Tokens-v2.0.md
docs/design/PetPark-Component-System-v2.0.md
docs/design/PetPark-Page-Templates-v2.0.md
docs/design/PetPark-Route-Redesign-Matrix-v2.0.md
docs/design/PetPark-Copy-System-hr-v2.0.md
docs/design/PetPark-Agent-Prompts-v2.0.md
docs/design/PetPark-QA-Visual-Checklist-v2.0.md
docs/design/PetPark-Implementation-Roadmap-v2.0.md
public/brand/petpark-logo.svg
```

`docs/design/README.md` marks Design Book v2.0 as the official source of truth.

### Phase 2 — Brand foundation

Created/updated:

```txt
app/globals.css
components/shared/brand/petpark-logo.tsx
components/shared/brand/index.ts
components/shared/petpark/pp-card.tsx
components/shared/petpark/pp-section-header.tsx
components/shared/petpark/pp-status-badge.tsx
components/shared/petpark/index.ts
```

Purpose:

- official logo component using `/brand/petpark-logo.svg`
- PetPark v2 CSS tokens
- base shared UI primitives

Validation after Phase 2:

```txt
npm run lint: pass, existing warnings only
npm run type-check: pass
npm run build: pass
```

### Page Blueprint Pack

Created:

```txt
docs/design/PetPark-Page-Blueprint-Pack-v2.0.md
```

This file defines route-group redesign guidance for 21 route groups:

1. Homepage
2. Usluge overview
3. Service detail pages
4. Search/results pages
5. Provider/service profiles
6. User dashboard
7. Provider dashboard
8. Pet profile / pet passport
9. Bookings
10. Checkout
11. Messages
12. Community hub
13. Forum list
14. Forum thread
15. Lost/found pets
16. Adoption
17. Blog homepage
18. Blog article
19. Login/register/onboarding
20. Footer / global shell
21. Mobile navigation

Final gate inside blueprint:

```txt
This blueprint must be reviewed and approved before any non-homepage page redesign starts.
```

## Existing working tree note

There was a pre-existing dirty file before this work:

```txt
components/shared/petpark/service-hub-overview.tsx
```

Known diff:

- removes the `Shop` upcoming service card

This file was inspected and not modified during Phase 2 or blueprint creation. Treat it as pre-existing work-in-progress.

## Important current repo state

Expected uncommitted changes include:

```txt
app/globals.css
components/shared/brand/*
components/shared/petpark/index.ts
components/shared/petpark/pp-card.tsx
components/shared/petpark/pp-section-header.tsx
components/shared/petpark/pp-status-badge.tsx
docs/design/*
public/brand/petpark-logo.svg
```

Plus the pre-existing dirty:

```txt
components/shared/petpark/service-hub-overview.tsx
```

## Recommended phase order from here

1. Review/approve `docs/design/PetPark-Page-Blueprint-Pack-v2.0.md`
2. Continue only with the next approved phase
3. Likely next implementation phase:
   - Homepage v2: Smart Assistant + Service Circle
4. Then visual QA homepage before expanding to other pages
5. Later:
   - Global shell
   - Service discovery
   - Profiles/pet passport
   - Community/forum/lost/adoption
   - Blog/content
   - Dashboards/messages/bookings
   - Checkout polish
   - Final QA

## If asking external ChatGPT for help

Best prompt:

```txt
You are reviewing the PetPark v2 redesign documentation and blueprint. Do not implement code. Review the attached handoff and blueprint for consistency, missing risks, route coverage, and whether the phase plan is safe. Focus on preserving the approved direction: Smart Assistant + Service Circle, service-first + community-first, official logo only. Return concise recommendations and blockers only.
```

If asking for homepage implementation guidance only:

```txt
Review the PetPark v2 Design Book and Page Blueprint. Propose a safe implementation plan for Homepage v2 only. Do not touch auth, payments, bookings, messages, APIs, Supabase, middleware, deployment, navbar/footer, or non-homepage routes. Keep the direction Smart Assistant + Service Circle. Return component structure, responsive behavior, copy, risk notes, and acceptance criteria.
```

## Key source files to attach to external ChatGPT

Attach these if possible:

```txt
docs/design/PetPark-External-ChatGPT-Handoff-v2.0.md
docs/design/PetPark-Page-Blueprint-Pack-v2.0.md
docs/design/PetPark-Official-Design-Book-v2.0.md
docs/design/PetPark-Page-Templates-v2.0.md
docs/design/PetPark-Component-System-v2.0.md
docs/design/PetPark-Route-Redesign-Matrix-v2.0.md
docs/design/PetPark-QA-Visual-Checklist-v2.0.md
```

Optional if homepage work is next:

```txt
app/page.tsx
components/shared/petpark/homepage-redesign.tsx
components/shared/petpark/service-hub-overview.tsx
app/globals.css
components/shared/petpark/pp-button.tsx
components/shared/petpark/pp-badge.tsx
components/shared/petpark/pp-card.tsx
components/shared/petpark/pp-section-header.tsx
components/shared/petpark/pp-status-badge.tsx
components/shared/brand/petpark-logo.tsx
```

## External reviewer checklist

Ask external ChatGPT to check:

- Does the blueprint stay aligned with Design Book v2.0?
- Are route groups complete enough?
- Are risky business-logic areas explicitly protected?
- Are mobile rules clear enough?
- Are empty/loading/error/accessibility/SEO notes sufficient?
- Is the next implementation phase small enough?
- Are any schema/CMS requirements clearly marked as future work?
- Are there any contradictions before homepage implementation starts?

## Current recommendation

Do not start non-homepage redesign yet. First approve the blueprint. Then proceed with Homepage v2 only, followed by homepage visual QA before touching global shell or other route groups.
