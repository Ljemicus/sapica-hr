'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bell, Megaphone, Plus, Search, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LostPet } from '@/lib/types';
import { CITIES } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';

interface LostPetsContentProps {
  initialPets?: LostPet[];
}

export function LostPetsContent({ initialPets = [], forcedLanguage }: LostPetsContentProps & { forcedLanguage?: 'hr' | 'en' }) {
  const { language } = useLanguage();
  const activeLanguage = forcedLanguage || language;
  const isEn = activeLanguage === 'en';
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [_view, _setView] = useState<'grid' | 'map'>('grid');

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
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-400/10 blur-3xl" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <p className="section-kicker">{isEn ? 'Alert board' : 'Ploča za hitne objave'}</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-[var(--font-heading)] leading-[1.05] tracking-tight mb-6">
              {isEn ? 'Lost Pets' : 'Izgubljeni ljubimci'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isEn ? 'Help reunite pets with their families. Every sighting matters.' : 'Pomozite vratiti ljubimce njihovim obiteljima. Svako viđenje je važno.'}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 text-left">
              {[
                { icon: AlertTriangle, label: isEn ? 'Report quickly' : 'Brza prijava', text: isEn ? 'Create a clear alert in minutes.' : 'Objavite jasan oglas za par minuta.' },
                { icon: Share2, label: isEn ? 'Share wider' : 'Dijelite dalje', text: isEn ? 'Every share expands the search area.' : 'Svako dijeljenje širi potragu.' },
                { icon: Bell, label: isEn ? 'Follow sightings' : 'Pratite viđenja', text: isEn ? 'Keep updates in one place.' : 'Držite informacije na jednom mjestu.' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-rose-200/50 bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card/70 dark:border-rose-900/30">
                  <item.icon className="mb-3 h-5 w-5 text-rose-600" />
                  <p className="font-bold font-[var(--font-heading)]">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
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
          <div className="appeal-card mx-auto max-w-3xl p-8 md:p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 dark:bg-rose-950/30">
              <Search className="h-8 w-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] mb-3">
              {isEn ? 'No active alerts match this search' : 'Nema aktivnih oglasa za ovu pretragu'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              {isEn
                ? 'Try a wider city filter, or publish a missing pet alert so the community can help.'
                : 'Probajte širi filter grada ili odmah objavite nestanak kako bi zajednica mogla pomoći.'}
            </p>
            <Link href="/izgubljeni/prijavi">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white h-12 px-8">
                <Megaphone className="h-5 w-5 mr-2" />
                {isEn ? 'Create an alert' : 'Objavi oglas'}
              </Button>
            </Link>
          </div>
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
