# PetPark Official Design Book v2.0

**Direction:** Smart Assistant + Service Circle  
**Product model:** service-first + community-first  
**Primary question:** “Što treba tvom ljubimcu danas?”  
**Status:** Official working specification for PetPark.hr redesign  
**Generated for:** PetPark.hr Next.js App Router codebase

---

## 1. Executive summary

PetPark v2 mora izgledati kao jedan proizvod: topao, hrvatski, moderan, pouzdan i dovoljno premium da korisnik osjeti da je riječ o ozbiljnoj platformi, a ne o oglasniku.

Odabrani vizualni smjer je **Smart Assistant + Service Circle**. Taj smjer zaključava dva glavna elementa:

1. **Smart Assistant / PetNeedWizard** na lijevoj strani hero sekcije.  
   Korisnik ne mora znati gdje početi. PetPark ga pita što treba ljubimcu i vodi ga dalje.

2. **Service Circle / ServiceOrbit** na desnoj strani hero sekcije.  
   Krug s ljubimcima u sredini i uslugama oko njih postaje signature vizual PetParka.

PetPark homepage ne smije biti provider-directory-first. Pružatelji postoje u sustavu, ali prvi mentalni model korisnika je:

```txt
Što treba mom ljubimcu danas?
```

Ne:

```txt
Koje pružatelje mogu pregledavati?
```

## 2. Brand positioning

### 2.1 Brand sentence

```txt
PetPark je mjesto gdje odabereš što treba tvom ljubimcu, a PetPark vodi dalje — prema usluzi, dogovoru, savjetu ili zajednici.
```

### 2.2 Core values

- **Toplo:** ljudi i ljubimci su u centru proizvoda.
- **Sigurno:** dogovor mora biti jasan, organiziran i transparentan.
- **Lokalno:** grad, lokacija i zajednica su dio identiteta.
- **Service-first:** usluga/potreba dolazi prije osobe/profila.
- **Community-first:** forum, izgubljeni/pronađeni, udomljavanje i savjeti nisu dodatak, nego dio proizvoda.
- **Premium but friendly:** UI treba biti čist, ozbiljan i lijep, ali ne hladan.

### 2.3 Do not position PetPark as

```txt
- imenik pružatelja
- provider marketplace bez zajednice
- generički pet-care template
- oglasnik
- veterinarska aplikacija
- social network bez strukture
```

## 3. Official visual direction

### 3.1 Homepage hero anatomy

Desktop hero mora imati:

```txt
Left side:
- logo/header iznad
- headline: “Što treba tvom ljubimcu danas?” ili “Odaberi što trebaš — PetPark vodi dalje.”
- kratki subtitle
- Smart Assistant card
- trust mini-row

Right side:
- Service Circle / ServiceOrbit
- pas i mačka u centru
- 6 usluga oko kruga

Below hero:
- QuickActionRail
- Live zajednica
- Najnoviji savjeti
- Zašto PetPark?
- app/benefits strip ili community strip
```

### 3.2 Signature Service Circle

Service Circle je jedan od najvažnijih brand elemenata. Koristi se na homepage desktop hero sekciji i eventualno na `/usluge` overview stranici.

Uvijek uključuje 6 glavnih potreba:

```txt
Čuvanje
Šetnja
Grooming
Trening
Izgubljeni
Udomljavanje
```

Pravila:

- Desktop: krug smije biti velik i dominantan.
- Tablet: krug se smanjuje, labeli se mogu premjestiti u grid.
- Mobile: puni desktop orbit se ne koristi. Pretvara se u 2x3 service grid ili horizontalni carousel.
- Tekstualni labeli ne smiju biti dio apsolutnih layoutova koji se preklapaju.
- Krug ne smije imati više od 6 primarnih usluga.
- Dodatne kategorije, ako postoje, idu ispod kao kartice, ne u krug.

## 4. Official logo rules

### 4.1 Canonical logo file

Koristi se samo:

```txt
public/brand/petpark-logo.svg
```

Repo audit je pokazao da taj file nije postojao i da su logo varijante bile fragmentirane u:

```txt
components/shared/navbar/paw-logo.tsx
components/shared/brand-logo.tsx
components/shared/footer.tsx
app/prijava/login-form.tsx
app/registracija/register-form.tsx
```

V2 pravilo: svuda koristiti jedan official asset i jednu komponentu.

### 4.2 Future logo component

Preporučena komponenta:

```txt
components/shared/brand/petpark-logo.tsx
```

Koristi:

