'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Filter, MapIcon, Grid, LayoutList, SlidersHorizontal, X, Search as SearchIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SitterCard } from '@/components/shared/sitter-card';
import { EmptyState } from '@/components/shared/empty-state';
import { SERVICE_LABELS, CITIES, type ServiceType, type SitterProfile, type User } from '@/lib/types';
import { PawPrint } from 'lucide-react';

const MapView = dynamic(() => import('./map-view'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <MapIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Učitavanje karte...</p>
      </div>
    </div>
  ),
});

type SitterWithUser = SitterProfile & { user: User };

interface SearchContentProps {
  sitters: SitterWithUser[];
  initialParams: {
    city?: string;
    service?: string;
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    sort?: string;
  };
}

function SitterSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </Card>
  );
}

export function SearchContent({ sitters, initialParams }: SearchContentProps) {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [city, setCity] = useState(initialParams.city || '');
  const [service, setService] = useState(initialParams.service || '');
  const [minPrice, setMinPrice] = useState(initialParams.min_price || '');
  const [maxPrice, setMaxPrice] = useState(initialParams.max_price || '');
  const [minRating, setMinRating] = useState(initialParams.min_rating || '');
  const [sort, setSort] = useState(initialParams.sort || 'rating');

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (service) params.set('service', service);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minRating) params.set('min_rating', minRating);
    if (sort) params.set('sort', sort);
    router.push(`/pretraga?${params.toString()}`);
  }, [city, service, minPrice, maxPrice, minRating, sort, router]);

  const clearFilters = () => {
    setCity('');
    setService('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('rating');
    router.push('/pretraga');
  };

  const activeFilterCount = [city, service, minPrice, maxPrice, minRating].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">Grad</Label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
        >
          <option value="">Svi gradovi</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Vrsta usluge</Label>
        <div className="space-y-2">
          {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="service"
                value={key}
                checked={service === key}
                onChange={(e) => setService(e.target.value)}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm group-hover:text-orange-600 transition-colors">{label}</span>
            </label>
          ))}
          {service && (
            <button onClick={() => setService('')} className="text-xs text-orange-500 hover:underline mt-1">
              Poništi odabir
            </button>
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Raspon cijena (€)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full focus:border-orange-300"
          />
          <span className="self-center text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full focus:border-orange-300"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Minimalna ocjena</Label>
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
        >
          <option value="">Sve ocjene</option>
          <option value="4.5">4.5+</option>
          <option value="4">4.0+</option>
          <option value="3.5">3.5+</option>
          <option value="3">3.0+</option>
        </select>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover">
          Primijeni filtere
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={clearFilters} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sticky Search Header */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-6 -mt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pretraži sittere</h1>
            <p className="text-muted-foreground text-sm">
              {sitters.length} {sitters.length === 1 ? 'sitter pronađen' : 'sittera pronađeno'}
              {city && ` u gradu ${city}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />} className="md:hidden relative">
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Filteri
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetTitle className="mb-4">Filteri</SheetTitle>
                <FilterPanel />
              </SheetContent>
            </Sheet>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setTimeout(applyFilters, 0); }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-orange-300"
            >
              <option value="rating">Po ocjeni</option>
              <option value="reviews">Po broju recenzija</option>
              <option value="price">Po cijeni</option>
            </select>

            {/* View toggle */}
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

      {/* Active filters */}
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
              {SERVICE_LABELS[service as ServiceType]}
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setService(''); applyFilters(); }} />
            </Badge>
          )}
          {minRating && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              {minRating}+ zvjezdica
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setMinRating(''); applyFilters(); }} />
            </Badge>
          )}
          <button onClick={clearFilters} className="text-xs text-orange-500 hover:underline self-center ml-1">
            Ukloni sve
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Card className="p-5 sticky top-32 border-0 shadow-sm">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filteri
            </h2>
            <FilterPanel />
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {showMap ? (
            <div className="h-[600px] rounded-xl overflow-hidden border shadow-sm animate-fade-in">
              <MapView sitters={sitters} />
            </div>
          ) : sitters.length === 0 ? (
            <EmptyState
              icon={PawPrint}
              title="Nema pronađenih sittera"
              description="Pokušajte promijeniti filtere ili pretražiti u drugom gradu."
              action={
                <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 hover:text-orange-600">
                  Poništi filtere
                </Button>
              }
            />
          ) : (
            <div className={`animate-fade-in ${
              viewMode === 'list'
                ? 'space-y-4'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
            }`}>
              {sitters.map((sitter) => (
                <SitterCard key={sitter.user_id} profile={sitter} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
