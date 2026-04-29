import type { Metadata } from 'next';
import {
  CTASection,
  PageHero,
  PetParkBadge,
  ProviderCard,
  SearchFilterBar,
  SectionHeader,
  ServiceCard,
  TrustPanel,
} from '@/components/shared/petpark';
import { BrandLogo } from '@/components/shared/brand-logo';

export const metadata: Metadata = {
  title: 'PetPark redizajn preview',
  description: 'Sigurni interni preview PetPark homepage redizajna.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const services = [
  {
    title: 'Sitteri',
    description: 'Čuvanje, smještaj i šetnje za dane kad trebaš pouzdanu pomoć oko ljubimca.',
    href: '/pretraga?category=sitter',
    category: 'sitter' as const,
    statusLabel: 'Dostupno',
    icon: '🐶',
  },
  {
    title: 'Groomeri',
    description: 'Kupanje, šišanje, njega dlake i higijena za ljubimce koji zaslužuju svjež dan.',
    href: '/njega',
    category: 'grooming' as const,
    statusLabel: 'Njega',
    icon: '✂️',
  },
  {
    title: 'Treneri',
    description: 'Pomoć s navikama, poslušnošću i boljim razumijevanjem između tebe i psa.',
    href: '/dresura',
    category: 'trainer' as const,
    statusLabel: 'Dresura',
    icon: '🎾',
  },
  {
    title: 'Izgubljeni ljubimci',
    description: 'Objavi nestanak, podijeli informaciju i uključi ljude u blizini kad je važno brzo reagirati.',
    href: '/izgubljeni',
    category: 'lost' as const,
    statusLabel: 'Hitno',
    icon: '📍',
  },
];

const providers = [
  {
    name: 'Ana Pet Care',
    city: 'Rijeka',
    description: 'Topla kućna briga, šetnje i dnevni ritam prilagođen psu.',
    serviceTags: ['Sitteri', 'Šetanje pasa'],
    priceFrom: 25,
    href: '/pretraga?category=sitter',
    category: 'sitter' as const,
    verified: true,
    isNew: true,
  },
  {
    name: 'Happy Paws Grooming',
    city: 'Zagreb',
    description: 'Mirno kupanje, osnovna njega i uredan salon za osjetljive ljubimce.',
    serviceTags: ['Groomeri', 'Kupanje'],
    priceFrom: 30,
    href: '/njega',
    category: 'grooming' as const,
    verified: true,
    isNew: true,
  },
  {
    name: 'Paw Training Rijeka',
    city: 'Rijeka',
    description: 'Individualni pristup obuci, navikama i svakodnevnim izazovima.',
    serviceTags: ['Treneri', 'Obuka pasa'],
    priceFrom: 35,
    href: '/dresura',
    category: 'trainer' as const,
    verified: true,
    isNew: true,
  },
];

function HeroVisual() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[var(--pp-radius-32)] bg-[linear-gradient(135deg,var(--pp-sitter-bg),var(--pp-grooming-bg),var(--pp-trainer-bg))] p-5">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[color:var(--pp-logo-yellow)]/70 blur-2xl" />
      <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[color:var(--pp-logo-teal)]/35 blur-2xl" />
      <div className="relative flex h-full min-h-[320px] flex-col justify-between rounded-[var(--pp-radius-24)] border border-white/45 bg-[color:var(--pp-warm-white)]/78 p-5 shadow-[var(--pp-shadow-card)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo size="sm" />
          <PetParkBadge variant="available">Rijeka → Hrvatska</PetParkBadge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--pp-radius-24)] bg-white/80 p-4 shadow-[var(--pp-shadow-card)]">
            <div className="text-4xl" aria-hidden="true">🐕</div>
            <p className="mt-4 text-sm font-extrabold text-[color:var(--pp-ink)]">Pouzdani ljudi za dane kad treba pomoć.</p>
          </div>
          <div className="rounded-[var(--pp-radius-24)] bg-white/80 p-4 shadow-[var(--pp-shadow-card)]">
            <div className="text-4xl" aria-hidden="true">🐈</div>
            <p className="mt-4 text-sm font-extrabold text-[color:var(--pp-ink)]">Zajednica, savjeti i usluge na jednom mjestu.</p>
          </div>
        </div>
        <div className="rounded-[var(--pp-radius-24)] bg-[color:var(--pp-forest)] p-4 text-white shadow-[var(--pp-shadow-soft)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-yellow)]">PetPark preview</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--pp-cream)]">Marketplace koji ne izmišlja ponudu — nego gradi stvarne profile i korisnu lokalnu mrežu.</p>
        </div>
      </div>
    </div>
  );
}

