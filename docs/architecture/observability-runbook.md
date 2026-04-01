# Observability Runbook

Status: Faza 3 / Task 1

Cilj: dati minimalan, praktičan runbook za ključne failure scenarije bez overengineeringa.

---

## Scope naming pravilo

Koristi format:
- `domain.action`
- ili `domain.subdomain.action`

Primjeri:
- `auth.login`
- `auth.register`
- `auth.callback`
- `bookings.create`
- `messages.send`
- `upload.image`
- `payments.webhook`
- `groomerBookings.create`
- `groomerBookings.update`
- `availability.update`
- `sitterProfile.save`
- `walks.list`
- `groomers.list`
- `sitters.list`

---

## 1. Auth fail

### Scopeovi
- `auth.login`
- `auth.register`
- `auth.callback`
- `auth`

### Gledaj za
- previše login failova
- profile upsert failove
- fallback na auth metadata umjesto `public.users`

### Prva provjera
- je li Supabase auth dostupan
- postoji li `public.users` zapis
- puca li callback flow ili samo login/register validacija

---

## 2. Booking fail

### Scope
- `bookings.create`

### Gledaj za
- sitter profile missing
- booking create fail
- validation fail

### Prva provjera
- postoji li sitter profile
- vraća li booking helper `null`
- jesu li datumi / payload validni

---

## 3. Messages fail

### Scope
- `messages.send`

### Gledaj za
- failed send
- thread fetch prazan kad ne bi smio biti
- realtime eventi postoje, ali persistence ne prolazi

### Prva provjera
- vraća li `/api/messages` 500
- vraća li `sendMessage(...)` null
- je li problem UI optimistic flow ili DB write

---

## 4. Upload fail

### Scope
- `upload.image`

### Gledaj za
- invalid bucket
- oversized file
- storage config missing
- storage upload error

### Prva provjera
- je li `SUPABASE_SERVICE_ROLE_KEY` prisutan
- je li bucket dozvoljen
- je li file type/size validan

---

## 5. Payments webhook fail

### Scope
- `payments.webhook`

### Gledaj za
- invalid signature
- booking update fail nakon successful checkout sessiona
- payment log insert fail
- dispute events

### Prva provjera
- je li webhook secret točan
- koji je Stripe event type
- je li booking id prisutan u metadata
- jesu li booking/payment writeovi uspjeli

---

## 6. Groomer bookings fail

### Scopeovi
- `groomerBookings.create`
- `groomerBookings.update`

### Gledaj za
- slot conflict (409)
- cancel/update na nepostojeći booking
- unexpected error u create ili update flowu

### Prva provjera
- je li groomer_id validan
- je li slot slobodan (conflict)
- je li booking id prisutan i pripada useru (za cancel)

---

## 7. Availability fail

### Scope
- `availability.update`

### Gledaj za
- invalid JSON body u POST requestu
- setAvailability DB write fail

### Prva provjera
- je li body validan JSON
- je li dates array prisutan

---

## 8. Sitter profile fail

### Scope
- `sitterProfile.save`

### Gledaj za
- DB write fail (insert ili update)

### Prva provjera
- je li user role sitter
- je li supabase write uspio (error.message u logu)

---

## 9. Listing routes fail

### Scopeovi
- `walks.list`
- `groomers.list`
- `sitters.list`

### Gledaj za
- DB query fail na list endpointima

### Prva provjera
- je li Supabase dostupan
- jesu li query parametri validni

---

## Minimalni operativni princip

Kad route faila:
1. pogledaj scope
2. pogledaj je li validation, auth, infra ili DB write problem
3. ne popravljaj naslijepo UI ako log kaže da je backend boundary pukao
