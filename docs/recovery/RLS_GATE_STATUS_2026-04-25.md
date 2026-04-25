# RLS gate status — 2026-04-25

## Result

**PASS** — direct Supabase Postgres check found `0` public base tables with RLS disabled.

## Query

```sql
SELECT count(*)
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT c.relrowsecurity;
```

## Evidence

- Connection path: Supabase pooler from `supabase/.temp/pooler-url` with DB password read from macOS Keychain.
- Credential values were not printed or written to this report.
- Artifact from launch gate: `/tmp/petpark-launch-gate/rls_disabled.txt`
- Latest launch gate now reports:
  - `RLS-disabled public tables | PASS | 0`
  - `UNKNOWN | 0`

## Notes

`psql` is not installed locally, so `scripts/launch-gate.sh` now supports a Node `pg` fallback when `DB_URL` is provided. This keeps the RLS and Zagreb DB-backed checks verifiable without installing local Postgres tooling.
