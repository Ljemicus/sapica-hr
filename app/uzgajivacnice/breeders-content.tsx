'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Shield, Award, Baby, ChevronRight, Dog, Cat,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

export function BreedersContent({ breeders, initialParams, forcedLanguage }: BreedersContentProps & { forcedLanguage?: 'hr' | 'en' }) {
  const { language } = useLanguage();
  const activeLanguage = forcedLanguage || language;
  const isEn = activeLanguage === 'en';
  const localeSegment = getLocaleSegment(activeLanguage);
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
    <div className="min-h-screen bg-background">
      {/* ══════════════════════════════════════════
          EDITORIAL HERO
          ══════════════════════════════════════════ */}
      <section className="relative breeders-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="section-kicker">{isEn ? 'Breeders' : 'Uzgajivači'}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] leading-[1.05]">
              {isEn ? 'Registered breeders\nyou can trust.' : 'Registrirani uzgajivači\nkojima možete vjerovati.'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? 'Browse verified breeders across Croatia. Every profile is reviewed for quality and animal welfare standards.'
                : 'Pretražite verificirane uzgajivače diljem Hrvatske. Svaki profil je provjeren prema standardima kvalitete i dobrobiti životinja.'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SPECIES FILTER PILLS
          ══════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 -mt-5 relative z-10">
        <div className="flex flex-wrap justify-center gap-2">
          {speciesTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = species === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleSpecies(tab.value)}
                data-active={isActive}
                className={`filter-pill flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-warm-orange text-white'
                    : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {tab.label}
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
              <span className="font-semibold text-foreground">{breeders.length}</span>{' '}
              {isEn ? (breeders.length === 1 ? 'breeder found' : 'breeders found') : (breeders.length === 1 ? 'uzgajivač pronađen' : 'uzgajivača pronađeno')}
              {city && <span className="text-warm-orange"> · {city}</span>}
              {totalLitters > 0 && ` · ${totalLitters} ${isEn ? 'available litters' : 'dostupnih legala'}`}
            </p>
            <div className="flex items-center gap-3">
              <select
                value={city}
                onChange={(e) => handleCity(e.target.value)}
                className="premium-select"
              >
                <option value="">{isEn ? 'All cities' : 'Svi gradovi'}</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={breed}
                onChange={(e) => handleBreedChange(e.target.value)}
                disabled={species === 'all' && availableBreeds.length === 0}
                className="premium-select disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
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
                className="premium-select"
              >
                <option value="rating">{isEn ? 'By rating' : 'Po ocjeni'}</option>
                <option value="name">{isEn ? 'By name' : 'Po imenu'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BREEDER CARDS GRID
          ══════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10">
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
                className="border-warm-orange/30 text-warm-orange hover:bg-warm-orange/5 rounded-xl"
              >
                {isEn ? 'Clear filters' : 'Poništi filtere'}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
            {breeders.map((breeder, i) => (
              <BreederCard key={breeder.id} breeder={breeder} index={i} isEn={isEn} localeSegment={localeSegment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BreederCard({ breeder, index, isEn, localeSegment }: { breeder: Breeder; index: number; isEn: boolean; localeSegment: '' | '/en' }) {
  const availableCount = breeder.availableLitters.filter((l) => l.status === 'available').length;

  return (
    <Link href={`/uzgajivacnice${localeSegment}/${breeder.id}`}>
      <div
        className="community-section-card group cursor-pointer overflow-hidden h-full animate-fade-in-up"
        style={{ animationDelay: `${((index % 3) + 1) * 100}ms` }}
      >
        {/* Gradient header */}
        <div className={`relative h-40 bg-gradient-to-br ${breeder.gradient} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 paw-pattern opacity-10" />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />

          {/* Avatar */}
          <Avatar className="h-20 w-20 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
            <AvatarFallback className="bg-white/90 text-gray-700 text-2xl font-bold">
              {breeder.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Badges — top right */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            {breeder.verified && (
              <span className="inline-flex items-center bg-white/90 text-green-600 text-[10px] font-medium shadow-sm rounded-full px-2.5 py-1">
                <Shield className="h-2.5 w-2.5 mr-0.5" />{isEn ? 'Registered' : 'Registriran'}
              </span>
            )}
            {breeder.fciRegistered && (
              <span className="inline-flex items-center bg-white/90 text-blue-600 text-[10px] font-medium shadow-sm rounded-full px-2.5 py-1">
                FCI
              </span>
            )}
          </div>

          {/* Bottom info — city + tag */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between pointer-events-none">
            <span className="text-white/90 text-xs font-medium drop-shadow-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {breeder.city}
            </span>
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-warm-orange shadow-sm">
              {isEn ? 'Breeder' : 'Uzgajivač'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg font-[var(--font-heading)] group-hover:text-warm-orange transition-colors">
              {breeder.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{breeder.rating.toFixed(1)}</span>
              <span className="text-xs text-amber-600/60 dark:text-amber-500/60">({breeder.reviewCount})</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{breeder.bio}</p>

          {/* Breed badges */}
          <div className="flex flex-wrap gap-1.5">
            {breeder.breeds.map((b) => (
              <Badge key={b} variant="secondary" className="text-xs font-normal bg-warm-peach/30 text-warm-orange dark:bg-amber-950/30 dark:text-amber-300">
                {b}
              </Badge>
            ))}
          </div>

          {/* Certification badges */}
          <div className="flex flex-wrap gap-1.5">
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
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {availableCount} {isEn ? (availableCount === 1 ? 'available litter' : 'available litters') : (availableCount === 1 ? 'dostupno leglo' : 'dostupnih legala')}
            </p>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="text-xs text-muted-foreground">
              {breeder.verified && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{isEn ? 'Trusted breeder' : 'Pouzdani uzgajivač'}</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warm-orange group-hover:gap-2.5 transition-all">
              {isEn ? 'View profile' : 'Pogledaj profil'}
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
