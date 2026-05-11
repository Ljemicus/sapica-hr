import Link from 'next/link';
import {
  CTASection,
  PageHero,
  SearchFilterBar,
  SectionHeader,
  ServiceCard,
  TrustPanel,
} from '@/components/shared/petpark';
import type { PetParkCategory } from '@/components/shared/petpark';
import { cn } from '@/lib/utils';

type HubCard = {
  title: string;
  description: string;
  href: string;
  category: PetParkCategory;
  statusLabel: string;
  icon: string;
};

const availableServices: HubCard[] = [
  {
    title: 'Sitteri',
    description: 'Čuvanje, šetnje i svakodnevna briga za pse i mačke kad trebaš pouzdanu pomoć.',
    href: '/pretraga?category=sitter',
    category: 'sitter',
    statusLabel: 'Dostupno sada',
    icon: '🐾',
  },
  {
    title: 'Groomeri',
    description: 'Njega, kupanje i uređivanje ljubimaca kroz jasne usluge i provjerene partnere.',
    href: '/njega',
    category: 'grooming',
    statusLabel: 'Dostupno sada',
    icon: '✂️',
  },
  {
    title: 'Treneri',
    description: 'Dresura, ponašanje i stvaranje boljih navika za mirniji život s ljubimcem.',
    href: '/dresura',
    category: 'trainer',
    statusLabel: 'Dostupno sada',
    icon: '🎓',
  },
];

const communityServices: HubCard[] = [
  {
    title: 'Izgubljeni ljubimci',
    description: 'Objavi nestanak, podijeli informaciju i uključi lokalnu zajednicu kad je vrijeme važno.',
    href: '/izgubljeni',
    category: 'lost',
    statusLabel: 'Zajednica',
    icon: '📍',
  },
  {
    title: 'Zajednica',
    description: 'Pitanja, preporuke i korisne priče ljudi koji svakodnevno brinu o ljubimcima.',
    href: '/zajednica',
    category: 'community',
    statusLabel: 'Aktivno',
    icon: '💛',
  },
  {
    title: 'Blog i forum',
    description: 'Savjeti, vodiči i razgovori za vlasnike koji žele bolju lokalnu podršku.',
    href: '/blog',
    category: 'community',
    statusLabel: 'Zajednica',
    icon: '✍️',
  },
];

const upcomingServices: HubCard[] = [
  {
    title: 'Veterinari',
    description: 'PetPark postupno gradi pregled korisnih zdravstvenih informacija i veterinarskih lokacija.',
    href: '/veterinari',
    category: 'vet',
    statusLabel: 'U pripremi',
    icon: '🩺',
  },
  {
    title: 'Udomljavanje',
    description: 'Prostor za odgovorno povezivanje ljubimaca koji traže dom i ljudi koji ga mogu pružiti.',
    href: '/udomljavanje',
    category: 'adoption',
    statusLabel: 'U pripremi',
    icon: '🏡',
  },
  {
    title: 'Uzgajivačnice',
    description: 'Pregled se priprema pažljivo, s naglaskom na informiran i odgovoran odabir.',
    href: '/uzgajivacnice',
    category: 'breeder',
    statusLabel: 'U pripremi',
    icon: '🌿',
  },
  {
    title: 'Dog-friendly mjesta',
    description: 'Lokacije i ideje za izlaske na kojima su ljubimci dobrodošli, grad po grad.',
    href: '/dog-friendly',
    category: 'dogFriendly',
    statusLabel: 'U pripremi',
    icon: '☀️',
  },
];

const quickLinks = [
  { label: 'Sitteri', href: '/pretraga?category=sitter', tone: 'bg-[color:var(--pp-sitter-bg)] text-[color:var(--pp-sitter-accent)]' },
  { label: 'Groomeri', href: '/njega', tone: 'bg-[color:var(--pp-grooming-bg)] text-[color:var(--pp-grooming-accent)]' },
  { label: 'Treneri', href: '/dresura', tone: 'bg-[color:var(--pp-trainer-bg)] text-[color:var(--pp-trainer-accent)]' },
];

