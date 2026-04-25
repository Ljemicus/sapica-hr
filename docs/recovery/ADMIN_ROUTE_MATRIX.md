# ADMIN_ROUTE_MATRIX

## Cycle 10 — Admin boundary audit (2026-04-24)

### App admin pages

| route/file                                                          | auth entry      | canonical admin check                  | status | notes                          |
| ------------------------------------------------------------------- | --------------- | -------------------------------------- | ------ | ------------------------------ |
| `/admin` — `app/admin/page.tsx`                                     | `getAuthUser()` | `user.profileMissing` + `user.isAdmin` | PASS   | canonical Cycle 7 gate present |
| `/admin/marketing` — `app/admin/marketing/page.tsx`                 | `getAuthUser()` | `user.profileMissing` + `user.isAdmin` | PASS   | canonical Cycle 7 gate present |
| `/admin/founder-dashboard` — `app/admin/founder-dashboard/page.tsx` | `getAuthUser()` | `user.profileMissing` + `user.isAdmin` | PASS   | canonical Cycle 7 gate present |

### Admin API routes

| route/file                                           | auth entry                    | canonical admin check | status | notes                                                                                      |
| ---------------------------------------------------- | ----------------------------- | --------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `app/api/admin/forum/moderate/route.ts`              | `requireAdmin()`              | yes                   | PASS   | uses canonical admin guard                                                                 |
| `app/api/admin/kpi-digest/route.ts`                  | `requireAdminOrCron(request)` | yes                   | PASS   | cron/admin dual gate via canonical guard                                                   |
| `app/api/admin/lost-pets/route.ts`                   | `requireAdmin()`              | yes                   | PASS   | canonical admin guard                                                                      |
| `app/api/admin/ops-audit/route.ts`                   | `requireAdminOrCron(request)` | yes                   | PASS   | cron/admin dual gate via canonical guard                                                   |
| `app/api/admin/provider-applications/route.ts`       | `requireAdmin()`              | yes                   | PASS   | canonical admin guard                                                                      |
| `app/api/admin/provider-public-status/route.ts`      | `requireAdmin()`              | yes                   | PASS   | canonical admin guard                                                                      |
| `app/api/admin/rescue-organizations/review/route.ts` | `requireAdmin()`              | yes                   | PASS   | canonical admin guard                                                                      |
| `app/api/admin/rescue-pending-count/route.ts`        | `requireAdmin()`              | yes                   | PASS   | canonical admin guard, but unauthorized path returns `{count:0}` instead of guard response |
| `app/api/admin/sitter-verification/route.ts`         | `requireAdmin()`              | yes                   | PASS   | auth gate is canonical; underlying table still legacy `sitter_profiles`                    |
| `app/api/admin/verifications/route.ts`               | `requireAdmin()`              | yes                   | PASS   | canonical admin guard                                                                      |
| `app/api/admin/verifications/documents/route.ts`     | `requireAdmin()`              | yes                   | PASS   | canonical admin guard; uses service role server-side for signed URLs                       |

## Related admin-boundary findings outside `/api/admin/*`

| file                                                                     | issue                                                                                                                                      | severity |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `app/api/rescue-verification-documents/[documentId]/signed-url/route.ts` | canonicalized to `user.isAdmin`; owner-or-admin gate now matches Cycle 7 auth truth                                                        | resolved |
| `app/sitemap.ts`                                                         | imports `createAdminClient()` in a public sitemap generation path; server-side only, but broad service-role reach in a public-facing route | medium   |
| `app/api/health/route.ts`                                                | health endpoint prefers service role when present, even though anon key would be enough for simple connectivity check                      | low      |

## Service-role scan summary

Server-side only hits were found in route handlers and `lib/*` server utilities. No direct service-role usage was found in client components or obvious client-marked files during this scan.

Notable server-side service-role consumers:

- `app/api/payments/webhook/route.ts`
- `app/api/admin/verifications/documents/route.ts`
- `app/api/rescue-verification-documents/*`
- `app/api/upload*`
- `app/api/auth/register/route.ts`
- `app/api/analytics/funnel/route.ts`
- `app/api/health/route.ts`
- `app/sitemap.ts`
- `lib/supabase/admin.ts`
- several `lib/db/*` provider/lost-pet helper files

## Bundle leak retest

- `npm run build` → PASS
- `grep -rlE 'SUPABASE_SERVICE_ROLE|service_role|sk_live_|whsec_' .next/static` → **0 hits**

## Cycle 10 acceptance read

- `docs/recovery/STORAGE_POLICY_MATRIX.md` exists → PASS
- `docs/recovery/ADMIN_ROUTE_MATRIX.md` exists → PASS
- `/admin/*` route family in app/admin + app/api/admin uses canonical Cycle 7 guard path → PASS
- bundle secret leak scan in `.next/static` → PASS
- storage posture confirmed via remote `supabase db dump --linked --schema storage --data-only` → `verification-docs` private, `pet-photos` public, `avatars` public → PASS
