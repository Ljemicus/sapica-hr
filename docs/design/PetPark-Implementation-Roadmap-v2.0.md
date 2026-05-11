# PetPark Implementation Roadmap v2.0

## 1. Principle

Do not redesign the whole app in one PR. PetPark has auth, bookings, payments, messages, dashboards, community, blog, forum, lost/found and adoption flows. Large uncontrolled UI changes risk breaking product logic.

Implementation order:

```txt
Docs → Brand foundation → UI primitives → Homepage → Public shell → Public routes → Profiles/app → Community/content → Dashboard → Checkout polish → QA/release
```

## 2. Phase 0 — Documentation and approval

**Goal:** commit official design documentation.

**Files:**

```txt
docs/design/PetPark-Official-Design-Book-v2.0.md
docs/design/PetPark-Design-Tokens-v2.0.md
docs/design/PetPark-Component-System-v2.0.md
docs/design/PetPark-Page-Templates-v2.0.md
docs/design/PetPark-Route-Redesign-Matrix-v2.0.md
docs/design/PetPark-Copy-System-hr-v2.0.md
docs/design/PetPark-Agent-Prompts-v2.0.md
docs/design/PetPark-QA-Visual-Checklist-v2.0.md
```

**No UI implementation.**

## 3. Phase 1 — Brand foundation

**Goal:** establish official logo and tokens.

**Scope:**

```txt
public/brand/petpark-logo.svg
components/shared/brand/petpark-logo.tsx
app/globals.css token additions
```

**Do not touch:** auth, payment, booking, API routes, Supabase schema.

**Acceptance:**

- one official logo asset exists,
- one logo component created,
- existing logo variants are not blindly removed until references are safely migrated,
- lint/type-check pass.

## 4. Phase 2 — UI primitives

**Goal:** create visual primitives used by all redesign pages.

**Scope:**

```txt
PPButton
PPCard
PPBadge
PPInput
PPSelect
PPStatusBadge
PPSectionHeader
PageHero
EmptyState
LoadingSkeleton
```

**Acceptance:**

- components are small, typed and reusable,
- states are documented,
- no product logic changed.

## 5. Phase 3 — Homepage v2

**Goal:** implement selected Smart Assistant + Service Circle homepage.

**Likely files:**

```txt
app/page.tsx
components/shared/petpark/homepage-redesign.tsx
components/shared/petpark/service-hub-overview.tsx
components/shared/petpark/service-card.tsx
components/shared/petpark/community-card.tsx
components/shared/petpark/blog-card.tsx
```

**Important:** check diff of `components/shared/petpark/service-hub-overview.tsx` before editing because audit found it modified.

**Homepage sections:**

```txt
SiteHeader
HeroSmartAssistant
PetNeedWizard
ServiceOrbit
QuickActionRail
LiveCommunityCard
AdviceCard
WhyPetParkCard
AppPromoStrip/BenefitsStrip
```

**Acceptance:**

- desktop resembles selected direction,
- official logo only,
- no text overlap,
- service orbit right on desktop,
- mobile uses service grid/wizard, not full desktop orbit,
- no fake counts,
- `npm run type-check`, `npm run lint`, `npm run build` pass.

## 6. Phase 4 — Public shell

**Goal:** refresh navbar/footer/bottom-nav while preserving logic.

**Likely files:**

```txt
components/shared/navbar.tsx
components/shared/navbar/config.tsx
components/shared/navbar/desktop-nav.tsx
components/shared/navbar/desktop-actions.tsx
components/shared/navbar/mobile-sheet.tsx
components/shared/footer.tsx
components/shared/bottom-nav.tsx
```

**Risk:** medium/high because nav is auth and role aware.

**Acceptance:** logged-out and logged-in states work; mobile menu works; admin/provider owner actions not lost.

## 7. Phase 5 — Public service pages

**Routes:**

```txt
/pretraga
/njega
/dresura
/veterinari
/dog-friendly
```

**Goal:** apply PageHero, filters, cards and consistent visual system.

**Do not:** move data fetching boundaries unless necessary and approved.

## 8. Phase 6 — Community/content pages

**Routes:**

```txt
/zajednica
/forum
/forum/[id]
/blog
/blog/[slug]
/izgubljeni
/udomljavanje
/udruge
```

**Goal:** unify community and content pages.

**Acceptance:** forum and social actions still work; moderation/report links preserved.

## 9. Phase 7 — Profiles and pet passport

**Routes:**

```txt
/sitter/[id]
/groomer/[id]
/trener/[id]
/veterinari/[slug]
/ljubimac/[id]/kartica
/ljubimac/[id]/karton
/ljubimac/[id]/passport
```

**Goal:** visually redesign profile and pet record pages without changing underlying data logic.

## 10. Phase 8 — Dashboards and messages

**Routes:**

```txt
/dashboard/vlasnik
/dashboard/sitter
/dashboard/groomer
/dashboard/trainer
/poruke
```

**Goal:** app shell consistency.

**Risk:** high. Do not change booking/message logic.

## 11. Phase 9 — Checkout polish

**Routes:**

```txt
/checkout/[bookingId]
/checkout/[bookingId]/success
/checkout/[bookingId]/cancel
```

**Risk:** high. Visual polish only after checkout review.

## 12. Phase 10 — QA and release

Checks:

```bash
npm run type-check
npm run lint
npm run build
npm run test
```

Manual visual screens:

```txt
1440px
1280px
1024px
768px
430px
390px
375px
```

Release only via Vercel preview first. Production after approval.
