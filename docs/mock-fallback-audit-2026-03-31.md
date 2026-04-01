# Mock Fallback Audit — 2026-03-31

Status: P1 #3 inventory

Cilj: popisati helper module po helper module i označiti fallback ponašanje kao:
- **KEEP** — zadržati
- **LIMIT** — ograničiti na local/dev ili specifične slučajeve
- **REMOVE** — maknuti iz production patha

---

## Sažetak po modu

### KEEP
Koristiti samo gdje fallback stvarno pomaže local/demo iskustvu bez prikrivanja ozbiljnog problema.

### LIMIT
Najveća kategorija trenutno. To su helperi koji su bili korisni za razvoj, ali više nisu dobri kao “silent production fallback”.

### REMOVE
Za module gdje fallback stvara lažni osjećaj da sustav radi iako zapravo ne radi.

---

## Inventory

| Modul | Mock fallback | Procjena | Napomena |
|---|---:|---|---|
| `availability.ts` | da | LIMIT | može prikriti stvarne scheduling probleme |
| `sitters.ts` | da | LIMIT | bitan search/domain modul, fallback ne bi trebao biti tih u productionu |
| `blog.ts` | da | KEEP/LIMIT | OK za content demo, ali production treba biti svjestan izvora |
| `walks.ts` | da | REMOVE/LIMIT | live domain, fallback može lagati o stvarnom stanju šetnje |
| `messages.ts` | da | REMOVE/LIMIT | messaging ne bi smio tiho fallbackati u produkciji |
| `trainers.ts` | da | LIMIT | prihvatljivo za dev, ne idealno za production silently |
| `forum.ts` | da | LIMIT | content/community zona, fallback može ostati samo uz jasne uvjete |
| `adoption.ts` | da | KEEP | dok je taj dio više katalog/demo zona |
| `pets.ts` | da | LIMIT | owner pet data bi trebala biti realna u produkciji |
| `pet-passport.ts` | da | REMOVE/LIMIT | zdravstveni podaci nisu za lažni fallback ako feature postane ozbiljan |
| `pet-updates.ts` | da | REMOVE/LIMIT | owner trust feature, ne smije glumiti stvarne updateove |
| `lost-pets.ts` | da | KEEP/LIMIT | može imati smisla za seeded demo sadržaj |
| `products.ts` | da | KEEP/LIMIT | OK dok je commerce/catalog još polu-demo |
| `bookings.ts` | da | REMOVE/LIMIT | core transactional domena |
| `update-actions.ts` | da | REMOVE/LIMIT | pet updates akcije ne bi trebale glumiti uspjeh |
| `users.ts` | da | LIMIT | profile i role podatci ne bi trebali biti tiho mockirani |
| `reviews.ts` | da | LIMIT | production fallback može zavesti UI i metrike |
| `groomers.ts` | da | LIMIT | search/list domena, bolje env-gated fallback |
| `walk-actions.ts` | da | REMOVE/LIMIT | live action domain |
| `groomer-availability.ts` | ne | OK | nema mock fallbacka |
| `groomer-bookings.ts` | ne | OK | nema mock fallbacka |
| `dog-friendly.ts` | da | KEEP | content/directory zona |

---

## Preporuke po grupama

## 1. Core transactional domene

### Kandidati
- `bookings.ts`
- `messages.ts`
- `walks.ts`
- `walk-actions.ts`
- `update-actions.ts`
- `pet-updates.ts`
- `pet-passport.ts`

### Preporuka
**REMOVE ili barem hard LIMIT**

### Zašto
Ovo su domene gdje korisnik očekuje istinu, ne demo ponašanje.
Ako DB ili query pukne, aplikacija bi trebala vratiti jasan error, ne glumiti realne podatke.

---

## 2. Identity / profile / ownership domene

### Kandidati
- `users.ts`
- `pets.ts`
- `sitters.ts`
- `reviews.ts`
- `availability.ts`
- `groomers.ts`
- `trainers.ts`

### Preporuka
**LIMIT**

### Zašto
Ovdje fallback još može pomoći local developmentu, ali u productionu ne bi trebao tiho prikrivati kvarove.
Predloženi smjer:
- fallback samo kad Supabase nije konfiguriran lokalno
- ne fallbackati tiho kad je production DB “configured but failing”

---

## 3. Content / directory / demo-friendly domene

### Kandidati
- `blog.ts`
- `forum.ts`
- `products.ts`
- `lost-pets.ts`
- `dog-friendly.ts`
- `adoption.ts`

### Preporuka
**KEEP ili LIMIT, ovisno o business važnosti**

### Zašto
Za sadržajne/directory zone fallback nije toliko opasan kao u transactional domeni.
Ipak, treba odlučiti gdje želiš “demo resilience”, a gdje stvarni sadržaj mora biti autoritativan iz baze.

---

## Pravilo koje predlažem

### Novi standard
Ako je feature:
- **transactional / live / trust-critical** → nema tihog mock fallbacka u production pathu
- **content / catalog / demo-supportive** → fallback može ostati, ali svjesno i po env pravilima

---

## Konkretni sljedeći koraci

### Val 1
- označiti transactional helper module za LIMIT/REMOVE
- uvesti env-aware helper za fallback policy

### Val 2
- refactorirati `messages`, `bookings`, `walks`, `pet-updates` da ne glume realne podatke ako DB faila

### Val 3
- proći content/catalog zone i odlučiti što ostaje kao demo resilience layer

---

## Iskreno mišljenje

Trenutni fallback sustav je bio vrlo koristan da app brzo zaživi.
Ali sada je previše centralan za projekt koji želi biti ozbiljan proizvod.

Najopasniji dio nije postojanje fallbacka — nego to što fallback često znači:
> “nešto je puklo, ali UI i dalje izgleda kao da sustav radi.”

To je gore od jasnog errora.
