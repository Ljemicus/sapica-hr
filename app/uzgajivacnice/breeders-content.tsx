'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Shield, Award, Baby, Search, ChevronRight, Dog, Cat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { CITIES } from '@/lib/types';
import type { Breeder } from '@/lib/db/breeders';
import { getLocaleSegment } from '@/lib/i18n/routing';
import { useLanguage } from '@/lib/i18n/context';

// Breed lists by species
const DOG_BREEDS_HR = [
  'Labrador retriver', 'Zlatni retriver', 'Njemački ovčar', 'Francuski buldog',
  'Maltezer', 'Dalmatinac', 'Sibirski husky', 'Border collie',
  'Bernski planinski pas', 'Cavalier King Charles', 'Mješanac', 'Chihuahua',
  'Beagle', 'Jack Russell terijer', 'Šar planinac', 'Rotvajler', 'Doberman',
  'Bokser', 'Džek rasel terijer', 'Pudl', 'Jorkširski terijer', 'Buldok',
];

const CAT_BREEDS_HR = [
  'Britanska kratkodlaka', 'Maine Coon', 'Ragdoll', 'Sijamska mačka',
  'Perzijska mačka', 'Bengalska mačka', 'Ruska plava', 'Norveška šumska',
  'Turska angora', 'Sphynx', 'Munchkin', 'Sibirska mačka', 'Egzotična kratkodlaka',
  'Škotska krivouha', 'Birman', 'Orientalna', 'Devon rex', 'Cornish rex',
];

const DOG_BREEDS_EN = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'French Bulldog',
  'Maltese', 'Dalmatian', 'Siberian Husky', 'Border Collie',
  'Bernese Mountain Dog', 'Cavalier King Charles', 'Mixed', 'Chihuahua',
  'Beagle', 'Jack Russell Terrier', 'Šarplaninac', 'Rottweiler', 'Doberman',
  'Boxer', 'Jack Russell', 'Poodle', 'Yorkshire Terrier', 'Bulldog',
];

const CAT_BREEDS_EN = [
  'British Shorthair', 'Maine Coon', 'Ragdoll', 'Siamese',
  'Persian', 'Bengal', 'Russian Blue', 'Norwegian Forest',
  'Turkish Angora', 'Sphynx', 'Munchkin', 'Siberian', 'Exotic Shorthair',
  'Scottish Fold', 'Birman', 'Oriental', 'Devon Rex', 'Cornish Rex',
];

interface BreedersContentProps {
  breeders: Breeder[];
  initialParams: { species?: string; city?: string; breed?: string; sort?: string };
}

interface BreedersContentProps {
  breeders: Breeder[];
  initialParams: { species?: string; city?: string; breed?: string; sort?: string };
}

