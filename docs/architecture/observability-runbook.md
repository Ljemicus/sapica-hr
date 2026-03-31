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

## Minimalni operativni princip

Kad route faila:
1. pogledaj scope
2. pogledaj je li validation, auth, infra ili DB write problem
3. ne popravljaj naslijepo UI ako log kaže da je backend boundary pukao