function HeroVisual() {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-[var(--pp-radius-32)] bg-[linear-gradient(135deg,var(--pp-sitter-bg),var(--pp-community-bg),var(--pp-grooming-bg))] p-5">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[color:var(--pp-logo-yellow)]/70 blur-2xl" />
      <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[color:var(--pp-logo-teal)]/35 blur-2xl" />
      <div className="relative grid min-h-[300px] gap-3 rounded-[var(--pp-radius-24)] border border-white/55 bg-[color:var(--pp-warm-white)]/82 p-4 shadow-[var(--pp-shadow-card)] backdrop-blur sm:grid-cols-2">
        <div className="rounded-[var(--pp-radius-24)] bg-white/85 p-4 shadow-[var(--pp-shadow-card)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-orange)]">Dostupno sada</p>
          <div className="mt-8 text-5xl" aria-hidden="true">🐕</div>
          <p className="mt-5 font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">Usluge za svakodnevnu brigu.</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-[var(--pp-radius-24)] bg-[color:var(--pp-forest)] p-4 text-white shadow-[var(--pp-shadow-soft)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-yellow)]">Zajednica</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--pp-cream)]">Pomoć, savjeti i lokalne informacije za ljude koji vole životinje.</p>
          </div>
          <div className="rounded-[var(--pp-radius-24)] bg-white/85 p-4 shadow-[var(--pp-shadow-card)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-teal)]">U pripremi</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--pp-muted)]">Nove kategorije rastu postupno, bez lažnih obećanja o ponudi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickEntryBlock() {
  return (
    <section aria-labelledby="service-hub-search-title" className="space-y-5">
      <SectionHeader
        kicker="Brzi početak"
        title="Kreni od potrebe, ne od menija."
        description="Odaberi uslugu, grad ili vrstu ljubimca i otvori postojeću PetPark pretragu kada želiš stvarne profile i rezultate."
      />
      <div className="rounded-[var(--pp-radius-40)] border border-[color:var(--pp-line)] bg-[color:var(--pp-surface)] p-4 shadow-[var(--pp-shadow-soft)] md:p-6">
        <SearchFilterBar
          action="/pretraga"
          service="Čuvanje"
          city="Rijeka"
          petType="Pas"
          query="Pouzdana pomoć"
          submitLabel="Prikaži usluge"
          popularCities={['Rijeka', 'Zagreb', 'Split']}
        />
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Brzi linkovi za kategorije">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={cn('rounded-[var(--pp-radius-pill)] px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]', link.tone)}
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceGroup({ kicker, title, description, cards }: { kicker: string; title: string; description: string; cards: HubCard[] }) {
  return (
    <section aria-labelledby={`service-hub-${kicker.toLowerCase().replaceAll(' ', '-')}`} className="space-y-8">
      <SectionHeader kicker={kicker} title={title} description={description} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <ServiceCard key={card.title} {...card} ctaLabel="Otvori" />
        ))}
      </div>
    </section>
  );
}

interface ServiceHubOverviewProps {
  mode?: 'preview' | 'production';
}

export function ServiceHubOverview({ mode = 'preview' }: ServiceHubOverviewProps) {
  const isProduction = mode === 'production';

  return (
    <div className="bg-[color:var(--pp-cream)] text-[color:var(--pp-ink)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageHero
          variant="colorful"
          eyebrow="PetPark usluge"
          title="Odaberi što ti treba."
          description="PetPark spaja usluge, lokalnu pomoć i zajednicu za vlasnike ljubimaca u Hrvatskoj. Sve je posloženo tako da brzo vidiš što možeš koristiti sada, gdje zajednica pomaže i što se gradi postupno."
          primaryAction={{ label: 'Pronađi uslugu', href: isProduction ? '/pretraga#rezultati' : '/pretraga' }}
          secondaryAction={{ label: 'Postani partner', href: '/postani-sitter' }}
          visual={<HeroVisual />}
        />

        <QuickEntryBlock />

        <ServiceGroup
          kicker="Dostupno sada"
          title="Usluge koje rješavaju svakodnevne potrebe."
          description="Kreni prema provjerenoj brizi, njezi ili treningu bez izmišljenih brojki i bez nepotrebnog lutanja."
          cards={availableServices}
        />

        <ServiceGroup
          kicker="Zajednica"
          title="Kad je korisnije pitati ljude oko sebe."
          description="PetPark povezuje vlasnike kroz pomoć, preporuke, vodiče i lokalne informacije koje stvarno olakšavaju brigu."
          cards={communityServices}
        />

        <ServiceGroup
          kicker="U pripremi"
          title="Kategorije koje gradimo pažljivo."
          description="Nove cjeline ostaju vidljive kao smjer razvoja, ali bez glumljenja aktivne ponude tamo gdje se ona još gradi."
          cards={upcomingServices}
        />

        <section aria-labelledby="service-hub-trust-title" className="space-y-8">
          <SectionHeader
            kicker="Transparentnost"
            title="Jasno što postoji, jasno što se tek gradi."
            description="Pregled usluga treba biti topao i jasan: bez lažnih ocjena, bez izmišljenih cijena i bez skrivanja statusa kategorija."
          />
          <TrustPanel
            items={[
              { title: 'Stvarni profili', description: 'Pretraga vodi prema postojećim profilima i provjerenim informacijama.', icon: '✓' },
              { title: 'Jasne kategorije', description: 'Svaka usluga ima svoje mjesto i status koji korisnik odmah razumije.', icon: '◇' },
              { title: 'Bez izmišljenih cijena', description: 'Ako cijena nije potvrđena, ne prikazujemo prazne ili zavaravajuće brojke.', icon: '€' },
              { title: 'Grad po grad', description: 'PetPark raste lokalno, s fokusom na korisnost prije širine.', icon: '⌁' },
            ]}
          />
        </section>

        <CTASection
          variant="partner"
          eyebrow="Partneri"
          title="Želiš biti dio PetParka?"
          description="Ako pružaš usluge za ljubimce, pridruži se mreži provjerenih partnera i predstavi svoju uslugu na jasan, topao i koristan način."
          primaryLabel="Postani partner"
          primaryHref="/postani-sitter"
          secondaryLabel="Pogledaj usluge"
          secondaryHref="/pretraga"
        />

      </div>
    </div>
  );
}
