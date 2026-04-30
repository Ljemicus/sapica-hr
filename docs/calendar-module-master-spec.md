# PetPark Kalendar — Frontend + Backend Master Spec

Status: plan / implementation contract  
Project: PetPark web, Next.js + Supabase  
Owner: PetPark  
Goal: kalendar mora biti premium, pouzdan i dovoljno jak za stvarne rezervacije sittera, groomera i trenera.

---

## 1. Zašto je kalendar kritičan

Kalendar nije samo UI za biranje datuma. U PetParku je kalendar srce marketplacea jer direktno odlučuje:

- može li korisnik rezervirati termin bez frustracije
- može li pružatelj usluge kontrolirati svoje vrijeme
- sprječavamo li double-booking
- znamo li točno što je plaćeno, potvrđeno, otkazano ili završeno
- može li sustav kasnije raditi podsjetnike, refundacije, Google Calendar sync i analitiku

Ako kalendar nije vrhunski, cijeli marketplace djeluje amaterski.

---

## 2. Glavni principi

1. **Jedan izvor istine**
   - Rezervacije moraju koristiti canonical `public.bookings` model.
   - Ne smije postojati drugi paralelni booking model samo za kalendar.
   - Live schema je istina, repo intent nije dovoljan.

2. **Backend odlučuje dostupnost**
   - Frontend nikad ne smije sam zaključiti da je termin slobodan.
   - Frontend samo prikazuje slotove koje backend vrati kao stvarno dostupne.

3. **Nema double-bookinga**
   - Conflict check mora biti transakcijski ili zaštićen baznim constraintom/RPC funkcijom.
   - Samo client-side provjera nije dovoljna.

4. **Sve mora raditi mobilno**
   - Većina korisnika će rezervirati preko mobitela.
   - Mobile booking flow mora biti jednostavniji od desktopa, ne samo stisnuta desktop verzija.

5. **Različite usluge imaju različita pravila**
   - Šetnja nije grooming.
   - Grooming nije dresura.
   - Čuvanje preko noći nije termin od 60 minuta.

6. **Kalendar mora podržati sadašnje i buduće use-caseove**
   - Pet sitting
   - Dog walking
   - Grooming
   - Training
   - Manual provider booking
   - Google Calendar / iCal sync kasnije
   - Podsjetnici
   - Refundacije i cancellation policy

---

## 3. Trenutno stanje / važno upozorenje

U kodu već postoji calendar subsystem:

- `components/calendar/*`
- `lib/calendar/*`
- `app/api/calendar/*`
- `types/calendar.ts`
- FullCalendar dependency je već prisutan

Ali postoji ozbiljan schema conflict dokumentiran u:

- `docs/recovery/CYCLE8_CALENDAR_SCHEMA_CONFLICT.md`

Problem: dio calendar koda tretira `public.bookings` kao stari model s poljima tipa:

- `provider_type`
- `client_name`
- `start_time`
- `end_time`
- `price`
- `title`
- `description`

Live canonical booking model koristi polja tipa:

- `owner_profile_id`
- `provider_id`
- `pet_id`
- `provider_kind`
- `primary_service_code`
- `starts_at`
- `ends_at`
- `subtotal_amount`
- `platform_fee_amount`
- `total_amount`
- `owner_note`
- `provider_note`
- `status`
- `payment_status`

Zaključak: prije ozbiljnog kalendara treba napraviti cutover calendar subsystema na canonical booking model. Ne graditi dalje na ghost kolonama.

---

## 4. Role i pogledi

### 4.1 Vlasnik ljubimca

Vlasnik mora moći:

- odabrati uslugu
- odabrati ljubimca
- vidjeti slobodne termine pružatelja
- odabrati datum i vrijeme
- vidjeti cijenu prije potvrde
- poslati napomenu pružatelju
- potvrditi rezervaciju
- platiti ako je payment flow aktivan
- pratiti status rezervacije
- otkazati u skladu s pravilima

