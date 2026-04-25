# Secret rotation log

## 2026-04-24 — Initial rotation after forensic pack v1

| secret                | exposure source                      | rotated in provider | revoked old | confirmed by | timestamp |
| --------------------- | ------------------------------------ | ------------------- | ----------- | ------------ | --------- |
| Supabase JWT signing  | git history scripts/run-migration.js | PENDING             | PENDING     | PENDING      | PENDING   |
| Stripe access token   | git history lib/stripe.ts            | PENDING             | PENDING     | PENDING      | PENDING   |
| Resend API key        | evidence pack                        | PENDING             | PENDING     | PENDING      | PENDING   |
| Upstash REST token    | evidence pack                        | PENDING             | PENDING     | PENDING      | PENDING   |
| Cloudinary API secret | evidence pack                        | PENDING             | PENDING     | PENDING      | PENDING   |
