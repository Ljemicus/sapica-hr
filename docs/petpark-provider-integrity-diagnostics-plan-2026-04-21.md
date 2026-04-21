# PetPark provider integrity diagnostics plan — 2026-04-21

## Goal
Add a small canonical integrity checker for listed providers so structural drift becomes visible early.

## Initial diagnostics covered
The first integrity checker now detects:
- listed provider missing expected settings row
- listed provider missing active services
- listed provider with unknown or kind-mismatched service code
- listed provider missing profile linkage
- listed provider missing display name
- listed provider missing city
- listed provider with unsupported `other` provider kind

## Canonical source
- `lib/db/provider-integrity.ts`

## Current function
- `getProviderIntegrityIssues()`

## What it checks

### 1. Missing settings row
For listed providers:
- sitter must have `provider_sitter_settings`
- groomer must have `provider_groomer_settings`
- trainer must have `provider_trainer_settings`

### 2. Missing active services
A listed provider with no active `provider_services` is flagged.

### 3. Unknown or mismatched service code
Allowed service code sets are defined per provider kind:
- sitter
- groomer
- trainer

Anything outside those sets is flagged.

### 4. Core completeness checks
Also flags listed providers with:
- missing `profile_id`
- missing `display_name`
- missing `city`
- unsupported `provider_kind = other`

## Recommended next integration
1. expose the diagnostics in admin/internal tooling
2. optionally add it to ops audit or founder dashboard
3. later extend checks for:
   - missing profile linkage
   - unsupported `other` provider kind
   - incomplete city/display_name for listed providers
   - missing kind-specific business fields

## Why this matters
This moves provider health from "implicit and reactive" to:
- explicit
- inspectable
- debuggable

It is the right companion to the provider promotion layer.
