# PetPark Agent Prompts v2.0

Use these prompts for Codex/OpenClaw work. Each prompt is scoped to avoid risky product logic changes.

## 1. Codebase mapper prompt

```txt
You are working on the PetPark.hr repository.

Task: produce a route/component/data mapping report for the v2 Smart Assistant + Service Circle redesign.

Do not modify files.
Do not deploy.
Do not read or print env values.
Do not change Supabase schema.
Do not touch auth/payment/booking/message logic.

Use docs/design/PetPark-Official-Design-Book-v2.0.md and docs/design/PetPark-Route-Redesign-Matrix-v2.0.md as source of truth.

Return:
1. All major public routes and their current files.
2. All dashboard/app routes and their current files.
3. Components used by homepage and public pages.
4. Data fetching boundaries for each major route.
5. Risk level per route.
6. Recommended implementation order.
7. Any files with uncommitted changes.

Report only.
```

## 2. Brand foundation implementation prompt

```txt
You are working on the PetPark.hr repository.

Task: implement only PetPark v2 brand foundation.

Source of truth:
- docs/design/PetPark-Official-Design-Book-v2.0.md
- docs/design/PetPark-Design-Tokens-v2.0.md
- brand/petpark-logo.svg or the approved official logo attachment

Scope:
1. Add official logo asset to public/brand/petpark-logo.svg.
2. Create components/shared/brand/petpark-logo.tsx.
3. Add PetPark v2 CSS variables to app/globals.css without breaking existing tokens.
4. Do not visually redesign pages yet.
5. Do not replace all logo usages unless safe and small; report remaining logo variants.

Hard rules:
- Do not touch auth/payment/booking/message/API/Supabase schema.
- Do not change app/page.tsx.
- Do not redesign navbar/footer yet unless only using the logo component safely.
- Do not generate a new logo.

Run:
- npm run type-check
- npm run lint

Return:
- changed files
- remaining logo references
- risks
- check results
```

## 3. UI primitives implementation prompt

```txt
Task: implement PetPark v2 shared UI primitives only.

Use:
- docs/design/PetPark-Component-System-v2.0.md
- docs/design/PetPark-Design-Tokens-v2.0.md

Create/adjust small reusable components only:
- PPButton
- PPCard
- PPBadge
- PPInput
- PPSelect
- PPStatusBadge
- PPSectionHeader
- EmptyState
- LoadingSkeleton

Preferred location:
components/shared/petpark/

Do not implement homepage yet.
Do not change business logic.
Do not touch API routes, auth, payments, bookings, messages, Supabase schema.

Run type-check and lint.
Return changed files and notes.
```

## 4. Homepage v2 implementation prompt

```txt
Task: implement the PetPark v2 homepage based on Smart Assistant + Service Circle.

Source of truth:
- docs/design/PetPark-Official-Design-Book-v2.0.md
- docs/design/PetPark-Component-System-v2.0.md
- docs/design/PetPark-Copy-System-hr-v2.0.md
- selected homepage reference image

Scope:
- app/page.tsx only if needed
- components/shared/petpark/homepage-redesign.tsx
- components/shared/petpark/service-hub-overview.tsx
- related presentational components only

Before editing:
- check git diff for components/shared/petpark/service-hub-overview.tsx because audit said it had uncommitted changes.

Implement:
1. Header area using existing navbar or page-local visual only if safe.
2. Hero with headline: Što treba tvom ljubimcu danas?
3. PetNeedWizard card.
4. Right-side ServiceOrbit on desktop.
5. MobileServiceGrid instead of full orbit on mobile.
6. QuickActionRail.
7. LiveCommunityCard.
8. AdviceCard.
9. WhyPetParkCard.
10. AppPromoStrip or BenefitsStrip.

Rules:
- Official logo only.
- No fake counts.
- No provider-directory homepage.
- No text absolute positioning.
- No horizontal mobile scroll.
- Preserve data fetching boundaries unless explicitly simple/static.
- Do not touch auth/payments/bookings/messages/API/Supabase schema.

Run:
- npm run type-check
- npm run lint
- npm run build

Return changed files, screenshots if available, risks and check results.
```

## 5. Public service pages prompt

```txt
Task: apply PetPark v2 design system to public service discovery pages.

Routes:
/pretraga
/njega
/dresura
/veterinari
/dog-friendly

Use page templates from docs/design/PetPark-Page-Templates-v2.0.md.

Rules:
- Do not move data fetching unless necessary.
- Preserve existing filters, maps and APIs.
- Use PetPark UI primitives.
- Do not touch auth/payment/booking logic.

Implement route by route, smallest safe PR.
Return changed files and checks.
```

## 6. Community/blog prompt

```txt
Task: apply PetPark v2 visual system to community and content routes.

Routes:
/zajednica
/forum
/forum/[id]
/blog
/blog/[slug]
/izgubljeni
/udomljavanje

Use community/content templates from docs/design/PetPark-Page-Templates-v2.0.md.

Rules:
- Preserve comments, likes, moderation, report actions.
- Preserve SEO metadata.
- Do not invent tables or schema.
- Do not touch API logic unless explicitly required and approved.

Return changed files, risks, and check results.
```

## 7. Profile/app prompt

```txt
Task: apply PetPark v2 design system to profile and app pages.

Routes:
/sitter/[id]
/groomer/[id]
/trener/[id]
/veterinari/[slug]
/dashboard/vlasnik
/ljubimac/[id]/passport
/poruke

Rules:
- Presentation-only unless explicitly approved.
- Do not change auth/booking/message/payment logic.
- Preserve protected route behavior.
- Keep mobile layout usable.

Return changed files and risks.
```

## 8. QA visual audit prompt

```txt
Task: run a PetPark v2 visual QA audit.

Check:
- official logo only
- no text overlap
- desktop service orbit readable
- mobile service orbit replaced by grid/wizard
- no horizontal scroll
- header works logged-out/logged-in if testable
- CTAs visible
- focus states
- loading/empty/error states
- SEO metadata not broken

Run:
- npm run type-check
- npm run lint
- npm run build
- npm run test if safe/available

Return:
- pass/fail checklist
- screenshots if available
- route issues
- exact file/line suggestions
```