export function BreedersContent({ breeders, initialParams }: BreedersContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const localeSegment = getLocaleSegment(language);
  const basePath = `/uzgajivacnice${localeSegment}`;

  // Breed lists based on language
  const dogBreeds = isEn ? DOG_BREEDS_EN : DOG_BREEDS_HR;
  const catBreeds = isEn ? CAT_BREEDS_EN : CAT_BREEDS_HR;

  const speciesTabs = [
    { value: 'all', label: isEn ? 'All' : 'Sve', icon: null },
    { value: 'dog', label: isEn ? 'Dogs' : 'Psi', icon: Dog },
    { value: 'cat', label: isEn ? 'Cats' : 'Mačke', icon: Cat },
  ] as const;

  const router = useRouter();
  const [species, setSpecies] = useState(initialParams.species || 'all');
  const [city, setCity] = useState(initialParams.city || '');
  const [breed, setBreed] = useState(initialParams.breed || '');
  const [sort, setSort] = useState(initialParams.sort || 'rating');

  // Available breeds based on selected species
  const availableBreeds = useMemo(() => {
    if (species === 'dog') return dogBreeds;
    if (species === 'cat') return catBreeds;
    return [...dogBreeds, ...catBreeds].sort();
  }, [species, dogBreeds, catBreeds]);

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
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }, [species, city, breed, sort, router, basePath]);

  const handleSpecies = (value: string) => {
    setSpecies(value);
    // Reset breed when changing species to avoid invalid combinations
    setBreed('');
    applyFilters({ species: value, breed: '' });
  };

  const handleCity = (value: string) => {
    setCity(value);
    applyFilters({ city: value });
  };

  const handleSort = (value: string) => {
    setSort(value);
    applyFilters({ sort: value });
  };

  const handleBreedChange = (value: string) => {
    setBreed(value);
    applyFilters({ breed: value });
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
                {isEn ? 'Breeders' : 'Uzgajivači'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {breeders.length} {isEn ? (breeders.length === 1 ? 'breeder found' : 'breeders found') : (breeders.length === 1 ? 'uzgajivač pronađen' : 'uzgajivača pronađeno')}
                {city && (isEn ? ` in ${city}` : ` u gradu ${city}`)}
                {totalLitters > 0 && ` · ${totalLitters} ${isEn ? 'available litters' : 'dostupnih legala'}`}
              </p>
            </div>
          </div>

          {/* Species pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5">
              {speciesTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleSpecies(tab.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                      species === tab.value
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-accent hover:bg-amber-100 dark:hover:bg-amber-900/30 text-foreground'
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <select
              value={city}
              onChange={(e) => handleCity(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
            >
              <option value="">{isEn ? 'All cities' : 'Svi gradovi'}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Species-dependent breed dropdown */}
            <select
              value={breed}
              onChange={(e) => handleBreedChange(e.target.value)}
              disabled={species === 'all' && availableBreeds.length === 0}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
            >
              <option value="">
                {species === 'all'
                  ? (isEn ? 'First select species' : 'Prvo odaberite vrstu')
                  : (isEn ? 'All breeds' : 'Sve pasmine')}
              </option>
              {availableBreeds.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
            >
              <option value="rating">{isEn ? 'By rating' : 'Po ocjeni'}</option>
              <option value="name">{isEn ? 'By name' : 'Po imenu'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Breeder cards grid */}
      {breeders.length === 0 ? (
        <EmptyState
          icon={Baby}
          title={isEn ? 'No matching breeders' : 'Nema odgovarajućih uzgajivača'}
          description={isEn ? 'Try changing filters, choosing another city, or searching without a breed name.' : 'Promijenite filtere, odaberite drugi grad ili pokušajte bez naziva pasmine.'}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSpecies('all');
                setCity('');
                setBreed('');
                setSort('rating');
                router.push(basePath);
              }}
              className="hover:bg-amber-50 hover:text-amber-600"
            >
              {isEn ? 'Clear filters' : 'Poništi filtere'}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
          {breeders.map((breeder, i) => (
            <BreederCard key={breeder.id} breeder={breeder} index={i} isEn={isEn} localeSegment={localeSegment} />
          ))}
        </div>
      )}
    </div>
  );
}

function BreederCard({ breeder, index, isEn, localeSegment }: { breeder: Breeder; index: number; isEn: boolean; localeSegment: '' | '/en' }) {
  const availableCount = breeder.availableLitters.filter((l) => l.status === 'available').length;

  return (
    <Card className={`group overflow-hidden border-0 shadow-sm rounded-2xl card-hover animate-fade-in-up delay-${((index % 3) + 1) * 100}`}>
      <CardContent className="p-0">
        {/* Gradient header */}
        <div className={`relative h-32 bg-gradient-to-br ${breeder.gradient} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 paw-pattern opacity-10" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white/90 text-[11px] font-medium">
            <span>{breeder.city}</span>
            <span className="rounded-full bg-white/90 px-2 py-1 text-amber-700 shadow-sm">{isEn ? 'Breeder' : 'Uzgajivač'}</span>
          </div>
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
                <Shield className="h-2.5 w-2.5 mr-0.5" />{isEn ? 'Registered' : 'Registriran'}
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
                <Shield className="h-2.5 w-2.5 mr-0.5" />{isEn ? 'Registered breeder' : 'Registriran uzgajivač'}
              </Badge>
            )}
            {breeder.fciRegistered && (
              <Badge variant="outline" className="text-[10px] font-normal text-blue-600 border-blue-200">
                <Award className="h-2.5 w-2.5 mr-0.5" />{isEn ? 'FCI registered' : 'FCI registriran'}
              </Badge>
            )}
            {breeder.certified && (
              <Badge variant="outline" className="text-[10px] font-normal text-purple-600 border-purple-200">
                {isEn ? 'Certified' : 'Certificiran'}
              </Badge>
            )}
          </div>

          {/* Available litters */}
          {availableCount > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
              {availableCount} {isEn ? (availableCount === 1 ? 'available litter' : 'available litters') : (availableCount === 1 ? 'dostupno leglo' : 'dostupnih legala')}
            </p>
          )}

          {/* CTA */}
          <div className="pt-3 border-t border-border/50">
            <Link
              href={`/uzgajivacnice${localeSegment}/${breeder.id}`}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              {isEn ? 'View profile' : 'Pogledaj profil'} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
