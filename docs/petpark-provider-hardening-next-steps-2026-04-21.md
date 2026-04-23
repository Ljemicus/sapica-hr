# PetPark provider hardening next steps — 2026-04-21

## Current state
Already completed:
- provider promotion baseline
- activation flow promotion hook
- activation ordering fix
- public-status promotion hook
- provider integrity diagnostics
- founder dashboard visibility

## Remaining hardening tasks

### 1. Public-status flow consistency polish
Current status:
- public-status flow already calls promotion before setting `public`

Still worth tightening:
- ensure audit metadata consistently includes promotion outcome
- optionally align log/event names with activation flow
- ensure the same failure semantics are documented clearly

### 2. Promotion diagnostics surface
Current status:
- diagnostics are visible in founder dashboard

Still worth adding later:
- a dedicated diagnostics/details page or modal
- links from issue entries to relevant provider application/admin context

### 3. Promotion mapping maturity
Current status:
- service label mapping exists
- provider type mapping exists

Still weak:
- service mapping is still a pragmatic first-pass dictionary
- kind-specific mapping for richer trainer/groomer semantics is still basic

### 4. Integrity check coverage
Current status:
- missing settings rows
- missing active services
- unknown service codes
- missing profile linkage
- missing display name
- missing city
- unsupported `other`

Still worth adding later:
- missing verified/contact readiness checks
- profile/provider application mismatch checks
- provider/services/settings shape drift checks

## Recommendation
The provider hardening track is in a good enough state to pause after one small final polish pass.

Best immediate move:
1. keep current provider hardening commits as baseline
2. do not over-refactor this track in one burst
3. switch next to breadcrumb batch 2 or broader route-structure cleanup

## Practical next priority
### Next recommended task
- breadcrumb batch 2

Reason:
- low risk
- visible UX/SEO consistency win
- lets provider hardening settle without piling on too many simultaneous backend changes
