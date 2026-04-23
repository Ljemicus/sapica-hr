# PetPark SSR profile fix plan — 2026-04-18

## Working conclusion
The strongest current evidence indicates that the SSR `<h1>` / breadcrumb failure on real profile routes is tied to **Supabase query execution inside the route branch itself**, not to generic async logic, not to route shape, and not to the client/profile UI tree.

## Evidence summary
Confirmed NOT to be the main cause:
- Next version alone (reproduced across Next 15 and 16)
- dynamic `[id]` route shape alone
- layout/page split alone
- `generateMetadata` alone
- JSON-LD alone
- route-level trust/indexability logic alone
- original `trainer-profile.tsx` alone
- shared UI modules alone (`Button`, `Badge`, `Avatar`, `Separator`, `StarRating`, `AvailabilityCalendar`, `TrainerBookingDialog`)
- `useLanguage` / `useUser` / `AuthProvider` in isolation

Confirmed strong trigger zone:
- real route works when page logic is synthetic
- real route breaks when transplanted page logic starts executing real Supabase query paths
- raw SSR `<h1>` returns when the real query is replaced by a plain async stub
- even minimal real query execution in transplanted route can kill SSR shell

## Recommended fix strategy
Do **not** keep trying to fix the existing direct-query route branch in place.

Instead:
1. Build a new internal public-profile data path that does **not** execute the problematic Supabase query directly inside the page branch.
2. Use that new data path from profile routes.
3. Verify raw HTML proof before rolling out broadly.

## Proposed rollout order
### Phase 1, trainer pilot
- create an internal public trainer profile loader/path
- avoid direct route-branch Supabase query execution in `/trener/[id]`
- keep the rendered output equivalent
- test local raw HTML for:
  - `<h1>`
  - breadcrumb nav
- if successful, verify live

### Phase 2, apply same pattern
- `/groomer/[id]`
- `/sitter/[id]`

### Phase 3, cleanup
- remove experimental SSR debug code/notes not needed anymore
- document the final workaround and rationale

## Acceptance criteria
A fix is only considered real when raw production HTML for each profile route contains:
- `<h1>`
- breadcrumb nav (`<nav aria-label="Breadcrumb">`)
- correct status 200

## Why this is the best next move
This plan targets the only trigger zone that has been strongly proven so far:
- **Supabase query execution inside the route branch**

It avoids further unbounded forensic looping and focuses on the most plausible practical workaround with the highest chance of restoring SSR-visible content.
