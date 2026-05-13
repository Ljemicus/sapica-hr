'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dog,
  Filter,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Newspaper,
  PawPrint,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
  Rating,
  Select,
} from '@/components/shared/petpark/design-foundation';
import { CITIES, GROOMING_SERVICE_LABELS, SERVICE_LABELS, TRAINING_TYPE_LABELS, type ServiceType } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { ProviderCategory, UnifiedProvider } from './types';

interface SearchContentProps {
  providers: UnifiedProvider[];
  initialParams: {
    category?: string;
    city?: string;
    service?: string;
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    sort?: string;
  };
  showEditorialHero?: boolean;
  resultsAnchorId?: string;
  forcedLanguage?: 'hr' | 'en';
}

type SearchTab = 'sve' | 'usluge' | 'zajednica' | 'blog' | 'ljubimci' | 'izgubljeni';

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/zajednica', label: 'Zajednica' },
  { href: '/blog', label: 'Blog' },
  { href: '/izgubljeni', label: 'Izgubljeni' },
  { href: '/udomljavanje', label: 'Udomljavanje' },
];

const tabs: Array<{ key: SearchTab; label: string; icon: typeof Search }> = [
  { key: 'sve', label: 'Sve', icon: Search },
  { key: 'usluge', label: 'Usluge', icon: PawPrint },
  { key: 'zajednica', label: 'Zajednica', icon: MessageCircle },
  { key: 'blog', label: 'Blog', icon: Newspaper },
  { key: 'ljubimci', label: 'Ljubimci', icon: Dog },
  { key: 'izgubljeni', label: 'Izgubljeni', icon: Bell },
];

const articles = [
  {
    title: 'Kako pripremiti psa za prvo čuvanje',
    href: '/blog/prvo-cuvanje-psa',
    category: 'Blog',
    description: 'Kratka lista stvari koje olakšavaju prvi susret sa sitterom.',
    meta: '5 min čitanja',
  },
  {
    title: 'Pet Passport: što treba biti upisano',
    href: '/blog/pet-passport-vodic',
    category: 'Vodič',
    description: 'Cijepljenja, kontakti, alergije i dokumenti na jednom mjestu.',
    meta: 'Ažurirano danas',
  },
];

const communityPosts = [
  {
    title: 'Preporuka za grooming u Rijeci?',
    href: '/zajednica',
    description: 'Vlasnici dijele iskustva i cijene za manje pasmine.',
    meta: '12 odgovora',
  },
  {
    title: 'Socijalizacija šteneta nakon cijepljenja',
    href: '/forum',
    description: 'Rasprava o parkovima, grupnim treninzima i sigurnim susretima.',
    meta: 'Aktivno danas',
  },
];

const petResults = [
  {
    title: 'Luna · Lagotto romagnolo',
    href: '/pet-passport',
    description: 'Pet Passport profil s cijepljenjem i napomenama za čuvanje.',
    meta: 'Passport spreman',
  },
  {
    title: 'Milo · Europska kratkodlaka',
    href: '/pet-passport',
    description: 'Osnovni karton, kontakt vlasnika i veterinarske napomene.',
    meta: 'Treba dopunu',
  },
];

const lostAndAdoption = [
  {
    title: 'Nestao pas u Trsatu',
    href: '/izgubljeni',
    description: 'Smeđi pas srednje veličine, zadnji put viđen blizu parka.',
    meta: 'Hitno · Rijeka',
    tone: 'orange' as const,
  },
  {
    title: 'Mlada mačka traži dom',
    href: '/udomljavanje',
    description: 'Socijalizirana, cijepljena i spremna za udomljavanje.',
    meta: 'Udomljavanje · Zagreb',
    tone: 'teal' as const,
  },
];

function activeTabFromCategory(category?: string): SearchTab {
  if (category === 'zajednica' || category === 'blog' || category === 'ljubimci' || category === 'izgubljeni') return category;
  if (category === 'usluge' || category === 'sitter' || category === 'grooming' || category === 'dresura') return 'usluge';
  return 'sve';
}

function getServiceLabel(service: string, category?: ProviderCategory): string {
  if (category === 'grooming') return GROOMING_SERVICE_LABELS[service as keyof typeof GROOMING_SERVICE_LABELS] || service;
  if (category === 'dresura') return TRAINING_TYPE_LABELS[service as keyof typeof TRAINING_TYPE_LABELS] || service;
  return SERVICE_LABELS[service as ServiceType] || service;
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function categoryLabel(category: ProviderCategory) {
  if (category === 'grooming') return 'Grooming';
  if (category === 'dresura') return 'Školovanje pasa';
  return 'Sitter';
}

function FilterChip({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-3 py-2 text-xs font-black',
      active
        ? 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]'
        : 'border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-muted-text)]',
    )}>
      {children}
    </span>
  );
}

