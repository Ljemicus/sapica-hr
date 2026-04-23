# PetPark live audit — 2026-04-20 final

## Scope
Post-fix production audit on `https://petpark.hr` after:
- provider-model migration for trainer/groomer/sitter profiles
- listing/search migration
- profile SSR shell recovery
- profile title and canonical polish
- health endpoint repair

## Executive summary
PetPark core provider/profile flows are now healthy on production.

### Confirmed healthy
- homepage and core search/auth surfaces
- `/pretraga`
- `/dresura`
- `/njega`
- `/trener/[id]`
- `/groomer/[id]`
- `/sitter/[id]`
- public provider profile APIs
- `/api/health`

### Still notable
- `/zajednica` still looks like a fallback/homepage-style SEO shell and should be treated as a separate issue
- `/blog` has no breadcrumb, but this is optional polish, not a blocker

---

## Route results

### `/`
- status: 200
- expected homepage route, previously validated in smoke checks
- verdict: PASS

### `/pretraga`
- status: 200
- h1: present
- breadcrumb: present
- canonical: expected
- robots: index, follow
- verdict: PASS

### `/prijava`
- status: 200
- h1: present
- previously validated in smoke checks
- verdict: PASS

### `/registracija`
- status: 200
- h1: present
- previously validated in smoke checks
- verdict: PASS

### `/dresura`
- status: 200
- title: `Školovanje pasa — treneri i programi | PetPark`
- h1: present
- breadcrumb: present
- canonical: `https://petpark.hr/dresura`
- robots: `index, follow`
- verdict: PASS

### `/njega`
- status: 200
- title: `Njega ljubimaca — grooming saloni i usluge | PetPark`
- h1: present
- breadcrumb: present
- canonical: `https://petpark.hr/njega`
- robots: `index, follow`
- verdict: PASS

### `/blog`
- status: 200
- title: `Blog — savjeti za vlasnike ljubimaca | PetPark`
- h1: present
- breadcrumb: absent
- canonical: `https://petpark.hr/blog`
- robots: `index, follow`
- verdict: PASS with optional breadcrumb polish

### `/zajednica`
- status: 200
- title: `PetPark — Sve za ljubimce na jednom mjestu`
- h1: absent
- breadcrumb: absent
- canonical: `https://petpark.hr`
- robots: `index, follow`
- verdict: FAIL / separate SEO-shell issue

### `/trener/30000000-0000-0000-0000-000000000002`
- status: 200
- title: `Maja Trainer | PetPark`
- h1: `Maja Trainer`
- breadcrumb: present
- canonical: `https://petpark.hr/trener/30000000-0000-0000-0000-000000000002`
- robots: none explicitly set (normal index/follow default)
- verdict: PASS

### `/groomer/30000000-0000-0000-0000-000000000003`
- status: 200
- title: `Petra Groomer | PetPark`
- h1: `Petra Groomer`
- breadcrumb: present
- canonical: `https://petpark.hr/groomer/30000000-0000-0000-0000-000000000003`
- robots: none explicitly set (normal index/follow default)
- verdict: PASS

### `/sitter/30000000-0000-0000-0000-000000000001`
- status: 200
- title: `Ivan Sitter | PetPark`
- h1: `Ivan Sitter`
- breadcrumb: present
- canonical: `https://petpark.hr/sitter/30000000-0000-0000-0000-000000000001`
- robots: none explicitly set (normal index/follow default)
- verdict: PASS

---

## API results

### `/api/public/trainers/[id]`
- status: 200
- returns valid trainer payload
- verdict: PASS

### `/api/public/groomers/[id]`
- status: 200
- returns valid groomer payload
- verdict: PASS

### `/api/public/sitters/[id]`
- status: 200
- returns valid sitter payload
- verdict: PASS

### `/api/health`
- status: 200
- body: `healthy`
- checks observed healthy:
  - `sentry_test`
  - `database`
  - `redis`
  - `sentry` (non-critical)
- verdict: PASS

---

## Final assessment

## Fixed successfully
- legacy schema dependency for provider profiles and listings
- empty/failed profile SSR shell
- missing raw `<h1>` and breadcrumbs on profile pages
- wrong homepage canonical on profile pages
- duplicate title suffix issue
- profile noindex/nofollow issue
- health endpoint false-negative caused by old table and non-critical Sentry config

## Remaining follow-up items
1. `/zajednica` SEO shell still needs separate investigation
2. optional breadcrumb polish for `/blog`

## Overall verdict
Provider/profile migration and related SEO/runtime fixes are successful on production.
