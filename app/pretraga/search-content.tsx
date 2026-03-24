'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Filter, MapIcon, Grid, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { SitterCard } from '@/components/shared/sitter-card';
import { EmptyState } from '@/components/shared/empty-state';
import { SERVICE_LABELS, CITIES, type ServiceType, type SitterProfile, type User } from '@/lib/types';
import { Search as SearchIcon, PawPrint } from 'lucide-react';

const MapView = dynamic(() => import('./map-view'), { ssr: false });

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

export function SearchContent({ sitters, initialParams }: SearchContentProps) {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
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
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="service"
                value={key}
                checked={service === key}
                onChange={(e) => setService(e.target.value)}
                className="accent-orange-500"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
          {service && (
            <button onClick={() => setService('')} className="text-xs text-orange-500 hover:underline">
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
            className="w-full"
          />
          <span className="self-center text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Minimalna ocjena</Label>
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
        <Button onClick={applyFilters} className="flex-1 bg-orange-500 hover:bg-orange-600">
          Primijeni filtere
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="rating">Po ocjeni</option>
            <option value="reviews">Po broju recenzija</option>
            <option value="price">Po cijeni</option>
          </select>

          <Button
            variant={showMap ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className={showMap ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {showMap ? <Grid className="h-4 w-4 mr-1" /> : <MapIcon className="h-4 w-4 mr-1" />}
            {showMap ? 'Lista' : 'Karta'}
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {city && (
            <Badge variant="secondary" className="gap-1">
              {city}
              <X className="h-3 w-3 cursor-pointer" onClick={() => { setCity(''); applyFilters(); }} />
            </Badge>
          )}
          {service && (
            <Badge variant="secondary" className="gap-1">
              {SERVICE_LABELS[service as ServiceType]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => { setService(''); applyFilters(); }} />
            </Badge>
          )}
          {minRating && (
            <Badge variant="secondary" className="gap-1">
              {minRating}+ zvjezdica
              <X className="h-3 w-3 cursor-pointer" onClick={() => { setMinRating(''); applyFilters(); }} />
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Card className="p-4 sticky top-24">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filteri
            </h2>
            <FilterPanel />
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {showMap ? (
            <div className="h-[600px] rounded-xl overflow-hidden border">
              <MapView sitters={sitters} />
            </div>
          ) : sitters.length === 0 ? (
            <EmptyState
              icon={PawPrint}
              title="Nema pronađenih sittera"
              description="Pokušajte promijeniti filtere ili pretražiti u drugom gradu."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Poništi filtere
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
