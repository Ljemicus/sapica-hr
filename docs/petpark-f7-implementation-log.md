# PetPark F7 — Launch QA / Consistency / Leftover Cleanup Pass

**Datum:** 2026-04-03
**Cilj:** Uhvatiti leftover nekonzistentnosti nakon F1–F6, ukloniti stare wordinge, broken links, metadata inconsistencies i duplicirane stare pathove.

---

## Što je napravljeno

### 1. `/blog/` path leftovers — JSON-LD, breadcrumbs, linkovi (4 filea)

**Problem:** Nakon F1 odluke da je `/zajednica` kanonski path (s 301 redirectom `/blog` → `/zajednica`), fallback stranice pod `/blog/` su i dalje sadržavale stare pathove:

- **`app/blog/[slug]/page.tsx`**
  - `mainEntityOfPage['@id']` — koristio `/blog/${slug}`, promijenjeno u `/zajednica/${slug}`
  - Breadcrumbs — "Blog" → "Zajednica", linkovi na `/blog?category=` → `/zajednica?kategorija=`, `/blog/${slug}` → `/zajednica/${slug}`

- **`app/blog/blog-content.tsx`**
  - Article card linkovi: `/blog/${slug}` → `/zajednica/${slug}`
  - Category filter navigacija: `/blog?category=` → `/zajednica?kategorija=`
  - Empty-state "prikaži sve" button: `/blog` → `/zajednica`

**Zašto:** Iako next.config.ts redirect hvata većinu prometa, fallback stranice mogu biti renderirane u edge-caseovima i JSON-LD/breadcrumb podaci moraju biti konzistentni s kanonskim URL-ovima.

### 2. Footer — deduplikacija city linkova

**Problem:** Footer je imao iste čuvanje-pasa linkove na dva mjesta:
- "Popularni gradovi" pod "Usluge" — Zagreb, Split, Rijeka + Grooming Zagreb
- "Po gradovima" pod "Istraži" — Zagreb, Rijeka, Split (identični linkovi)

**Riješenje:** Uklonjena sekcija "Po gradovima" iz "Istraži" stupca — ostaje potpunija "Popularni gradovi" sekcija pod "Usluge" s 4 linka.

**File:** `components/shared/footer.tsx`

### 3. Metadata typing — `zajednica/page.tsx`

**Problem:** `export const metadata = {...}` bez `: Metadata` type annotationa — jedina javna stranica bez njega.

**Riješenje:** Dodan `import type { Metadata } from 'next'` i `: Metadata` tip.

**File:** `app/zajednica/page.tsx`

---

## Što NIJE napravljeno (svjesna odluka)

### Ostalo je "uskoro" na specifičnim mjestima
- `app/uzgajivacnice/page.tsx` — "uskoro dostupan" (stranica je u pripremi, korektno prikazano)
- `app/dashboard/postavke/page.tsx` — SMS "Uskoro" badge (disabled feature, pravilno označeno)
- `app/dashboard/sitter/components/sitter-dashboard-dialogs.tsx` — Video update "(uskoro)" badge
- `app/udomljavanje/adoption-browse-content.tsx` — Empty-state "Provjerite ponovo uskoro!"
- `app/zajednica/page.tsx` — Empty-state "Uskoro objavljujemo..."
- Newsletter toast — "Newsletter pretplata je uskoro dostupna!"

**Razlog:** Ovo su UI states za features koji su svjesno disabled/pripremaju se. Poruke su user-friendly i ne stvaraju launch noise.

### TODO u `components/shared/image-upload.tsx`
- Dev komentar o Supabase Storage bucketu — ne utječe na korisničko iskustvo, workaround radi.

### OG/Twitter metadata na nekim stranicama
- Neke stranice (privatnost, uvjeti, o-nama) nemaju explicit openGraph/twitter blokove — oslanjaju se na Next.js defaults i opengraph-image. Ovo je low-priority i ne utječe na launch.

### `/blog/page.tsx` i `/grooming/page.tsx` i dalje postoje
- Ove stranice imaju `robots: noindex` i canonical koji upućuje na `/zajednica` / `/njega`. Redirect u next.config.ts ih hvata na HTTP razini. Brisanje fileova bi bilo čistije ali nije launch-critical i moglo bi slomiti build ako ih nešto referencira.

---

## Validacija

- **TypeScript (`tsc --noEmit`):** ✅ Prolazi bez grešaka
- **ESLint (promijenjeni fileovi):** ✅ Prolazi bez grešaka

---

## Promijenjeni fileovi (ukupno 4)

| File | Promjena |
|------|----------|
| `app/blog/[slug]/page.tsx` | JSON-LD `@id` i breadcrumb pathovi → `/zajednica/` |
| `app/blog/blog-content.tsx` | Article linkovi, category filter, empty-state → `/zajednica/` |
| `components/shared/footer.tsx` | Uklonjena duplicirana "Po gradovima" sekcija |
| `app/zajednica/page.tsx` | Dodan `Metadata` type import i annotation |

---

## Follow-up / rizici

1. **Low:** Razmotriti brisanje `app/blog/` i `app/grooming/` direktorija potpuno — redirect u next.config.ts je dovoljan. Ali zahtijeva provjeru da build ne ovisi o njima.
2. **Low:** Dodati explicit openGraph/twitter metadata na javne stranice koje ga nemaju (o-nama, privatnost, uvjeti).
3. **Low:** `app/uzgajivacnice/page.tsx` — kada uzgajivači feature bude spreman, ukloniti "uskoro" poruku.
4. **None:** Mock data (`@demo.hr` emailovi) — samo fallback za dev, ne izlazi u production.
