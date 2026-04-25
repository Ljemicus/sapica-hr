# DNS Security Status — Cycle 20

## Live DNS status

Authoritative nameservers are `dns1.cdn.hr` and `dns2.cdn.hr` (cdn.hr / cyber_Folks), not Vercel DNS. `vercel dns ls petpark.hr` returns no editable records.

| Gate                    | Current             | Required                                   | Status                                                  |
| ----------------------- | ------------------- | ------------------------------------------ | ------------------------------------------------------- |
| `_dmarc.petpark.hr` TXT | `v=DMARC1; p=none;` | rua/ruf/adkim/aspf monitoring record       | Blocked on DNS provider change                          |
| `petpark.hr` AAAA       | none                | playbook says Vercel IPv6                  | Blocked/outdated: Vercel docs say IPv6 is not supported |
| `petpark.hr` CAA        | none                | letsencrypt, pki.goog, sectigo, globalsign | Blocked on DNS provider change                          |

Manual DNS changeset: `docs/recovery/DNS_CHANGESET_CYCLE20.md`.

## Code-side CSP status

Completed locally:

- Removed `unsafe-inline` from `style-src` in `next.config.ts`.
- Removed `unsafe-inline` fallback from CSP utility style/script directives.
- Kept narrow `style-src` hashes for deterministic Next route announcer / Sonner inline styles instead of restoring `unsafe-inline`.
- Removed root layout inline critical CSS injection.
- Moved static public route CSS from inline `<style>` to `public/static-public.css`.
- Removed inline `style` attributes from static public HTML.

Local browser checks for `/`, `/pretraga`, `/blog`, and `/sitter/30000000-0000-0000-0000-000000000001` show:

- `unsafeInline: false`
- `style-src` contains no `unsafe-inline`
- `cspFindings: 0`

## Remaining blocker

DNS records must be updated in the current DNS provider before Cycle 20 can close fully. The IPv6 requirement needs a product decision because Vercel does not currently provide a supported AAAA target.
