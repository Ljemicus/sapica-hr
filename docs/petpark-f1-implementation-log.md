# PetPark F1 — SEO/IA Implementation Log

**Datum:** 2026-04-03  
**Scope:** SEO/IA critical cleanup before launch  
**Subagent:** Claude Code (subagent depth 1)

---

## Running Log

### 2026-04-03 — Analiza repo stanja

Pronađeni duplikati:
- `/blog` i `/zajednica` — oba prikazuju blog/article listing iz iste DB funkcije (`getArticles()`). Nav koristi `/zajednica`. Canonical u nav/footer/JSON-LD je `/zajednica`. **Odluka: `/zajednica` je canonical, `/blog` → redirect 301**.
- `/grooming` i `/njega` — oba prikazuju groomere iz `getGroomers()`. Nav/footer/breadcrumbs/homepage koriste `/njega`. Layout canonical je `/njega`. **Odluka: `/njega` je canonical, `/grooming` → redirect 301**.

Auth/utility rute bez noindex: `prijava`, `registracija`, `nova-lozinka`, `zaboravljena-lozinka`, `hard-404`, `onboarding/provider`, `onboarding/publisher-type`, `azuriranja/[bookingId]`, `shop/kosarica`, `omiljeni`.

Sitemap: sadrži i `/blog` i `/zajednica` i `/grooming` — duple canonicale treba ukloniti. Blog dynamic entries koriste `/zajednica/slug` URL — konzistentno s canonical decision.

Blog article stranica `/blog/[slug]` ima canonical na `/blog/slug` — treba promijeniti u `/zajednica/slug` da prati canonical decision.

Robots: dobro pokriva `/api/`, `/dashboard/`, `/admin/` ali fale utility rute.

---

### Implementacija

#### 1. next.config.ts — redirects za duplikate

Dodan redirect: `/blog` → `/zajednica` (permanent 301) i `/grooming` → `/njega` (permanent 301).

#### 2. noindex — auth i utility rute

Dodan `robots: { index: false, follow: false }` u metadata za:
- `app/prijava/page.tsx`
- `app/registracija/page.tsx`
- `app/nova-lozinka/page.tsx`
- `app/zaboravljena-lozinka/page.tsx`
- `app/hard-404/page.tsx`
- `app/onboarding/provider/page.tsx`
- `app/shop/kosarica/page.tsx`
- `app/omiljeni/page.tsx`
- `app/azuriranja/[bookingId]/page.tsx`

#### 3. blog/[slug] canonical fix

`app/blog/[slug]/page.tsx` — canonical promijenjen iz `/blog/slug` u `/zajednica/slug`.

#### 4. sitemap.ts — cleanup

Uklonjeni duplikati: `/blog` i `/grooming` iz STATIC_PAGES liste.

#### 5. robots.ts — prošireni disallow

Dodani: `/onboarding/`, `/nova-lozinka`, `/zaboravljena-lozinka`, `/azuriranja/`.

#### 6. blog/page.tsx i grooming/page.tsx

Dodani `robots: noindex`, canonical preusmjeren na `/zajednica` i `/njega` (za slučaj da crawler nekako dođe prije redirecta).

---

### Build verifikacija (2026-04-03)

```
npx tsc --noEmit       → OK (0 errors)
npx eslint             → OK (0 warnings)
npx next build         → ✓ Compiled successfully in 3.7s
                          ✓ Generating static pages 100/100 in 360ms
                          BUILD PASSED
```

---

## Final Summary

### Što je napravljeno

| # | Promjena | File |
|---|----------|------|
| 1 | 301 redirect `/blog` → `/zajednica` | `next.config.ts` |
| 2 | 301 redirect `/grooming` → `/njega` | `next.config.ts` |
| 3 | noindex na 9 auth/utility stranica | po jedan page.tsx za svaku |
| 4 | Canonical fix: `/blog/[slug]` canonical → `/zajednica/slug` | `app/blog/[slug]/page.tsx` |
| 5 | Sitemap cleanup: uklonjeni `/blog` i `/grooming` duplikati | `app/sitemap.ts` |
| 6 | Robots: prošireni disallow (`/onboarding/`, `/nova-lozinka`, `/zaboravljena-lozinka`, `/azuriranja/`) | `app/robots.ts` |
| 7 | noindex + canonical fix na `/blog/page.tsx` i `/grooming/page.tsx` | oba page.tsx |
| 8 | Build verified: `next build` prošao čisto | — |

### Što nije napravljeno

- **`/zajednica/[slug]`** je zadržan kao-je (canonical je `/zajednica/slug`) — konzistentno, nema problema
- **`/onboarding/publisher-type`** — nema page.tsx (samo `'use client'` komponentna stranica bez metadata export) — za noindex treba poseban layout.tsx, izostavljeno kao niska prioriteta
- **`/verifikacija`** — javna informativna stranica, ostavljena indexable (legitimni landing)
- **`/postani-sitter/oglas`** — javni landing za SEO, ostavljen indexable
- UI promjene — nije dirano ništa

### Rizici / Follow-up

1. **`/blog` route postoji** — redirect je dodan u config ali `app/blog/` direktorij i dalje postoji. To je OK (Next.js config redirects imaju prednost), ali može zbuniti developere. Preporučeno: dokumentirati pa eventualno ukloniti `app/blog/` direktorij u F2.
2. **`/grooming` route postoji** — isto kao gore; `app/grooming/` direktorij ostaje.
3. **Interne veze u `/blog/*` komponentama** linkovaju na `/blog/slug` — te veze će raditi (redirect ih vodi na `/zajednica/slug`), ali idealno bi bilo ažurirati ih na `/zajednica/slug`. Niska prioriteta za launch, ali dobro za F2.
4. **JSON-LD u `app/zajednica/[slug]/page.tsx`** koristi `/zajednica/slug` — konzistentno, OK.
5. **`/blog` sitemap entry je uklonjen** — Google će ga de-indexirati prirodno; stare cached stranice će biti redirectane 301, što je ispravno.
