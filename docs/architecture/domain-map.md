# PetPark Domain Map

Status: P2 #3 initial domain grouping cleanup

Cilj ovog dokumenta nije veliki rewrite foldera nego jasna podjela odgovornosti po domenama,
kako nove promjene ne bi nastavile širiti "everything app soup" pattern.

---

## 1. Marketplace Core

Obuhvaća:
- sittere
- bookinge
- availability
- reviews
- owner/sitter dashboarde
- walks
- pet updates
- pets / pet passport
- messages između ownera i sittera

Glavni folderi / moduli danas:
- `lib/db/sitters.ts`
- `lib/db/bookings.ts`
- `lib/db/availability.ts`
- `lib/db/reviews.ts`
- `lib/db/walks.ts`
- `lib/db/walk-actions.ts`
- `lib/db/pet-updates.ts`
- `lib/db/update-actions.ts`
- `lib/db/pets.ts`
- `lib/db/pet-passport.ts`
- `lib/db/messages.ts`
- `app/dashboard/*`
- `app/poruke/*`

---

## 2. Service Extensions

Obuhvaća:
- groomere
- grooming bookings
- groomer availability
- trenere
- training programs

Glavni folderi / moduli danas:
- `lib/db/groomers.ts`
- `lib/db/groomer-bookings.ts`
- `lib/db/groomer-availability.ts`
- `lib/db/trainers.ts`
- `app/groomer/*`
- `app/grooming*`
- `app/trener/*`
- `app/dresura*`
- `app/dashboard/groomer/*`

---

## 3. Community & Content

Obuhvaća:
- blog
- forum
- content/directory-like experience

Glavni folderi / moduli danas:
- `lib/db/blog.ts`
- `lib/db/forum.ts`
- `app/blog/*`
- `app/forum/*`

---

## 4. Rescue / Discovery

Obuhvaća:
- lost pets
- adoption
- dog friendly directory
- discovery/search support content

Glavni folderi / moduli danas:
- `lib/db/lost-pets.ts`
- `lib/db/adoption.ts`
- `lib/db/dog-friendly.ts`
- `app/izgubljeni/*`
- `app/udomljavanje/*`
- `app/dog-friendly/*`

---

## 5. Commerce

Obuhvaća:
- products
- shop
- payments / checkout / refund / webhook

Glavni folderi / moduli danas:
- `lib/db/products.ts`
- `app/shop/*`
- `app/api/payments/*`
- `app/checkout/*`

---

## 6. Search / Aggregation Layer

Ovo nije zaseban business domain nego adapter sloj koji spaja više domena za UI use-case.

Trenutno:
- `lib/search/providers.ts`
- `app/pretraga/*`

Pravilo:
- cross-domain composition ide ovdje, ne trajno u page fileove.

---

## 7. Pravilo za budući rad

Kad dodaješ novi feature, prvo odluči kojoj domeni pripada:
- marketplace core
- service extensions
- community & content
- rescue / discovery
- commerce
- search/aggregation adapter

Ako feature ne pripada jasno nijednoj, to je signal da dizajn još nije čist.

---

## 8. Lagani migration plan (bez velikog reorg kaosa)

### Sad odmah
- koristiti ovaj domain map za naming i placement novih helpera
- nove cross-domain agregacije stavljati u adapter sloj (`lib/search`, `lib/adapters`)
- ne širiti `lib/db/index.ts` bez razmišljanja o domain ownershipu

### Kasnije
- po potrebi grupirati helpere u podfoldere, npr.:
  - `lib/db/marketplace/*`
  - `lib/db/extensions/*`
  - `lib/db/content/*`
  - `lib/db/rescue/*`
  - `lib/db/commerce/*`

To ne treba raditi odmah ako će napraviti import masakr bez koristi.
