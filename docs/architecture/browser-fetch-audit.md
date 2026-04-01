# Browser Fetch Audit

Status: 5.2.a

Cilj: jasno razlikovati client-side fetchove koji su **legitimni** od onih koje treba serverizirati.

---

## Legit browser-only fetchovi

### 1. Messaging realtime / thread UX
- `app/poruke/messages-realtime.ts`
- `app/poruke/messages-thread.ts`

Zašto ostaje client-side:
- realtime subscriptions
- optimistic UI updates
- thread interaction state

### 2. Walk session flow
- `app/dashboard/sitter/setnja/walk-session.tsx`

Zašto ostaje client-side:
- geolocation
- live session orchestration
- browser permissions
- local active state + realtime feel

### 3. Groomer booking slot fetch
- `app/groomer/[id]/booking-dialog.tsx`

Zašto ostaje client-side:
- fetch ovisi o otvorenom dialogu
- dinamički range datuma (sad + 60 dana)
- interaktivni slot picker UX
- nije običan static/detail fetch

### 4. Auth forms
- `app/prijava/login-form.tsx`
- `app/registracija/register-form.tsx`

Zašto ostaje client-side:
- form submit UX
- auth/session flow
- error handling i redirect ponašanje

### 5. Upload flowovi
- client-side upload triggeri / file inputs

Zašto ostaje client-side:
- browser file API
- progress / user interaction

---

## Već očišćeni sumnjivi fetchovi

### Serverizirani u ovom valu
- sitter booking dialog pets fetch
- pet card data fetch
- owner booking history fetch
- više dashboard/detail page data composition slučajeva

---

## Pravilo

Ako fetch nije:
- realtime
- geolocation/browser permission flow
- auth/session interaction flow
- upload/file interaction flow
- izrazito interaktivni on-demand picker UX

onda default pretpostavka treba biti:
**to ne treba ostati client-side**.

---

## Trenutna odluka za 5.2.a

Nakon ovog pregleda:
- messaging client fetchovi = KEEP
- walk session client fetchovi = KEEP
- grooming slot fetch = KEEP
- auth form fetchovi = KEEP
- sitter booking pets fetch = već serveriziran

Zaključak:
5.2.a nije "ukloni sve client fetchove", nego potvrdi koji su opravdani.
