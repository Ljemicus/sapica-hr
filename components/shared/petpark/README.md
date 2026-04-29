# PetPark shared presentation components

Phase 3 component layer for the PetPark visual redesign.

These components are intentionally presentational:

- no Supabase imports
- no API calls
- no booking/payment/dashboard logic
- no page-level redesign wiring

Use them in later phases to migrate pages safely.

## Trust/data display rules

- `ProviderCard` and `RatingSummary` do not show numeric ratings when `reviewCount` is `0`, missing, or invalid.
- `PriceRange` never renders `od 0 €`; invalid/empty/zero prices fall back to `Cijena po dogovoru`.
- `ProviderCard` does not accept or render public email/phone props.

## Exports

Import from:

```ts
import {
  PetParkButton,
  ProviderCard,
  SectionHeader,
} from "@/components/shared/petpark";
```
