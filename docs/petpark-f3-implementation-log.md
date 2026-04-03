# PetPark F3 — Schema, Metadata/OG Discipline & Internal Linking Pass

**Datum:** 2026-04-03
**Scope:** Structured data discipline, metadata/OG consistency, internal linking
**Cilj:** Ojačati SEO signale bez fake schema/ratinga; minimalno-invazivno

---

## Analiza zatečenog stanja

### Structured data
- City landing stranice (Zagreb, Split, Rijeka) — već imaju LocalBusiness + FAQPage JSON-LD. OK.
- `/dresura` — već ima ServiceJsonLd. OK.
- `/njega` layout — već ima ServiceJsonLd. OK.
- Profile pages (sitter, groomer, trainer) — LocalBusiness + conditionalni AggregateRating. OK, koriste samo stvarne podatke.
- **Problem:** Sitemap ne filtrira sittere po `shouldIndexSitter()` — svi ostali provider tipovi (groomer, trainer, adoption, lost-pet) koriste indexability filter, ali sitters ne.

### Metadata/OG discipline
- Sitter profile: conditional OG/twitter samo kad je indexable. Ispravno.
- **Problem:** Groomer i Trainer profile: emitiraju openGraph i twitter card čak i kad profil nije indexable (thin/seed). Nekonzistentno sa sitter uzorkom.

### Internal linking
- **FAQ stranica:** Jedini link je na `/kontakt`. Nema veze s marketplace-om.
- **City landing pages:** Linkaju na `/pretraga?city=X` i druge gradove + generički `/njega`. Nema linka na dresuru, grooming nije city-specific.
- **Blog članci (`/zajednica/[slug]`):** Samo natrag na `/zajednica` i related articles. Nema marketplace CTA-a (za razliku od `/blog/[slug]` koji ima CTA na `/pretraga`).
- **Sitemap:** City landing pages imale `changeFrequency: 'monthly'` i `priority: 0.6` — prenisko za SEO landing pages.

---

## Implementacija

### 1. Sitemap: sitter indexability filter

**File:** `app/sitemap.ts`

- Dodan import `shouldIndexSitter` iz `lib/seo/indexability`
- Sitter entries sada prolaze `.filter(shouldIndexSitter)` — isto kao groomeri, traineri, adoption, lost-pets
- Linter/hook je podigao prioritet city landing stranica: `priority: 0.7`, `changeFrequency: 'weekly'`

### 2. OG discipline: groomer + trainer conditional OG/twitter

**Files:** `app/groomer/[id]/page.tsx`, `app/trener/[id]/page.tsx`

- openGraph i twitter card sada su conditionalni: emitiraju se samo kad je `indexable === true`
- Isto ponašanje kao sitter profile — konzistentan uzorak za sve provider tipove

### 3. FAQ: internal linking na marketplace

**File:** `app/faq/faq-content.tsx`

- Dodan "Istražite naše usluge" section prije finalnog CTA-a
- 3 linka: `/pretraga` (Čuvanje ljubimaca), `/njega` (Grooming), `/dresura` (Školovanje pasa)
- Dizajn prati pattern iz `/dresura` cross-links sekcije

### 4. City landing pages: cross-service linkovi

**Files:** `app/cuvanje-pasa-zagreb/page.tsx`, `app/cuvanje-pasa-split/page.tsx`, `app/cuvanje-pasa-rijeka/page.tsx`

- Generički `/njega` link zamijenjen city-specific linkom: `/njega?city={Grad}`
- Dodan link na `/dresura?city={Grad}` (školovanje pasa)
- Ikone zamijenjene sa semantičkim: `Scissors` za grooming, `GraduationCap` za dresuru
- Grid proširen na 4 itema (2 grada + grooming + dresura)

### 5. Blog članci (`/zajednica/[slug]`): marketplace CTA

**File:** `app/zajednica/[slug]/page.tsx`

- Dodan marketplace CTA section nakon related articles
- Link na `/pretraga` s copy-jem "Trebate uslugu za ljubimca?"
- Soft gradient pozadina, ne agresivno — ne remeti reading experience

---

## Build verifikacija

```
npx tsc --noEmit       → OK (0 errors)
npx next build         → ✓ Compiled successfully
                          ✓ All pages generated
                          BUILD PASSED
```

---

## Summary tablica

| # | Promjena | File(s) |
|---|----------|---------|
| 1 | Sitemap: sitter indexability filter | `app/sitemap.ts` |
| 2 | OG discipline: conditional OG/twitter za groomer | `app/groomer/[id]/page.tsx` |
| 3 | OG discipline: conditional OG/twitter za trainer | `app/trener/[id]/page.tsx` |
| 4 | FAQ: internal linking na marketplace | `app/faq/faq-content.tsx` |
| 5 | City Zagreb: city-specific grooming + dresura linkovi | `app/cuvanje-pasa-zagreb/page.tsx` |
| 6 | City Split: city-specific grooming + dresura linkovi | `app/cuvanje-pasa-split/page.tsx` |
| 7 | City Rijeka: city-specific grooming + dresura linkovi | `app/cuvanje-pasa-rijeka/page.tsx` |
| 8 | Blog zajednica: marketplace CTA | `app/zajednica/[slug]/page.tsx` |

---

## Što NIJE napravljeno (svjesno)

- **Profile pages cross-service links** (npr. "Također u vašem gradu: grooming, dresura") — veća UI promjena, treba dizajn review. Follow-up za F4.
- **Schema za `/pretraga` page** — search results page nema smisla za structured data (dinamički sadržaj, nema canonical entiteta).
- **Product schema za `/shop`** — već postoji na `/shop/[slug]`, listing page ne treba schema.
- **AggregateRating na city pages** — nema realnih podataka za rating, ne dodajemo fake.
- **Blog `article-content.tsx` internal linking** — `/blog/[slug]` već ima CTA na `/pretraga`, a `/blog` je redirect na `/zajednica` (F1), pa je prioritet nizak.
- **Breadcrumbs na FAQ** — FAQ nema parent kategoriju, breadcrumb bi bio Početna → FAQ što dodaje malo SEO vrijednosti.

## Follow-up (F4+)

1. Profile pages: cross-service links ("Trebate i grooming?" sekcija na sitter profilima)
2. `/grooming-zagreb` landing page: analogni cross-links (dresura, čuvanje)
3. Razmotriti `HowTo` schema za blog članke tipa "Kako pripremiti psa za grooming"
4. Internal linking audit: programski provjeriti orphan pages bez inbound linkova