export default function RedizajnPreviewPage() {
  return (
    <div className="bg-[color:var(--pp-cream)] text-[color:var(--pp-ink)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageHero
          variant="colorful"
          eyebrow="PetPark Hrvatska"
          title="Mjesto gdje ljubav prema životinjama postaje način života."
          description="PetPark je marketplace i zajednica za vlasnike ljubimaca u Hrvatskoj: pronađi pomoć, upoznaj provjerene partnere, podijeli važne informacije i budi dio lokalne mreže ljudi koji stvarno vole životinje."
          primaryAction={{ label: 'Pronađi uslugu', href: '/pretraga' }}
          secondaryAction={{ label: 'Izgubljeni ljubimci', href: '/izgubljeni' }}
          visual={<HeroVisual />}
        />

        <section aria-labelledby="preview-search-title" className="space-y-5">
          <SectionHeader
            kicker="Brzi početak"
            title="Što danas treba tvom ljubimcu?"
            description="Preview search panel je presentational-only u ovoj fazi i vodi prema postojećoj pretrazi."
          />
          <SearchFilterBar
            action="/pretraga"
            service="Čuvanje"
            city="Rijeka"
            date="Danas"
            petType="Pas"
            submitLabel="Pronađi uslugu"
            popularCities={['Rijeka', 'Zagreb', 'Split']}
          />
        </section>

        <section aria-labelledby="preview-services-title" className="space-y-8">
          <SectionHeader
            kicker="Usluge"
            title="Sve važno za ljubimce na jednom toplom mjestu."
            description="Prve kategorije pokrivaju svakodnevnu brigu, njegu, trening i hitne situacije u zajednici."
            actionLabel="Pogledaj sve"
            actionHref="/pretraga"
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </section>

        <section aria-labelledby="preview-providers-title" className="space-y-8">
          <SectionHeader
            kicker="Partneri"
            title="Primjer kako će izgledati stvarni profili."
            description="Kartice poštuju trust pravila: bez lažnih ocjena, bez 0 € cijena i bez javnog izlaganja kontakata."
          />
          <div className="grid gap-5 xl:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.name} {...provider} />
            ))}
          </div>
        </section>

        <section aria-labelledby="preview-community-title" className="grid gap-5 lg:grid-cols-2">
          <CTASection
            variant="community"
            eyebrow="Zajednica"
            title="Pitanja, preporuke i lokalna podrška."
            description="PetPark nije samo katalog usluga — to je prostor za vlasnike koji žele bolju, korisniju mrežu oko svojih ljubimaca."
            primaryLabel="Pridruži se zajednici"
            primaryHref="/zajednica"
          />
          <CTASection
            variant="partner"
            eyebrow="Postani partner"
            title="Imaš uslugu za ljubimce?"
            description="Sitteri, groomeri i treneri mogu graditi vidljiv profil na platformi koja komunicira jasno i bez lažnih obećanja."
            primaryLabel="Saznaj više"
            primaryHref="/postani-sitter"
          />
        </section>

        <section aria-labelledby="preview-trust-title" className="space-y-8">
          <SectionHeader
            kicker="Zašto PetPark"
            title="Toplo, korisno i transparentno."
            description="PetPark dizajn treba pokazati povjerenje bez hladnog SaaS dojma i bez dječjeg vizualnog tona."
          />
          <TrustPanel />
        </section>

        <div className="rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] p-5 text-sm leading-7 text-[color:var(--pp-muted)] shadow-[var(--pp-shadow-card)]">
          <p className="font-bold text-[color:var(--pp-ink)]">Interni preview route</p>
          <p>Ova stranica je namjerno odvojena od produkcijskog homepagea. Ne mijenja postojeći `/`, `/pretraga` ili `/blog`.</p>
        </div>
      </div>
    </div>
  );
}
