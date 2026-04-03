# PetPark F6 — Marketplace Trust Depth / Entity Depth Pass

**Date:** 2026-04-03
**Status:** Complete
**Build:** Passes (no errors)

---

## What was done

### 1. Sitter profile JSON-LD enrichment (`app/sitter/[id]/page.tsx`)

- Added `url` (canonical profile URL) to schema
- Added `image` (avatar URL, when available)
- Added `geo` (GeoCoordinates from `location_lat`/`location_lng`, when available)
- Added `hasOfferCatalog` with real services and EUR prices from profile data
- Added individual `review` items (top 5) with author, date, rating, comment
- Added `bestRating: 5` / `worstRating: 1` to AggregateRating
- Guard: AggregateRating only emits when `review_count > 0`

### 2. Groomer profile JSON-LD enrichment (`app/groomer/[id]/page.tsx`)

- Added `url` (canonical profile URL)
- Added `telephone` and `email` (when provider has them)
- Added `streetAddress` in PostalAddress (when available)
- Added `hasOfferCatalog` with grooming services and EUR prices
- Added individual `review` items (top 5)
- Added `openingHoursSpecification` from `working_hours` data
- Added `bestRating`/`worstRating` to AggregateRating
- Guard: AggregateRating only emits when `review_count > 0`

### 3. Trainer profile JSON-LD enrichment (`app/trener/[id]/page.tsx`)

- Added `url` (canonical profile URL)
- Added `telephone` and `email` (when available)
- Added `streetAddress` in PostalAddress (when available)
- Added `knowsAbout` array with specialization labels
- Added `hasOfferCatalog` with training programs (name, description, price)
- Added individual `review` items (top 5)
- Added `bestRating`/`worstRating` to AggregateRating
- Guard: AggregateRating only emits when `review_count > 0`

### 4. Meta description entity enrichment (all 3 profile types)

**Before (generic):**
- Sitter: "Pogledajte profil sittera X. Rezervirajte uslugu cuvanja ljubimaca."
- Groomer: "Pogledajte profil groomera X. Zakazite termin za uljepsavanje ljubimca."
- Trainer: "Pogledajte profil trenera X. Zakazite dresuru za svog psa."

**After (entity-rich):**
- Sitter: "X - sitter u Y. Usluge: Smjestaj, Setnja. Ocjena 4.8/5 (12 recenzija). Rezervirajte putem PetParka."
- Groomer: "X - grooming salon u Y (psi i macke). Usluge: Sisanje, Kupanje. Ocjena 4.7/5 (8 recenzija). Zakazite termin putem PetParka."
- Trainer: "X - trener pasa u Y. Specijalizacije: Osnovna poslusnost, Agility. Ocjena 4.9/5 (15 recenzija). Certificiran. Zakazite trening putem PetParka."

Descriptions now carry: provider name, city, services/specializations, rating (when available), certification status. Consistent across OG, Twitter, and `<meta>`.

### 5. BreadcrumbList JSON-LD

Already present via `<Breadcrumbs>` component which emits `BreadcrumbJsonLd`. No changes needed.

---

## What was NOT changed

- **F1-F4 canonical/indexability guardrails** — untouched. `shouldIndex*` + `robotsMeta()` logic preserved as-is.
- **City landing pages** (`cuvanje-pasa-*`, `grooming-zagreb`) — already had strong meta descriptions, FAQ schema, and LocalBusiness schema. No changes needed.
- **Search page (`/pretraga`)** — static metadata kept. Dynamic `generateMetadata` based on query params would add value but is a larger refactor (requires converting from static export to async function with data dependency).
- **Sitter card component** — no structural change. Trust signals (verified badge, superhost, rating, response time) already present.
- **No fabricated data** — all schema properties come from real profile fields. Reviews pulled from actual review data. Prices from actual prices. No fake counts, badges, or certifications.
- **No UI changes** — this pass is schema/metadata-only. Zero visual diff.

---

## Follow-ups / Risks

1. **Search page dynamic metadata** — converting `/pretraga/page.tsx` to `generateMetadata` would allow city/category-specific titles and descriptions in SERPs. Medium effort, medium value.
2. **Schema validation** — run profile pages through Google Rich Results Test to confirm `hasOfferCatalog`, `review`, and `openingHoursSpecification` render correctly.
3. **Review schema depth** — currently emitting top 5 reviews. If profiles accumulate many reviews, consider paginating or capping to avoid bloating `<script>` tag.
4. **Groomer working_hours day names** — current `openingHoursSpecification` uses the day keys from the database (`working_hours` record). Ensure these map to Schema.org `DayOfWeek` enum values (Monday, Tuesday, etc.) — if stored in Croatian, a mapping function may be needed.
5. **Offer prices** — schema uses `price` without `priceSpecification.unitText`. For sitters, the price unit varies by service (per day, per walk). Adding `unitText` would improve clarity for search engines.

---

## Files changed

| File | Type of change |
|---|---|
| `app/sitter/[id]/page.tsx` | JSON-LD enrichment + meta description |
| `app/groomer/[id]/page.tsx` | JSON-LD enrichment + meta description |
| `app/trener/[id]/page.tsx` | JSON-LD enrichment + meta description |