### 4.2 Pružatelj usluge

Pružatelj mora moći:

- postaviti redovnu tjednu dostupnost
- dodati iznimke
- blokirati dane ili sate
- vidjeti sve termine u kalendaru
- potvrditi ili odbiti pending rezervaciju ako koristimo manual confirm
- ručno unijeti termin
- promijeniti termin uz pravila
- dodati interne bilješke
- povezati Google Calendar kasnije

### 4.3 Admin

Admin mora moći:

- vidjeti rezervacije svih pružatelja
- filtrirati po statusu, pružatelju, usluzi, gradu i datumu
- ručno intervenirati kod spora
- vidjeti audit trail promjena
- provjeriti zašto je slot bio ili nije bio dostupan

---

## 5. Core funkcionalnosti

### 5.1 Availability / dostupnost

Sustav mora podržati:

- tjednu ponavljajuću dostupnost
  - npr. pon-pet 09:00-17:00
  - subota 09:00-13:00
  - nedjelja zatvoreno
- više intervala isti dan
  - npr. 09:00-12:00 i 16:00-20:00
- datumsku dostupnost samo za jedan dan
- privremena pravila
  - npr. ljetni raspored od 01.06. do 01.09.
- minimalni notice
  - npr. korisnik ne može rezervirati manje od 12h unaprijed
- maksimalni booking horizon
  - npr. može se rezervirati najviše 90 dana unaprijed
- buffer prije/poslije termina
  - npr. 15 min između dva groominga
- max rezervacija po slotu
  - većinom 1, ali moguće više kod grupne dresure

### 5.2 Blokade / time off

Pružatelj mora moći blokirati:

- cijeli dan
- raspon datuma
- dio dana
- godišnji odmor
- bolest
- privatnu obavezu
- praznik
- pauzu

Blokada mora uvijek imati prioritet nad redovnom dostupnošću.

### 5.3 Slot generation

Backend generira stvarne bookable slotove iz:

1. provider availability rules
2. service duration
3. service buffer
4. existing bookings
5. blocked dates
6. cancellation/notice rules
7. timezone

Frontend traži:

```txt
provider_id + provider_kind + service_code + date/range
```

Backend vraća:

```txt
available slots: start, end, price, reason flags if needed
```

Frontend ne računa availability sam.

### 5.4 Booking lifecycle

Minimalni lifecycle:

- `draft` / optional, ako se koristi checkout session
- `pending`
- `confirmed`
- `completed`
- `cancelled_by_owner`
- `cancelled_by_provider`
- `rejected`
- `no_show`

Ako se ne želi širiti postojeći status enum odmah, mapirati na postojeći canonical status, ali UI mora jasno razlikovati stanje.

### 5.5 Payment status

Kalendar mora prikazivati i payment status:

- unpaid
- authorized
- paid
- refunded
- partially_refunded
- failed

Pravila:

- termin može biti zauzet i dok payment nije finaliziran samo ako postoji kratki hold
- unpaid pending booking ne smije vječno blokirati slot
- payment timeout treba automatski osloboditi slot

### 5.6 Slot hold

Za premium booking UX treba imati privremeni hold:

- korisnik odabere termin
- backend napravi hold 5-10 minuta
- slot je privremeno zaključan
- ako korisnik ne završi checkout, hold istekne
- ako završi, hold postaje booking

Bez holda postoji rizik da dva korisnika kliknu isti slot u isto vrijeme.

---

## 6. Backend arhitektura

### 6.1 Preporučene tablice

#### `provider_availability_rules`

Služi za redovni raspored.

Polja:

- `id uuid primary key`
- `provider_id uuid not null`
- `provider_kind text not null` — sitter/groomer/trainer
- `service_code text null` — ako pravilo vrijedi samo za određenu uslugu
- `day_of_week int not null` — 1-7 ili 0-6, ali standardizirati
- `starts_at_time time not null`
- `ends_at_time time not null`
- `timezone text not null default 'Europe/Zagreb'`
- `effective_from date not null`
- `effective_until date null`
- `slot_duration_minutes int null`
- `buffer_before_minutes int not null default 0`
- `buffer_after_minutes int not null default 0`
- `max_bookings_per_slot int not null default 1`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constrainti:

