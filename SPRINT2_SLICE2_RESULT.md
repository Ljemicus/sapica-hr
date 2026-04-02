# Sprint 2 Slice 2 — Demo vs Real Cleanup

**Status: DONE**

## Files changed

1. `app/cuvanje-pasa-zagreb/page.tsx`
2. `app/cuvanje-pasa-split/page.tsx`
3. `app/cuvanje-pasa-rijeka/page.tsx`
4. `lib/mock-breeders.ts`

## What changed

### City sitter pages (Zagreb, Split, Rijeka) — HIGH priority

These three SEO landing pages each displayed 4 hardcoded sitter profiles under the heading "Istaknuti sitteri" (Featured sitters) with realistic names, ratings, review counts, and prices. There was **zero indication** that these were illustrative examples, not real bookable sitters. A user landing on `/cuvanje-pasa-zagreb` from Google could reasonably believe Ana M. from Maksimir is a real person they can book.

**Changes made:**
- Added `Eye` icon + "Primjer prikaza" (Example display) outline badge next to the section heading — consistent with the pattern already used on `/uzgajivacnice`
- Changed subtitle from "Neki od naših najpopularnijih sittera" to "Ilustrativni profili — stvarne sittere pronađite putem pretrage" (Illustrative profiles — find real sitters via search)
- Renamed `MOCK_SITTERS` constant to `EXAMPLE_SITTERS` and updated JSX comments from `{/* Mock sitter listings */}` to `{/* Example sitter listings */}` for developer clarity

### mock-breeders.ts — LOW priority

Added `@deprecated` JSDoc tag for parity with `mock-data.ts`, `mock-adoption-data.ts`, and `mock-dog-friendly.ts` which were all already marked deprecated.

## What was already well-labeled (no changes needed)

- `/uzgajivacnice` — already has "Demo podaci" badge + explanatory subtitle
- `/ljubimac/[id]/karton` — has `isDemo` flag + amber warning banner
- `/setnja/[id]` — has `isDemo` flag + amber warning banner
- `/azuriranja/[bookingId]` — has `isDemo` flag + amber warning banner

## What remains

- The city pages still use static example data. When real sitter data is available, these sections should pull from the database (or be removed entirely).
- `lib/mock-data.ts` and other deprecated mock files remain in the codebase as fallbacks. The existing `docs/mock-fallback-audit-2026-03-31.md` documents the strategy for phasing these out.
- No environment-gating was added for mock fallbacks in `lib/db/` modules — that's a larger effort tracked in the audit doc.

## Build

Passed successfully.
