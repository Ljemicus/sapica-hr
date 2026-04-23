# PetPark live audit — 2026-04-19 (post provider-model migration)

## Scope
Live production verification on `https://petpark.hr` after:
- provider-model migration for trainer/groomer/sitter profiles
- listing/search migration
- profile SSR shell recovery
- profile metadata title/canonical fixes

## Summary
Core profile and listing regressions are resolved on production.

Confirmed good:
- `/pretraga`
- `/dresura`
- `/njega`
- `/trener/[id]`
- `/groomer/[id]`
- `/sitter/[id]`
- public profile API routes for all three categories

Still notable issues:
- profile pages are still `noindex, nofollow`
- `/zajednica` still appears to fall back to homepage-style SEO output
- `/api/health` returned `503` / unhealthy during audit

---

## Route checks

### `/pretraga`
- status: 200
- title: OK
- h1: present
- breadcrumb: present
- canonical: correct
- robots: index, follow
- verdict: PASS

### `/dresura`
- status: 200
- title: `Školovanje pasa — treneri i programi | PetPark`
- h1: present
- breadcrumb: present
- canonical: `https://petpark.hr/dresura`
- robots: index, follow
- verdict: PASS

### `/njega`
- status: 200
- title: `Njega ljubimaca — grooming saloni i usluge | PetPark`
- h1: present
- breadcrumb: present
- canonical: `https://petpark.hr/njega`
- robots: index, follow
- verdict: PASS

### `/trener/30000000-0000-0000-0000-000000000002`
- status: 200
- title: `Maja Trainer | PetPark`
- h1: `Maja Trainer`
- breadcrumb: present
- canonical: `https://petpark.hr/trener/30000000-0000-0000-0000-000000000002`
- robots: `noindex, nofollow`
- verdict: PASS on SSR/canonical, FAIL on indexability

### `/groomer/30000000-0000-0000-0000-000000000003`
- status: 200
- title: `Petra Groomer | PetPark`
- h1: `Petra Groomer`
- breadcrumb: present
- canonical: `https://petpark.hr/groomer/30000000-0000-0000-0000-000000000003`
- robots: `noindex, nofollow`
- verdict: PASS on SSR/canonical, FAIL on indexability

### `/sitter/30000000-0000-0000-0000-000000000001`
- status: 200
- title: `Ivan Sitter | PetPark`
- h1: `Ivan Sitter`
- breadcrumb: present
- canonical: `https://petpark.hr/sitter/30000000-0000-0000-0000-000000000001`
- robots: `noindex, nofollow`
- verdict: PASS on SSR/canonical, FAIL on indexability

### `/blog`
- status: 200
- title: `Blog — savjeti za vlasnike ljubimaca | PetPark`
- h1: present
- breadcrumb: absent
- canonical: `/blog`
- verdict: acceptable, optional breadcrumb polish only

### `/zajednica`
- status: 200
- title: homepage fallback style
- h1: absent
- breadcrumb: absent
- canonical: `https://petpark.hr`
- robots: index, follow
- verdict: SEO regression / separate issue

---

## API checks

### `/api/public/trainers/[id]`
- status: 200
- payload valid
- includes real trainer data
- verdict: PASS

### `/api/public/groomers/[id]`
- status: 200
- payload valid
- includes real groomer data
- verdict: PASS

### `/api/public/sitters/[id]`
- status: 200
- payload valid
- includes real sitter data
- verdict: PASS

### `/api/health`
- status: 503
- body reported `status: unhealthy`
- database check was not healthy during audit
- verdict: FAIL, operational issue

---

## Final assessment

### Fixed successfully
- old schema dependency for provider profiles/listings
- missing raw `<h1>` on profile pages
- missing breadcrumbs on profile pages
- broken canonical-to-homepage profile metadata
- broken provider listing data paths on `/pretraga`, `/dresura`, `/njega`

### Still open
1. Profile pages are currently `noindex, nofollow`
2. `/zajednica` appears to return fallback metadata/SSR shell
3. `/api/health` returned unhealthy/503 during live audit

## Recommended next steps
1. Decide whether trainer/groomer/sitter profiles should now be indexable, and if yes, remove the current `noindex, nofollow`
2. Audit and fix `/zajednica` metadata/SSR shell separately
3. Investigate production health check failure (`/api/health`)