function FilterPanel({
  city,
  minPrice,
  maxPrice,
  minRating,
  verifiedOnly,
  date,
  onCityChange,
  onMinPriceChange,
  onMaxPriceChange,
  onMinRatingChange,
  onVerifiedChange,
  onDateChange,
  onApply,
  onClear,
}: {
  city: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  verifiedOnly: boolean;
  date: string;
  onCityChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinRatingChange: (value: string) => void;
  onVerifiedChange: (value: boolean) => void;
  onDateChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <Card radius="28" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">
          <Filter className="size-4" aria-hidden /> Filteri
        </h2>
        <button type="button" onClick={onClear} className="text-xs font-black text-[color:var(--pp-color-orange-primary)] hover:underline">
          Očisti
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <label className="space-y-2 block">
          <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Kategorija</span>
          <Select defaultValue="sve" disabled>
            <option value="sve">Sve kategorije</option>
          </Select>
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Lokacija</span>
          <Select value={city} onChange={(event) => onCityChange(event.target.value)}>
            <option value="">Svi gradovi</option>
            {CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </label>

        <div className="space-y-2">
          <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Raspon cijene</span>
          <div className="grid grid-cols-2 gap-2">
            <Input inputMode="numeric" placeholder="Od €" value={minPrice} onChange={(event) => onMinPriceChange(event.target.value.replace(/[^0-9]/g, ''))} />
            <Input inputMode="numeric" placeholder="Do €" value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value.replace(/[^0-9]/g, ''))} />
          </div>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Ocjena</span>
          <Select value={minRating} onChange={(event) => onMinRatingChange(event.target.value)}>
            <option value="">Bilo koja ocjena</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
          </Select>
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Datum</span>
          <Input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-4">
          <span>
            <span className="block text-sm font-black text-[color:var(--pp-color-forest-text)]">Samo verificirani</span>
            <span className="mt-1 block text-xs font-semibold text-[color:var(--pp-color-muted-text)]">Prikaži provjerene profile.</span>
          </span>
          <input type="checkbox" checked={verifiedOnly} onChange={(event) => onVerifiedChange(event.target.checked)} className="size-5 accent-[color:var(--pp-color-orange-primary)]" />
        </label>

        <Button onClick={onApply} className="w-full"><SlidersHorizontal className="size-4" /> Primijeni filtere</Button>
      </div>
    </Card>
  );
}

function ServiceResultCard({ provider }: { provider: UnifiedProvider }) {
  return (
    <Link href={provider.profileUrl} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
      <Card radius="28" shadow="small" interactive className="h-full overflow-hidden p-5 ring-1 ring-[color:var(--pp-color-warm-border)]/70">
        <div className="flex items-start gap-4">
          <Avatar src={provider.avatarUrl || undefined} initials={initials(provider.name)} alt={provider.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="orange">{categoryLabel(provider.category)}</Badge>
              {provider.verified ? <Badge variant="success"><ShieldCheck className="size-3" /> Verificirano</Badge> : null}
            </div>
            <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{provider.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]"><MapPin className="size-4" /> {provider.city || 'Hrvatska'}</p>
          </div>
        </div>
        <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{provider.bio || 'PetPark profil s uslugama, recenzijama i dostupnošću.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {provider.services.slice(0, 3).map((service) => <Badge key={service} variant="sage">{getServiceLabel(service, provider.category)}</Badge>)}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[color:var(--pp-color-warm-border)] pt-4">
          <Rating value={provider.rating} count={provider.reviews} />
          {provider.lowestPrice != null ? <span className="text-sm font-black text-[color:var(--pp-color-orange-primary)]">od {provider.lowestPrice}€</span> : null}
        </div>
      </Card>
    </Link>
  );
}

function CompactResultCard({
  title,
  href,
  description,
  meta,
  icon: Icon,
  tone = 'sage',
}: {
  title: string;
  href: string;
  description: string;
  meta: string;
  icon: typeof Search;
  tone?: 'sage' | 'teal' | 'orange' | 'cream';
}) {
  return (
    <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
      <Card radius="24" tone={tone} interactive className="p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{title}</h3>
              <ChevronRight className="mt-1 size-4 shrink-0 text-[color:var(--pp-color-muted-text)] transition group-hover:translate-x-1" />
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{description}</p>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-teal-accent)]">{meta}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ResultGroup({ title, description, count, children }: { title: string; description: string; count: number; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-[color:var(--pp-color-muted-text)]">{description}</p>
        </div>
        <Badge variant="teal">{count} rezultata</Badge>
      </div>
      {children}
    </section>
  );
}

