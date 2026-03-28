# 🐾 PetPark — Hrvatski Pet Sitting Marketplace

PetPark je moderna web aplikacija za pronalaženje pouzdanih čuvara kućnih ljubimaca u Hrvatskoj. Slična Rover.com platformi, prilagođena hrvatskom tržištu.

## ✨ Značajke

- **Pretraga sittera** — Filtrirajte po gradu, usluzi, cijeni i ocjeni
- **Interaktivna karta** — Leaflet karta s lokacijama sittera
- **Profili sittera** — Detaljni profili s recenzijama, cijenama i dostupnošću
- **Sustav rezervacija** — Kompletan booking flow s potvrdom
- **Real-time poruke** — Chat između vlasnika i sittera (Supabase Realtime)
- **Dashboard za vlasnike** — Upravljanje ljubimcima i rezervacijama
- **Dashboard za sittere** — Kalendar dostupnosti, zarada, recenzije
- **Admin panel** — Upravljanje korisnicima i verifikacija sittera
- **Responzivan dizajn** — Mobile-first pristup

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + Supabase
- **Auth:** Supabase Auth (Email + Google OAuth)
- **Database:** PostgreSQL (Supabase)
- **Real-time:** Supabase Realtime
- **Maps:** Leaflet / OpenStreetMap
- **Validation:** Zod + React Hook Form
- **Deployment:** Vercel

## 🚀 Pokretanje

### Preduvjeti

- Node.js 18+
- npm
- Supabase račun (besplatan)

### 1. Kloniraj repozitorij

```bash
git clone <repo-url>
cd petpark
npm install
```

### 2. Postavi Supabase

1. Kreiraj novi projekt na [supabase.com](https://supabase.com)
2. U SQL Editor pokreni migraciju: `supabase/migrations/001_initial_schema.sql`
3. (Opcionalno) Pokreni seed podatke: `supabase/seed.sql`
4. Uključi Realtime za `messages` tablicu u Supabase dashboard

### 3. Environment varijable

Kopiraj `.env.local.example` u `.env.local` i popuni:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Pokreni development server

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

### 5. (Opcionalno) Google OAuth

1. U Google Cloud Console kreiraj OAuth 2.0 credentials
2. U Supabase Dashboard → Authentication → Providers → Google, dodaj Client ID i Secret
3. Postavi redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## 📁 Struktura projekta

```
├── app/                    # Next.js App Router stranice
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── dashboard/         # Owner & Sitter dashboards
│   ├── poruke/            # Messaging
│   ├── pretraga/          # Search/Explore
│   ├── prijava/           # Login
│   ├── registracija/      # Register
│   └── sitter/[id]/      # Sitter profile
├── components/
│   ├── shared/            # Reusable components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client config
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Zod schemas
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── seed.sql           # Seed data
└── public/                # Static assets
```

## 🎨 Dizajn

- **Boja:** Narančasta (#F97316) + warm gray
- **Font:** Inter
- **Komponente:** shadcn/ui
- **Ikone:** Lucide React
- **Responsive:** Mobile-first

## 📝 Licence

MIT
