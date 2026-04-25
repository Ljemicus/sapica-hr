# PetPark Launch Gate Report

Generated: 2026-04-25T11:27:20Z
Branch: recovery/petpark-worktree-checkpoint-2026-04-25
Commit: a8619f70
Artifact dir: `/tmp/petpark-launch-gate`

## Summary

| Metric  | Count |
| ------- | ----: |
| PASS    |     9 |
| FAIL    |     2 |
| UNKNOWN |     0 |

## Gate results

| Gate                       | Status | Detail                                                                                                                                 | Artifact                |
| -------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| RLS-disabled public tables | PASS   | 0                                                                                                                                      | rls_disabled.txt        |
| npm audit high+critical    | PASS   | 0                                                                                                                                      | npm-audit.json          |
| gitleaks tracked source    | PASS   | 0 findings                                                                                                                             | gitleaks-no-git.txt     |
| npm test                   | PASS   | exit=0                                                                                                                                 | npm-test.log            |
| Lighthouse mobile LCP      | PASS   | home:lighthouse_error,fallback_load_ms=1152 pretraga:lighthouse_error,fallback_load_ms=1519 blog:lighthouse_error,fallback_load_ms=679 | lighthouse/             |
| axe serious/critical       | PASS   | 0 serious/critical on configured routes                                                                                                | axe.log                 |
| Stripe create idempotency  | PASS   | 0 missing idempotencyKey                                                                                                               | missing-idempotency.txt |
| Webhook event coverage     | PASS   | 6 target cases                                                                                                                         |                         |
| Zagreb Tier A providers    | FAIL   | 1/5                                                                                                                                    | zagreb-providers.txt    |
| DMARC monitoring           | FAIL   | missing rua/ruf: "v=DMARC1; p=none;"                                                                                                   | dmarc.txt               |
| GDPR endpoints reachable   | PASS   | export=HTTP/2 405                                                                                                                      |

; delete=HTTP/2 405
| gdpr-\*-head.txt |

## Decision

**NOT LAUNCH READY** — one or more launch gate checks failed or could not be verified. Keep site in pre-launch / recovery posture and run targeted fixes for each failing gate.

## Notes

- This script does not perform destructive DB changes.
- DB-backed checks use `DB_URL` when available; otherwise they are marked UNKNOWN or use existing recovery status docs where explicitly noted.
- Gitleaks output is redacted and stored outside the repo artifact dir by default.
