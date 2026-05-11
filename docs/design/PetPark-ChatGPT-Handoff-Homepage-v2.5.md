# PetPark ChatGPT Handoff — Homepage Layout Refinement v2.5

## Status

Homepage v2.5 layout refinement is implemented locally, **not deployed**, and **not approved**.

Current status recommendation: **NEEDS_FINAL_PET_ASSET**.

Reason: layout simplification is much better, mobile duplicate service grid is removed, but the desktop service orbit still uses the best available local dog image rather than a final approved dog+cat PetPark hero asset.

Do not continue to global shell, profiles, blog, forum, dashboard, messages, checkout, community pages, or any other route until Ljemicus explicitly approves the homepage.

## Scope

This was a **homepage-only** layout refinement pass.

Do not touch or propose changes to:

- Supabase schema or RLS
- API routes
- auth/session logic
- Stripe/payment logic
- booking business logic
- messages logic
- middleware
- provider dashboards
- community route implementations
- blog route implementations
- forum route implementations
- checkout routes
- deployment settings
- non-homepage routes

## Direction to Preserve

```txt
PetPark v2 = Smart Assistant + Service Circle
service-first + community-first
warm cream / deep green / orange
official PetPark logo only
right-side service circle on desktop
mobile service grid instead of desktop orbit
```

Do not turn the homepage into a provider-directory-first UI. Do not use fake counts. Do not use emoji as final UI icons. Do not use alternative logos.

## Files Changed in v2.5

```txt
components/shared/petpark/homepage-redesign.tsx
```

No auth/payments/bookings/messages/Supabase/API/middleware files were touched.

## Current Homepage Structure

Desktop:

1. Header
2. Hero section
   - left: eyebrow, H1, subtitle, Smart Assistant card
   - right: desktop service orbit
3. Quick Actions
4. Lower content section
   - Live zajednica
   - Najnoviji savjeti
   - Zašto PetPark?
5. Dark PetPark community strip
6. Homepage-specific footer

Mobile:

1. Compact header
2. Hero eyebrow
3. H1: Što treba tvom ljubimcu danas?
4. Subtitle
5. Smart Assistant card
6. Quick actions grid
7. PetPark vodi dalje section
8. Live zajednica card
9. Najnoviji savjeti card
10. Zašto PetPark? card
11. Dark PetPark zajednica card
12. Footer

## What Changed in v2.5

- Refined desktop hero proportions and spacing.
- Reduced assistant card heaviness.
- Improved relationship between left hero content and right service orbit.
- Reduced service orbit size from oversized v2.4 feel to a cleaner desktop hero visual.
- Tightened Smart Assistant internal rhythm.
- Improved selected/unselected pill state styling.
- Improved mobile header so it no longer feels like a single unfinished “Usluge” pill.
- Reduced mobile H1 pressure so it feels less crushed/aggressive.
- Improved quick action density and hierarchy.
- Tightened lower content cards and row rhythm.
- Refined dark community strip spacing.
- Kept screenshot cleanup for cookie/chat/dev overlays.

## What Was Removed or Simplified

- Removed duplicate mobile “Odaberi uslugu” service grid.
- Mobile now avoids repeating service-selection immediately after the Smart Assistant.
- Mobile top flow is now simpler:

```txt
hero → assistant → quick actions → content cards → community → footer
```

## Service Circle Asset Status

```txt
final dog+cat asset used: no
current asset path: /images/services/07-hero-puppy.jpg
status: NEEDS_FINAL_PET_ASSET
```

The current orbit center uses the best available local PetPark dog image found in `public/`. It is acceptable for layout review, but it is not the intended final premium dog+cat asset.

If a final brand-approved dog+cat image or illustration becomes available, replace the orbit center asset.

## Validation Results

Commands run successfully:

```txt
npm run lint
npm run type-check
npm run build
```

Results:

```txt
lint: pass, 0 errors, existing repo warnings
type-check: pass
build: pass
```

Screenshot/DOM metrics:

```txt
no horizontal overflow
no clipped homepage elements
fixed overlays: 0
desktop orbit visible on desktop
desktop orbit hidden on mobile
duplicate mobile service grid removed
emoji count: 0
```

Final QA result:

```txt
PASS — no blocking layout issues observed.
```

## Screenshot Paths

```txt
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-5-screenshots/desktop-1440.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-5-screenshots/tablet-1024.png
/Users/ljemicus/.openclaw/workspace/artifacts/petpark-homepage-v2-5-screenshots/mobile-390.png
```

## Risks / Remaining Issues

- Service orbit still needs final dog+cat brand asset.
- Current center image is a single dog image, not final dog+cat direction.
- Human visual review is still required.
- Do not self-approve the homepage.

## Suggested ChatGPT Review Prompt

```txt
Review only the attached PetPark Homepage v2.5 screenshots. Direction: Smart Assistant + Service Circle, service-first + community-first, warm cream/deep green/orange, official logo only. Do not suggest auth/payment/API/Supabase/global shell/other route changes.

Focus on layout refinement: desktop hero balance, service orbit hierarchy, mobile simplification after removing duplicate service grid, quick action density, lower content cards, dark community strip, and footer integration.

Important: the current service orbit center uses /images/services/07-hero-puppy.jpg, which is not a final dog+cat brand asset. Return whether this blocks approval or can be accepted temporarily.

Return only:
1. Blocking issues, if any
2. Minor polish suggestions
3. Asset verdict: OK TEMPORARILY / NEEDS_FINAL_PET_ASSET
4. Approval recommendation: APPROVE CANDIDATE / NEEDS_ANOTHER_PASS / NEEDS_FINAL_PET_ASSET
```

## Recommendation

**NEEDS_FINAL_PET_ASSET**

Homepage layout is cleaner and ready for review, but do not move to other pages until Ljemicus approves the homepage and decides whether the current orbit image is acceptable temporarily.
