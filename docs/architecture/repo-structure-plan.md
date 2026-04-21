# Repo structure plan

## Goal
Keep the current `petpark` repo as the canonical production-backed codebase and gradually make it cleaner without disruptive rewrites.

## Near-term structure principles

### 1. `app/` stays route-first
Do not rewrite the whole app tree immediately.
Instead:
- preserve existing route URLs
- normalize internals within route families first
- use route-family standards instead of large moves for the first phase

### 2. Organize by family, not by one-off fixes
Priority families:
- provider profiles
- public info pages
- public listing/discovery pages
- rescue/adoption families
- dashboard/private areas

### 3. Canonical logic belongs in shared layers
Use shared places for:
- metadata helpers
- locale helpers
- provider read adapters
- search/listing adapters
- security helpers

## Documentation filing

### Durable docs
Keep in `docs/`:
- architecture standards
- deployment checklists
- environment docs
- final audit summaries
- durable implementation logs if still useful

### Investigation docs
Investigation and temporary audit docs may stay in `docs/` short term, but should eventually move to:
- `docs/audits/`
- `docs/plans/`
- `docs/archive/`

## Hygiene actions
1. ignore `supabase/.temp/*`
2. review whether `supabase/migrations/20260421073000_create_trainer_feature_tables.sql` is real work or stray local state
3. decide which PetPark audit docs should remain committed as durable references
4. keep `git status` clean before larger refactors

## Refactor order

### Phase 1
- hygiene
- docs/architecture baseline
- breadcrumb consistency completion

### Phase 2
- normalize info page shells
- normalize listing page shells
- normalize locale handling

### Phase 3
- remove or isolate remaining legacy data reads
- reduce duplication across route wrappers and content shells

### Phase 4
- optional IA/naming cleanup only after the internals are stable

## Success condition
The repo is structurally healthy when:
- route families follow a small set of patterns
- locale handling is SSR-first by default
- metadata and breadcrumb behavior are predictable
- provider/public data access goes through canonical adapters
- future changes require less route-specific special casing