- `starts_at_time < ends_at_time`
- `max_bookings_per_slot >= 1`
- `slot_duration_minutes > 0` ako nije null

#### `provider_availability_exceptions`

Služi za blokade i iznimke.

Polja:

- `id uuid primary key`
- `provider_id uuid not null`
- `provider_kind text not null`
- `service_code text null`
- `exception_type text not null`
  - unavailable
  - available_extra
  - vacation
  - sick_leave
  - personal
  - holiday
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `timezone text not null default 'Europe/Zagreb'`
- `reason text null`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constrainti:

- `starts_at < ends_at`

#### `booking_holds`

Služi za privremeno zaključavanje slota tijekom checkouta.

Polja:

- `id uuid primary key`
- `owner_profile_id uuid not null`
- `provider_id uuid not null`
- `provider_kind text not null`
- `pet_id uuid null`
- `primary_service_code text not null`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `expires_at timestamptz not null`
- `status text not null default 'active'`
  - active
  - converted
  - expired
  - cancelled
- `created_at timestamptz not null default now()`

Constrainti:

- `starts_at < ends_at`
- aktivni hold ne smije overlapati s aktivnim bookingom za istog providera
- aktivni hold ne smije overlapati s drugim aktivnim holdom za istog providera

#### `booking_audit_events`

Ako već postoji audit system, koristiti postojeći. Ako ne, dodati.

Polja:

