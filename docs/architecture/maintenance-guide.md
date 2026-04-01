# Maintenance Guide

## Cleanup vs Ongoing Maintenance

### When is cleanup "done"?

A cleanup task is **done** when:

- The specific anti-pattern or debt item no longer appears in the codebase.
- The build, type check, and tests all pass after the change.
- No new `any` types, `as` casts, or mock fallbacks were introduced.

Cleanup is a **bounded** task with a clear finish line. If the scope keeps growing, split it into smaller PRs.

### What counts as ongoing maintenance?

These are never "done" — they recur as the codebase evolves:

- Keeping mock/fallback usage minimal (audit periodically).
- Ensuring new code follows established type patterns.
- Updating logger coverage as new API routes or server actions are added.
- Reviewing dependency updates and Next.js migration notes.

## When to Do Quality Passes vs Feature Work

### Do a quality pass when:

- You are about to start a feature sprint (see checklist below).
- The build has warnings that have accumulated over 2+ PRs.
- A fallback audit reveals new untyped or mock-dependent paths.
- Type errors or `any` usage has crept into recently merged code.

### Prioritise feature work when:

- The build is clean, type check passes, and the last fallback audit is current.
- There is an active deadline or user-facing commitment.
- Quality issues are cosmetic (naming, comment style) rather than correctness.

**Rule of thumb:** if a quality issue could cause a runtime bug or silently return wrong data, fix it before shipping features. If it is only a style or readability concern, note it and move on.

## Pre-Feature-Sprint Hygiene Checklist

Run through this before starting a batch of feature work:

- [ ] **Build check** — `npm run build` completes with no errors.
- [ ] **Type check** — `npx tsc --noEmit` reports zero errors.
- [ ] **Fallback audit status** — review `docs/mock-fallback-audit-*.md` for outstanding items. No new mock fallbacks should exist outside of explicitly accepted ones.
- [ ] **Logger coverage** — every API route and server action has structured logging (see `observability-runbook.md`). Spot-check any routes added since the last review.
- [ ] **Dependency review** — no pending security advisories (`npm audit`). Check for Next.js migration notes in `node_modules/next/dist/docs/` if the framework was updated.

If any item fails, fix it before starting feature work — small issues compound quickly once a sprint is underway.
