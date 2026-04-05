'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, MapPin, Calendar, Plus, AlertTriangle, Map, List, Loader2, CheckCircle2, Heart, Clock, ArrowRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LostPet } from '@/lib/types';
import { LOST_PET_SPECIES_LABELS, LOST_PET_STATUS_LABELS, CITIES, isLostPetExpired, isLostPetExpiringSoon, lostPetDaysUntilExpiry } from '@/lib/types';
import { EmptyState } from '@/components/shared/empty-state';
import { ShareButtons } from './share-buttons';
import { AlertSubscribeDialog } from './alert-subscribe-dialog';
import { useLanguage } from '@/lib/i18n/context';

const LostPetsMap = dynamic(() => import('@/components/shared/lost-pets-map'), { ssr: false });

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysAgo(dateStr: string, isEn: boolean) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return isEn ? 'Today' : 'Danas';
  if (diff === 1) return isEn ? 'Yesterday' : 'Jučer';
  return isEn ? `${diff} days ago` : `Prije ${diff} dana`;
}

function getLatestActivityDate(pet: LostPet) {
  const dates = [
    ...pet.updates.map((update) => update.date),
    ...pet.sightings.map((sighting) => sighting.date),
  ].filter(Boolean);

  if (pet.found_at) dates.push(pet.found_at);
  if (dates.length === 0) return null;

  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
}

function isRecentActivity(dateStr: string | null, days = 3) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() <= days * 24 * 60 * 60 * 1000;
}