```tsx
<Image
  src="/brand/petpark-logo.svg"
  alt="PetPark"
  width={180}
  height={44}
  priority
/>
```

Ako SVG renderiranje zahtijeva kontrolu boje ili dimenzije, wrapper komponenta smije postaviti samo veličinu, `alt`, `className`, `priority`; ne smije mijenjati oblike ili boje loga.

### 4.3 Zabranjeno

```txt
- AI-generated logo
- fake logo iz reference
- novi paw logo u headeru
- zasebni inline logo u login/register/footer
- mijenjanje boja official SVG-a
- dodavanje .hr ako nije u official assetu
```

## 5. Information architecture

### 5.1 Main navigation

Default public navigation:

```txt
Usluge
Kako radi
Zajednica
Blog
```

Right actions:

```txt
Prijava
Objavi uslugu
```

Logged-in additions depend on auth/role:

```txt
Poruke
Dashboard
Moj profil
```

### 5.2 Usluge dropdown

Dropdown može uključivati:

```txt
Čuvanje
Šetnja
Grooming
Trening
Izgubljeni/pronađeni
Udomljavanje
Veterinari, ako ostaje javni service route
```

### 5.3 Zajednica dropdown

```txt
Forum
Izgubljeni/pronađeni
Udomljavanje
Feed zajednice
Najbolji/izazovi, ako ostaje aktivno
```

## 6. Design principles

### 6.1 Layout discipline

- Bez teksta u apsolutno pozicioniranim dekorativnim blokovima osim za label badgeve s poznatom širinom.
- Koristiti CSS grid/flex, ne ručno pozicioniranje kartica.
- Svaki text block mora imati `max-width`.
- Svaka kartica mora imati `min-height` ili content-safe layout.
- Hero headline na desktopu max 2–3 linije.
- Mobile headline max 3–4 linije, bez ogromnih 90px fontova.

### 6.2 Density

Odabrani screenshot je dobar jer ima puno korisnih stvari, ali implementacija mora paziti da ne postane pretrpana.

Hero sadrži:

```txt
- headline
- subtitle
- Smart Assistant card
- Service Circle
```

Ispod hero sekcije:

```txt
- QuickActionRail
- 3 content cards
- bottom strip
```

Ne dodavati dodatni provider-heavy block na homepage.

### 6.3 Mobile-first exception

Desktop može imati Service Circle. Mobile ne smije pokušavati komprimirati puni Service Circle. Mobile koristi:

```txt
- compact hero image/brand moment
- Smart Assistant wizard
- 2x3 service grid
- quick actions as horizontal scroll
- content cards stacked
```

## 7. Content model

Homepage v2 treba pokazati 4 vrste sadržaja:

1. **Usluge** — čuvanje, šetnja, grooming, trening.
2. **Zajednica** — live activity, forum, preporuke.
3. **Pomoć** — izgubljeni/pronađeni, udomljavanje.
4. **Savjeti** — blog/advice content.

### 7.1 Avoid fake metrics

Ne koristiti:

```txt
12.000+ članova
5.000+ usluga
98% recenzija
```

osim ako su stvarni i potvrđeni iz baze/analyticsa. Za static design može pisati:

```txt
PetPark zajednica
Tisuće ljubitelja životinja dijele iskustva, savjete i pomažu jedni drugima svaki dan.
```

ali brojke tek nakon potvrde.

## 8. Product surfaces that must follow the same system

- Homepage
- Usluge overview
- Search/results
- Service detail
- Provider/service profile
- User dashboard
- Provider dashboard
- Pet profile / pet passport
- Booking / checkout
- Messages
- Community hub
- Forum list and thread
- Lost/found pets
- Adoption
- Blog homepage and article
- Login/register/onboarding

## 9. Implementation philosophy

Ne implementirati “sliku”. Implementirati sustav:

```txt
Design Book → tokens → primitives → homepage → route templates → rollout → QA
```

Ako se krene odmah na homepage bez foundationa, ostale stranice će opet izgledati nepovezano.

## 10. Hard rules for coding agents

```txt
1. Do not touch Supabase schema.
2. Do not touch Stripe/payment logic.
3. Do not touch booking business logic.
4. Do not touch auth/session logic.
5. Do not modify API routes unless assigned.
6. Do not invent or redesign the logo.
7. Do not use fake metrics.
8. Do not create provider-directory homepage.
9. Do not overwrite modified WIP file components/shared/petpark/service-hub-overview.tsx without checking diff.
10. Preserve data-fetching boundaries.
11. Run type-check/lint/build after implementation phases.
12. Provide screenshot QA before production.
```
