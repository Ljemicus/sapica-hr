'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Filter, MapIcon, Grid, LayoutList, SlidersHorizontal, X, MapPin, Star,
  Clock, Shield, Award, ArrowRight, PawPrint, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { SERVICE_LABELS, GROOMING_SERVICE_LABELS, TRAINING_TYPE_LABELS, CITIES, type ServiceType } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import type { UnifiedProvider, ProviderCategory } from './types';
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_BADGE_STYLES } from './types';

const MapView = dynamic(() => import('./map-view'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-2xl bg-accent animate-pulse flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <MapIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

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
}

const CATEGORY_TABS: { key: ProviderCategory | 'all'; emoji: string }[] = [
  { key: 'all', emoji: '🔍' },
  { key: 'sitter', emoji: '🐾' },
  { key: 'grooming', emoji: '✂️' },
  { key: 'dresura', emoji: '🎓' },
];

function getServiceLabel(service: string, category?: ProviderCategory): string {
  if (category === 'grooming') return GROOMING_SERVICE_LABELS[service as keyof typeof GROOMING_SERVICE_LABELS] || service;
  if (category === 'dresura') return TRAINING_TYPE_LABELS[service as keyof typeof TRAINING_TYPE_LABELS] || service;
  return SERVICE_LABELS[service as ServiceType] || service;
}

function getTranslatedServiceLabel(service: string, category: ProviderCategory | undefined, language: 'hr' | 'en'): string {
  if (language !== 'en') return getServiceLabel(service, category);

  const sitterLabels: Record<string, string> = {
    boarding: 'Boarding',
    walking: 'Dog walking',
    'house-sitting': 'House sitting',
    'drop-in': 'Drop-in visit',
    daycare: 'Day care',
  };

  const groomingLabels: Record<string, string> = {
    sisanje: 'Haircut',
    kupanje: 'Bath',
    trimanje: 'Hand stripping',
    nokti: 'Nail trim',
    cetkanje: 'Brushing',
  };

  const trainingLabels: Record<string, string> = {
    osnovna: 'Basic obedience',
    napredna: 'Advanced training',
    agility: 'Agility',
    ponasanje: 'Behavior training',
    stenci: 'Puppy training',
  };

  if (category === 'grooming') return groomingLabels[service] || service;
  if (category === 'dresura') return trainingLabels[service] || service;
  return sitterLabels[service] || service;
}

interface SearchFilterPanelProps {
  city: string;
  service: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  activeFilterCount: number;
  category: ProviderCategory | 'all';
  onCityChange: (v: string) => void;
  onServiceChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onMinRatingChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

function SearchFilterPanel({
  city, service, minPrice, maxPrice, minRating, activeFilterCount, category,
  onCityChange, onServiceChange, onMinPriceChange, onMaxPriceChange, onMinRatingChange,
  onApply, onClear,
}: SearchFilterPanelProps) {
  const { language } = useLanguage();
  const copy = language === 'en'
    ? {
        city: 'City',
        chooseCity: 'All cities',
        serviceType: 'Service type',
        clearSelection: 'Clear selection',
        priceRange: 'Price range (€)',
        minPlaceholder: 'Min',
        maxPlaceholder: 'Max',
        minRating: 'Minimum rating',
        noMinRating: 'Any rating',
        showResults: 'Show results',
      }
    : {
        city: 'Grad',
        chooseCity: 'Svi gradovi',
        serviceType: 'Vrsta usluge',
        clearSelection: 'Poništi odabir',
        priceRange: 'Raspon cijena (€)',
        minPlaceholder: 'Min',
        maxPlaceholder: 'Max',
        minRating: 'Minimalna ocjena',
        noMinRating: 'Bilo koja',
        showResults: 'Prikaži rezultate',
      };

  const serviceOptions = category === 'sitter'
    ? Object.entries(SERVICE_LABELS) as [string, string][]
    : category === 'grooming'
    ? Object.entries(GROOMING_SERVICE_LABELS) as [string, string][]
    : category === 'dresura'
    ? Object.entries(TRAINING_TYPE_LABELS) as [string, string][]
    : null;

  return (
    <div className="space-y-7">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{copy.city}</Label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="premium-select"
        >
          <option value="">{copy.chooseCity}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {serviceOptions && (
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{copy.serviceType}</Label>
          <div className="space-y-1">
            {serviceOptions.map(([key]) => (
              <label key={key} className="premium-radio-option group">
                <input
                  type="radio"
                  name="service"
                  value={key}
                  checked={service === key}
                  onChange={(e) => onServiceChange(e.target.value)}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-sm group-hover:text-foreground transition-colors">
                  {getTranslatedServiceLabel(key, category === 'all' ? undefined : category, language)}
                </span>
              </label>
            ))}
            {service && (
              <button onClick={() => onServiceChange('')} className="text-xs text-warm-orange hover:underline mt-2 pl-3">
                {copy.clearSelection}
              </button>
            )}
          </div>
        </div>
      )}

      {(category === 'all' || category === 'sitter') && (
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{copy.priceRange}</Label>
          <div className="flex gap-3 items-center">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={copy.minPlaceholder}
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full rounded-xl border-border/60 focus:border-orange-300"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={copy.maxPlaceholder}
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full rounded-xl border-border/60 focus:border-orange-300"
            />
          </div>
        </div>
      )}

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{copy.minRating}</Label>
        <select
          value={minRating}
          onChange={(e) => onMinRatingChange(e.target.value)}
          className="premium-select"
        >
          <option value="">{copy.noMinRating}</option>
          <option value="4.5">4.5+</option>
          <option value="4">4.0+</option>
          <option value="3.5">3.5+</option>
          <option value="3">3.0+</option>
        </select>
      </div>

      <div className="pt-2">
        <Button onClick={onApply} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover rounded-xl h-11 font-semibold">
          {copy.showResults}
        </Button>
        {activeFilterCount > 0 && (
          <button onClick={onClear} className="w-full text-center text-xs text-muted-foreground hover:text-warm-orange mt-3 transition-colors">
            {language === 'en' ? 'Clear all filters' : 'Očisti sve filtere'}
          </button>
        )}
      </div>
    </div>
  );
}

const gradients = [
  'from-orange-400 to-amber-300',
  'from-blue-400 to-cyan-300',
  'from-purple-400 to-pink-300',
  'from-green-400 to-emerald-300',
  'from-rose-400 to-orange-300',
  'from-teal-400 to-cyan-300',
];

function ProviderCard({ provider }: { provider: UnifiedProvider }) {
  const { language } = useLanguage();
  const gradientIndex = provider.name.charCodeAt(0) % gradients.length;
  const copy = language === 'en'
    ? {
        from: 'from',
        verified: 'Verified',
        topPick: 'Top pick',
        certified: 'Certified',
        trusted: 'Trusted contact',
        viewProfile: 'View profile',
        categoryLabels: {
          sitter: 'Sitters',
          grooming: 'Grooming',
          dresura: 'Dog training',
        } as Record<ProviderCategory, string>,
      }
    : {
        from: 'već od',
        verified: 'Verificiran',
        topPick: 'Top izbor',
        certified: 'Certificiran',
        trusted: 'Provjeren kontakt',
        viewProfile: 'Pogledaj profil',
        categoryLabels: CATEGORY_LABELS,
      };

  return (
    <Link href={provider.profileUrl}>
      <article className="community-section-card group overflow-hidden cursor-pointer">
        {/* Card header — gradient with avatar */}
        <div className={`relative h-48 bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 paw-pattern opacity-[0.07]" />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />

          {/* Avatar */}
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
            <AvatarImage src={provider.avatarUrl || ''} alt={provider.name} />
            <AvatarFallback className="bg-white text-gray-700 text-2xl font-bold">
              {provider.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Category badge — top left */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 shadow-sm border ${CATEGORY_BADGE_STYLES[provider.category]}`}>
              {CATEGORY_EMOJI[provider.category]} {copy.categoryLabels[provider.category]}
            </span>
          </div>

          {/* Trust badges — top right */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            {provider.verified && (
              <span className="inline-flex items-center bg-white/90 text-blue-600 text-xs font-medium shadow-sm rounded-full px-2.5 py-1">
                <Shield className="h-3 w-3 mr-1" />
                {copy.verified}
              </span>
            )}
            {provider.superhost && (
              <span className="inline-flex items-center bg-white/90 text-amber-600 text-xs font-semibold shadow-sm rounded-full px-2.5 py-1">
                <Award className="h-3 w-3 mr-1" />
                {copy.topPick}
              </span>
            )}
            {provider.certified && !provider.superhost && (
              <span className="inline-flex items-center bg-white/90 text-amber-600 text-xs font-semibold shadow-sm rounded-full px-2.5 py-1">
                <Award className="h-3 w-3 mr-1" />
                {copy.certified}
              </span>
            )}
          </div>

          {/* Bottom info — city + price */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
            <span className="text-white/90 text-xs font-medium drop-shadow-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {provider.city}
            </span>
            {provider.lowestPrice != null && (
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-orange-600 shadow-sm">
                {copy.from} {provider.lowestPrice}&euro;
              </span>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 space-y-4">
          {/* Name + Rating */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg font-[var(--font-heading)] group-hover:text-warm-orange transition-colors">
                {provider.name}
              </h3>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{provider.rating.toFixed(1)}</span>
                <span className="text-xs text-amber-600/60 dark:text-amber-500/60">({provider.reviews})</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {provider.bio}
          </p>

          {/* Service tags */}
          <div className="flex flex-wrap gap-1.5">
            {provider.services.slice(0, 3).map((s) => (
              <span key={s} className="inline-flex items-center text-xs font-medium bg-accent dark:bg-accent/50 text-accent-foreground px-2.5 py-1 rounded-lg">
                {getTranslatedServiceLabel(s, provider.category, language)}
              </span>
            ))}
            {provider.services.length > 3 && (
              <span className="inline-flex items-center text-xs font-medium bg-accent dark:bg-accent/50 text-muted-foreground px-2.5 py-1 rounded-lg">
                +{provider.services.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="text-xs text-muted-foreground">
              {provider.responseTime ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {provider.responseTime}
                </span>
              ) : provider.certificates && provider.certificates.length > 0 ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{provider.certificates[0]}</span>
              ) : provider.verified ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{copy.trusted}</span>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warm-orange group-hover:gap-2.5 transition-all">
              {copy.viewProfile}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function SearchContent({ providers, initialParams, forcedLanguage }: SearchContentProps & { forcedLanguage?: 'hr' | 'en' }) {
  const router = useRouter();
  const { language } = useLanguage();
  const activeLanguage = forcedLanguage || language;
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const activeCategory = (initialParams.category || 'all') as ProviderCategory | 'all';
  const [city, setCity] = useState(initialParams.city || '');
  const [service, setService] = useState(initialParams.service || '');
  const [minPrice, setMinPrice] = useState(initialParams.min_price || '');
  const [maxPrice, setMaxPrice] = useState(initialParams.max_price || '');
  const [minRating, setMinRating] = useState(initialParams.min_rating || '');
  const [sort, setSort] = useState(initialParams.sort || 'rating');
  const basePath = activeLanguage === 'en' ? '/pretraga/en' : '/pretraga';

  const buildUrl = useCallback((overrides?: Record<string, string | undefined>) => {
    const current: Record<string, string> = {};
    const cat = activeCategory as string;
    if (cat !== 'all') current.category = cat;
    if (city) current.city = city;
    if (service) current.service = service;
    if (minPrice) current.min_price = minPrice;
    if (maxPrice) current.max_price = maxPrice;
    if (minRating) current.min_rating = minRating;
    if (sort && sort !== 'rating') current.sort = sort;

    const merged = { ...current, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  }, [activeCategory, basePath, city, service, minPrice, maxPrice, minRating, sort]);

  const applyFilters = useCallback(() => {
    router.push(buildUrl());
  }, [router, buildUrl]);

  const clearFilters = () => {
    setCity('');
    setService('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('rating');
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory);
    router.push(`${basePath}${params.toString() ? '?' + params.toString() : ''}`);
  };

  const setCategory = (cat: ProviderCategory | 'all') => {
    setService('');
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    if (city) params.set('city', city);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minRating) params.set('min_rating', minRating);
    if (sort && sort !== 'rating') params.set('sort', sort);
    router.push(`${basePath}${params.toString() ? '?' + params.toString() : ''}`);
  };

  let filtered = providers;
  if (minRating) {
    const minR = Number(minRating);
    filtered = filtered.filter((p) => p.rating >= minR);
  }

  const activeFilterCount = [city, service, minPrice, maxPrice, minRating].filter(Boolean).length;
  const localeCityLinks = activeLanguage === 'en'
    ? {
        zagreb: '/cuvanje-pasa-zagreb/en',
        rijeka: '/cuvanje-pasa-rijeka/en',
        split: '/cuvanje-pasa-split/en',
      }
    : {
        zagreb: '/cuvanje-pasa-zagreb',
        rijeka: '/cuvanje-pasa-rijeka',
        split: '/cuvanje-pasa-split',
      };

  const copy = activeLanguage === 'en'
    ? {
        tabs: { all: 'All', sitter: 'Sitters', grooming: 'Grooming', dresura: 'Dog training' },
        heroKicker: 'Discover',
        heroTitle: {
          all: 'Find the right care\nfor your pet.',
          sitter: 'Find a trusted\npet sitter.',
          grooming: 'Find a professional\ngroomer.',
          dresura: 'Find a certified\ndog trainer.',
        },
        heroSub: {
          all: 'Browse verified sitters, groomers, and trainers across Croatia. Every profile is reviewed for quality.',
          sitter: 'Trusted sitters who treat your pet like family — at their home or yours.',
          grooming: 'Professional coat care, bathing, and styling for your beloved companion.',
          dresura: 'Certified trainers for obedience, socialisation, and agility.',
        },
        profilesMatch: filtered.length === 1 ? 'profile matches' : 'profiles match',
        filters: 'Filters',
        narrowSearch: 'Refine search',
        sortBest: 'Top rated',
        sortMostReviews: 'Most reviews',
        sortLowestPrice: 'Lowest price first',
        rating: 'rating',
        from: 'from',
        upTo: 'up to',
        clearFilters: 'Clear filters',
        emptyTitle: 'No great matches yet',
        emptyDescription: 'Try another city or remove a few filters — there are probably more results just around the corner.',
        exploreCities: 'Explore by city',
        exploreCitiesSub: 'Dedicated city guides with local context and neighbourhood recommendations.',
      }
    : {
        tabs: { all: 'Sve', sitter: 'Sitteri', grooming: 'Grooming', dresura: 'Školovanje pasa' },
        heroKicker: 'Otkrijte',
        heroTitle: {
          all: 'Pronađite pravu brigu\nza svog ljubimca.',
          sitter: 'Pronađite pouzdanog\nčuvara ljubimaca.',
          grooming: 'Pronađite profesionalnog\ngroomera.',
          dresura: 'Pronađite certificiranog\ntrenera za pse.',
        },
        heroSub: {
          all: 'Pretražite verificirane sittere, groomere i trenere diljem Hrvatske. Svaki profil je provjeren.',
          sitter: 'Pouzdani sitteri koji se brinu za vašeg ljubimca kao za svog — u svom domu ili vašem.',
          grooming: 'Profesionalna njega dlake, kupanje i styling za vašeg voljenog ljubimca.',
          dresura: 'Certificirani treneri za poslušnost, socijalizaciju i agility.',
        },
        profilesMatch: filtered.length === 1 ? 'profil odgovara' : 'profila odgovara',
        filters: 'Filteri',
        narrowSearch: 'Suzi pretragu',
        sortBest: 'Najbolje ocijenjeni',
        sortMostReviews: 'Najviše recenzija',
        sortLowestPrice: 'Najniža cijena prvo',
        rating: 'ocjena',
        from: 'od',
        upTo: 'do',
        clearFilters: 'Očisti filtere',
        emptyTitle: 'Nismo našli dobar match',
        emptyDescription: 'Promijenite grad ili maknite neke filtere — vjerojatno ima više rezultata odmah iza ugla.',
        exploreCities: 'Istražite po gradovima',
        exploreCitiesSub: 'Posvećeni gradski vodiči s lokalnim kontekstom i preporukama za kvartove.',
      };

  return (
    <div>
      {/* ══════════════════════════════════════════
          EDITORIAL HERO
          ══════════════════════════════════════════ */}
      <section className="relative browse-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <p className="section-kicker animate-fade-in-up">
              {copy.heroKicker}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6 font-[var(--font-heading)] whitespace-pre-line animate-fade-in-up delay-100">
              {copy.heroTitle[activeCategory]}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up delay-200">
              {copy.heroSub[activeCategory]}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORY TABS
          ══════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 -mt-5 relative z-10">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                data-active={isActive}
                className={`filter-pill flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-warm-orange text-white'
                    : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{copy.tabs[tab.key]}</span>
                {isActive && (
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-0.5">
                    {filtered.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TOOLBAR
          ══════════════════════════════════════════ */}
      <div className="sticky top-14 z-30 glass-strong border-b border-border/50">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> {copy.profilesMatch}
              {city && <span className="text-warm-orange"> · {city}</span>}
            </p>
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <Sheet>
                <SheetTrigger render={<Button variant="outline" size="sm" />} className="md:hidden relative rounded-xl">
                  <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                  {copy.filters}
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetTitle className="mb-6 font-[var(--font-heading)]">{copy.narrowSearch}</SheetTitle>
                  <SearchFilterPanel
                    city={city} service={service} minPrice={minPrice} maxPrice={maxPrice} minRating={minRating}
                    activeFilterCount={activeFilterCount} category={activeCategory}
                    onCityChange={setCity} onServiceChange={setService} onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice} onMinRatingChange={setMinRating}
                    onApply={applyFilters} onClear={clearFilters}
                  />
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setTimeout(applyFilters, 0); }}
                className="h-9 rounded-xl border border-border/60 bg-white dark:bg-card px-3 text-sm focus:border-orange-300 shadow-sm"
              >
                <option value="rating">{copy.sortBest}</option>
                <option value="reviews">{copy.sortMostReviews}</option>
                <option value="price">{copy.sortLowestPrice}</option>
              </select>

              {/* View toggles */}
              <div className="hidden sm:flex items-center border border-border/60 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => { setShowMap(false); setViewMode('grid'); }}
                  className={`p-2.5 transition-colors ${!showMap && viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setShowMap(false); setViewMode('list'); }}
                  className={`p-2.5 transition-colors ${!showMap && viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`p-2.5 transition-colors ${showMap ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'}`}
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile map toggle */}
              <Button
                variant={showMap ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className={`sm:hidden rounded-xl ${showMap ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                {showMap ? <Grid className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ACTIVE FILTERS
          ══════════════════════════════════════════ */}
      {activeFilterCount > 0 && (
        <div className="container mx-auto px-6 md:px-10 lg:px-16 pt-6">
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {city && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                <MapPin className="h-3 w-3" />
                {city}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setCity(''); applyFilters(); }} />
              </Badge>
            )}
            {service && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                {getTranslatedServiceLabel(service, activeCategory === 'all' ? undefined : activeCategory, language)}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setService(''); applyFilters(); }} />
              </Badge>
            )}
            {minRating && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                {minRating}+ {copy.rating}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setMinRating(''); applyFilters(); }} />
              </Badge>
            )}
            {minPrice && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                {copy.from} {minPrice}&euro;
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setMinPrice(''); applyFilters(); }} />
              </Badge>
            )}
            {maxPrice && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                {copy.upTo} {maxPrice}&euro;
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setMaxPrice(''); applyFilters(); }} />
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-warm-orange hover:underline self-center ml-1">
              {copy.clearFilters}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10">
        <div className="flex gap-10">
          {/* Desktop filter sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32 filter-panel rounded-2xl p-6 border border-border/30 shadow-sm">
              <h2 className="font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                {copy.narrowSearch}
              </h2>
              <SearchFilterPanel
                city={city} service={service} minPrice={minPrice} maxPrice={maxPrice} minRating={minRating}
                activeFilterCount={activeFilterCount} category={activeCategory}
                onCityChange={setCity} onServiceChange={setService} onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice} onMinRatingChange={setMinRating}
                onApply={applyFilters} onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {showMap ? (
              <div className="h-[600px] rounded-2xl overflow-hidden border border-border/30 shadow-sm animate-fade-in">
                <MapView providers={filtered} />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={PawPrint}
                title={copy.emptyTitle}
                description={copy.emptyDescription}
                action={
                  <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 hover:text-orange-600 rounded-xl">
                    {copy.clearFilters}
                  </Button>
                }
              />
            ) : (
              <div className={`animate-fade-in ${
                viewMode === 'list'
                  ? 'space-y-5'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7'
              }`}>
                {filtered.map((provider) => (
                  <ProviderCard key={`${provider.category}-${provider.id}`} provider={provider} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          EXPLORE BY CITY — EDITORIAL
          ══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-warm-section">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="mb-10">
            <p className="section-kicker">
              {copy.exploreCities}
            </p>
            <p className="text-base text-muted-foreground max-w-lg">
              {copy.exploreCitiesSub}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Zagreb', href: localeCityLinks.zagreb, color: 'hover:border-orange-300 hover:text-orange-600' },
              { name: 'Rijeka', href: localeCityLinks.rijeka, color: 'hover:border-teal-300 hover:text-teal-600' },
              { name: 'Split', href: localeCityLinks.split, color: 'hover:border-blue-300 hover:text-blue-600' },
            ].map((c) => (
              <Link
                key={c.name}
                href={c.href}
                className={`group flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card transition-all duration-300 hover:shadow-md ${c.color}`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent">
                  <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-current transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold font-[var(--font-heading)]">{c.name}</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-current group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export { Skeleton as SitterSkeleton };
