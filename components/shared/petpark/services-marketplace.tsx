import Link from 'next/link';
import {
  CheckCircle2,
  Heart,
  Home,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trees,
  UsersRound,
} from 'lucide-react';
import {
  AppHeader,
  Badge,
  Button,
  ButtonLink,
  Card,
  IconButton,
  Input,
  LeafDecoration,
  PawDecoration,
  PetParkLogo,
  Rating,
  Select,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';
import type { MarketplaceServiceListing } from '@/lib/db/service-listings';

type Category = {
  title: string;
  count: string;
  icon: typeof PawPrint;
  tone: 'orange' | 'sage' | 'teal' | 'cream';
};

type Service = Pick<MarketplaceServiceListing, 'slug' | 'title' | 'provider' | 'location' | 'rating' | 'reviews' | 'description' | 'price' | 'badges' | 'tone'>;

const categories: Category[] = [
  { title: 'Čuvanje', count: '312 usluga', icon: Home, tone: 'orange' },
  { title: 'Šetnja', count: '286 usluga', icon: PawPrint, tone: 'sage' },
  { title: 'Grooming', count: '178 usluga', icon: Sparkles, tone: 'teal' },
  { title: 'Trening', count: '154 usluga', icon: Trees, tone: 'cream' },
  { title: 'Izgubljeni', count: '89 objava', icon: MapPin, tone: 'orange' },
  { title: 'Udomljavanje', count: '201 ljubimac', icon: UsersRound, tone: 'sage' },
];

const services: Service[] = [
  {
    slug: 'cuvanje-psa-u-kucnom-okruzenju',
    title: 'Čuvanje psa u obiteljskom domu',
    provider: 'Ana K.',
    location: 'Zagreb, Trešnjevka',
    rating: 5,
    reviews: 46,
    description: 'Topla i sigurna usluga s puno pažnje, igre i redovitih updatea za vlasnika.',
    price: '25 EUR / dan',
    badges: ['Dostupno', 'Provjereno'],
    tone: 'orange',
  },
  {
    slug: 'setnja-pasa-tresnjevka-i-okolica',
    title: 'Šetnja pasa - Trešnjevka i okolica',
    provider: 'Marko P.',
    location: 'Zagreb, Trešnjevka',
    rating: 5,
    reviews: 46,
    description: 'Pouzdane šetnje, jasni dogovori i fotografije nakon svake rute.',
    price: '12 EUR / 30 min',
    badges: ['Brza reakcija', 'Provjereno'],
    tone: 'sage',
  },
  {
    slug: 'grooming-sisanje-i-njega',
    title: 'Grooming - šišanje i njega',
    provider: 'Petra G.',
    location: 'Zagreb, Maksimir',
    rating: 5,
    reviews: 46,
    description: 'Nježan pristup, uredan salon i njega prilagođena karakteru ljubimca.',
    price: '35 EUR / usluga',
    badges: ['Iskusno', 'Provjereno'],
    tone: 'teal',
  },
  {
    slug: 'trening-poslusnosti',
    title: 'Trening poslušnosti',
    provider: 'Pet Star Lana',
    location: 'Zagreb, Jarun',
    rating: 5,
    reviews: 46,
    description: 'Praktični treninzi za bolju svakodnevicu, mirnije šetnje i sigurniju komunikaciju.',
    price: '30 EUR / sat',
    badges: ['Dostupno', 'Provjereno'],
    tone: 'cream',
  },
];

const toneClasses: Record<Category['tone'], string> = {
  orange: 'bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]',
  sage: 'bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-success)]',
  teal: 'bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
  cream: 'bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-forest-text)]',
};

export function SearchBar() {
  return (
    <form className="relative z-10 rounded-[22px] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-3 shadow-[var(--pp-shadow-soft-card)]" aria-label="Pretraga usluga">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.35fr_172px]">
        <label className="space-y-1">
          <span className="sr-only">Lokacija</span>
          <Input name="lokacija" defaultValue="Zagreb, Hrvatska" className="shadow-none" />
        </label>
        <label className="space-y-1">
          <span className="sr-only">Kategorija</span>
          <Select name="kategorija" defaultValue="sve" className="shadow-none">
            <option value="sve">Sve kategorije</option>
            <option value="cuvanje">Čuvanje</option>
            <option value="setnja">Šetnja</option>
            <option value="grooming">Grooming</option>
            <option value="trening">Trening</option>
          </Select>
        </label>
        <label className="relative space-y-1">
          <span className="sr-only">Ključna riječ</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
          <Input name="pojam" placeholder="Pretraži usluge..." className="shadow-none" style={{ paddingLeft: 56 }} />
        </label>
        <Button type="submit" className="h-12">Pretraži usluge</Button>
      </div>
    </form>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;

  return (
    <button type="button" className="group flex min-h-[88px] items-center gap-4 rounded-[18px] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4 text-left shadow-[var(--pp-shadow-small-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-soft-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]">
      <span className={cn('flex size-12 items-center justify-center rounded-[var(--pp-radius-control)]', toneClasses[category.tone])}>
        <Icon className="size-6" aria-hidden />
      </span>
      <span>
        <span className="block text-lg font-black tracking-[-0.02em] text-[color:var(--pp-color-forest-text)]">{category.title}</span>
        <span className="mt-1 block text-sm font-bold text-[color:var(--pp-color-muted-text)]">{category.count}</span>
      </span>
    </button>
  );
}

function FilterRow({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-3 rounded-[18px] bg-[color:var(--pp-color-cream-surface)] p-3 sm:bg-transparent sm:p-0">
      <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{label}</span>
      <Input defaultValue={value} className="h-12 shadow-none lg:h-11" />
    </label>
  );
}

export function FilterSidebar() {
  return (
    <aside className="space-y-8 sm:space-y-7 lg:space-y-5">
      <Card radius="24" className="p-6 sm:p-6 lg:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">
            <SlidersHorizontal className="size-5 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
            Filtri
          </h2>
          <button type="button" className="text-xs font-extrabold text-[color:var(--pp-color-orange-primary)] underline-offset-4 hover:underline">
            Poništi sve
          </button>
        </div>
        <div className="space-y-6 lg:space-y-4">
          <FilterRow label="Lokacija" value="Zagreb, Hrvatska" />
          <FilterRow label="Kategorija" value="Sve kategorije" />
          <FilterRow label="Cijena" value="0 EUR - 100+ EUR" />
          <FilterRow label="Dostupnost" value="Bilo kada" />
          <FilterRow label="Ocjena" value="4+ i više" />
          <label className="flex items-start gap-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-sage-surface)] p-4 text-sm font-extrabold leading-6 text-[color:var(--pp-color-forest-text)] lg:items-center lg:p-3 lg:leading-normal">
            <input type="checkbox" className="size-4 accent-[color:var(--pp-color-teal-accent)]" defaultChecked />
            Samo provjereni pružatelji
          </label>
        </div>
      </Card>
      <div className="mt-3 sm:mt-2 lg:mt-0">
        <SafetyCard />
      </div>
    </aside>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="grid gap-5 rounded-[24px] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4 shadow-[var(--pp-shadow-small-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-soft-card)] md:grid-cols-[160px_1fr_auto]">
      <div className={cn('relative flex min-h-[132px] items-center justify-center overflow-hidden rounded-[20px]', toneClasses[service.tone])}>
        <div className="absolute -right-5 -top-5 size-20 rounded-full bg-[color:var(--pp-color-card-surface)]/45" />
        <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-[color:var(--pp-color-card-surface)]/35" />
        <PawPrint className="relative size-12 opacity-80" aria-hidden />
        <span className="absolute bottom-3 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">foto usluge</span>
      </div>

      <div className="min-w-0 py-1">
        <h3 className="text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{service.title}</h3>
        <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{service.provider} • {service.location}</p>
        <Rating value={service.rating} count={service.reviews} className="mt-3" />
        <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{service.description}</p>
      </div>

      <div className="flex min-w-[210px] flex-col items-start justify-between gap-4 md:items-end">
        <div className="flex items-center gap-2">
          {service.badges.map((badge, index) => (
            <Badge key={badge} variant={index === 0 ? 'orange' : 'success'}>{badge}</Badge>
          ))}
          <IconButton aria-label={`Spremi ${service.title}`} variant="ghost" className="size-10 shadow-none">
            <Heart className="size-5" aria-hidden />
          </IconButton>
        </div>
        <div className="text-left md:text-right">
          <p className="text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{service.price}</p>
          <Link href={`/usluge/${service.slug}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-orange-primary)] px-5 text-sm font-extrabold text-[color:var(--pp-color-card-surface)] shadow-[var(--pp-shadow-button-glow)] transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
            Pogledaj detalje
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SafetyCard() {
  return (
    <Card tone="sage" radius="24" className="relative overflow-hidden p-7 lg:p-5">
      <PawDecoration className="-right-4 -top-4 hidden opacity-60 sm:block" />
      <div className="relative z-10 flex gap-4 sm:gap-5 lg:gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-teal-accent)] shadow-[var(--pp-shadow-small-card)]">
          <ShieldCheck className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-black tracking-[-0.02em] text-[color:var(--pp-color-forest-text)]">Sigurnost na prvom mjestu</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
            Provjera identiteta, stvarne recenzije i sigurna komunikacija.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function TrustStrip() {
  const items = [
    ['Provjereni pružatelji', 'Sigurnost i kvaliteta'],
    ['Zajednica koja pomaže', 'Podrška kad treba'],
    ['Lokalno i pouzdano', 'Usluge u vašem gradu'],
    ['Za sve ljubimce', 'Psi, mačke i više'],
  ];

  return (
    <section className="mx-auto mt-16 max-w-[var(--pp-content-width)] rounded-[24px] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-6 py-6 shadow-[var(--pp-shadow-small-card)] lg:mt-20">
      <div className="grid gap-5 md:grid-cols-4">
        {items.map(([title, description]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-success)]">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{title}</h3>
              <p className="mt-1 text-xs font-bold text-[color:var(--pp-color-muted-text)]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroPhotoArea() {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[28px] bg-[color:var(--pp-color-sage-surface)] p-6 shadow-[var(--pp-shadow-small-card)]">
      <div className="absolute right-8 top-8 size-28 rounded-full bg-[color:var(--pp-color-info-surface)]" />
      <div className="absolute bottom-8 left-10 size-24 rounded-full bg-[color:var(--pp-color-warning-surface)]" />
      <div className="absolute left-1/2 top-1/2 flex size-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[44px] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-soft-card)]">
        <PawPrint className="size-20" aria-hidden />
      </div>
      <div className="absolute bottom-10 right-12 rounded-full bg-[color:var(--pp-color-card-surface)] px-5 py-3 text-sm font-black text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)]">
        Topla zajednica za sve ljubimce
      </div>
    </div>
  );
}

export function ServicesMarketplacePage({ realServices = [] }: { realServices?: MarketplaceServiceListing[] }) {
  const visibleServices = realServices.length > 0 ? realServices.slice(0, services.length) : services;
  const resultCountLabel = '1.220 usluga';

  return (
    <main data-petpark-route="usluge" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader
        navItems={[
          { href: '/usluge', label: 'Usluge' },
          { href: '/#kako-radi', label: 'Kako radi' },
          { href: '/zajednica', label: 'Zajednica' },
          { href: '/blog', label: 'Blog' },
        ]}
        actions={(
          <div className="hidden items-center gap-5 lg:flex">
            <ButtonLink href="/prijava" variant="secondary" size="md" className="min-w-[130px]">Prijava</ButtonLink>
            <ButtonLink href="/objavi-uslugu" size="md" className="min-w-[190px]">+ Objavi uslugu</ButtonLink>
          </div>
        )}
      />
      <section className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-8 sm:px-6 lg:px-10">
        <LeafDecoration className="-left-20 top-[820px] size-[230px] opacity-55" />
        <LeafDecoration className="right-[-60px] top-10 size-[170px] opacity-55" />
        <PawDecoration className="left-[45%] top-12 hidden size-[76px] rotate-12 opacity-80 sm:block" />
        <PawDecoration className="left-[38%] top-36 hidden size-[59px] -rotate-12 opacity-60 sm:block" />

        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="grid items-center gap-10 lg:grid-cols-[560px_1fr]">
            <div>
              <Badge variant="teal">PetPark usluge</Badge>
              <h1 className="mt-4 max-w-[560px] text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[color:var(--pp-color-forest-text)] sm:text-6xl lg:text-[66px]">
                Pronađi uslugu za svog ljubimca
              </h1>
              <p className="mt-6 max-w-[550px] text-lg font-semibold leading-8 text-[color:var(--pp-color-muted-text)]">
                Povezujemo ljubimce i provjerene pružatelje usluga za sigurniju, sretniju i ispunjeniju svakodnevicu.
              </p>
            </div>
            <HeroPhotoArea />
          </div>

          <div className="mt-6" style={{ marginTop: 52 }}>
            <SearchBar />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6" style={{ marginTop: 22 }}>
            {categories.map((category) => <CategoryCard key={category.title} category={category} />)}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]" style={{ marginTop: 34 }}>
            <FilterSidebar />
            <section aria-label="Rezultati pretrage" className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-lg font-black text-[color:var(--pp-color-forest-text)]">Pronađeno {resultCountLabel}</p>
                <label className="min-w-[170px]">
                  <span className="sr-only">Sortiranje</span>
                  <Select defaultValue="najnovije" aria-label="Sortiranje rezultata">
                    <option value="najnovije">Najnovije</option>
                    <option value="ocjena">Najbolje ocjene</option>
                    <option value="cijena">Najpovoljnije</option>
                  </Select>
                </label>
              </div>
              <div className="space-y-5">
                {visibleServices.map((service) => <ServiceCard key={service.slug} service={service} />)}
              </div>
            </section>
          </div>

          <TrustStrip />
          <footer className="mt-12 pb-16 pt-12 text-center text-sm font-bold text-[color:var(--pp-color-muted-text)]">
            <PetParkLogo className="mx-auto mb-3" width={126} height={38} />
            PetPark povezuje lokalnu zajednicu ljubimaca i provjerene pružatelje usluga.
          </footer>
        </div>
      </section>
    </main>
  );
}
