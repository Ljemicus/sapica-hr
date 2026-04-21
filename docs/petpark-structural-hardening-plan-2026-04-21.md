# PetPark structural hardening plan — 2026-04-21

## Goal
Turn the current production-backed `petpark` repo into the clean canonical codebase for long-term development.

This plan assumes the current live site (`petpark.hr`) is best represented by:
- `/Users/ljemicus/Projects/petpark`

## Current high-level assessment

### What is already strong
- production deploy flow is proven from this repo
- major SEO / SSR / i18n issues were fixed directly here
- route coverage is broad and the product surface is real, not speculative
- `lib/seo`, `lib/search`, `lib/db/provider-*`, and the repaired public page shells give a usable foundation

### What is structurally weak
1. mixed route architecture
   - some pages are clean server shells
   - others still mix route shell, hero, client state, and locale switching in a single file
   - there is no obvious route-family standard applied consistently

2. mixed naming / IA conventions
   - `trener`, `dresura`, `grooming`, `groomer`, `njega`, `dog-friendly`, `hitna-pomoc`, `hitno`, etc.
   - some are market-facing slugs, some are technical/resource slugs, some are English/HR mixed concepts

3. app directory is too flat for current size
   - many unrelated domains live side by side in `app/`
   - route families are discoverable, but the repo is not yet optimized for maintainability

4. public page shell patterns are duplicated
   - metadata patterns
   - breadcrumb patterns
   - locale handling
   - hero composition
   - JSON-LD placement

5. repo hygiene is incomplete
   - untracked docs from audit work
   - `supabase/.temp/cli-latest` modified
   - untracked `supabase/migrations/`
   - planning/debug docs live next to durable docs without a clear filing rule

## Immediate structural problems to solve first

### A. Repo hygiene and filing
Current `git status` shows:
- modified: `supabase/.temp/cli-latest`
- untracked docs audit/planning files
- untracked `supabase/migrations/`

#### Action
1. decide which docs are permanent and commit them intentionally
2. move temporary/debug notes into a clearer archive bucket if needed
3. ignore or reset `supabase/.temp/*`
4. inspect `supabase/migrations/` and decide whether they are real schema history or local noise

#### Desired end state
- clean `git status`
- no accidental temp artifacts
- docs split into:
  - durable architecture/audit docs
  - temporary investigation notes

---

### B. Define route-family standards
We need explicit standards for these page families:

1. **info pages**
- examples: `/faq`, `/verifikacija`, `/o-nama`, `/kontakt`, `/privatnost`, `/uvjeti`
- standard:
  - server metadata
  - optional JSON-LD
  - breadcrumb
  - server hero shell
  - minimal client interactivity

2. **listing/discovery pages**
- examples: `/pretraga`, `/dresura`, `/njega`, `/dog-friendly`, `/veterinari`, `/izgubljeni`, `/udomljavanje`, `/uzgajivacnice`
- standard:
  - server page wrapper
  - one content component with explicit props
  - no SEO-critical copy hidden behind client language state
  - breadcrumb policy consistent
  - standardized empty state / toolbar / filtering shell

3. **detail pages**
- examples: `/trener/[id]`, `/groomer/[id]`, `/sitter/[id]`, `/udruge/[slug]`, `/apelacije/[slug]`, `/blog/[slug]`
- standard:
  - server metadata
  - canonical policy
  - JSON-LD policy
  - SSR-visible title/h1/breadcrumb
  - client hydration only for interactive sections

4. **dashboard/private pages**
- examples: `/dashboard/*`, `/poruke`, `/omiljeni`
- separate rule set from SEO/public pages

---

### C. Locale architecture cleanup
Current state improved a lot, but the pattern should be formalized.

#### Desired rule
- locale-specific routes decide locale server-side
- public hero/h1/intro copy must be SSR-visible
- `useLanguage()` should not control SEO-critical shell copy
- client locale context should only enhance interaction, not determine raw HTML shell

#### Action
- document this as a project rule
- audit remaining public routes against this rule over time

---

### D. Public page composition cleanup
A reusable public-page pattern should be established.

#### Desired reusable pieces
- metadata helper
- breadcrumb helper/policy
- hero section pattern
- locale shell pattern
- optional JSON-LD placement convention

#### Why
This avoids repeating custom one-off page structures for every route.

---

### E. Data layer consolidation
Provider model migration solved the biggest live issue, but structurally the repo still needs clearer data-layer boundaries.

#### Desired state
- `lib/db/provider-*` is the canonical provider read layer
- legacy data access is either removed or clearly marked as legacy
- public pages should not query random route-specific tables ad hoc if a canonical adapter exists

#### Action
- inventory remaining legacy reads in public routes and sitemap/helpers
- either migrate or mark them explicitly

---

## Recommended execution order

### Phase 1 — hygiene + architecture docs
1. clean git status / temp artifacts
2. classify docs
3. write one durable architecture doc for page-family standards
4. write one filing rule for future audits/investigations if current docs are too noisy

### Phase 2 — route architecture normalization
1. normalize info page pattern
2. normalize listing/discovery page pattern
3. normalize detail page pattern

### Phase 3 — data layer consolidation
1. inventory remaining legacy reads
2. migrate or isolate them
3. reduce duplicated route-specific fetch logic

### Phase 4 — final polish
1. breadcrumb consistency batch 2
2. heading hierarchy/accessibility pass
3. optional content consistency improvements

## First cleanup/refactor batch I recommend

### Batch 1: repo hygiene + architecture baseline
Concrete tasks:
1. inspect and clean `supabase/.temp/cli-latest`
2. inspect untracked `supabase/migrations/`
3. decide which audit docs stay committed
4. create `docs/architecture/public-page-standards.md`
5. create `docs/architecture/repo-structure-plan.md`

Why this batch first:
- it lowers future chaos immediately
- it gives a stable rulebook before more refactors
- it makes the repo easier to keep clean while continuing feature work

## Success criteria
This structural hardening effort is succeeding when:
- the repo is clean and predictable
- public routes follow a small number of clear patterns
- locale handling is SSR-first by default
- provider/data access is canonicalized
- future page work becomes easier, not messier
