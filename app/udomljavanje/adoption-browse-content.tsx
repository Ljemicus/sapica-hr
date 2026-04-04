'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, HeartHandshake, MapPin, Filter, ArrowRight, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAdoptionFavorites } from '@/hooks/use-adoption-favorites';
import { EmptyState } from '@/components/shared/empty-state';
import type { AdoptionListingCard } from '@/lib/types';
import {
  ADOPTION_SPECIES_EMOJI,
  ADOPTION_GENDER_LABELS,
  ADOPTION_SIZE_LABELS,
  CITIES,
} from '@/lib/types';

const speciesFilters = [
  { value: 'all', label: 'Sve', emoji: '' },
  { value: 'dog', label: 'Psi', emoji: '🐕' },
  { value: 'cat', label: 'Mačke', emoji: '🐈' },
  { value: 'rabbit', label: 'Mali ljubimci', emoji: '🐰' },
  { value: 'other', label: 'Ostalo', emoji: '🐾' },
];

const sizeFilters = [
  { value: 'all', label: 'Svi' },
  { value: 'small', label: 'Mali' },
  { value: 'medium', label: 'Srednji' },
  { value: 'large', label: 'Veliki' },
];

const genderFilters = [
  { value: 'all', label: 'Svi' },
  { value: 'male', label: 'Muški' },
  { value: 'female', label: 'Ženski' },
];

function formatAge(months: number | null): string {
  if (months == null) return 'Nepoznato';
  if (months < 12) return `${months} mj.`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} g. ${rem} mj.` : `${years} g.`;
}

const SPECIES_GRADIENTS: Record<string, string> = {
  dog: 'from-amber-300 to-orange-400',
  cat: 'from-purple-300 to-pink-400',
  rabbit: 'from-green-300 to-teal-400',
  other: 'from-blue-300 to-indigo-400',
};

export function AdoptionBrowseContent({ listings }: { listings: AdoptionListingCard[] }) {
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState<string | null>('all');
  const [sizeFilter, setSizeFilter] = useState<string | null>('all');
  const [genderFilter, setGenderFilter] = useState<string | null>('all');
  const [search, setSearch] = useState('');
  const { toggleFavorite, isFavorite } = useAdoptionFavorites();

  const hasActiveFilters = speciesFilter !== 'all' || (cityFilter && cityFilter !== 'all') || (sizeFilter && sizeFilter !== 'all') || (genderFilter && genderFilter !== 'all') || search.trim() !== '';

  const clearFilters = () => {
    setSpeciesFilter('all');
    setCityFilter('all');
    setSizeFilter('all');
    setGenderFilter('all');
    setSearch('');
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return listings.filter((l) => {
      if (speciesFilter !== 'all' && l.species !== speciesFilter) return false;
      if (cityFilter && cityFilter !== 'all' && l.city !== cityFilter) return false;
      if (sizeFilter && sizeFilter !== 'all' && l.size !== sizeFilter) return false;
      if (genderFilter && genderFilter !== 'all' && l.gender !== genderFilter) return false;
      if (q) {
        const haystack = [l.name, l.breed, l.city, l.publisher_display_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [listings, speciesFilter, cityFilter, sizeFilter, genderFilter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-pink-50/30 dark:from-purple-950/10 dark:via-background dark:to-pink-950/10">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 text-white">
        <div className="absolute inset-0 paw-pattern opacity-[0.05]" />
        <div className="container mx-auto px-4 py-16 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <Heart className="h-4 w-4 fill-white" />
              {listings.length} {listings.length === 1 ? 'ljubimac čeka' : 'ljubimaca čeka'} dom
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
              Udomite ljubimca
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-4 max-w-2xl mx-auto">
              Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i male ljubimce za udomljavanje diljem Hrvatske.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-gray-100 dark:border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtriraj</span>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pretraži po imenu, pasmini, gradu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Pretraži oglase za udomljavanje"
            />
          </div>

          {/* Species pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {speciesFilters.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeciesFilter(s.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  speciesFilter === s.value
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                {s.emoji && <span className="mr-1">{s.emoji}</span>}
                {s.label}
              </button>
            ))}
          </div>

          {/* Dropdown filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Svi gradovi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi gradovi</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Veličina" />
              </SelectTrigger>
              <SelectContent>
                {sizeFilters.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Spol" />
              </SelectTrigger>
              <SelectContent>
                {genderFilters.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Poništi filtere
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'ljubimac' : 'ljubimaca'} pronađeno
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={hasActiveFilters ? Search : HeartHandshake}
            title={hasActiveFilters ? 'Nema rezultata' : 'Trenutno nema aktivnih oglasa'}
            description={hasActiveFilters ? 'Pokušajte promijeniti filtere ili pojam pretrage.' : 'Novi oglasi za udomljavanje pojavljuju se čim budu objavljeni. Provjerite ponovno uskoro.'}
            action={hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Poništi sve filtere
              </button>
            ) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.map((listing) => {
              const primaryImage = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
              const gradient = SPECIES_GRADIENTS[listing.species] ?? SPECIES_GRADIENTS.other;

              return (
                <Link key={listing.id} href={`/udomljavanje/${listing.id}`}>
                  <Card className="group card-hover cursor-pointer overflow-hidden border-0 shadow-sm rounded-2xl h-full">
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className={`relative h-48 ${primaryImage ? 'bg-gray-100' : `bg-gradient-to-br ${gradient}`} flex items-center justify-center`}>
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={primaryImage.alt || listing.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 paw-pattern opacity-10" />
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                              {ADOPTION_SPECIES_EMOJI[listing.species]}
                            </span>
                          </>
                        )}

                        {/* Urgent badge */}
                        {listing.is_urgent && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-red-500 text-white font-bold rounded-full flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              Hitno
                            </Badge>
                          </div>
                        )}

                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(listing.id);
                          }}
                          aria-label={isFavorite(listing.id) ? `Ukloni ${listing.name} iz favorita` : `Dodaj ${listing.name} u favorite`}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                            isFavorite(listing.id)
                              ? 'bg-red-500 text-white shadow-lg shadow-red-200/50'
                              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg group-hover:text-purple-500 transition-colors font-[var(--font-heading)]">
                            {listing.name}
                          </h3>
                          <span className="text-sm">{ADOPTION_SPECIES_EMOJI[listing.species]}</span>
                        </div>
                        {listing.breed && (
                          <p className="text-sm text-muted-foreground mb-3">{listing.breed}</p>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {listing.gender && (
                            <Badge variant="secondary" className="rounded-full text-xs">
                              {ADOPTION_GENDER_LABELS[listing.gender]}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {formatAge(listing.age_months)}
                          </Badge>
                          {listing.size && (
                            <Badge variant="secondary" className="rounded-full text-xs">
                              {ADOPTION_SIZE_LABELS[listing.size]}
                            </Badge>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5 text-purple-400" />
                          {listing.city}
                        </div>

                        {/* Publisher */}
                        {listing.publisher_display_name && (
                          <div className="rounded-lg bg-purple-50/70 dark:bg-purple-950/20 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">O njemu brine</p>
                            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{listing.publisher_display_name}</p>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            Pogledaj profil ljubimca <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
