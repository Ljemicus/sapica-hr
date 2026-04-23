# PetPark `/zajednica` fix plan — 2026-04-20

## Problem statement
Live audit shows `/zajednica` is not rendering a proper page-level SEO shell.

Observed on production:
- status: 200
- title: homepage fallback (`PetPark — Sve za ljubimce na jednom mjestu`)
- h1: missing
- breadcrumb: missing
- canonical: root homepage
- robots: index, follow

Current implementation:
- `app/zajednica/page.tsx` redirects to `/blog`
- live output behaves like a fallback/homepage-style page rather than a distinct community landing page

## Goal
Make `/zajednica` behave like a real, indexable landing page with:
- correct title
- correct canonical
- visible h1 in raw HTML
- optional breadcrumb if appropriate
- no misleading homepage fallback metadata

## Desired end state
For `/zajednica` live production should show:
- title like `Zajednica ljubitelja ljubimaca | PetPark` (exact copy can be adjusted)
- h1 present in raw HTML
- canonical `https://petpark.hr/zajednica`
- no accidental redirect/fallback metadata from homepage
- either:
  1. a real dedicated page shell, or
  2. a proper redirect to `/blog` with clean redirect semantics and no conflicting SEO signals

## Decision to make before coding
We need to choose one of two correct product/SEO behaviors.

### Option A — real `/zajednica` landing page (recommended)
Keep `/zajednica` as its own page.

Pros:
- clean SEO target
- stable community landing route
- can link to blog/feed/community sections properly
- avoids weird redirect/fallback behavior

Cons:
- requires a small real page shell to maintain

### Option B — hard redirect to `/blog`
If community is intentionally just the blog for now, then `/zajednica` should redirect cleanly and permanently.

Pros:
- smaller scope
- less UI to maintain

Cons:
- `/zajednica` stops being a standalone landing page
- not ideal if community/feed/challenges are still planned under that route family

### Recommendation
Use **Option A**.
Reason: route family already exists (`/zajednica`, `/zajednica/feed`, `/zajednica/izazovi`, `/zajednica/najbolji`), so a dedicated landing page is the more coherent long-term model.

---

## Implementation plan

### Phase 1 — inspect current route tree
1. inspect `app/zajednica/page.tsx`
2. inspect related routes:
   - `app/zajednica/feed`
   - `app/zajednica/izazovi`
   - `app/zajednica/najbolji`
3. inspect whether `/blog` and `/zajednica` share metadata helpers or redirects elsewhere
4. confirm whether current live behavior comes from redirect logic or route composition/fallback

### Phase 2 — replace redirect with real landing page shell
Create a small SSR-safe landing page with:
- page metadata
- h1
- intro copy
- links/cards into:
  - Blog / savjeti
  - Feed / zajednica
  - Izazovi
  - Najbolji
- optional breadcrumb component

Need raw HTML visibility for:
- title
- h1
- breadcrumb if used

### Phase 3 — metadata correctness
Set in `generateMetadata` or static metadata:
- title
- description
- canonical `/zajednica`
- open graph / twitter if worthwhile
- robots index, follow

### Phase 4 — local verification
Check locally:
- `/zajednica`
- status 200
- title correct
- h1 present in raw HTML
- canonical correct
- breadcrumb present if intended

### Phase 5 — deploy + live verification
Check live production:
- same metrics as local
- ensure no homepage fallback title remains

---

## Minimal page content proposal
A simple first version is enough.

Suggested content:
- H1: `Zajednica ljubitelja ljubimaca`
- Intro: short description that PetPark community gathers owners, sittere, groomere, trenere and rescue users
- 3 to 4 cards/links:
  - `Savjeti i priče` → `/blog`
  - `Feed zajednice` → `/zajednica/feed`
  - `Izazovi` → `/zajednica/izazovi`
  - `Najbolji` → `/zajednica/najbolji`

This is enough to remove the SEO regression without inventing heavy product UI.

---

## Acceptance criteria
`/zajednica` is fixed only when live production shows:
1. status 200
2. correct title (not homepage fallback)
3. h1 present in raw HTML
4. canonical `https://petpark.hr/zajednica`
5. no misleading redirect/fallback behavior

Optional but nice:
6. breadcrumb present

---

## Follow-up optional polish
- add breadcrumb if not present initially
- add OG/Twitter metadata
- align copy and CTA style with `/blog` and PetPark brand voice
