# Listing/discovery pattern notes — 2026-04-21

## Reviewed target family
- `/pretraga`
- `/dresura`
- `/njega`

## Why this family matters
These are some of the highest-value public discovery pages in the product.
They already work, but their structure is still more custom than it should be.

## Shared characteristics
All three routes currently follow roughly the same domain shape:
- route wrapper fetches initial data
- metadata is route-level
- a main client content component handles filtering and UI state
- public hero/h1 is SEO-critical
- locale-specific routes need explicit server-controlled locale behavior

## Target pattern

### 1. Route wrapper responsibilities
The route file should do only:
- metadata
- locale/canonical decisions
- initial data fetch
- pass props into one content shell
- optional breadcrumb via `PublicPageShell`

### 2. Content component responsibilities
The content component should do only:
- interactive filters
- tab state
- map/list toggles
- empty state handling
- non-critical UI behaviors

### 3. Locale rule
The route wrapper must pass locale explicitly.
Client content may still consume language context for secondary UI, but SEO-critical hero/h1 must be controlled by explicit server props.

### 4. Shared shell opportunity
These routes are strong candidates for a future shared component such as:
- `components/shared/discovery-page-shell.tsx`

Potential responsibilities:
- hero/kicker/title/intro block
- optional toolbar slot
- breadcrumb placement
- consistent spacing
- empty state framing

## Route-specific notes

### `/pretraga`
Most generalized discovery page.
Good candidate to define the most abstract pattern.

### `/dresura`
Closer to a focused vertical listing page.
Could fit the same shell with a different copy/config.

### `/njega`
Same as `/dresura`, with different data and copy.

## Recommended first refactor target
Best first normalization target:
- `/pretraga`

Reason:
- it is the broadest listing shell
- if we can make its route wrapper/content contract clean, the same pattern can be reused for training and grooming

## Proposed next implementation step
1. define a clean route wrapper contract for `SearchContent`
2. ensure breadcrumb uses shared `PublicPageShell`
3. make locale/hero shell responsibility explicit at route level
4. then mirror the same approach to `/dresura` and `/njega`

## Desired end state
For this family, we want:
- one consistent route wrapper pattern
- one clear server/client boundary
- explicit locale control
- fewer route-specific hacks
- easier future extension across discovery pages
