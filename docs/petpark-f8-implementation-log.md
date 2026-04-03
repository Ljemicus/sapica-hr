# PetPark F8 — Post-launch readiness / measurement / monitoring

**Datum:** 2026-04-03
**Status:** Complete
**Validacija:** `next build` — pass (zero errors, zero warnings)

---

## Napravljeno

### 1. Health check endpoint — `/api/health`
**Datoteka:** `app/api/health/route.ts`

Lightweight health endpoint za uptime monitoring (UptimeRobot, Pingdom, BetterUptime, ili curl iz crona).

- Provjerava Supabase DB konektivnost (SELECT 1 row iz `sitter_profiles`)
- Vraća `status: ok | degraded | error` + `db_latency_ms` + `latency_ms`
- HTTP 200 = healthy, HTTP 503 = degraded/error
- `force-dynamic` — nikad se ne cache-ira
- Ne koristi cookie-based server client (nema auth dependency) — koristi direktan `createClient` iz `@supabase/supabase-js`

### 2. Web Vitals → Plausible
**Datoteke:** `components/monitoring/web-vitals.tsx`, `app/layout.tsx`

Šalje Core Web Vitals (LCP, FCP, CLS, INP, TTFB) kao Plausible custom evente.

- Koristi `useReportWebVitals` iz `next/web-vitals`
- Event name: `Web Vital` s props: `name`, `value`, `rating`, `path`
- CLS se množi × 1000 (Plausible prima integere)
- `rating` dolazi iz web-vitals library (`good` / `needs-improvement` / `poor`)
- Filtrira samo core vitals — ne šalje Next.js custom metrike
- Zero-cost kad Plausible nije učitan (guard na `window.plausible`)

### 3. Error boundary → Plausible
**Datoteka:** `app/error.tsx`

Error boundary sada osim `appLogger.error` šalje i Plausible event `Error Boundary`.

- Props: `message` (truncated na 150 chars), `digest`, `path`
- Vidljivo u Plausible dashboardu pod custom events — ne treba Sentry za bazični error counting
- Nije zamjena za full error tracking, ali daje visibility na "koliko usera vidi error page"

### 4. Sitemap generation logging
**Datoteka:** `app/sitemap.ts`

Logira entry counts po kategoriji pri svakom sitemap generiranju.

- Scope: `sitemap.generate`
- Logira: `total`, `static`, `sitters`, `groomers`, `trainers`, `articles`, `forum`, `lostPets`, `adoption`
- Korisno za praćenje marketplace health-a — pad broja indexed sittera/groomera = signal

---

## Nije napravljeno (i zašto)

| Stavka | Razlog |
|--------|--------|
| Sentry / full error tracking | Zahtijeva account setup + SDK + DSN config — out of scope za F8 |
| Product analytics (Mixpanel/Amplitude) | Plausible pokriva bazične needs, dodavanje drugog analytics toola = overkill za launch |
| Synthetic monitoring (Lighthouse CI) | Zahtijeva CI/CD integraciju — follow-up |
| Custom 404 tracking | Next.js `not-found.tsx` je server component — ne može lako fire-ati client-side event bez wrappera; low priority |
| Stripe webhook health monitoring | Stripe dashboard već ima webhook logs; dodavanje custom health check-a za webhook = overengineering |
| Build metadata endpoint | `process.env.VERCEL_GIT_COMMIT_SHA` je dostupan na Vercelu automatski; custom endpoint nepotreban |

---

## Follow-upovi / rizici

1. **Plausible custom event limits** — Plausible free tier ima limit na custom event props. Ako Web Vitals events generiraju previše unique values, treba provjeriti billing/plan.
2. **Health endpoint security** — Endpoint je public (no auth). Ovo je ok za monitoring ali ne bi trebao vraćati osjetljive info. Trenutno vraća samo status + latency.
3. **Sentry consideration** — Kad app poraste, Plausible error events neće biti dovoljni. Sentry free tier (5k events/month) je logičan next step.
4. **Uptime monitoring setup** — Health endpoint postoji ali treba ga registrirati u monitoring tool (UptimeRobot free tier = 5min intervals, dovoljno za start).
5. **Sitemap log monitoring** — Logovi su u stdout. Ako hosting (Vercel) ima log drain, ovi logovi se mogu routati u external system za alerting na pad marketplace content-a.