- `id uuid primary key`
- `booking_id uuid null`
- `actor_profile_id uuid null`
- `actor_role text not null`
- `event_type text not null`
- `old_value jsonb null`
- `new_value jsonb null`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`

Koristi se za:

- booking created
- booking confirmed
- booking cancelled
- booking moved
- payment changed
- refund started
- provider note changed

---

## 7. Canonical booking mapping

Calendar event za UI treba nastati iz canonical bookinga.

Mapiranje:

| UI field      | Canonical booking field |
| ------------- | ----------------------- |
| event id      | `bookings.id`           |
| provider      | `provider_id`           |
| provider type | `provider_kind`         |
| owner         | `owner_profile_id`      |
| pet           | `pet_id`                |
| service       | `primary_service_code`  |
| start         | `starts_at`             |
| end           | `ends_at`               |
| price         | `total_amount`          |
| status        | `status`                |
| payment       | `payment_status`        |
| owner note    | `owner_note`            |
| provider note | `provider_note`         |

Zabranjeno za novi calendar kod:

- `start_time`
- `end_time`
- `provider_type`
- `client_name`
- `client_email`
- `price`
- `title`
- `description`

Ako treba prikazati ime klijenta, radi se join prema profilu vlasnika, ne dupliciranje u bookings.

---

## 8. Backend API contract

### 8.1 `GET /api/calendar/availability`

Svrha: vrati dostupne slotove za providera i uslugu.

Query:

- `providerId`
- `providerKind`
- `serviceCode`
- `from`
- `to`
- `timezone`

Response:

```json
{
  "slots": [
    {
      "startsAt": "2026-04-26T09:00:00+02:00",
      "endsAt": "2026-04-26T10:00:00+02:00",
      "durationMinutes": 60,
      "price": 2500,
      "currency": "EUR",
      "available": true
    }
  ]
}
```

Napomena:

- iznos držati u minor units, npr. centi
- response može sadržavati unavailable reason samo za provider/admin view, ne nužno za public korisnika

### 8.2 `POST /api/calendar/holds`

Svrha: zaključa slot dok korisnik završava booking/payment.

Body:

```json
{
  "providerId": "uuid",
  "providerKind": "sitter",
  "petId": "uuid",
  "serviceCode": "dog_walk_60",
  "startsAt": "2026-04-26T09:00:00+02:00",
  "endsAt": "2026-04-26T10:00:00+02:00"
}
```

Response:

```json
{
  "holdId": "uuid",
  "expiresAt": "2026-04-26T08:55:00+02:00"
}
```

Backend mora:

- provjeriti auth
- provjeriti ownership nad petom
- provjeriti real availability
- napraviti atomic insert holda
- odbiti overlap

### 8.3 `POST /api/bookings`

Svrha: kreira canonical booking iz holda ili direktno ako nema paymenta.

Body:

```json
{
  "holdId": "uuid",
  "ownerNote": "Pas je malo plašljiv na bicikle."
}
```

Backend mora:

- validirati hold
- provjeriti da nije istekao
- još jednom provjeriti conflict
- kreirati booking u canonical `bookings`
- označiti hold kao converted
- zapisati audit event

### 8.4 `PATCH /api/bookings/:id/status`

Svrha: potvrda, odbijanje, otkazivanje.

Body:

```json
{
  "status": "confirmed",
  "providerNote": "Vidimo se u 9."
}
```

Backend mora:

- provjeriti permissions
- provjeriti legal transition
- zapisati audit event
- pokrenuti notification/reminder job ako treba

### 8.5 `PATCH /api/bookings/:id/reschedule`

Svrha: promjena termina.

Body:

```json
{
  "startsAt": "2026-04-27T10:00:00+02:00",
  "endsAt": "2026-04-27T11:00:00+02:00",
  "reason": "Dogovor s korisnikom"
}
```

Backend mora:

- provjeriti tko smije mijenjati
- provjeriti availability novog termina
- napraviti atomic update
- zapisati audit event
- poslati notification drugoj strani

### 8.6 `GET /api/provider/calendar/events`

Svrha: provider/admin calendar view.

Query:

- `providerId`
- `providerKind`
- `from`
- `to`
- `status[]`

Response treba vratiti evente spremne za prikaz, ali bez poslovne logike u frontendu.

---

## 9. Conflict detection

Overlap pravilo:

```sql
existing.starts_at < new.ends_at
AND existing.ends_at > new.starts_at
```

Aktivni booking statusi koji blokiraju slot:

- pending, ako ima aktivan hold/payment window
- confirmed
- in_progress ako se uvede

Statusi koji ne blokiraju:

- cancelled
- rejected
- expired
- no_show nakon završetka termina

Najbolje rješenje:

- koristiti PostgreSQL exclusion constraint s range tipom ako je moguće
- ili RPC funkciju koja radi conflict check i insert u istoj transakciji
- nikako: prvo `check`, pa odvojeno `insert` bez DB zaštite

Primjer poželjnog DB nivoa:

```sql
-- ideja, prilagoditi live shemi
-- provider_id + provider_kind + tstzrange(starts_at, ends_at) ne smiju overlapati za aktivne statuse
```

Ako Supabase/Postgres setup otežava exclusion constraint, koristiti `create_booking_from_hold()` RPC kao jedini entrypoint.

---

## 10. Timezone pravila

Default timezone za Hrvatsku:

- `Europe/Zagreb`

Pravila:

- u bazi čuvati `timestamptz`
- provider availability time-of-day čuvati uz timezone
- frontend prikazuje lokalno vrijeme korisniku, ali za HR marketplace default je Europe/Zagreb
- DST mora biti testiran
- nikad ne ručno spajati string datuma i vremena bez timezone biblioteke

Preporučeno:

- `date-fns-tz` ili već postojeći standard u projektu
- jasno helperi:
  - `toProviderTimezone()`
  - `fromProviderLocalToUtc()`
  - `formatCalendarTime()`

---

## 11. Service duration i pricing

Svaka usluga mora definirati:

- `service_code`
- naziv
- trajanje
- buffer prije/poslije
- cijenu
- minimalni notice
- max advance booking
- cancellation policy
- zahtijeva li potvrdu providera
- može li se rezervirati online

Primjeri:

| Service            |  Duration |   Buffer | Notes                |
| ------------------ | --------: | -------: | -------------------- |
| dog_walk_30        |    30 min |   10 min | kratka šetnja        |
| dog_walk_60        |    60 min |   15 min | standard             |
| pet_sitting_day    |        8h | 0-30 min | dnevno čuvanje       |
| overnight_sitting  | overnight |   custom | poseban flow         |
| grooming_small_dog |    90 min |   15 min | ovisi o veličini psa |
| training_1on1      |    60 min |   15 min | trener               |
| group_training     |    60 min |    0 min | max više korisnika   |

Kalendar ne smije pretpostaviti da je sve 60 minuta.

---

## 12. Frontend arhitektura

### 12.1 Komponente

Preporučene glavne komponente:

```txt
components/calendar/
  CalendarShell.tsx
  ProviderCalendarView.tsx
  OwnerBookingCalendar.tsx
  AvailabilityEditor.tsx
  WeeklyScheduleEditor.tsx
  ExceptionManager.tsx
  SlotPicker.tsx
  BookingSummaryPanel.tsx
  BookingStatusBadge.tsx
  CalendarLegend.tsx
  RescheduleDialog.tsx
  CancelBookingDialog.tsx
