# Homepage Performance Polish — Result

**Status:** DONE
**Date:** 2026-04-02

## Files changed

| File | Change |
|------|--------|
| `app/page.tsx` | Added ISR `revalidate = 60`, parallel data fetching via `Promise.all`, inlined lost-pets section to eliminate async waterfall |
| `lib/db/sitters.ts` | Added `.order()` to Supabase query for `rating` and `reviews` sorts — pushes sorting to the database instead of JS |

## What changed

### 1. ISR caching (`revalidate = 60`)
The homepage was fully dynamic (re-rendered on every request). Added `export const revalidate = 60` so the page is cached and revalidated at most once per minute. This eliminates redundant DB queries and render work for repeat visitors.

### 2. Parallel data fetching
`getSitters` and `getLostPets` were fetched sequentially (sitters in the main component, lost pets in a child async component). Now both run in parallel via `Promise.all`, cutting total data-fetch time roughly in half.

### 3. Eliminated async component waterfall
`LostPetsHomepageSection` was a separate async server component that introduced a sequential fetch after the main component resolved. Inlined the markup into `HomePage` so both queries start immediately and the page streams as a single unit.

### 4. Database-side sorting for sitters
The `getSitters` function fetched all rows then sorted in JavaScript. Added `query.order('rating_avg', ...)` / `query.order('review_count', ...)` to the Supabase query so the database handles sorting — reduces data transfer and JS compute.

## What was already good (no changes needed)

- Hero image uses `priority` for LCP
- All below-fold images use `loading="lazy"`
- `next/image` with proper `sizes` hints throughout
- Newsletter signup is `dynamic()` imported (code-split)
- Sitter and lost-pet queries already use `fields: 'homepage-card'` for narrow column selection
- Lucide icons are tree-shaken (all 18 imports are used)

## What remains

- **Image compression**: Verify `/public/images/` assets are optimized (WebP/AVIF). Could add `formats: ['image/avif', 'image/webp']` to `next.config.ts` images config.
- **Font subsetting**: Nunito loads 5 weights (400–900). Could reduce to 3 (600, 700, 800) if design allows.
- **Critical CSS**: The `paw-pattern` and animation classes could be audited for unused CSS.
- **Edge caching**: If deployed on Vercel/Cloudflare, confirm CDN caching headers are set for the 60s revalidation window.

## Live-check recommendation after deploy

1. Run Lighthouse on the homepage — target LCP < 2.5s, CLS < 0.1
2. Check Network tab: confirm only 1 hero image loads eagerly, all others are lazy
3. Verify ISR: hit the page twice within 60s — second request should be instant (cached)
4. Check Supabase dashboard: confirm homepage queries use index scans on `rating_avg`
