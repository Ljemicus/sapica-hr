# Cycle 21 — Pre-commit gitleaks hook

Date: 2026-04-25
Branch: `recovery/petpark-worktree-checkpoint-2026-04-25`
Commit: `f683f6de` initially added hook

## Change

`.husky/pre-commit` now runs:

```sh
gitleaks protect --staged --redact
npx lint-staged
```

The hook fails before lint-staged if a staged secret is detected.

## Acceptance evidence

### 1. Staged secret blocks commit

Test file used locally and removed before commit:

```text
.cycle21-gitleaks-test.txt
```

Fake token pattern used:

```text
ghp_[REDACTED_TEST_TOKEN]
```

Result:

```text
gitleaks
INF 0 commits scanned.
INF scanned ~76 bytes (76 bytes)
WRN leaks found: 1
husky - pre-commit script failed (code 1)
exit=1
```

### 2. Normal commit still passes

The actual hook commit passed:

```text
gitleaks
INF 0 commits scanned.
INF scanned ~35 bytes (35 bytes)
INF no leaks found
→ lint-staged could not find any staged files matching configured tasks.
[recovery/petpark-worktree-checkpoint-2026-04-25 f683f6de] chore: add gitleaks pre-commit hook
```

## Notes

- The playbook example token `sk_live_fake_1234567890abcdef` was not detected by gitleaks because it is not a realistic Stripe token shape. A GitHub token pattern was used for a reliable staged-secret acceptance test.
- `prettier` was already added in the previous checkpoint because lint-staged referenced `prettier --write` but the dependency was missing.
- No generated evidence/test output is committed; `/evidence/` and `/test-results/` are locally excluded in `.git/info/exclude`.

## Status

Cycle 21 local acceptance: **GREEN**
