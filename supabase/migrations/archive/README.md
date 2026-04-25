# Archived migrations

Migracije ovdje su povijesne — targetiraju tablice koje više ne postoje u canonical modelu
ili koriste legacy column imena. One su **supersedane** novim canonical migracijama i
**ne smiju se reaplyati**.

| migration                                        | arhivirana | razlog                                                                                                              |
| ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 20260423140000_rls_least_privilege_hardening.sql | 2026-04-24 | cilja `public.users`, koristi legacy `owner_id` / `sitter_id` / `total_price` i stale `sitter_profiles` assumptions |
