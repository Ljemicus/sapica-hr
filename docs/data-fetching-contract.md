# PetPark Data Fetching Contract

_Status: P1 architecture rule set_

Ovaj dokument definira **jedan zajednički pattern** za dohvat podataka u PetParku.
Cilj nije savršenstvo nego konzistentnost, manji cognitive load i manje slučajnog arhitekturnog kaosa.

---

## 1. Jedan glavni princip

**UI ne smije znati više o dohvatima podataka nego što mora.**

To znači:
- page/server component ne bi trebao ručno slagati kompleksnu query logiku ako to može živjeti u `lib/db`
- client komponenta ne bi trebala direktno zvati Supabase osim kad za to postoji dobar razlog
- query shape treba pratiti stvarnu potrebu UI-ja, ne “za svaki slučaj”

---

## 2. Gdje query logika smije živjeti

### Dozvoljeno

#### `lib/db/*`
Primarni data access sloj za aplikaciju.

Koristi za:
- read queryje
- write helper funkcije
- mapiranje DB row -> app shape
- lean/full field varijante
- fallback ponašanje gdje je još potrebno

#### `app/api/*`
Koristi za:
- client-triggered mutacije
- auth-protected operations
- browser uploadove / webhookove / realtime-adjacent flowove
- server endpointe koje client smije zvati

API route ne bi smio sadržavati bogatu query logiku ako ista može živjeti u `lib/db`.

#### server page / server component
Smije:
- pozvati `lib/db` helper
- složiti 1 razinu compositiona za prikaz

Ne bi smio:
- ručno graditi veliki DB workflow
- duplirati `lib/db` logiku

---

## 3. Kada client komponenta smije direktno koristiti Supabase

Dozvoljeno samo kad je razlog jasan:
- realtime subscription
- browser-only auth/session API
- upload flow koji zahtijeva browser/file kontekst
- geolocation / live session slučajevi gdje client mora orkestrirati stanje

Nije dozvoljeno kao default za:
- obične list/detail fetchove
- dashboard history prikaze
- profile/detail podatke koji se mogu server-loadati

Ako client fetch postoji, mora imati jasno objašnjenje zašto nije server/API/`lib/db` rješenje.

---

## 4. Query shape pravila

### List views
Koristi **lean select**.

Primjeri:
- kartice
- dashboard liste
- tablice
- summaries
- search results

Ne koristiti `select('*')` ako UI prikazuje 20% polja.

### Detail views
Koristi **full select** samo kad detail UI zaista koristi većinu polja.

### Pattern
Kad ima smisla, helper treba podržati field mode:
- `full`
- `list`
- `card`
- `summary`
- domain-specific mode poput `owner-history`, `dashboard-list`, `walk-selector`

---

## 5. Page composition pravilo

Page file može:
- pozvati više helpera
- složiti finalni props shape za komponentu

Page file ne bi trebao:
- ručno raditi partner maps / grouping / sorting / normalization ako to predstavlja reusable domain logiku
- sadržavati veliku DB business logiku

Ako page počne izgledati kao mini-service layer, logika treba van u `lib/db` ili dedicated adapter.

---

## 6. API route pravilo

API route je boundary, ne data jungle.

API route treba raditi ove korake:
1. auth
2. validation
3. poziv helperu / service funkciji
4. response mapping

API route ne treba postati mjesto gdje se duplira business/data logika.

---

## 7. Fallback pravilo

Mock fallback nije zabranjen, ali mora biti svjestan izbor.

Kategorije:
- **KEEP** — lokalni demo/dev flowovi gdje je fallback legitiman
- **LIMIT** — fallback samo u local/dev envu
- **REMOVE** — production path treba failati jasno, ne glumiti da ima podatke

Default pravilo za nove featuree:
- ne uvoditi mock fallback bez jasnog razloga

---

## 8. Search i aggregation pravilo

Kad page agregira više domena (npr. sitteri + groomeri + treneri), aggregation ne bi trebala zauvijek ostati u page fileu.

Za takve slučajeve treba uvesti adapter layer, npr.:
- `lib/search/*`
- `lib/adapters/*`

To posebno vrijedi za unified provider listove.

---

## 9. Realtime pravilo

Realtime i live session flowovi su iznimka, ali i dalje trebaju granice.

Realtime sloj treba:
- orkestrirati subscriptione
- emitirati evente/UI state

Ne treba:
- postati glavni source kompleksne business logike

---

## 10. Red flags

Ako vidiš nešto od ovoga, stani i refactoriraj prije nego dodaš još koda:
- page file radi veliko DB grupiranje/mapiranje/sortiranje
- client komponenta direktno zove Supabase za običan detail/list fetch
- API route i `lib/db` rade istu stvar na dva mjesta
- `select('*')` na list prikazu bez dobrog razloga
- fallback skriva error koji bi trebao biti vidljiv

---

## 11. Trenutni prioritetni kandidati za usklađivanje

Najveći kandidati nakon ovog dokumenta:
- search/provider aggregation (`/pretraga`)
- preostali `select('*')` helperi
- helperi s teškim fallback ponašanjem
- page-level ručna composition logika koja se ponavlja

---

## 12. Jedna kratka verzija

Ako nisi siguran gdje nešto staviti:

- **read/write data logic** → `lib/db`
- **auth + validation + public endpoint** → `app/api`
- **browser-only / realtime** → client
- **view composition** → page/component
- **cross-domain aggregation** → adapter/service layer


---

## 13. Domain ownership note

Data fetching pravila vrijede unutar domena, ali cross-domain composition ne bi smjela završavati nasumično po page fileovima.

Za takve slučajeve koristi:
- `lib/search/*`
- `lib/adapters/*`
- ili drugi jasno imenovan adapter sloj

Primjer:
- unified provider search nije čisti `sitters` ni `groomers` ni `trainers` problem
- zato pripada search/aggregation sloju, ne pojedinom domain helperu i ne page fileu
