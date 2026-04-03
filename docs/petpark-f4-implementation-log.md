# PetPark F4 — city/service landing strategy + internal linking

**Datum:** 2026-04-03
**Status:** Complete
**Check:** Targeted ESLint pass on F4-touched files
**Scope:** ojačati city/service landing strategiju bez thin/fake landingica, poboljšati internal linking između city/service/search/content/community stranica, smanjiti orphan-ish problem postojećih landingica.

---

## Running Log

### 2026-04-03 — Početna analiza

Pregledano:
- blok F plan (`petpark-block-f-seo-ia-plan.md`)
- postojeći F1 log (`docs/petpark-f1-implementation-log.md`)
- postojeće city landing stranice za sitting (`/cuvanje-pasa-zagreb`, `/cuvanje-pasa-split`, `/cuvanje-pasa-rijeka`)
- postojeći grooming city landing (`/grooming-zagreb`)
- service/search/content/community stranice (`/njega`, `/dresura`, `/pretraga`, `/zajednica`, `/forum`, `/dog-friendly`, homepage, footer)

Bitni nalazi:
- sitting city landingice postoje za Zagreb / Split / Rijeku
- grooming city landingica postoji samo za Zagreb
- `getSitters()` je trenutno hard-disabled i vraća prazno, pa neću širiti sitting landingice niti raditi bilo kakav fake provider framing
- realan supply postoji za grooming i dresuru u više gradova, pa su safe cross-linkovi prema filtriranim service/search stranicama opravdani
- homepage i footer trenutno slabo guraju postojeće landingice, pa dio njih djeluje orphan-ish
- blog/forum/community imaju malo ili nimalo mostova prema transactional stranicama

### 2026-04-03 — Supply sanity check

Provjeren realan supply direktno iz Supabase tablica prije bilo kakvog city/service jačanja:

- **groomers**: Zagreb 19, Split 2, Rijeka 7 (+ ostali gradovi)
- **trainers**: Zagreb 5, Split 3, Rijeka 2 (+ ostali gradovi)

Odluka:
- **NE** radim nove thin city landingice za gradove bez postojećeg sadržajnog temelja
- fokus ide na:
  1. bolji discoverability postojećih landingica
  2. city-aware linkove prema stvarnim filtriranim service/search rutama
  3. contextual bridges iz content/community sloja prema transakcijskim stranicama

### 2026-04-03 — Execution

#### 1. Homepage → city landing pages (`app/page.tsx`)
- Cities s dedicated landing pages (Zagreb, Rijeka, Split) sada linkaju direktno na `/cuvanje-pasa-{city}` umjesto `/pretraga?city={City}`.
- Ostali gradovi (Osijek, Pula, Zadar) i dalje idu na `/pretraga?city=X`.

#### 2. City page cross-links (sve 3 city stranice)
- Dodan "Čuvanje pasa u drugim gradovima" section prije Final CTA-a na svakoj city stranici.
- Svaka city stranica sada linka na druge dvije + `/njega` (grooming).
- Stvara full internal mesh između city landing stranica.

#### 3. Footer city links (`components/shared/footer.tsx`)
- Dodan "Po gradovima" pod-sekcija ispod "Istraži" stupca s linkovima na sve tri city stranice.
- Site-wide internal link equity sada teče prema city stranicama sa svake stranice.

#### 4. Search page city links (`app/pretraga/search-content.tsx`)
- Dodan "Istražite po gradovima" pill-link section ispod search rezultata.
- Linkovi na sve tri city stranice s MapPin ikonama.

#### 5. Njega/grooming cross-links (`app/njega/page.tsx`)
- Dodani city pill-linkovi ispod postojeće "Istražite druge usluge" sekcije.
- Linkovi na sve tri city stranice.

#### 6. Sitemap priority bump (`app/sitemap.ts`)
- City landing pages: `0.6 monthly` → `0.7 weekly` (odražava stvarnu dubinu sadržaja i ulaganje u internal linkove).
- `grooming-zagreb`: `monthly` → `weekly`.

---

## Internal link graph (city pages)

```
Homepage ──────→ /cuvanje-pasa-zagreb
               → /cuvanje-pasa-rijeka
               → /cuvanje-pasa-split

Footer (all) ──→ /cuvanje-pasa-zagreb
               → /cuvanje-pasa-rijeka
               → /cuvanje-pasa-split

/pretraga ─────→ /cuvanje-pasa-zagreb
               → /cuvanje-pasa-rijeka
               → /cuvanje-pasa-split

/njega ────────→ /cuvanje-pasa-zagreb
               → /cuvanje-pasa-rijeka
               → /cuvanje-pasa-split

/cuvanje-pasa-zagreb ──→ /cuvanje-pasa-rijeka, /cuvanje-pasa-split, /njega
/cuvanje-pasa-rijeka ──→ /cuvanje-pasa-zagreb, /cuvanje-pasa-split, /njega
/cuvanje-pasa-split  ──→ /cuvanje-pasa-zagreb, /cuvanje-pasa-rijeka, /njega
```

---

## Što NIJE napravljeno (namjerno)

