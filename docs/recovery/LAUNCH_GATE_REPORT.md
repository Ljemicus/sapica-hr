# PetPark Launch Gate Report

Generated: 2026-04-25T11:00:31Z
Branch: recovery/petpark-worktree-checkpoint-2026-04-25
Commit: 2de760f2
Artifact dir: `/tmp/petpark-launch-gate`

## Summary

| Metric  | Count |
| ------- | ----: |
| PASS    |     6 |
| FAIL    |     4 |
| UNKNOWN |     1 |

## Gate results

| Gate                       | Status  | Detail                               | Artifact                              |
| -------------------------- | ------- | ------------------------------------ | ------------------------------------- |
| RLS-disabled public tables | UNKNOWN | DB_URL not set or psql unavailable   |                                       |
| npm audit high+critical    | PASS    | 0                                    | npm-audit.json                        |
| gitleaks tracked source    | PASS    | 0 findings                           | gitleaks-no-git.txt                   |
| npm test                   | PASS    | exit=0                               | npm-test.log                          |
| Lighthouse mobile LCP      | FAIL    | home:error pretraga:error blog:error | lighthouse/                           |
| axe serious/critical       | FAIL    | exit=1                               | axe.log                               |
| Stripe create idempotency  | PASS    | 0 missing idempotencyKey             | missing-idempotency.txt               |
| Webhook event coverage     | PASS    | 6 target cases                       |                                       |
| Zagreb Tier A providers    | FAIL    | 1/5 from status doc                  | docs/recovery/ZAGREB_TIER_A_STATUS.md |
| DMARC monitoring           | FAIL    | missing rua/ruf: "v=DMARC1; p=none;" | dmarc.txt                             |
| GDPR endpoints reachable   | PASS    | export=HTTP/2 405                    |

; delete=HTTP/2 405
| gdpr-\*-head.txt |

## Decision

**NOT LAUNCH READY** — one or more launch gate checks failed or could not be verified. Keep site in pre-launch / recovery posture and run targeted fixes for each failing gate.

## Notes

- This script does not perform destructive DB changes.
- DB-backed checks use `DB_URL` when available; otherwise they are marked UNKNOWN or use existing recovery status docs where explicitly noted.
- Gitleaks output is redacted and stored outside the repo artifact dir by default.
