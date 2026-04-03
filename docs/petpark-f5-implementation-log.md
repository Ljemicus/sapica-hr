# PetPark F5 — Blog/Content Role vs Marketplace Role Cleanup

**Datum:** 2026-04-03
**Status:** Complete
**Check:** ESLint + tsc --noEmit + next build — all passed
**Scope:** Jasno odvojiti content/discovery ulogu od transactional/marketplace uloge; smanjiti content cannibalization i dead-end patterne; poboljšati content → marketplace flow bez spammy CTA kaosa.

---

## Analiza zatečenog stanja

### Problemi identificirani

1. **`/blog/[slug]/article-content.tsx` — content previše glumi marketplace**
   - CTA "Pronađite sittera za svog ljubimca" — pretjerano transakcijski za content stranicu
   - Svi interni linkovi (related articles, zadnje objave, author bio) vode na `/blog/slug` umjesto `/zajednica/slug` — F1 je redirectao `/blog` → `/zajednica`, ali linkovi unutar komponente nisu ažurirani
   - Nema `InternalLinkSection` — samo jedan hard-coded CTA kao slijepa ulica

2. **`/zajednica/[slug]/page.tsx` — dupli CTA**
   - Hard-coded marketplace CTA ("Trebate uslugu za ljubimca?") + `InternalLinkSection` s category-specific linkovima
   - Redundantno: InternalLinkSection već radi bolji posao s kontekstualnim prijedlozima

3. **`/forum/[id]/page.tsx` — content dead-end**
   - Nakon related topics, nema izlaza prema marketplace-u
   - Korisnik pročita raspravu i nema puta dalje

4. **`lib/seo/internal-links.ts` — opisi su interni SEO žargon**
   - "Sadržajna landing stranica za najjači city intent u sitting sloju"
   - "Lifestyle layer koji pomaže povezati PetPark s lokalnom rutinom"
   - "Filtrirana pretraga za grooming u gradu gdje već postoji zdrava ponuda"
   - Ovi opisi su vidljivi korisnicima u `InternalLinkSection` karticama

5. **Zajednica + Forum page descriptions — interni žargon**
   - "Zajednica je informacijski sloj, ali ne treba biti slijepa ulica..."
   - "Forum je odličan za iskustva, ali ovdje smo dodali i jasne izlaze prema city/service stranicama..."

---

## Implementacija

### 1. Blog article linkovi: `/blog/` → `/zajednica/` + CTA softening

**File:** `app/blog/[slug]/article-content.tsx`

- Related articles linkovi: `/blog/${slug}` → `/zajednica/${slug}`
- Zadnje objave linkovi: `/blog/${slug}` → `/zajednica/${slug}`
- Author bio link: `/blog` → `/zajednica`
- CTA zamijenjen: umjesto agresivnog orange gradient "Pronađite sittera" → soft gradient "Trebate uslugu za ljubimca?" (isti pattern kao zajednica article, ali bez redundancije)

### 2. Zajednica article: uklonjen redundantni hard-coded CTA

**File:** `app/zajednica/[slug]/page.tsx`

- Uklonjen hard-coded marketplace CTA blok (gradient box → `/pretraga`)
- `InternalLinkSection` ostaje kao jedini content→marketplace bridge — category-specific, manje spammy
- Uklonjen nekorišteni `ArrowRight` import
- Ažuriran description iz internog žargona u user-facing copy

### 3. Forum topic: dodan InternalLinkSection

**File:** `app/forum/[id]/page.tsx`

- Dodan `InternalLinkSection` nakon main content containera
- Koristi 3 city page linka + 2 content discovery linka (zajednica, forum)
- Soft framing: "Trebate konkretnu pomoć?" / "Od rasprave do akcije"

### 4. Internal link descriptions: SEO žargon → user-facing copy

**File:** `lib/seo/internal-links.ts`

Prepisani opisi za sve link kolekcije:
- `SEARCH_DISCOVERY_LINKS` (6 items)
- `CONTENT_DISCOVERY_LINKS` (3 items)
- `GROOMING_HUB_LINKS` (3 items)
- `TRAINING_HUB_LINKS` (3 items)
- `getSiblingCityLinks()` (dynamic)
- `getCityServiceLinks()` (6 items)
- `getArticleActionLinks()` (3 branches × 3 items)

Primjer promjene:
- Prije: "Najzrelija grooming city stranica koju treba lakše otkriti iz search sloja"
- Poslije: "Njega, šišanje i kupanje ljubimaca u Zagrebu — saloni i cijene"

### 5. Zajednica + Forum page descriptions

**Files:** `app/zajednica/page.tsx`, `app/forum/page.tsx`

- Zajednica: "Zajednica je informacijski sloj..." → "Ako ste spremni za sljedeći korak — pronađite usluge, lokacije i savjete za svog ljubimca."
- Forum: "Forum je odličan za iskustva, ali..." → "Pronađite usluge, lokacije i vodiče koji vam mogu pomoći."

---

## Build verifikacija

```
npx eslint [all F5 files]  → OK (0 errors)
npx tsc --noEmit            → OK (0 errors)
npx next build              → ✓ Compiled successfully, BUILD PASSED
```

---

## Summary tablica

| # | Promjena | File(s) |
|---|----------|---------|
| 1 | Blog article linkovi `/blog/` → `/zajednica/` | `app/blog/[slug]/article-content.tsx` |
| 2 | Blog article CTA softened | `app/blog/[slug]/article-content.tsx` |
| 3 | Zajednica article: uklonjen redundantni CTA | `app/zajednica/[slug]/page.tsx` |
| 4 | Zajednica article: description fix | `app/zajednica/[slug]/page.tsx` |
| 5 | Forum topic: dodan InternalLinkSection | `app/forum/[id]/page.tsx` |
| 6 | Internal link descriptions: user-facing copy | `lib/seo/internal-links.ts` |
| 7 | Zajednica page description fix | `app/zajednica/page.tsx` |
| 8 | Forum page description fix | `app/forum/page.tsx` |

---

## Što NIJE napravljeno (namjerno)

- **Blog article `InternalLinkSection`** — `/blog/[slug]` je redirect target (F1), nije canonical; softened CTA je dovoljan jer većina korisnika dolazi na `/zajednica/[slug]`
- **Forum topic category-aware linkovi** — mogao bi koristiti `getArticleActionLinks`-style routing po forum kategoriji, ali forum kategorije (pitanja, savjeti, priče...) nisu dovoljno specifične za category-aware marketplace bridge. Generički set je bolji.
- **Nije dirana navigacija, footer, homepage** — F4 ih je već pokrio
- **Nisu dirani F1-F4 guardraili** — kompatibilno nadograđeno

## Rizici / Follow-up

1. **Blog article component redundancija** — `/blog/[slug]/article-content.tsx` i `/zajednica/[slug]/page.tsx` prikazuju isti sadržaj ali na dva različita načina. Dugoročno, `article-content.tsx` bi trebao biti uklonjen ili spušten iza `/zajednica/[slug]` layouta. Za sada oboje funkcioniraju korektno (redirect + noindex štite od cannibalization).
2. **Forum topic InternalLinkSection** — kad forum dobije realan sadržaj, može trebati category-aware bridge umjesto generic seta.
3. **Ako se doda novi content tip** (npr. guides, tutorials), trebaju pratiti isti pattern: informational framing + `InternalLinkSection` za content→marketplace bridge, bez hard-coded marketplace CTA-ova.