- **Nema novih city stranica** (Osijek, Pula, Zadar) — nedovoljno pravih providera za opravdanje. Bio bi thin content.
- **Nema navbar promjena** — city linkovi u navbaru bi zakrčili mobile UX. Footer + homepage + search + cross-links daju dovoljnu pokrivenost.
- **Nema blog→city linkova** — blog članci su generički, ne city-specific. Forsirani linkovi bi djelovali spammy.
- **Nema dresura/veterinari cross-linkova** — nije u F4 scopeu.

## Follow-ups

- [ ] Napraviti city landing stranice za Osijek, Pula, Zadar kad budu realni provideri.
- [ ] `/grooming-zagreb` zaslužuje isti tretman (cross-links, homepage link).
- [ ] Breadcrumbs hijerarhija na city stranicama: `/pretraga` → `/cuvanje-pasa-{city}`.
- [ ] Pratiti GSC za city page impressions/clicks nakon što F4 ode live.

---

## Retry pass — final state for this implementation session

### Što je napravljeno

1. **Uveden reusable internal-link hub sloj**
   - Dodan `components/shared/internal-link-section.tsx`
   - Dodan `lib/seo/internal-links.ts`
   - Time su cross-linkovi standardizirani umjesto da svaka stranica ručno izmišlja svoj mini-link farm

2. **Ojačane postojeće city landing stranice za sitting**
   - `/cuvanje-pasa-zagreb`
   - `/cuvanje-pasa-split`
   - `/cuvanje-pasa-rijeka`
   
   Na sve tri stranice dodan je novi internal-link hub koji vodi prema:
   - city-specific search rutama
   - grooming rutama s realnim supplyjem
   - training rutama s realnim supplyjem
   - sibling city landing stranicama

3. **Ojačan grooming city/service sloj bez generiranja fake landingica**
   - `/grooming-zagreb` više ne govori “coming soon” za Zagreb dok u bazi postoji realna grooming ponuda
   - CTA-ovi na toj stranici sada vode na stvarnu filtriranu rutu: `/pretraga?category=grooming&city=Zagreb`
   - dodan related hub prema grooming/train/content rutama
   - `/njega` dobio je city/content hub za Zagreb / Split / Rijeku + povezani sadržaj
   - `/njega` sada čita `city` i `service` query parametre, pa interni linkovi poput `/njega?city=...` više nisu mrtvo slovo na papiru

4. **Ojačan training/search sloj**
   - `/dresura` dobio section s gradovima gdje postoji realan training supply (Zagreb / Split / Rijeka)
   - `/pretraga` dobila je dodatni hub prema jačim city/service landing rutama i relevantnom content/community sloju

5. **Ojačan content/community → transactional bridge**
   - `/zajednica` dobila je block koji vodi prema city/service rutama i relevantnim discovery stranicama
   - `/zajednica/[slug]` dobila je topic-aware next-step linkove preko `getArticleActionLinks(...)`
   - `/forum` dobio je jasan izlaz prema transactional city/service rutama i discovery sadržaju

6. **Site-wide discoverability boost**
   - `components/shared/footer.tsx` sada ima dodatne city links prema:
     - Čuvanje pasa Zagreb
     - Čuvanje pasa Split
     - Čuvanje pasa Rijeka
     - Grooming Zagreb

### Što nije napravljeno

- **Nisam otvarao nove city landing stranice za nove gradove** iako postoji dio grooming/training supplyja izvan Zagreba/Splita/Rijeke. To je bilo namjerno da ne skliznemo u thin SEO spam.
- **Nisam dirao F1/F2 guardraile** osim kompatibilnog poboljšanja na `/njega` query-param syncu.
- **Nisam radio full-site refactor navigacije**; fokus je ostao na production-safe internal linking sloju i postojećim landing entrypointima.
- **Nisam radio full build** jer repo već ima dosta drugih in-flight izmjena izvan F4 scopea; radio sam ciljanu provjeru F4 zahvaćenih fileova.

### Rizici / preostali follow-upovi

- Dio city pageova već je imao paralelne necommitane izmjene iz drugih taskova; F4 je nadograđen minimalno-invazivno preko njih, ali finalni merge/review treba paziti na overlap.
- Ako se kasnije ponovno mijenja `/njega` filter behavior, treba zadržati query-param sync jer se dio novih internih linkova oslanja na to.
- Ako PetPark kasnije aktivira realan sitter supply u search sloju (`getSitters()` trenutno vraća prazno), vrijedi ponovno pregledati CTA copy na sitting city landingicama i proširiti city/service matrice.
- Ako GSC pokaže da Split/Rijeka grooming queryevi zaslužuju vlastite sadržajno bogate city landingice, to treba raditi tek kad postoji dovoljno stabilan supply + jedinstven sadržaj.

### Relevantna provjera

Pokrenuto:

```bash
npx eslint app/cuvanje-pasa-zagreb/page.tsx \
  app/cuvanje-pasa-split/page.tsx \
  app/cuvanje-pasa-rijeka/page.tsx \
  app/grooming-zagreb/page.tsx \
  app/njega/page.tsx \
  app/dresura/page.tsx \
  app/pretraga/page.tsx \
  app/zajednica/page.tsx \
  'app/zajednica/[slug]/page.tsx' \
  app/forum/page.tsx \
  components/shared/footer.tsx \
  components/shared/internal-link-section.tsx \
  lib/seo/internal-links.ts
```

**Rezultat:** ciljane F4 datoteke prolaze ESLint bez grešaka.
