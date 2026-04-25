# Phase 0 containment status

Datum: 2026-04-24
Status: in progress

## 0.1 Secret rotation

- Next.js upgraded to 16.2.4
- sanitizer script added
- manual provider-dashboard secret rotation deferred for owner action

## 0.2 Evidence sanitizer

- `scripts/build-evidence-pack.sh` added
- excludes `.env*` and sensitive artifacts from packs

## 0.3 RLS hardening

- Cycle 2 booking/trainer tables hardened live
- Cycle 3 provider `review_count` drift fixed with sync trigger

## 0.4 Public containment

- social feed gated behind `NEXT_PUBLIC_FEATURE_SOCIAL_FEED=false`
- social API routes return `503 feature disabled`
- forum removed from sitemap and primary nav until backend is validated

## 0.5 Launch posture

- Option C selected: aggressive kill-list with indexable homepage and honest copy

## Open caveats

- manual secret rotation still requires owner completion
- full runtime/staging probe evidence is still partial for earlier cycles
- further ghost-route cleanup remains for later cycles in the playbook
