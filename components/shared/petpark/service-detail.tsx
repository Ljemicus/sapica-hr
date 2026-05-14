import Link from 'next/link';
import {
  CalendarDays,
  Check,
  ChevronRight,
  Heart,
  Home,
  MapPin,
  PawPrint,
  ShieldCheck,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  IconButton,
  LeafDecoration,
  PawDecoration,
  PetParkLogo,
  Rating,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';
import type { MarketplaceServiceListing } from '@/lib/db/service-listings';

const fallbackService = {
  title: 'Čuvanje psa u kućnom okruženju',
  provider: 'Ana K.',
  location: 'Maksimir, Zagreb',
  rating: 5.0,
  reviewCount: 28,
  price: '25 EUR / dan',
  range: '12. lip - 17. lip (6 noći)',
  pet: 'Leo • Labrador • 3 god.',
  total: '150 EUR',
};

const features = [
  'Boravak u kući',
  'Šetnje 3x dnevno',
  'Slanje foto updatea',
  'Nadziranje 24/7',
  'Igra i druženje',
  'Hranjenje prema dogovoru',
];

const rules = [
  'Ljubimci smiju na namještaj',
  'Nema agresivnih pasa',
  'Cijepljenje obavezno',
];

const similar = [
  ['Šetnja i dnevno čuvanje', 'Marko P.', '18 EUR / dan'],
  ['Čuvanje kod provjerene obitelji', 'Petra G.', '27 EUR / dan'],
];

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-extrabold text-[color:var(--pp-color-muted-text)]">
      <Link href="/" className="transition hover:text-[color:var(--pp-color-forest-text)]">Početna</Link>
      <ChevronRight className="size-4" aria-hidden />
      <Link href="/usluge" className="transition hover:text-[color:var(--pp-color-forest-text)]">Usluge</Link>
      <ChevronRight className="size-4" aria-hidden />
      <span className="text-[color:var(--pp-color-forest-text)]">Čuvanje</span>
    </nav>
  );
}

function PhotoPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,var(--pp-color-sage-surface),var(--pp-color-warning-surface))]', className)}>
      <div className="absolute -right-10 -top-10 size-36 rounded-full bg-[color:var(--pp-color-info-surface)]/85" />
      <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-[color:var(--pp-color-card-surface)]/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_35%,rgba(255,255,255,.72),transparent_34%)]" />
      <div className="relative flex h-full min-h-full flex-col items-center justify-center text-center text-[color:var(--pp-color-forest-text)]">
        <PawPrint className="mb-3 size-14 text-[color:var(--pp-color-orange-primary)]" aria-hidden />
        <span className="rounded-full bg-[color:var(--pp-color-card-surface)]/88 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[var(--pp-shadow-small-card)]">{label}</span>
      </div>
    </div>
  );
}

export function ImageGallery() {
  return (
    <Card radius="28" className="grid h-auto gap-5 p-5 md:h-[430px] md:grid-cols-[1fr_200px]">
      <PhotoPlaceholder label="topli dom i dvorište" className="h-[260px] md:h-full" />
      <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-4">
        <PhotoPlaceholder label="dvorište" className="min-h-[92px]" />
        <PhotoPlaceholder label="igra" className="min-h-[92px]" />
        <div className="relative min-h-[92px] overflow-hidden rounded-[22px] bg-[color:var(--pp-color-sage-surface)]">
          <PhotoPlaceholder label="+14" className="absolute inset-0 rounded-[22px]" />
          <div className="absolute inset-0 bg-[color:var(--pp-color-forest-text)]/8" />
        </div>
      </div>
    </Card>
  );
}

