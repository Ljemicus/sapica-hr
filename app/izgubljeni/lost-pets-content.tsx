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
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-4 bg-white/20 text-white">Community</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {isEn ? 'Lost Pets' : 'Izgubljeni ljubimci'}
          </h1>
          <p className="text-lg text-white/90 max-w-xl mx-auto">
            {isEn ? 'Help reunite pets with their families.' : 'Pomozite vratiti ljubimce njihovim obiteljima.'}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={isEn ? 'Search by name, breed...' : 'Pretraži po imenu, pasmini...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border"
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border"
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
      <section className="container mx-auto px-6 py-8">
        {filteredPets.length === 0 ? (
          <EmptyState
            icon={Search}
            title={isEn ? 'No results' : 'Nema rezultata'}
            description={isEn ? 'Try changing your filters.' : 'Pokušajte promijeniti filtere.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <Link key={pet.id} href={"/izgubljeni/" + pet.id}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                    <span className="text-6xl">{(pet.species as string) === 'dog' ? '🐕' : (pet.species as string) === 'cat' ? '🐈' : '🐾'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">{pet.breed}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-3.5 w-3.5" />
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
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {isEn ? 'Lost your pet?' : 'Izgubili ste ljubimca?'}
          </h2>
          <Link href="/izgubljeni/prijavi">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
              <Plus className="h-5 w-5 mr-2" />
              {isEn ? 'Report missing pet' : 'Prijavi nestanak'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
