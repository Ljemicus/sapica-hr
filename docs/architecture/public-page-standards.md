# Public page standards

## Purpose
Define one consistent structure for public PetPark pages so SEO, SSR, i18n, and future maintenance stay predictable.

## Page families

### 1. Info pages
Examples:
- `/faq`
- `/verifikacija`
- `/o-nama`
- `/kontakt`
- `/privatnost`
- `/uvjeti`

Standard:
- server-side metadata
- canonical explicitly defined or built from helper
- breadcrumb when page is not the homepage
- SSR-visible hero title/h1
- client logic only for non-critical interactions

### 2. Listing/discovery pages
Examples:
- `/pretraga`
- `/dresura`
- `/njega`
- `/dog-friendly`
- `/veterinari`
- `/izgubljeni`
- `/udomljavanje`
- `/uzgajivacnice`

Standard:
- server route wrapper fetches initial data
- page passes explicit props into one main content component
- SEO-critical hero/h1 copy must be SSR-visible
- locale must be decided server-side for `/en` routes
- filtering/searching may stay client-side

### 3. Detail pages
Examples:
- `/trener/[id]`
- `/groomer/[id]`
- `/sitter/[id]`
- `/blog/[slug]`
- `/apelacije/[slug]`
- `/udruge/[slug]`

Standard:
- server metadata
- canonical explicit and stable
- raw HTML h1 present
- breadcrumb present unless intentionally omitted for product reasons
- client hydration only for interactive widgets

## Locale rules
- locale-specific routes decide locale server-side
- `useLanguage()` must not control raw HTML hero/h1 on public pages
- `forcedLanguage` or locale prop is acceptable for client content components when needed
- metadata, canonical, and h1 must agree on locale

## Breadcrumb rules
- public non-home routes should render breadcrumb unless there is a clear UX reason not to
- breadcrumb should render before hero/content shell
- breadcrumb labels should be explicit, not guessed from slugs at runtime

## Metadata rules
- use `title.absolute` when the full page title already includes the brand
- avoid homepage canonical fallbacks on non-home routes
- auth routes may stay `noindex, nofollow`, but canonical should point to self route

## Data access rules
- provider public pages use canonical provider-model adapters
- avoid route-local ad hoc data access when a shared read adapter exists
- legacy reads should be removed or clearly marked as legacy

## Anti-patterns to avoid
- SEO-critical copy hidden behind client language gate
- duplicate title suffixes
- mixed HR/EN raw shell on `/en` routes
- page-specific query logic copied into multiple route files
- public page shell composed differently for every route without reason
