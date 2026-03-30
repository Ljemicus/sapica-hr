'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Shield, Award, Baby, Search, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { CITIES } from '@/lib/types';
import type { Breeder } from '@/lib/mock-breeders';

const speciesTabs = [
  { value: 'all', label: 'Sve', emoji: '' },
  { value: 'dog', label: 'Psi', emoji: '🐕' },
  { value: 'cat', label: 'Mačke', emoji: '🐈' },
] as const;

interface BreedersContentProps {
  breeders: Breeder[];
  initialParams: { species?: string; city?: string; breed?: string; sort?: string };
}

export function BreedersContent({ breeders, initialParams }: BreedersContentProps) {
  const router = useRouter();
  const [species, setSpecies] = useState(initialParams.species || 'all');
  const [city, setCity] = useState(initialParams.city || '');
  const [breed, setBreed] = useState(initialParams.breed || '');
  const [sort, setSort] = useState(initialParams.sort || 'rating');

  const applyFilters = useCallback((overrides?: Partial<typeof initialParams>) => {
    const params = new URLSearchParams();
    const s = overrides?.species ?? species;
    const c = overrides?.city ?? city;
    const b = overrides?.breed ?? breed;
    const so = overrides?.sort ?? sort;
    if (s && s !== 'all') params.set('species', s);
    if (c) params.set('city', c);
    if (b) params.set('breed', b);
    if (so && so !== 'rating') params.set('sort', so);
    router.push(`/uzgajivacnice?${params.toString()}`);
  }, [species, city, breed, sort, router]);

  const handleSpecies = (value: string) => {
    setSpecies(value);
    applyFilters({ species: value });
  };

  const handleCity = (value: string) => {
    setCity(value);
    applyFilters({ city: value });
  };

  const handleSort = (value: string) => {
    setSort(value);
    applyFilters({ sort: value });
  };

  const handleBreedSearch = () => {
    applyFilters();
  };

  const totalLitters = breeders.reduce(
    (sum, b) => sum + b.availableLitters.filter((l) => l.status === 'available').length,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter bar */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-4 glass-strong border-b border-border/50 mb-6 -mt-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Baby className="h-5 w-5 text-amber-500" />
                Uzgajivači
              </h2>
              <p className="text-muted-foreground text-sm">
                {breeders.length} {breeders.length === 1 ? 'uzgajivač pronađen' : 'uzgajivača pronađeno'}
                {city && ` u gradu ${city}`}
                {totalLitters > 0 && ` · ${totalLitters} dostupnih legala`}
              </p>
            </div>
          </div>

          {/* Species pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5">
              {speciesTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleSpecies(tab.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    species === tab.value
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-accent hover:bg-amber-100 dark:hover:bg-amber-900/30 text-foreground'
                  }`}
                >
                  {tab.emoji && <span className="mr-1">{tab.emoji}</span>}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <select
              value={city}
              onChange={(e) => handleCity(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
            >
              <option value="">Svi gradovi</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex gap-1.5 flex-1 min-w-[180px] max-w-xs">
              <Input
                placeholder="Pretraži pasminu..."
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBreedSearch()}
                className="h-9 rounded-lg text-sm"
              />
              <Button size="sm" variant="outline" onClick={handleBreedSearch} className="h-9 px-3">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
            >
              <option value="rating">Po ocjeni</option>
              <option value="name">Po imenu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Breeder cards grid */}
      {breeders.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="Nema pronađenih uzgajivača"
          description="Pokušajte promijeniti filtere ili pretražiti drugu pasminu."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSpecies('all');
                setCity('');
                setBreed('');
                setSort('rating');
                router.push('/uzgajivacnice');
              }}
              className="hover:bg-amber-50 hover:text-amber-600"
            >
              Poništi filtere
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
          {breeders.map((breeder, i) => (
            <BreederCard key={breeder.id} breeder={breeder} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function BreederCard({ breeder, index }: { breeder: Breeder; index: number }) {
  const availableCount = breeder.availableLitters.filter((l) => l.status === 'available').length;

  return (
    <Card className={`group overflow-hidden border-0 shadow-sm rounded-2xl card-hover animate-fade-in-up delay-${((index % 3) + 1) * 100}`}>
      <CardContent className="p-0">
        {/* Gradient header */}
        <div className={`relative h-32 bg-gradient-to-br ${breeder.gradient} flex items-center justify-center`}>
          <div className="absolute inset-0 paw-pattern opacity-10" />
          <div className="text-center relative">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg mx-auto">
              <AvatarFallback className="bg-white/90 text-gray-700 text-xl font-bold">
                {breeder.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* Badges on header */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {breeder.verified && (
              <Badge className="bg-white/90 text-green-600 text-[10px] shadow-sm hover:bg-white/90 rounded-full px-2">
                <Shield className="h-2.5 w-2.5 mr-0.5" />Registriran
              </Badge>
            )}
            {breeder.fciRegistered && (
              <Badge className="bg-white/90 text-blue-600 text-[10px] shadow-sm hover:bg-white/90 rounded-full px-2">
                FCI
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-base mb-1 font-[var(--font-heading)]">{breeder.name}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{breeder.city}</span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {breeder.rating.toFixed(1)} ({breeder.reviewCount})
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">{breeder.bio}</p>

          {/* Breed badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {breeder.breeds.map((b) => (
              <Badge key={b} variant="secondary" className="text-xs font-normal bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                {b}
              </Badge>
            ))}
          </div>

          {/* Certification badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {breeder.verified && (
              <Badge variant="outline" className="text-[10px] font-normal text-green-600 border-green-200">
                <Shield className="h-2.5 w-2.5 mr-0.5" />Registriran uzgajivač
              </Badge>
            )}
            {breeder.fciRegistered && (
              <Badge variant="outline" className="text-[10px] font-normal text-blue-600 border-blue-200">
                <Award className="h-2.5 w-2.5 mr-0.5" />FCI registriran
              </Badge>
            )}
            {breeder.certified && (
              <Badge variant="outline" className="text-[10px] font-normal text-purple-600 border-purple-200">
                Certificiran
              </Badge>
            )}
          </div>

          {/* Available litters */}
          {availableCount > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
              {availableCount} {availableCount === 1 ? 'dostupno leglo' : 'dostupnih legala'}
            </p>
          )}

          {/* CTA */}
          <div className="pt-3 border-t border-border/50">
            <Link
              href={`/uzgajivacnice/${breeder.id}`}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              Pogledaj profil <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
