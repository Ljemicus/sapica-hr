# Discovery shell Batch B notes — 2026-04-21

## Scope
Apply the same shared discovery shell direction used for:
- `/pretraga`
- `/dresura`
- `/njega`

to the next listing/discovery family:
- `/dog-friendly`
- `/veterinari`
- `/izgubljeni`
- `/udomljavanje`

## Goal
Standardize route wrapper behavior without changing public page behavior.

## Expected pattern
Each route should move toward:
1. route-level metadata
2. route-level locale/canonical control
3. server wrapper passing explicit props
4. shared discovery shell or a close compatible shell
5. client content component responsible only for interactive UI

## What should stay stable
- title
- canonical
- h1
- public data output
- existing provider-model reads where already correct
- EN locale behavior

## Route-family notes

### `/dog-friendly`
Good candidate for shell reuse.
No major data risk.

### `/veterinari`
Good candidate for shell reuse.
Directory style route, structurally similar enough.

### `/izgubljeni`
Candidate for shell reuse, but content behavior is slightly more feed/notices driven.
Still acceptable.

### `/udomljavanje`
Candidate for shell reuse, but adoption content may have its own emotional/CTA framing.
Need to preserve that while standardizing wrapper structure.

## Success criteria
Batch B is successful when:
- shared shell adoption is expanded
- build passes
- local smoke confirms status + breadcrumb + h1 + canonical
- no public behavior regressions appear
