'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Filter, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAdoptionFavorites } from '@/hooks/use-adoption-favorites';
import {
  mockAdoptionPets,
  getShelterById,
  formatAge,
  getAgeCategory,
  SPECIES_EMOJI,
  SPECIES_LABEL,
  GENDER_LABEL,
  SIZE_LABEL,
} from '@/lib/mock-adoption-data';
import { CITIES } from '@/lib/types';

const speciesFilters = [
  { value: 'all', label: 'Sve', emoji: '' },
  { value: 'dog', label: 'Psi', emoji: '🐕' },
  { value: 'cat', label: 'Mačke', emoji: '🐈' },
  { value: 'rabbit', label: 'Mali ljubimci', emoji: '🐰' },
];

const ageFilters = [
  { value: 'all', label: 'Sve dobi' },
  { value: 'puppy', label: 'Štene/Mače' },
  { value: 'young', label: 'Mladi' },
  { value: 'adult', label: 'Odrasli' },
  { value: 'senior', label: 'Senior' },
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

export function AdoptionContent() {
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState<string | null>('all');
  const [sizeFilter, setSizeFilter] = useState<string | null>('all');
  const [ageFilter, setAgeFilter] = useState<string | null>('all');
  const [genderFilter, setGenderFilter] = useState<string | null>('all');
  const { toggleFavorite, isFavorite } = useAdoptionFavorites();

  const filtered = useMemo(() => {
    return mockAdoptionPets.filter((pet) => {
      if (speciesFilter !== 'all' && pet.species !== speciesFilter) return false;
      if (cityFilter && cityFilter !== 'all' && pet.city !== cityFilter) return false;
      if (sizeFilter && sizeFilter !== 'all' && pet.size !== sizeFilter) return false;
      if (genderFilter && genderFilter !== 'all' && pet.gender !== genderFilter) return false;
      if (ageFilter && ageFilter !== 'all' && getAgeCategory(pet.age_months) !== ageFilter) return false;
      return true;
    });
  }, [speciesFilter, cityFilter, sizeFilter, ageFilter, genderFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-pink-50/30 dark:from-purple-950/10 dark:via-background dark:to-pink-950/10">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 text-white">
        <div className="absolute inset-0 paw-pattern opacity-[0.05]" />
        <div className="container mx-auto px-4 py-16 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <Heart className="h-4 w-4 fill-white" />
              {mockAdoptionPets.length} ljubimaca čeka dom
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)]">
              🏠 Udomite ljubimca
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-4 max-w-2xl mx-auto">
              Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i male ljubimce iz azila diljem Hrvatske.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Dob" />
              </SelectTrigger>
              <SelectContent>
                {ageFilters.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
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
          <div className="text-center py-16">
            <p className="text-xl font-semibold mb-2">Nema rezultata</p>
            <p className="text-muted-foreground">Pokušajte promijeniti filtere.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.map((pet, i) => {
              const shelter = getShelterById(pet.shelter_id);
              return (
                <Link key={pet.id} href={`/udomljavanje/${pet.id}`}>
                  <Card className={`group card-hover cursor-pointer overflow-hidden border-0 shadow-sm rounded-2xl h-full animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                    <CardContent className="p-0">
                      {/* Image placeholder */}
                      <div className={`relative h-48 bg-gradient-to-br ${pet.image_gradient} flex items-center justify-center`}>
                        <div className="absolute inset-0 paw-pattern opacity-10" />
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {SPECIES_EMOJI[pet.species]}
                        </span>

                        {/* Urgent badge */}
                        {pet.urgent && (
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
                            toggleFavorite(pet.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                            isFavorite(pet.id)
                              ? 'bg-red-500 text-white shadow-lg shadow-red-200/50'
                              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(pet.id) ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg group-hover:text-purple-500 transition-colors font-[var(--font-heading)]">
                            {pet.name}
                          </h3>
                          <span className="text-sm">{SPECIES_EMOJI[pet.species]}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{pet.breed}</p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <Badge variant="secondary" className="rounded-full text-xs">{GENDER_LABEL[pet.gender]}</Badge>
                          <Badge variant="secondary" className="rounded-full text-xs">{formatAge(pet.age_months)}</Badge>
                          <Badge variant="secondary" className="rounded-full text-xs">{SIZE_LABEL[pet.size]}</Badge>
                          {pet.sterilized && (
                            <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 border-0 rounded-full text-xs">
                              Steriliziran/a
                            </Badge>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3.5 w-3.5 text-purple-400" />
                          {pet.city}
                        </div>

                        {/* Shelter */}
                        {shelter && (
                          <p className="text-xs text-muted-foreground">{shelter.name}</p>
                        )}

                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Saznaj više <ArrowRight className="h-3 w-3" />
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
