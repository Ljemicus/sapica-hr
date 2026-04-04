'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Filter, MapIcon, Grid, LayoutList, SlidersHorizontal, X, MapPin, Star,
  Clock, Shield, Award, ArrowRight, PawPrint,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
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
    <div className="h-[600px] rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
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

const TITLE_MAP: Record<string, string> = {
  all: 'Pronađi uslugu za svog ljubimca',
  sitter: 'Pronađi sittera',
  grooming: 'Pronađi groomera',
  dresura: 'Pronađi trenera za pse',
};

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
        chooseCity: 'Choose a city',
        serviceType: 'Service type',
        clearSelection: 'Clear selection',
        priceRange: 'Price range (€)',
        minPlaceholder: 'Min',
        maxPlaceholder: 'Max',
        minRating: 'Minimum rating',
        noMinRating: 'No minimum rating',
        showResults: 'Show results',
      }
    : {
        city: 'Grad',
        chooseCity: 'Odaberi grad',
        serviceType: 'Vrsta usluge',
        clearSelection: 'Poništi odabir',
        priceRange: 'Raspon cijena (€)',
        minPlaceholder: 'Min',
        maxPlaceholder: 'Max',
        minRating: 'Minimalna ocjena',
        noMinRating: 'Bez minimalne ocjene',
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
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">{copy.city}</Label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
        >
          <option value="">{copy.chooseCity}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {serviceOptions && (
        <div>
          <Label className="text-sm font-medium mb-2 block">{copy.serviceType}</Label>
          <div className="space-y-2">
            {serviceOptions.map(([key]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="service"
                  value={key}
                  checked={service === key}
                  onChange={(e) => onServiceChange(e.target.value)}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-sm group-hover:text-orange-600 transition-colors">
                  {getTranslatedServiceLabel(key, category === 'all' ? undefined : category, language)}
                </span>
              </label>
            ))}
            {service && (
              <button onClick={() => onServiceChange('')} className="text-xs text-orange-500 hover:underline mt-1">
                {copy.clearSelection}
              </button>
            )}
          </div>
        </div>
      )}

      {(category === 'all' || category === 'sitter') && (
        <div>
          <Label className="text-sm font-medium mb-2 block">{copy.priceRange}</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={copy.minPlaceholder}
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full focus:border-orange-300"
            />
            <span className="self-center text-muted-foreground">—</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={copy.maxPlaceholder}
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full focus:border-orange-300"
            />
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium mb-2 block">{copy.minRating}</Label>
        <select
          value={minRating}
          onChange={(e) => onMinRatingChange(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
        >
          <option value="">{copy.noMinRating}</option>
          <option value="4.5">4.5+</option>
          <option value="4">4.0+</option>
          <option value="3.5">3.5+</option>
          <option value="3">3.0+</option>
        </select>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover">
          {copy.showResults}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={onClear} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
            <X className="h-4 w-4" />
          </Button>
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
        verified: 'Verified profile',
        topPick: 'Top pick',
        certified: 'Certified profile',
        trusted: 'Trusted contact',
        viewDetails: 'View details',
        viewProfile: 'View profile',
        categoryLabels: {
          sitter: 'Sitters',
          grooming: 'Grooming',
          dresura: 'Dog training',
        } as Record<ProviderCategory, string>,
      }
    : {
        from: 'već od',
        verified: 'Verificiran profil',
        topPick: 'Top izbor',
        certified: 'Certificiran profil',
        trusted: 'Provjeren kontakt',
        viewDetails: 'Pogledaj detalje',
        viewProfile: 'Pogledaj profil',
        categoryLabels: CATEGORY_LABELS,
      };

  return (
    <Link href={provider.profileUrl}>
      <Card className="group card-hover overflow-hidden cursor-pointer border-0 shadow-sm rounded-2xl">
        <CardContent className="p-0">
          <div className={`relative h-44 bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 paw-pattern opacity-10" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
              <div className="text-white/90 text-xs font-medium drop-shadow-sm">
                {provider.city}
              </div>
              {provider.lowestPrice != null && (
                <div className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-orange-600 shadow-sm">
                  {copy.from} {provider.lowestPrice}&euro;
                </div>
              )}
            </div>
            <Avatar className="h-22 w-22 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AvatarImage src={provider.avatarUrl || ''} alt={provider.name} />
              <AvatarFallback className="bg-white/95 text-gray-700 text-2xl font-bold">
                {provider.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute top-3 left-3">
              <Badge className={`text-xs shadow-sm rounded-full px-2.5 border ${CATEGORY_BADGE_STYLES[provider.category]}`}>
                {CATEGORY_EMOJI[provider.category]} {copy.categoryLabels[provider.category]}
              </Badge>
            </div>
            <div className="absolute top-3 right-3 flex gap-1.5">
              {provider.verified && (
                <Badge className="bg-white/90 text-blue-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
                  <Shield className="h-3 w-3 mr-1" />
                  {copy.verified}
                </Badge>
              )}
              {provider.superhost && (
                <Badge className="bg-white/90 text-amber-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5 font-semibold">
                  <Award className="h-3 w-3 mr-1" />
                  {copy.topPick}
                </Badge>
              )}
              {provider.certified && !provider.superhost && (
                <Badge className="bg-white/90 text-amber-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5 font-semibold">
                  <Award className="h-3 w-3 mr-1" />
                  {copy.certified}
                </Badge>
              )}
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">
                  {provider.name}
                </h3>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-700">{provider.rating.toFixed(1)}</span>
                  <span className="text-xs text-amber-600/70">({provider.reviews})</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {provider.city}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {provider.bio}
            </p>
            <div className="flex flex-wrap gap-1">
              {provider.services.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs font-normal bg-gray-50">
                  {getTranslatedServiceLabel(s, provider.category, language)}
                </Badge>
              ))}
              {provider.services.length > 3 && (
                <Badge variant="secondary" className="text-xs font-normal bg-gray-50">
                  +{provider.services.length - 3}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {provider.responseTime ? (
                  <>
                    <Clock className="h-3 w-3" />
                    {provider.responseTime}
                  </>
                ) : provider.certificates && provider.certificates.length > 0 ? (
                  <span className="text-xs text-indigo-600 font-medium">{provider.certificates[0]}</span>
                ) : provider.verified ? (
                  <span className="text-xs text-emerald-600 font-medium">{copy.trusted}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">{copy.viewDetails}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-orange-500">{copy.viewProfile}</span>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SearchContent({ providers, initialParams }: SearchContentProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const activeCategory = (initialParams.category || 'all') as ProviderCategory | 'all';
  const [city, setCity] = useState(initialParams.city || '');
  const [service, setService] = useState(initialParams.service || '');
  const [minPrice, setMinPrice] = useState(initialParams.min_price || '');
  const [maxPrice, setMaxPrice] = useState(initialParams.max_price || '');
  const [minRating, setMinRating] = useState(initialParams.min_rating || '');
  const [sort, setSort] = useState(initialParams.sort || 'rating');
  const basePath = language === 'en' ? '/pretraga/en' : '/pretraga';

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
  const localeCityLinks = language === 'en'
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

  const copy = language === 'en'
    ? {
        tabs: { all: 'All', sitter: 'Sitters', grooming: 'Grooming', dresura: 'Dog training' },
        titles: {
          all: 'Find the right service for your pet',
          sitter: 'Find a sitter',
          grooming: 'Find a groomer',
          dresura: 'Find a dog trainer',
        },
        profilesMatch: filtered.length === 1 ? 'profile matches your search' : 'profiles match your search',
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
      }
    : {
        tabs: { all: 'Sve', sitter: 'Sitteri', grooming: 'Grooming', dresura: 'Školovanje pasa' },
        titles: TITLE_MAP,
        profilesMatch: filtered.length === 1 ? 'profil odgovara pretrazi' : 'profila odgovara pretrazi',
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
      };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 -mt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{copy.tabs[tab.key]}</span>
                {isActive && (
                  <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
                    {filtered.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky top-14 z-30 -mx-4 px-4 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{copy.titles[activeCategory]}</h1>
            <p className="text-muted-foreground text-sm">
              {filtered.length} {copy.profilesMatch}
              {city && ` · ${city}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />} className="md:hidden relative">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                {copy.filters}
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetTitle className="mb-4">{copy.narrowSearch}</SheetTitle>
                <SearchFilterPanel
                  city={city} service={service} minPrice={minPrice} maxPrice={maxPrice} minRating={minRating}
                  activeFilterCount={activeFilterCount} category={activeCategory}
                  onCityChange={setCity} onServiceChange={setService} onMinPriceChange={setMinPrice}
                  onMaxPriceChange={setMaxPrice} onMinRatingChange={setMinRating}
                  onApply={applyFilters} onClear={clearFilters}
                />
              </SheetContent>
            </Sheet>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setTimeout(applyFilters, 0); }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-orange-300"
            >
              <option value="rating">{copy.sortBest}</option>
              <option value="reviews">{copy.sortMostReviews}</option>
              <option value="price">{copy.sortLowestPrice}</option>
            </select>

            <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => { setShowMap(false); setViewMode('grid'); }}
                className={`p-2 transition-colors ${!showMap && viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setShowMap(false); setViewMode('list'); }}
                className={`p-2 transition-colors ${!showMap && viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowMap(true)}
                className={`p-2 transition-colors ${showMap ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant={showMap ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className={`sm:hidden ${showMap ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
            >
              {showMap ? <Grid className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
          {city && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              <MapPin className="h-3 w-3" />
              {city}
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setCity(''); applyFilters(); }} />
            </Badge>
          )}
          {service && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              {getTranslatedServiceLabel(service, activeCategory === 'all' ? undefined : activeCategory, language)}
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setService(''); applyFilters(); }} />
            </Badge>
          )}
          {minRating && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              {minRating}+ {copy.rating}
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setMinRating(''); applyFilters(); }} />
            </Badge>
          )}
          {minPrice && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              {copy.from} {minPrice}&euro;
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setMinPrice(''); applyFilters(); }} />
            </Badge>
          )}
          {maxPrice && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              {copy.upTo} {maxPrice}&euro;
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setMaxPrice(''); applyFilters(); }} />
            </Badge>
          )}
          <button onClick={clearFilters} className="text-xs text-orange-500 hover:underline self-center ml-1">
            {copy.clearFilters}
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Card className="p-5 sticky top-32 border-0 shadow-sm rounded-2xl">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
              <Filter className="h-4 w-4" />
              {copy.narrowSearch}
            </h2>
            <SearchFilterPanel
              city={city} service={service} minPrice={minPrice} maxPrice={maxPrice} minRating={minRating}
              activeFilterCount={activeFilterCount} category={activeCategory}
              onCityChange={setCity} onServiceChange={setService} onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice} onMinRatingChange={setMinRating}
              onApply={applyFilters} onClear={clearFilters}
            />
          </Card>
        </aside>

        <div className="flex-1 min-w-0">
          {showMap ? (
            <div className="h-[600px] rounded-xl overflow-hidden border shadow-sm animate-fade-in">
              <MapView providers={filtered} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={PawPrint}
              title={copy.emptyTitle}
              description={copy.emptyDescription}
              action={
                <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 hover:text-orange-600">
                  {copy.clearFilters}
                </Button>
              }
            />
          ) : (
            <div className={`animate-fade-in ${
              viewMode === 'list'
                ? 'space-y-4'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            }`}>
              {filtered.map((provider) => (
                <ProviderCard key={`${provider.category}-${provider.id}`} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-bold mb-4 font-[var(--font-heading)]">{copy.exploreCities}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href={localeCityLinks.zagreb} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium hover:border-orange-300 hover:text-orange-600 transition-colors">
            <MapPin className="h-3.5 w-3.5" /> Zagreb
          </Link>
          <Link href={localeCityLinks.rijeka} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium hover:border-teal-300 hover:text-teal-600 transition-colors">
            <MapPin className="h-3.5 w-3.5" /> Rijeka
          </Link>
          <Link href={localeCityLinks.split} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-colors">
            <MapPin className="h-3.5 w-3.5" /> Split
          </Link>
        </div>
      </div>
    </div>
  );
}

export { Skeleton as SitterSkeleton };
