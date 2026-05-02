'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, HeartHandshake, MapPin, ArrowRight, Search, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAdoptionFavorites } from '@/hooks/use-adoption-favorites';
import { EmptyState } from '@/components/shared/empty-state';
import { RescueAlertBanner } from '@/components/adoption/rescue-alert-banner';
import { BeforeAfterSlider } from '@/components/adoption/before-after-slider';
import type { AdoptionListingCard } from '@/lib/types';
import {
  ADOPTION_SPECIES_EMOJI,
  ADOPTION_GENDER_LABELS,
  ADOPTION_SIZE_LABELS,
  CITIES,
} from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';

function formatAge(months: number | null, isEn: boolean): string {
  if (months == null) return isEn ? 'Unknown' : 'Nepoznato';
  if (months < 12) return isEn ? `${months} mo` : `${months} mj.`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0
    ? (isEn ? `${years} yr ${rem} mo` : `${years} g. ${rem} mj.`)
    : (isEn ? `${years} yr` : `${years} g.`);
}

export function AdoptionBrowseContent({ listings, forcedLanguage }: { listings: AdoptionListingCard[]; forcedLanguage?: 'hr' | 'en' }) {
  const { language } = useLanguage();
  const activeLanguage = forcedLanguage || language;
  const isEn = activeLanguage === 'en';
  const speciesFilters = [
    { value: 'all', label: isEn ? 'All' : 'Sve', emoji: '' },
    { value: 'dog', label: isEn ? 'Dogs' : 'Psi', emoji: '🐕' },
    { value: 'cat', label: isEn ? 'Cats' : 'Mačke', emoji: '🐈' },
    { value: 'rabbit', label: isEn ? 'Small pets' : 'Mali ljubimci', emoji: '🐰' },
    { value: 'other', label: isEn ? 'Other' : 'Ostalo', emoji: '🐾' },
  ];
  const sizeFilters = [
    { value: 'all', label: isEn ? 'All sizes' : 'Sve veličine' },
    { value: 'small', label: isEn ? 'Small' : 'Mali' },
    { value: 'medium', label: isEn ? 'Medium' : 'Srednji' },
    { value: 'large', label: isEn ? 'Large' : 'Veliki' },
  ];
  const genderFilters = [
    { value: 'all', label: isEn ? 'All genders' : 'Svi spolovi' },
    { value: 'male', label: isEn ? 'Male' : 'Muški' },
    { value: 'female', label: isEn ? 'Female' : 'Ženski' },
  ];
  const genderLabels = isEn ? { male: 'Male', female: 'Female' } : ADOPTION_GENDER_LABELS;
  const sizeLabels = isEn ? { small: 'Small', medium: 'Medium', large: 'Large' } : ADOPTION_SIZE_LABELS;
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

  // Surface urgent listings first, then keep the rescue banner useful when real listings exist.
  const urgentPets = useMemo(() => {
    const urgent = listings
      .filter(l => l.is_urgent || l.name.toLowerCase().includes('hitno'))
      .slice(0, 3)
      .map(l => ({
        id: l.id,
        name: l.name,
        species: l.species,
        reason: 'Traži dom hitno',
        deadline: 'Ograničeno vrijeme',
        image_url: l.images?.[0]?.url || '',
        city: l.city,
      }));
    
    if (urgent.length === 0 && listings.length > 0) {
      return listings.slice(0, 2).map(l => ({
        id: l.id,
        name: l.name,
        species: l.species,
        reason: 'Čeka na dom',
        deadline: 'Udomi me',
        image_url: l.images?.[0]?.url || '',
        city: l.city,
      }));
    }
    
    return urgent;
  }, [listings]);

  return (
    <div className="min-h-screen bg-background">
      {/* Rescue Alert Banner */}
      <RescueAlertBanner urgentPets={urgentPets} />

      {/* Editorial Hero */}
      <section className="relative adoption-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange font-semibold mb-4">
              {isEn ? 'Give a home' : 'Udomljavanje'}
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-[var(--font-heading)] leading-[1.05] tracking-tight mb-6">
              {isEn ? 'Adopt a pet' : 'Udomite ljubimca'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              {isEn ? 'Give a home to the ones who need it most. Browse dogs, cats, and small pets available for adoption across Croatia.' : 'Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i male ljubimce za udomljavanje diljem Hrvatske.'}
            </p>
            <div className="inline-flex items-center gap-2 bg-warm-orange/10 dark:bg-warm-orange/20 rounded-full px-6 py-3">
              <Heart className="h-4 w-4 text-warm-orange fill-warm-orange" />
              <span className="text-sm font-semibold text-foreground">
                {listings.length} {isEn ? (listings.length === 1 ? 'pet waiting for a home' : 'pets waiting for a home') : (listings.length === 1 ? 'ljubimac čeka dom' : 'ljubimaca čeka dom')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 -mt-8 relative z-10">
        <div className="community-section-card p-5 md:p-7">
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={isEn ? 'Search by name, breed, city...' : 'Pretraži po imenu, pasmini, gradu...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="forum-search-input"
              aria-label={isEn ? 'Search adoption listings' : 'Pretraži oglase za udomljavanje'}
            />
          </div>

          {/* Species pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {speciesFilters.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeciesFilter(s.value)}
                data-active={speciesFilter === s.value}
                className={`filter-pill ${
                  speciesFilter === s.value
                    ? 'bg-warm-orange text-white'
                    : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'
                }`}
              >
                {s.emoji && <span className="mr-1.5">{s.emoji}</span>}
                {s.label}
              </button>
            ))}
          </div>

          {/* Dropdown filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={cityFilter || 'all'}
              onChange={(e) => setCityFilter(e.target.value)}
              className="premium-select"
            >
              <option value="all">{isEn ? 'All cities' : 'Svi gradovi'}</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={sizeFilter || 'all'}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="premium-select"
            >
              {sizeFilters.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select
              value={genderFilter || 'all'}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="premium-select"
            >
              {genderFilters.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              {isEn ? 'Clear filters' : 'Poništi filtere'}
            </button>
          )}

          {/* Result count */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {isEn ? (filtered.length === 1 ? 'pet found' : 'pets found') : (filtered.length === 1 ? 'ljubimac' : 'ljubimaca')} {isEn ? '' : 'pronađeno'}
            </p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16">
        {filtered.length === 0 ? (
          <EmptyState
            icon={hasActiveFilters ? Search : HeartHandshake}
            title={hasActiveFilters ? (isEn ? 'No results' : 'Nema rezultata') : (isEn ? 'No active listings right now' : 'Trenutno nema aktivnih oglasa')}
            description={hasActiveFilters ? (isEn ? 'Try changing your filters or search term.' : 'Pokušajte promijeniti filtere ili pojam pretrage.') : (isEn ? 'New adoption listings appear as soon as they are published. Check back soon.' : 'Novi oglasi za udomljavanje pojavljuju se čim budu objavljeni. Provjerite ponovno uskoro.')}
            action={hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-warm-orange hover:text-warm-orange/80 transition-colors"
              >
                {isEn ? 'Clear all filters' : 'Poništi sve filtere'}
              </button>
            ) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((listing, index) => {
              const primaryImage = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];

              return (
                <Link key={listing.id} href={`/udomljavanje/${listing.id}`}>
                  <div
                    className="adoption-card group cursor-pointer overflow-hidden h-full animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
                  >
                    {/* Image */}
                    <div className={`relative h-52 ${primaryImage ? 'bg-muted' : 'bg-gradient-to-br from-warm-peach to-warm-orange/30'} flex items-center justify-center overflow-hidden`}>
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt || listing.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 paw-pattern opacity-10" />
                          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                            {ADOPTION_SPECIES_EMOJI[listing.species]}
                          </span>
                        </>
                      )}

                      {/* Gradient overlay */}
                      {primaryImage && <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />}

                      {/* Urgent badge */}
                      {listing.is_urgent && (
                        <div className="absolute top-3.5 left-3.5">
                          <Badge className="bg-warm-coral text-white font-bold rounded-full flex items-center gap-1.5 px-3 py-1 hover:bg-warm-coral">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            {isEn ? 'Urgent' : 'Hitno'}
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
                        aria-label={isFavorite(listing.id) ? (isEn ? `Remove ${listing.name} from favorites` : `Ukloni ${listing.name} iz favorita`) : (isEn ? `Add ${listing.name} to favorites` : `Dodaj ${listing.name} u favorite`)}
                        className={`absolute top-3.5 right-3.5 p-2.5 rounded-full transition-all duration-200 ${
                          isFavorite(listing.id)
                            ? 'bg-warm-coral text-white shadow-lg shadow-warm-coral/30'
                            : 'bg-white/90 dark:bg-card/90 text-muted-foreground hover:text-warm-coral hover:bg-white shadow-sm backdrop-blur-sm'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-lg group-hover:text-warm-orange transition-colors font-[var(--font-heading)]">
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
                          <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary border-0 rounded-full text-xs font-medium">
                            {genderLabels[listing.gender]}
                          </Badge>
                        )}
                        <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary border-0 rounded-full text-xs font-medium">
                          {formatAge(listing.age_months, isEn)}
                        </Badge>
                        {listing.size && (
                          <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary border-0 rounded-full text-xs font-medium">
                            {sizeLabels[listing.size]}
                          </Badge>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5 text-warm-orange" />
                        {listing.city}
                      </div>

                      {/* Publisher */}
                      {listing.publisher_display_name && (
                        <div className="rounded-xl bg-warm-peach/30 dark:bg-warm-peach/10 px-3.5 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5">{isEn ? 'Care provided by' : 'O njemu brine'}</p>
                          <p className="text-sm font-semibold text-warm-orange">{listing.publisher_display_name}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
                        <span className="text-sm font-semibold text-warm-orange flex items-center gap-1.5">
                          {isEn ? 'View pet profile' : 'Pogledaj profil ljubimca'} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Success Stories with Before/After */}
      <section className="bg-warm-section">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">{isEn ? 'Success Stories' : 'Priče sretnog završetka'}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] leading-[1.1] mb-4">
              {isEn ? 'From rescue to beloved family member' : 'Od spasavanja do voljenog člana obitelji'}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? 'See the incredible transformations of pets who found their forever homes through PetPark.'
                : 'Pogledajte nevjerojatne transformacije ljubimaca koji su pronašli svoje zauvijek domove putem PetParka.'}
            </p>
          </div>

          {/* Before/After Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=600&fit=crop"
                afterImage="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop"
                beforeLabel={isEn ? 'Before' : 'Prije'}
                afterLabel={isEn ? 'After' : 'Poslije'}
                className="shadow-2xl"
              />
              <div className="mt-4 text-center">
                <h3 className="font-bold text-lg">Max</h3>
                <p className="text-sm text-muted-foreground">{isEn ? 'Found his forever home in Zagreb' : 'Pronašao dom u Zagrebu'}</p>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop"
                afterImage="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop"
                beforeLabel={isEn ? 'Before' : 'Prije'}
                afterLabel={isEn ? 'After' : 'Poslije'}
                className="shadow-2xl"
              />
              <div className="mt-4 text-center">
                <h3 className="font-bold text-lg">Luna</h3>
                <p className="text-sm text-muted-foreground">{isEn ? 'Rescued and thriving in Split' : 'Spašena i sretna u Splitu'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-b from-warm-section to-background">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange font-semibold mb-4">
              {isEn ? 'Every pet deserves love' : 'Svaki ljubimac zaslužuje ljubav'}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] leading-[1.1] mb-6">
              {isEn ? 'Open your heart and home' : 'Otvorite srce i dom'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isEn
                ? 'Browse pets waiting for adoption. When you find the right match, send an inquiry and take the first step.'
                : 'Pregledajte ljubimce koji čekaju udomljavanje. Kad pronađete pravog, pošaljite upit i napravite prvi korak.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