export function IncludedFeatures({ items = features }: { items?: string[] }) {
  return (
    <Card radius="24" className="p-8">
      <h2 className="text-2xl font-black tracking-[-0.03em]">Što je uključeno</h2>
      <div className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
        {items.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm font-extrabold text-[color:var(--pp-color-muted-text)]">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]">
              <Check className="size-4" aria-hidden />
            </span>
            {feature}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ServiceDescription({ description = 'Vaš pas bit će dio naše obitelji dok ste vi odsutni. Živimo u mirnom stanu s puno zelenila u blizini, a svaki dan uključuje šetnje, igru i pažnju.', rules: ruleItems = rules }: { description?: string; rules?: string[] }) {
  return (
    <Card radius="24" className="grid gap-8 p-8 md:grid-cols-[1fr_0.88fr]">
      <div>
        <h2 className="text-2xl font-black tracking-[-0.03em]">Opis usluge</h2>
        <p className="mt-4 max-w-md text-base font-semibold leading-8 text-[color:var(--pp-color-muted-text)]">
          {description}
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-black tracking-[-0.03em]">Kućna pravila</h2>
        <div className="mt-4 space-y-3">
          {ruleItems.map((rule) => (
            <p key={rule} className="flex items-center gap-3 text-sm font-extrabold text-[color:var(--pp-color-muted-text)]">
              <Check className="size-4 text-[color:var(--pp-color-success)]" aria-hidden />
              {rule}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MiniCalendar() {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const selected = new Set([12, 13, 14, 15, 16, 17]);
  const weekdays = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED'];

  return (
    <div className="rounded-[20px] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-5 lg:p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Lipanj 2024.</p>
        <CalendarDays className="size-5 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day) => (
          <span key={day} className="text-[10px] font-black text-[color:var(--pp-color-muted-text)]">{day}</span>
        ))}
        {days.map((day) => (
          <span
            key={day}
            className={cn(
              'flex aspect-square items-center justify-center rounded-full text-xs font-black',
              selected.has(day)
                ? day === 12 || day === 17
                  ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-button-glow)]'
                  : 'bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]'
                : 'text-[color:var(--pp-color-muted-text)]',
            )}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BookingPanel({ currentService = fallbackService }: { currentService?: typeof fallbackService | MarketplaceServiceListing }) {
  return (
    <Card radius="28" className="sticky top-24 p-8 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{currentService.price}</p>
          <p className="mt-2 text-xs font-bold text-[color:var(--pp-color-muted-text)]">Minimalno 2 dana • Maksimalno 14 dana</p>
        </div>
        <Badge variant="orange">DOSTUPNO</Badge>
      </div>

      <div className="mt-8 space-y-6 lg:space-y-5">
        <div className="rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-5 py-4 shadow-[var(--pp-shadow-small-card)] lg:px-4 lg:py-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Odaberi datume</p>
          <p className="mt-1 text-sm font-black text-[color:var(--pp-color-forest-text)]">12. lip - 17. lip</p>
        </div>
        <div className="hidden sm:block">
          <MiniCalendar />
        </div>
        <div className="rounded-[20px] bg-[color:var(--pp-color-cream-surface)] p-4 text-sm font-extrabold leading-6 text-[color:var(--pp-color-muted-text)] sm:hidden">
          Kalendar je dostupan na većim ekranima. Odabrani termini su 12. lip - 17. lip.
        </div>
        <div className="grid gap-1 text-sm">
          <span className="font-extrabold text-[color:var(--pp-color-muted-text)]">{'range' in currentService ? currentService.range : 'Termin po dogovoru'}</span>
          <button type="button" className="w-fit font-black text-[color:var(--pp-color-orange-primary)]">Promijeni datume</button>
        </div>
        <PetSelector />
      </div>

      <div className="my-8 h-px bg-[color:var(--pp-color-warm-border)]" />
      <PriceSummary />
      <Button className="mt-6 w-full" size="lg">Rezerviraj sada</Button>
    </Card>
  );
}

export function PetSelector() {
  return (
    <div className="flex items-center gap-3 rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-4 py-4 shadow-[var(--pp-shadow-small-card)]">
      <span className="flex size-11 items-center justify-center rounded-full bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-success)]">
        <PawPrint className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Ljubimac</p>
        <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{fallbackService.pet}</p>
      </div>
    </div>
  );
}

export function PriceSummary() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] bg-[color:var(--pp-color-cream-surface)] px-5 py-4">
      <p className="text-lg font-black text-[color:var(--pp-color-forest-text)]">Ukupno</p>
      <p className="text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{fallbackService.total}</p>
    </div>
  );
}

export function ProviderTrustCard({ currentService = fallbackService }: { currentService?: typeof fallbackService | MarketplaceServiceListing }) {
  const items = [
    'responseTime' in currentService ? currentService.responseTime : 'Odgovara unutar 1 h',
    `${currentService.rating.toFixed(1)} ocjena`,
    `${'reviews' in currentService ? currentService.reviews : currentService.reviewCount} recenzija`,
    currentService.location,
  ];

  return (
    <Card radius="28" className="p-7">
      <h2 className="text-2xl font-black tracking-[-0.03em]">Tvoj čuvar</h2>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row lg:mt-5">
        <Avatar initials="AK" size="lg" className="size-24 text-2xl" />
        <div className="min-w-0">
          <p className="text-xl font-black tracking-[-0.02em]">{currentService.provider}</p>
          <Badge variant="success" className="mt-2">PROVJERENI PRUŽATELJ</Badge>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
                <Check className="size-4 text-[color:var(--pp-color-success)]" aria-hidden />
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ReviewsSection() {
  return (
    <Card radius="24" className="p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-[-0.03em]">Recenzije (28)</h2>
        <Button variant="secondary" size="sm">Pogledaj sve recenzije</Button>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
        <div className="flex items-center gap-4">
          <span className="text-5xl font-black tracking-[-0.06em] text-[color:var(--pp-color-forest-text)]">4.9</span>
          <span className="text-xl text-[color:var(--pp-color-orange-primary)]" aria-label="5 zvjezdica">★★★★★</span>
        </div>
        <blockquote className="rounded-[20px] bg-[color:var(--pp-color-cream-surface)] p-5 text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">
          “Ana je prekrasna! Leo je bio sretan i opušten cijelo vrijeme. Dobivali smo redovite slike i poruke.”
        </blockquote>
      </div>
    </Card>
  );
}

export function SimilarServices() {
  return (
    <Card radius="24" className="p-8">
      <h2 className="text-2xl font-black tracking-[-0.03em]">Slične usluge</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {similar.map(([title, provider, price]) => (
          <Link key={title} href="/usluge/cuvanje-psa-u-kucnom-okruzenju" className="min-h-[150px] rounded-[20px] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-5 transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-small-card)]">
            <div className="mb-4 flex size-12 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]">
              <Home className="size-6" aria-hidden />
            </div>
            <h3 className="text-lg font-black tracking-[-0.02em] text-[color:var(--pp-color-forest-text)]">{title}</h3>
            <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{provider} • {price}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function ServiceDetailPage({ service = fallbackService }: { service?: typeof fallbackService | MarketplaceServiceListing }) {
  return (
    <main data-petpark-route="usluge-detail" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
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
            <ButtonLink href="/objavi-uslugu" size="md" className="min-w-[190px]">+ Spremi nacrt</ButtonLink>
          </div>
        )}
      />
      <section className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-8 sm:px-6 lg:px-10">
        <LeafDecoration className="-left-24 top-[940px] size-[221px] opacity-55" />
        <LeafDecoration className="right-[-58px] top-[118px] size-[153px] opacity-55" />
        <PawDecoration className="right-[17%] top-[190px] hidden size-[59px] rotate-12 opacity-70 sm:block" />

        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <Breadcrumb />
          <div className="mt-4 flex flex-wrap items-start justify-between gap-5" style={{ marginTop: 20 }}>
            <div className="min-w-0">
              <h1 className="max-w-[820px] text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-[48px]">
                {service.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-[color:var(--pp-color-muted-text)]" style={{ marginTop: 22 }}>
                <span>{service.provider}</span>
                <span aria-hidden>•</span>
                <Rating value={service.rating} count={'reviewCount' in service ? service.reviewCount : service.reviews} />
                <span aria-hidden>•</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden />{service.location}</span>
                <Badge variant="success">PROVJERENO</Badge>
              </div>
            </div>
            <IconButton aria-label="Spremi uslugu" variant="secondary" className="size-12">
              <Heart className="size-5" aria-hidden />
            </IconButton>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[800px_360px] lg:items-start lg:justify-between" style={{ marginTop: 29 }}>
            <div className="flex flex-col gap-6">
              <ImageGallery />
              <IncludedFeatures items={'includedFeatures' in service ? service.includedFeatures : features} />
              <ServiceDescription description={'detailDescription' in service ? service.detailDescription : undefined} rules={'houseRules' in service ? service.houseRules : rules} />
              <ReviewsSection />
              <SimilarServices />
            </div>
            <aside className="mt-2 flex flex-col gap-8 lg:mt-5">
              <BookingPanel currentService={service} />
              <ProviderTrustCard currentService={service} />
              <Card tone="sage" radius="24" className="p-7 lg:p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-1 size-6 shrink-0 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                  <p className="text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
                    Rezervacija je statički prikaz za ovaj korak. Prava logika bookinga dolazi kasnije.
                  </p>
                </div>
              </Card>
            </aside>
          </div>

          <footer className="pb-16 pt-14 text-center text-sm font-bold text-[color:var(--pp-color-muted-text)]">
            <PetParkLogo className="mx-auto mb-3" width={126} height={38} />
            PetPark povezuje lokalnu zajednicu ljubimaca i provjerene pružatelje usluga.
          </footer>
        </div>
      </section>
    </main>
  );
}