export function LostPetsContent() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? 'en-GB' : 'hr-HR';
  const statusLabels = isEn ? { lost: 'Still missing', found: 'Found!', expired: 'Listing expired' } : LOST_PET_STATUS_LABELS;
  const speciesLabels = isEn ? { pas: 'Dog', macka: 'Cat', ostalo: 'Other' } : LOST_PET_SPECIES_LABELS;
  const [pets, setPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string | null>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string | null>('all');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (cityFilter && cityFilter !== 'all') params.set('city', cityFilter);
      if (speciesFilter && speciesFilter !== 'all') params.set('species', speciesFilter);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      try {
        const res = await fetch(`/api/lost-pets/list?${params.toString()}`);
        const data = await res.json();
        setPets(Array.isArray(data) ? data : []);
      } catch {
        setPets([]);
      }
      setLoading(false);
    }
    load();
  }, [cityFilter, speciesFilter, statusFilter]);

  const lostCount = pets.filter(p => p.status === 'lost').length;

  const speciesFilters = [
    { value: 'all', label: isEn ? 'All' : 'Sve', emoji: '' },
    { value: 'pas', label: isEn ? 'Dogs' : 'Psi', emoji: '🐕' },
    { value: 'macka', label: isEn ? 'Cats' : 'Mačke', emoji: '🐈' },
    { value: 'ostalo', label: isEn ? 'Other' : 'Ostalo', emoji: '🐾' },
  ];

  const statusFilters = [
    { value: 'all', label: isEn ? 'All statuses' : 'Svi statusi' },
    { value: 'lost', label: isEn ? 'Still missing' : 'Još se traži' },
    { value: 'found', label: isEn ? 'Found' : 'Pronađen' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Hero */}
      <section className="relative lost-pets-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-coral font-semibold mb-4">
              {isEn ? 'Community' : 'Zajednica'}
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-[var(--font-heading)] leading-[1.05] tracking-tight mb-6">
              {isEn ? 'Lost pets' : 'Izgubljeni ljubimci'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              {isEn
                ? 'Every share increases the chance of a pet getting back home. Help by spreading the word.'
                : 'Svako dijeljenje povećava šansu da se ljubimac vrati kući. Pomozite — podijelite!'}
            </p>

            {/* Urgency counter */}
            <div className="inline-flex items-center gap-3 bg-warm-coral/10 dark:bg-warm-coral/20 rounded-full px-6 py-3 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-coral opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-warm-coral" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {loading ? '...' : (isEn ? `${lostCount} ${lostCount === 1 ? 'pet currently missing' : 'pets currently missing'}` : `${lostCount} ljubimaca se trenutno traži`)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/izgubljeni/prijavi">
                <Button size="lg" className="bg-warm-coral hover:bg-warm-coral/90 text-white font-bold h-14 px-10 rounded-full text-base shadow-2xl shadow-warm-coral/20 btn-hover">
                  <Plus className="h-5 w-5 mr-2" />
                  {isEn ? 'Report a missing pet' : 'Prijavi nestanak ljubimca'}
                </Button>
              </Link>
              <AlertSubscribeDialog />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 -mt-8 relative z-10">
        <div className="community-section-card p-5 md:p-7">
          {/* Species pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {speciesFilters.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeciesFilter(s.value)}
                data-active={speciesFilter === s.value}
                className={`filter-pill ${
                  speciesFilter === s.value
                    ? 'bg-warm-coral text-white'
                    : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-coral/30'
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
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={statusFilter || 'all'}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="premium-select"
            >
              {statusFilters.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('list')}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-all ${
                  view === 'list'
                    ? 'bg-warm-coral text-white shadow-md'
                    : 'bg-white dark:bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-4 w-4" />
                {isEn ? 'List' : 'Lista'}
              </button>
              <button
                onClick={() => setView('map')}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-all ${
                  view === 'map'
                    ? 'bg-warm-coral text-white shadow-md'
                    : 'bg-white dark:bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Map className="h-4 w-4" />
                {isEn ? 'Map' : 'Mapa'}
              </button>
            </div>
          </div>

          {/* Result count */}
          <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? '...' : `${pets.length} ${isEn ? 'results' : 'rezultata'}`}
            </p>
          </div>
        </div>
      </section>

      {/* Map View */}
      {view === 'map' && (
        <section className="container mx-auto px-6 md:px-10 lg:px-16 mt-8">
          <div className="h-[500px] rounded-2xl overflow-hidden community-section-card">
            <LostPetsMap pets={pets} />
          </div>
        </section>
      )}

      {/* Pet Cards */}
      <section className={`container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 ${view === 'map' ? 'hidden' : ''}`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-warm-coral" />
            <span className="ml-3 text-muted-foreground">{isEn ? 'Loading...' : 'Učitavanje...'}</span>
          </div>
        ) : pets.length === 0 ? (
          <EmptyState
            icon={Search}
            title={isEn ? 'No results' : 'Nema rezultata'}
            description={isEn ? 'There are no reports for the selected filters. Try another city, species, or status.' : 'Nema prijava za odabrane filtere. Pokušajte promijeniti grad, vrstu ili status.'}
            action={
              <Link href="/izgubljeni/prijavi">
                <Button size="sm" className="bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full px-6 btn-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  {isEn ? 'Report missing pet' : 'Prijavi nestanak'}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {pets.map((pet, index) => {
              const expired = isLostPetExpired(pet);
              const expiringSoon = isLostPetExpiringSoon(pet);
              const daysLeft = lostPetDaysUntilExpiry(pet);
              const latestActivity = getLatestActivityDate(pet);
              const showRecentActivity = pet.status === 'lost' && isRecentActivity(latestActivity);
              return (
                <div
                  key={pet.id}
                  className={`lost-pet-card overflow-hidden animate-fade-in-up ${expired ? 'opacity-70' : ''}`}
                  style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
                >
                  <div className="relative">
                    <Link href={`/izgubljeni/${pet.id}`}>
                      <div className="relative h-56 bg-muted">
                        <Image
                          src={pet.image_url}
                          alt={pet.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className={`object-cover${expired ? ' grayscale' : ''} group-hover:scale-105 transition-transform duration-500`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      </div>
                    </Link>

                    {/* Status badge */}
                    {expired ? (
                      <Badge className="absolute top-4 left-4 bg-foreground/60 text-white font-semibold px-3 py-1 rounded-full text-xs backdrop-blur-sm hover:bg-foreground/60">
                        <Clock className="h-3 w-3 mr-1.5 inline" /> {isEn ? 'Expired' : 'Istekao'}
                      </Badge>
                    ) : pet.status === 'found' ? (
                      <Badge className="absolute top-4 left-4 bg-emerald-500 text-white font-semibold px-3 py-1 rounded-full text-xs hover:bg-emerald-500">
                        <CheckCircle2 className="h-3 w-3 mr-1.5 inline" /> {statusLabels.found}
                      </Badge>
                    ) : (
                      <Badge className="absolute top-4 left-4 bg-warm-coral text-white font-semibold px-3 py-1 rounded-full text-xs hover:bg-warm-coral">
                        <AlertTriangle className="h-3 w-3 mr-1.5 inline" /> {statusLabels.lost}
                      </Badge>
                    )}

                    {/* Expiry warning */}
                    {expiringSoon && daysLeft !== null && (
                      <Badge className="absolute top-4 right-4 bg-amber-500/90 text-white font-medium px-2.5 py-1 rounded-full text-xs backdrop-blur-sm hover:bg-amber-500/90">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        {isEn ? `${daysLeft}d left` : `${daysLeft}d`}
                      </Badge>
                    )}

                    {showRecentActivity && latestActivity && (
                      <Badge className="absolute bottom-16 left-4 bg-white/90 text-foreground font-medium px-2.5 py-1 rounded-full text-xs backdrop-blur-sm hover:bg-white/90">
                        <Bell className="h-3 w-3 mr-1 inline text-warm-coral" />
                        {isEn ? `Updated ${daysAgo(latestActivity, isEn).toLowerCase()}` : `Ažurirano ${daysAgo(latestActivity, isEn).toLowerCase()}`}
                      </Badge>
                    )}

                    {/* Pet name overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold font-[var(--font-heading)] text-white drop-shadow-lg">{pet.name}</h3>
                      <p className="text-sm text-white/85 drop-shadow mt-0.5">
                        {speciesLabels[pet.species]} · {pet.breed} · {pet.color}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Found reunion summary */}
                    {pet.status === 'found' && pet.found_at && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 flex items-start gap-2.5">
                        <Heart className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {isEn
                              ? `Found after ${Math.max(1, Math.floor((new Date(pet.found_at).getTime() - new Date(pet.date_lost).getTime()) / 86400000))} days`
                              : `Pronađen/a nakon ${Math.max(1, Math.floor((new Date(pet.found_at).getTime() - new Date(pet.date_lost).getTime()) / 86400000))} dana`}
                          </p>
                          {pet.reunion_message && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-0.5 line-clamp-2 italic">&ldquo;{pet.reunion_message}&rdquo;</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-warm-coral shrink-0" />
                      <span className="font-medium text-foreground">{pet.city}{pet.neighborhood ? `, ${pet.neighborhood}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatDate(pet.date_lost, locale)} ({daysAgo(pet.date_lost, isEn)})</span>
                    </div>

                    {/* Share & CTA */}
                    <div className="pt-3 border-t border-border/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{pet.share_count} {isEn ? 'shares' : 'dijeljenja'}</span>
                      </div>
                      <ShareButtons petName={pet.name} city={pet.city} petId={pet.id} />
                      <Link href={`/izgubljeni/${pet.id}`} className="block">
                        <button className={`w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all ${
                          pet.status === 'found'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30'
                            : 'bg-warm-coral/10 dark:bg-warm-coral/20 text-warm-coral hover:bg-warm-coral/15 dark:hover:bg-warm-coral/25'
                        }`}>
                          {pet.status === 'found'
                            ? (isEn ? 'Read reunion story' : 'Pročitajte priču')
                            : (isEn ? 'View details' : 'Pogledaj detalje')}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-warm-section">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-coral font-semibold mb-4">
              {isEn ? 'Help a pet come home' : 'Pomozite ljubimcu da dođe kući'}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] leading-[1.1] mb-6">
              {isEn ? 'Has your pet gone missing?' : 'Je li vaš ljubimac nestao?'}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {isEn
                ? 'Report a missing pet to alert the community. Every share counts.'
                : 'Prijavite nestanak ljubimca i obavijestite zajednicu. Svako dijeljenje pomaže.'}
            </p>
            <Link href="/izgubljeni/prijavi">
              <Button size="lg" className="bg-warm-coral hover:bg-warm-coral/90 text-white font-bold h-14 px-10 rounded-full text-base shadow-2xl shadow-warm-coral/20 btn-hover">
                <Plus className="h-5 w-5 mr-2" />
                {isEn ? 'Report a missing pet' : 'Prijavi nestanak ljubimca'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
