# Info page pattern notes — 2026-04-21

## Reviewed pages
- `/verifikacija`
- `/faq`
- `/o-nama`

## Current pattern quality

### `/verifikacija`
Strong candidate for the target pattern.

What it already has:
- server metadata
- locale-aware page shell
- breadcrumb
- server-visible hero/h1
- route-local content sections that stay structurally readable

Weaknesses:
- page file is still large
- labels/data/content all live in the same route file
- repeated hero/section conventions are not abstracted

### `/faq`
Medium quality, but structurally close.

What it has:
- server metadata
- locale-aware shell
- server-visible hero/h1
- JSON-LD

Weaknesses:
- breadcrumb not yet normalized into the shell
- page data, hero, metadata, and FAQ content composition still tightly bundled in one file
- `FaqContent` is appended without a consistent public-page shell wrapper

### `/o-nama`
Readable, but the most custom/editorial of the three.

What it has:
- metadata
- breadcrumb
- strong server hero
- clean readable sections

Weaknesses:
- very custom structure
- no shared info-page shell usage
- image hero and editorial layout are route-specific without a standard wrapper

## Target info-page pattern
Each info page should move toward this structure:

1. metadata at route level
2. locale-aware page shell at route level
3. breadcrumb before hero
4. hero block as explicit section
5. content sections below hero
6. optional JSON-LD attached at shell level
7. client logic only when truly needed

## Proposed reusable pieces

### 1. `components/shared/public-page-shell.tsx`
Responsibilities:
- optional breadcrumb
- page wrapper spacing
- optional background classes / shell variants
- optional JSON-LD slot as top-level child

### 2. `components/shared/public-page-hero.tsx`
Responsibilities:
- badge/kicker
- h1
- intro text
- alignment and spacing presets
- optional centered vs editorial variant

### 3. locale-aware content props
Public route shells should explicitly pass:
- `locale`
- `title`
- `intro`
- `breadcrumbItems`

instead of relying on client locale state.

## Recommended first refactor target
Best first normalization target:
- `/faq`

Why:
- smaller than `/o-nama`
- already locale-aware
- structurally close to the target pattern
- lower risk than refactoring the more editorial `/o-nama`

## Next target after that
- `/verifikacija`

Reason:
- already strong, so it can become the clean reference implementation

## Last of the first trio
- `/o-nama`

Reason:
- custom editorial design means it should adapt to the pattern only after the simpler cases prove out