```

### 12.2 Owner booking flow

Koraci:

1. Odabir usluge
2. Odabir ljubimca
3. Prikaz slobodnih datuma
4. Odabir termina
5. Sažetak cijene i uvjeta
6. Napomena vlasnika
7. Hold termina
8. Potvrda / payment
9. Success screen

UX pravila:

- prvo pokazati najbliže slobodne termine
- jasno prikazati cijenu i trajanje
- ako nema slobodnih termina, ponuditi drugi datum ili kontakt
- ne prikazivati 50 disabled slotova bez pomoći
- mobile: slotovi kao velike touch kartice, ne sitna grid polja

### 12.3 Provider calendar view

Provider mora imati:

- month view
- week view
- day view
- agenda/list view
- filter po statusu
- filter po usluzi
- brzi gumb “blokiraj termin”
- brzi gumb “dodaj ručni termin”
- drag/drop samo ako backend provjeri conflict
- vizualni status:
  - pending žuto
  - confirmed zeleno
  - paid plavo/zelena oznaka
  - cancelled sivo/crveno

### 12.4 Availability editor

Mora biti jednostavan, ne enterprise kaos.

UI:

- dani u tjednu kao kartice
- toggle “radim ovaj dan”
- time interval picker
- “dodaj još jedan interval”
- copy schedule to other days
- preset buttons:
  - pon-pet 09-17
  - svaki dan 08-20
  - vikendom samo
- exceptions tab:
  - blokiraj datum
  - blokiraj raspon
  - dodaj ekstra slobodan termin

### 12.5 Admin calendar

Admin treba tablični + calendar prikaz:

- svi provideri
- statusi
- payment status
- datumski raspon
- search po korisniku/ljubimcu
- izvoz CSV kasnije

---

## 13. Dizajn i UX standard

Kalendar mora izgledati kao premium proizvod:

- čist layout
- puno whitespacea
- jasna hijerarhija
- statusi bojama, ali ne prešareno
- veliki touch targets
- sticky booking summary na desktopu
- bottom sheet na mobitelu
- skeleton loading
- empty states koji pomažu
- error states koji nude sljedeći korak

Primjeri dobrog osjećaja:

- Calendly jednostavnost za korisnika
- Booking.com jasnoća statusa
- Google Calendar poznat provider layout

Ne smije:

- izgledati kao admin template iz 2014.
- tražiti previše klikova
- skrivati cijenu
- prikazivati zauzete slotove kao da su dostupni
- dozvoliti potvrdu pa tek onda javiti da termin nije dostupan

---

## 14. Mobile-first zahtjevi

Na mobitelu:

- month grid samo za odabir datuma
- nakon izbora datuma, slotovi se prikazuju kao lista
- sticky bottom CTA
- booking summary kao bottom sheet
- provider day agenda treba biti lista po vremenu
- availability editor mora imati velike kontrole
- drag/drop nije core mobile flow

Touch target minimum:

- 44px visine

---

## 15. Notifications i reminders

Kalendar treba proizvoditi evente za notifikacije:

- booking requested
- booking confirmed
- booking rejected
- booking cancelled
- booking rescheduled
- 24h reminder
- 1h reminder
- payment failed
- review request after completed booking

Kanali kasnije:

- email
- push notification
- WhatsApp/SMS ako se uvede

Reminder job ne smije ovisiti o otvorenom browseru.

---

## 16. Google Calendar / iCal sync

Ovo nije nužno za prvi premium MVP, ali arhitektura mora biti spremna.

### 16.1 Export

Provider može dobiti iCal feed:

- samo confirmed bookings
- optionally pending
- bez internih bilješki u public feedu
- tokeniziran private URL

### 16.2 Import

Ako se radi Google import:

- imported busy events blokiraju availability
- ne stvaraju PetPark booking
- čuvaju se kao external calendar blocks

### 16.3 Bidirectional sync

Raditi tek kasnije. Opasno je za MVP jer uvodi puno conflict edge-caseova.

Preporuka:

1. prvo iCal export
2. zatim Google busy import
3. tek kasnije bidirectional sync

---

## 17. Security i RLS

Pravila:

- owner vidi samo svoje bookingse
- provider vidi bookingse gdje je `provider_id` njegov profil
- admin vidi sve
- provider ne može uređivati tuđu availability
- owner ne može mijenjati provider note
- provider ne može mijenjati owner private podatke
- public availability endpoint ne smije curiti privatne blokade tipa “bolestan”

RLS mora pokrivati:

- bookings
- availability rules
- exceptions
- holds
- audit events

Service role koristiti samo u server routes/RPC gdje je nužno.

---

## 18. Performance

Kalendar može lako postati spor ako se krivo napravi.

Pravila:

- default range max 31-45 dana za public availability
- provider calendar može dohvatiti month range
- indeksirati:
  - `provider_id`
  - `provider_kind`
  - `starts_at`
  - `ends_at`
  - `status`
  - `payment_status`
- API response cache samo za public static dijelove, ne za live availability bez invalidacije
- debounce kod promjene filtera
- optimistic UI samo uz backend rollback

Potrebni indeksi:

```sql
create index if not exists idx_bookings_provider_time
on public.bookings (provider_id, starts_at, ends_at);

