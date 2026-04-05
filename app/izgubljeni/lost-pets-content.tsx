'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import type { LostPet } from '@/lib/types';
import { CITIES } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';

interface LostPetsContentProps {
  initialPets?: LostPet[];
}

export function LostPetsContent({ initialPets = [] }: LostPetsContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'map'>('grid');

  const filteredPets = initialPets.filter((pet) => {
    if (cityFilter !== 'all' && pet.city !== cityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        pet.name.toLowerCase().includes(q) ||
        pet.breed.toLowerCase().includes(q) ||
        pet.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Hero */}
      <section className="relative lost-pets-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="section-kicker">Community</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-[var(--font-heading)] leading-[1.05] tracking-tight mb-6">
              {isEn ? 'Lost Pets' : 'Izgubljeni ljubimci'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isEn ? 'Help reunite pets with their families. Every sighting matters.' : 'Pomozite vratiti ljubimce njihovim obiteljima. Svako viđenje je važno.'}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 -mt-8 relative z-10">
        <div className="community-section-card p-5 md:p-6">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={isEn ? 'Search by name, breed...' : 'Pretraži po imenu, pasmini...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="forum-search-input"
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="premium-select h-12"
            >
              <option value="all">{isEn ? 'All cities' : 'Svi gradovi'}</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16">
        {filteredPets.length === 0 ? (
          <EmptyState
            icon={Search}
            title={isEn ? 'No results' : 'Nema rezultata'}
            description={isEn ? 'Try changing your filters.' : 'Pokušajte promijeniti filtere.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPets.map((pet, index) => (
              <Link key={pet.id} href={"/izgubljeni/" + pet.id}>
                <div 
                  className="lost-pet-card overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
                >
                  <div className="h-52 bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center border-b border-border/10">
                    <span className="text-7xl">{(pet.species as string) === 'dog' ? '🐕' : (pet.species as string) === 'cat' ? '🐈' : '🐾'}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg font-[var(--font-heading)]">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pet.breed}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-3">
                      <MapPin className="h-4 w-4 text-warm-orange/70" />
                      {pet.city}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="appeal-card p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] mb-4">
              {isEn ? 'Lost your pet?' : 'Izgubili ste ljubimca?'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {isEn ? 'Create a listing and get notified when someone spots your pet.' : 'Kreirajte oglas i primite obavijest kad netko primijeti vašeg ljubimca.'}
            </p>
            <Link href="/izgubljeni/prijavi">
              <Button size="lg" className="bg-warm-orange hover:bg-warm-orange/90 text-white h-12 px-8">
                <Plus className="h-5 w-5 mr-2" />
                {isEn ? 'Report missing pet' : 'Prijavi nestanak'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