export function SearchContent({ providers, initialParams, resultsAnchorId }: SearchContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>(() => activeTabFromCategory(initialParams.category));
  const [query, setQuery] = useState('');
  const [city, setCity] = useState(initialParams.city || '');
  const [minPrice, setMinPrice] = useState(initialParams.min_price || '');
  const [maxPrice, setMaxPrice] = useState(initialParams.max_price || '');
  const [minRating, setMinRating] = useState(initialParams.min_rating || '');
  const [date, setDate] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      if (minRating && provider.rating < Number(minRating)) return false;
      if (verifiedOnly && !provider.verified) return false;
      if (query) {
        const haystack = `${provider.name} ${provider.city || ''} ${provider.bio || ''} ${provider.services.join(' ')}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [minRating, providers, query, verifiedOnly]);

  const serviceCount = filteredProviders.length;
  const counts: Record<SearchTab, number> = {
    sve: serviceCount + communityPosts.length + articles.length + petResults.length + lostAndAdoption.length,
    usluge: serviceCount,
    zajednica: communityPosts.length,
    blog: articles.length,
    ljubimci: petResults.length + lostAndAdoption.filter((item) => item.href === '/udomljavanje').length,
    izgubljeni: lostAndAdoption.filter((item) => item.href === '/izgubljeni').length,
  };

  const buildUrl = useCallback((tab: SearchTab = activeTab) => {
    const params = new URLSearchParams();
    if (tab !== 'sve') params.set('category', tab);
    if (city) params.set('city', city);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minRating) params.set('min_rating', minRating);
    const queryString = params.toString();
    return queryString ? `/pretraga?${queryString}` : '/pretraga';
  }, [activeTab, city, maxPrice, minPrice, minRating]);

  const applyFilters = useCallback(() => {
    router.push(buildUrl());
  }, [buildUrl, router]);

  const clearFilters = useCallback(() => {
    setQuery('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setDate('');
    setVerifiedOnly(false);
    router.push(activeTab === 'sve' ? '/pretraga' : `/pretraga?category=${activeTab}`);
  }, [activeTab, router]);

  const selectTab = (tab: SearchTab) => {
    setActiveTab(tab);
    router.push(buildUrl(tab));
  };

  const showServices = activeTab === 'sve' || activeTab === 'usluge';
  const showCommunity = activeTab === 'sve' || activeTab === 'zajednica';
  const showBlog = activeTab === 'sve' || activeTab === 'blog';
  const showPets = activeTab === 'sve' || activeTab === 'ljubimci';
  const showLost = activeTab === 'sve' || activeTab === 'izgubljeni';
  const hasResults = counts[activeTab] > 0;

  return (
    <main id={resultsAnchorId} data-petpark-route="pretraga" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/objavi-uslugu" size="sm">Dodaj uslugu</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[760px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[390px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" shadow="small" className="relative overflow-hidden p-6 sm:p-8 lg:p-9">
            <div className="absolute right-10 top-10 hidden size-28 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
            <div className="relative grid gap-7 xl:grid-cols-[1fr_500px] xl:items-end">
              <div>
                <Badge variant="orange"><Search className="size-3" /> Univerzalna pretraga</Badge>
                <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl lg:text-7xl">Pretraži PetPark</h1>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">
                  Pronađi usluge, savjete, ljubimce, objave i ljude iz zajednice.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <FilterChip active>Usluge</FilterChip>
                  <FilterChip>Zajednica</FilterChip>
                  <FilterChip>Blog</FilterChip>
                  <FilterChip>Izgubljeni ljubimci</FilterChip>
                  <FilterChip>Udomljavanje</FilterChip>
                </div>
              </div>

              <Card radius="28" tone="cream" shadow="small" className="p-4 sm:p-5">
                <form action="/pretraga" className="space-y-4">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                    <Input name="q" placeholder="Što tražite?" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-12" />
                  </label>
                  <label className="relative block">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-orange-primary)]" aria-hidden />
                    <Input name="city" placeholder="Grad ili kvart" value={city} onChange={(event) => setCity(event.target.value)} className="pl-12" />
                  </label>
                  <Button type="submit" size="lg" className="w-full"><Search className="size-5" /> Pretraži</Button>
                </form>
              </Card>
            </div>
          </Card>

          <Card radius="24" className="p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => selectTab(tab.key)}
                    aria-pressed={isActive}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-[var(--pp-radius-control)] px-4 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
                      isActive
                        ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]'
                        : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]',
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {tab.label}
                    <span className={cn('rounded-full px-2 py-0.5 text-xs', isActive ? 'bg-white/20' : 'bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-teal-accent)]')}>{counts[tab.key]}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <FilterPanel
                city={city}
                minPrice={minPrice}
                maxPrice={maxPrice}
                minRating={minRating}
                verifiedOnly={verifiedOnly}
                date={date}
                onCityChange={setCity}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onMinRatingChange={setMinRating}
                onVerifiedChange={setVerifiedOnly}
                onDateChange={setDate}
                onApply={applyFilters}
                onClear={clearFilters}
              />
            </aside>

            <div className="space-y-10">
              <div className="flex flex-col gap-3 rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-5 shadow-[var(--pp-shadow-small-card)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Rezultati</p>
                  <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{counts[activeTab]} pronađenih rezultata</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {city ? <Badge variant="orange"><MapPin className="size-3" /> {city}</Badge> : null}
                  {minRating ? <Badge variant="teal"><Star className="size-3" /> {minRating}+ ocjena</Badge> : null}
                  {verifiedOnly ? <Badge variant="success"><CheckCircle2 className="size-3" /> Verificirani</Badge> : null}
                </div>
              </div>

              {!hasResults ? (
                <Card radius="28" tone="sage" className="p-10 text-center">
                  <PawPrint className="mx-auto size-12 text-[color:var(--pp-color-orange-primary)]" aria-hidden />
                  <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Nema rezultata za ovu pretragu.</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Pokušajte promijeniti filtere ili pretražiti širi pojam.</p>
                  <Button onClick={clearFilters} className="mt-6" variant="secondary">Očisti filtere</Button>
                </Card>
              ) : null}

              {showServices ? (
                <ResultGroup title="Usluge i provideri" description="Sitteri, groomeri i treneri s profilima, cijenama i recenzijama." count={serviceCount}>
                  {filteredProviders.length ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {filteredProviders.map((provider) => <ServiceResultCard key={`${provider.category}-${provider.id}`} provider={provider} />)}
                    </div>
                  ) : (
                    <Card radius="24" tone="sage" className="p-6 text-sm font-semibold text-[color:var(--pp-color-muted-text)]">Nema rezultata za ovu pretragu.</Card>
                  )}
                </ResultGroup>
              ) : null}

              {showBlog ? (
                <ResultGroup title="Blog i savjeti" description="Kratki vodiči, edukacija i praktični članci za vlasnike ljubimaca." count={articles.length}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {articles.map((item) => <CompactResultCard key={item.title} {...item} icon={BookOpen} tone="cream" />)}
                  </div>
                </ResultGroup>
              ) : null}

              {showCommunity ? (
                <ResultGroup title="Zajednica" description="Pitanja, preporuke i odgovori drugih PetPark korisnika." count={communityPosts.length}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {communityPosts.map((item) => <CompactResultCard key={item.title} {...item} icon={MessageCircle} tone="sage" />)}
                  </div>
                </ResultGroup>
              ) : null}

              {showPets ? (
                <ResultGroup title="Ljubimci i udomljavanje" description="Pet Passport profili, kartoni i aktivni oglasi za udomljavanje." count={petResults.length + 1}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {petResults.map((item) => <CompactResultCard key={item.title} {...item} icon={Dog} tone="teal" />)}
                    <CompactResultCard {...lostAndAdoption[1]} icon={HeartHandshake} />
                  </div>
                </ResultGroup>
              ) : null}

              {showLost ? (
                <ResultGroup title="Izgubljeni i pronađeni" description="Hitne objave, lokacije i kontakti za pomoć u zajednici." count={1}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <CompactResultCard {...lostAndAdoption[0]} icon={Bell} tone="orange" />
                  </div>
                </ResultGroup>
              ) : null}

              <Card radius="28" tone="orange" className="p-6 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Badge variant="teal"><CalendarDays className="size-3" /> Sljedeći korak</Badge>
                    <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Niste našli što tražite?</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Objavite upit ili krenite direktno na marketplace usluga.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <ButtonLink href="/usluge" variant="secondary">Sve usluge <ArrowRight className="size-4" /></ButtonLink>
                    <ButtonLink href="/zajednica" variant="teal">Pitaj zajednicu</ButtonLink>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