create index if not exists idx_bookings_provider_status_time
on public.bookings (provider_id, status, starts_at);

create index if not exists idx_availability_rules_provider_day
on public.provider_availability_rules (provider_id, provider_kind, day_of_week, is_active);

create index if not exists idx_availability_exceptions_provider_time
on public.provider_availability_exceptions (provider_id, provider_kind, starts_at, ends_at, is_active);

create index if not exists idx_booking_holds_provider_time
on public.booking_holds (provider_id, provider_kind, starts_at, ends_at, expires_at, status);
```

---

## 19. Edge caseovi koje moramo pokriti

- dva korisnika kliknu isti slot u isto vrijeme
- provider blokira termin dok korisnik checkouta
- payment fail nakon holda
- booking crossing midnight
- overnight pet sitting
- DST promjena vremena
- provider promijeni weekly schedule, postojeći bookings ostaju
- provider obriše availability rule, postojeći bookings ostaju
- cancellation unutar policy windowa
- admin reschedule potvrđenog termina
- korisnik nema pet profile
- provider nema availability postavljen
- service duration duži od dostupnog prozora
- group training ima više mjesta u istom slotu
- groomer treba buffer poslije termina
- no-show nakon prošlog termina
- provider timezone nije Europe/Zagreb kasnije

---

## 20. Testing plan

### 20.1 Unit tests

Testirati:

- slot generation
- overlap detection
- timezone conversion
- service duration + buffer
- status transitions
- cancellation policy
- hold expiry logic

### 20.2 Integration tests

Testirati API:

- create availability
- fetch slots
- create hold
- convert hold to booking
- conflict rejection
- cancel booking frees slot
- reschedule checks conflict

### 20.3 E2E tests

Playwright scenariji:

1. owner reserves sitter slot
2. second owner cannot reserve same slot
3. provider blocks day and owner sees no slots
4. provider creates weekly schedule
5. mobile booking flow works
6. provider confirms pending booking
7. owner cancels booking

### 20.4 Manual QA

Checklist:

- desktop Chrome
- mobile Safari
- Android Chrome
- slow network
- no availability state
- fully booked state
- payment failure state
- timezone around DST

---

## 21. Implementation order

### Phase 0 — Cleanup / decision

- potvrditi canonical bookings schema
- zamrznuti stari ghost calendar booking model
- odlučiti hoćemo li migrirati postojeći calendar kod ili napraviti clean module

Preporuka: clean backend contract + pažljivo reuse UI dijelova.

### Phase 1 — Backend foundation

- dodati availability rules
- dodati exceptions
- dodati holds
- dodati RPC za slot generation
- dodati conflict-safe booking creation
- dodati RLS policies
- dodati indexes

### Phase 2 — Provider availability UI

- weekly schedule editor
- exception manager
- preview availability
- save/load backend integration

### Phase 3 — Owner booking UI

- service picker
- pet picker
- slot picker
- hold creation
- booking summary
- booking confirmation

### Phase 4 — Provider calendar UI

- month/week/day/list view
- status badges
- confirm/cancel/reschedule
- manual block
- manual booking if needed

### Phase 5 — Notifications / polish

- booking emails
- reminders
- cancellation messages
- empty/error/loading states
- mobile polish

### Phase 6 — Sync later

- iCal export
- Google busy import
- bidirectional sync only if truly needed

---

## 22. Acceptance criteria

Kalendar je “dobar” tek kad vrijedi sve ovo:

- korisnik može rezervirati termin od početka do kraja na mobitelu
- provider može postaviti dostupnost bez objašnjavanja
- backend sprječava double-booking i race condition
- postojeći canonical bookings model je jedini source of truth
- zauzeti termini nestaju iz public slot pickera
- potvrđeni termini se jasno vide provideru
- blokade rade odmah
- promjena termina provjerava conflict
- payment/booking status se ne razilaze
- RLS ne pušta tuđe podatke
- Playwright pokriva barem core booking flow
- nema ghost kolona u novom calendar kodu

---

## 23. Što NE raditi

- Ne graditi dalje na starom `start_time/end_time/provider_type/client_name` modelu.
- Ne računati availability samo u React komponenti.
- Ne dozvoliti booking bez server-side conflict checka.
- Ne koristiti samo disabled datume bez objašnjenja korisniku.
- Ne uvoditi bidirectional Google sync prije stabilnog core booking flowa.
- Ne miješati sitter, groomer i trainer pravila bez service layera.
- Ne skrivati cijenu do zadnjeg koraka.
- Ne ostaviti unpaid booking da vječno blokira slot.

---

## 24. Kratki developer brief

Build PetPark calendar as a canonical booking module, not a separate booking system. Use `public.bookings` with canonical fields (`starts_at`, `ends_at`, `provider_kind`, `owner_profile_id`, `primary_service_code`, monetary fields, status/payment_status). Add provider availability rules, exceptions, booking holds, conflict-safe RPC/transaction, and RLS. Frontend must provide owner slot picker, provider weekly availability editor, provider calendar view, and admin overview. Backend is responsible for availability and conflict detection. Mobile UX is mandatory. No ghost booking columns.
