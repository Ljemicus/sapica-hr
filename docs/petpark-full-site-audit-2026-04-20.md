# PetPark full-site audit — 2026-04-20

## Scope
Deep live audit of `https://petpark.hr` after:
- provider profile migration
- profile SSR fixes
- `/zajednica` landing fix
- sitemap canonical cleanup

## Confirmed fixed
- profile routes render correct title, canonical, raw h1, breadcrumb
- `/zajednica` now renders as a real landing page
- sitemap now contains `/blog/[slug]` entries instead of stale `/zajednica/[slug]` article URLs
- sitemap again includes provider profile routes (`/sitter`, `/groomer`, `/trener`)
- `/api/health` returns `200 healthy`

## Sitemap state
Live `sitemap.xml` now reports:
- total URLs: 50
- stale `/zajednica/[slug]` article URLs: absent
- `/blog/[slug]` article URLs: present
- `/trener/...`: present
- `/groomer/...`: present
- `/sitter/...`: present

## High-confidence findings so far

### PASS
- `/`
- `/pretraga`
- `/dresura`
- `/njega`
- `/zajednica`
- `/trener/[id]`
- `/groomer/[id]`
- `/sitter/[id]`
- `/blog/[slug]` family appears correctly represented in sitemap
- public provider APIs
- `/api/health`

### New issues found

#### 1. `/forum` has a confirmed homepage fallback SEO shell
Live route check confirms:
- status: `200`
- title: `PetPark — Sve za ljubimce na jednom mjestu`
- h1: none
- breadcrumb: absent
- canonical: `https://petpark.hr`
- robots: `index, follow`

Priority: High
Reason: sitemap includes `/forum`, but the route currently looks like a homepage fallback shell and is indexable.

#### 2. Duplicate title suffix on content pages
Confirmed live:
- `/apelacije` → `Rescue apelacije | PetPark | PetPark`
- `/udruge` → `Rescue udruge i organizacije | PetPark | PetPark`
- `/o-nama` → `O nama — Naša priča | PetPark | PetPark`

Priority: Medium
Reason: not a blocker, but clear metadata consistency bug.

#### 3. Listing pages without breadcrumb, but otherwise structurally healthy
Confirmed live:
- `/izgubljeni` → title/h1/canonical OK, breadcrumb absent
- `/udomljavanje` → title/h1/canonical OK, breadcrumb absent
- `/udruge` → title/h1/canonical OK, breadcrumb absent
- `/apelacije` → title/h1/canonical OK, breadcrumb absent
- `/veterinari` → title/h1/canonical OK, breadcrumb absent
- `/dog-friendly` → title/h1/canonical OK, breadcrumb absent
- `/faq` → title/h1/canonical OK, breadcrumb absent
- `/kontakt` → title/h1/canonical OK, breadcrumb absent
- `/o-nama` → title/h1/canonical OK, breadcrumb absent
- `/privatnost` → title/h1/canonical OK, breadcrumb absent
- `/uvjeti` → title/h1/canonical OK, breadcrumb absent

Priority: Low to Medium
Reason: likely polish, not a breakage, but inconsistent against routes where breadcrumb has been treated as desired SSR structure.

#### 4. `/uzgajivacnice` is in better shape than the rest of this family
Confirmed live:
- status: `200`
- title: `Uzgajivači — Certificirani uzgajivači u Hrvatskoj | PetPark`
- h1: present
- breadcrumb: present
- canonical: correct

Priority: None, this route currently looks healthy.

## Immediate next audit targets
1. `/forum`
2. `/izgubljeni`
3. `/udomljavanje`
4. `/uzgajivacnice`
5. `/udruge`
6. `/apelacije`
7. `/veterinari`
8. `/dog-friendly`
9. `/faq`
10. `/kontakt`, `/o-nama`, `/privatnost`, `/uvjeti`

## Notes
- One local validation command failed because `scripts/validate-sitemap.mjs` was not found on the expected path. This was a tooling/path issue, not a production regression.
- Live sitemap verification was done directly and passed.
