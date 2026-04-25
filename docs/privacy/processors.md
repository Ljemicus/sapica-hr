# PetPark privacy processors

Status: Cycle 22 GDPR minimum documentation
Last updated: 2026-04-25

This document tracks the core third-party processors and infrastructure services that may process PetPark personal data. It is an operational register, not legal advice.

| Processor           | Purpose                                                 | Personal data categories                                                                             | Processing location / note         | Retention / deletion note                                                      | Owner action required                     |
| ------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| Supabase            | Auth, PostgreSQL database, storage, realtime            | account identity, profiles, pets, bookings, reviews, messages, uploaded verification/storage objects | primary application data processor | account deletion uses 30-day grace marker; retention cron handles aged data    | confirm DPA/project region                |
| Vercel              | Hosting, serverless/edge execution, logs                | request metadata, IP/user agent, route logs, limited payload metadata                                | production hosting platform        | platform logs follow Vercel retention settings                                 | confirm log retention settings            |
| Stripe              | Payments, Connect onboarding, refunds, disputes         | payment identifiers, connected account data, transaction metadata                                    | payment processor                  | financial records retained as required by law; app keeps booking/payment truth | confirm live Connect account settings     |
| Upstash Redis       | Rate limiting, cache/session-adjacent counters          | IP/user identifiers in rate-limit keys, counters, timestamps                                         | Redis REST provider                | rate-limit keys expire by configured windows                                   | verify TTL/key namespace policy           |
| Resend              | Transactional email delivery                            | email address, message content/metadata                                                              | email processor                    | email logs follow provider settings                                            | confirm retention/log settings            |
| Cloudinary          | Image/media processing and hosting                      | uploaded images/media and metadata                                                                   | media processor/CDN                | deletion must remove or detach storage references                              | confirm signed upload/deletion flows      |
| Sentry              | Error monitoring and diagnostics                        | error traces, request metadata, potential user IDs/emails if included                                | observability processor            | configure PII scrubbing and retention                                          | Cycle 23 observability decision pending   |
| OpenAI / AI tooling | Internal analysis, support/recovery evidence generation | should receive redacted evidence only; no secrets/PII by default                                     | internal/operator tooling          | use sanitized evidence packs only                                              | enforce sanitizer/gitleaks before sharing |

## Current GDPR implementation notes

- `/api/account/export` creates a ZIP containing profile, roles, pets, owner bookings, authored reviews, and sent messages for the authenticated user after password confirmation.
- `/api/account/delete` marks `profiles.deleted_at` and `status='deleted'` after password confirmation; the grace period is 30 days.
- `/api/cron/retention` deletes old messages, clears old booking notes while preserving financial booking rows, deletes abandoned registrations, and attempts hard-delete of profiles past the 30-day grace period.
- Secret and evidence-pack hygiene is tracked separately in `docs/recovery/SECRET_ROTATION_LOG.md` and `scripts/build-evidence-pack.sh`.
