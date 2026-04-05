'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, MapPin, Calendar, Plus, AlertTriangle, Map, List, Loader2, CheckCircle2, Heart, Clock, ArrowRight, Bell, Eye, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
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

function getUnreviewedSightingsCount(pet: LostPet): number {
  return pet.sightings.filter(s => s.status === 'new').length;
}

function getTotalSightingsCount(pet: LostPet): number {
  return pet.sightings.length;
}

function hasActiveSightings(pet: LostPet): boolean {
  return pet.sightings.some(s => s.status === 'new' || s.status === 'helpful');
}

type SortOption = 'newest' | 'most_leads' | 'most_unreviewed' | 'recent_activity' | 'oldest';
type LeadFilterOption = 'all' | 'has_leads' | 'unreviewed' | 'no_leads';

interface LostPetsContentProps {
  /** Optional user ID to filter for user's own listings */
  userId?: string;
  /** Optional flag to show only listings with unreviewed leads */
  showNeedsReviewOnly?: boolean;
}

export function LostPetsContent({ userId, showNeedsReviewOnly = false }: LostPetsContentProps = {}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? 'en-GB' : 'hr-HR';
  const statusLabels = isEn ? { lost: 'Still missing', found: 'Found!', expired: 'Listing expired' } : LOST_PET_STATUS_LABELS;
  const speciesLabels = isEn ? { pas: 'Dog', macka: 'Cat', ostalo: 'Other' } : LOST_PET_SPECIES_LABELS;
  const [pets, setPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leadFilter, setLeadFilter] = useState<LeadFilterOption>(showNeedsReviewOnly ? 'unreviewed' : 'all');
  const [sortBy, setSortBy] = useState<SortOption>(showNeedsReviewOnly ? 'most_unreviewed' : 'newest');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (cityFilter && cityFilter !== 'all') params.set('city', cityFilter);
      if (speciesFilter && speciesFilter !== 'all') params.set('species', speciesFilter);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (userId) params.set('userId', userId);
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
  }, [cityFilter, speciesFilter, statusFilter, userId]);

  // Calculate lead statistics for filter indicators
  const leadStats = useMemo(() => {
    const stats = {
      withUnreviewed: 0,
      withLeads: 0,
      withoutLeads: 0,
    };
    pets.forEach(pet => {
      const unreviewed = getUnreviewedSightingsCount(pet);
      const total = getTotalSightingsCount(pet);
      if (unreviewed > 0) stats.withUnreviewed++;
      if (total > 0) stats.withLeads++;
      else stats.withoutLeads++;
    });
    return stats;
  }, [pets]);

  // Filter and sort pets
  const filteredAndSortedPets = useMemo(() => {
    let result = [...pets];

    // Apply lead filter
    if (leadFilter !== 'all') {
      result = result.filter(pet => {
        const unreviewedCount = getUnreviewedSightingsCount(pet);
        const totalCount = getTotalSightingsCount(pet);
        
        switch (leadFilter) {
          case 'has_leads':
            return totalCount > 0;
          case 'unreviewed':
            return unreviewedCount > 0;
          case 'no_leads':
            return totalCount === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_leads': {
          const aLeads = getTotalSightingsCount(a);
          const bLeads = getTotalSightingsCount(b);
          if (bLeads !== aLeads) return bLeads - aLeads;
          // Secondary sort by unreviewed leads
          return getUnreviewedSightingsCount(b) - getUnreviewedSightingsCount(a);
        }
        case 'most_unreviewed': {
          const aUnreviewed = getUnreviewedSightingsCount(a);
          const bUnreviewed = getUnreviewedSightingsCount(b);
          if (bUnreviewed !== aUnreviewed) return bUnreviewed - aUnreviewed;
          // Secondary sort by total leads
          return getTotalSightingsCount(b) - getTotalSightingsCount(a);
        }
        case 'recent_activity': {
          const aDate = getLatestActivityDate(a);
          const bDate = getLatestActivityDate(b);
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }
        default:
          return 0;
      }
    });

    return result;
  }, [pets, leadFilter, sortBy]);

  const lostCount = pets.filter(p => p.status === 'lost').length;
  const totalUnreviewedLeads = pets.reduce((sum, pet) => sum + getUnreviewedSightingsCount(pet), 0);

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

  const leadFilters: { value: LeadFilterOption; label: string; count?: number }[] = [
    { value: 'all', label: isEn ? 'All listings' : 'Svi oglasi' },
    { value: 'has_leads', label: isEn ? 'Has leads' : 'Ima tragove', count: leadStats.withLeads },
    { value: 'unreviewed', label: isEn ? 'Unreviewed leads' : 'Nepregledani tragovi', count: leadStats.withUnreviewed },
    { value: 'no_leads', label: isEn ? 'No leads yet' : 'Još nema tragova', count: leadStats.withoutLeads },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: isEn ? 'Newest first' : 'Najnovije' },
    { value: 'oldest', label: isEn ? 'Oldest first' : 'Najstarije' },
    { value: 'most_leads', label: isEn ? 'Most leads' : 'Najviše tragova' },
    { value: 'most_unreviewed', label: isEn ? 'Most unreviewed' : 'Najviše nepregledanih' },
    { value: 'recent_activity', label: isEn ? 'Recent activity' : 'Nedavna aktivnost' },
  ];

  const activeFiltersCount = [
    cityFilter !== 'all',
    speciesFilter !== 'all',
    statusFilter !== 'all',
    leadFilter !== 'all',
  ].filter(Boolean).length;

  const needsReviewActive = leadFilter === 'unreviewed';

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

          {/* Primary filters row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="premium-select"
            >
              <option value="all">{isEn ? 'All cities' : 'Svi gradovi'}</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={statusFilter}
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

          {/* Quick lead filters - NEW */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setLeadFilter(needsReviewActive ? 'all' : 'unreviewed')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                needsReviewActive
                  ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-950/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isEn ? 'Needs Review' : 'Treba pregled'}
              {!loading && leadStats.withUnreviewed > 0 && (
                <Badge variant="secondary" className={`ml-1 text-xs ${needsReviewActive ? 'bg-violet-400 text-white' : 'bg-violet-200 text-violet-800'}`}>
                  {leadStats.withUnreviewed}
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setLeadFilter(leadFilter === 'has_leads' ? 'all' : 'has_leads')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                leadFilter === 'has_leads'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              {isEn ? 'Has Leads' : 'Ima tragove'}
              {!loading && leadStats.withLeads > 0 && (
                <Badge variant="secondary" className={`ml-1 text-xs ${leadFilter === 'has_leads' ? 'bg-blue-400 text-white' : 'bg-blue-200 text-blue-800'}`}>
                  {leadStats.withLeads}
                </Badge>
              )}
            </button>

            <button
              onClick={() => setLeadFilter(leadFilter === 'no_leads' ? 'all' : 'no_leads')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                leadFilter === 'no_leads'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50'
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              {isEn ? 'No Leads Yet' : 'Još nema tragova'}
              {!loading && leadStats.withoutLeads > 0 && (
                <Badge variant="secondary" className={`ml-1 text-xs ${leadFilter === 'no_leads' ? 'bg-amber-400 text-white' : 'bg-amber-200 text-amber-800'}`}>
                  {leadStats.withoutLeads}
                </Badge>
              )}
            </button>
          </div>

          {/* Advanced filters toggle */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {isEn ? 'Advanced filters' : 'Napredni filteri'}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <span className={`ml-auto transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Advanced filters panel */}
            {showAdvancedFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in-up">
                <select
                  value={leadFilter}
                  onChange={(e) => setLeadFilter(e.target.value as LeadFilterOption)}
                  className="premium-select"
                >
                  {leadFilters.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}{f.count !== undefined && f.count > 0 ? ` (${f.count})` : ''}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="premium-select"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Result count */}
          <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading 
                ? (isEn ? 'Loading...' : 'Učitavanje...')
                : `${filteredAndSortedPets.length} ${isEn ? 'results' : 'rezultata'}`
              }
              {!loading && totalUnreviewedLeads > 0 && (
                <span className="ml-2 text-warm-coral font-medium">
                  · {totalUnreviewedLeads} {isEn ? 'unreviewed leads total' : 'ukupno nepregledanih tragova'}
                </span>
              )}
            </p>
            
            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setCityFilter('all');
                  setSpeciesFilter('all');
                  setStatusFilter('all');
                  setLeadFilter('all');
                }}
                className="text-sm text-muted-foreground hover:text-warm-coral transition-colors"
              >
                {isEn ? 'Clear filters' : 'Očisti filtere'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Map View */}
      {view === 'map' && (
        <section className="container mx-auto px-6 md:px-10 lg:px-16 mt-8">
          <div className="h-[500px] rounded-2xl overflow-hidden community-section-card">
            <LostPetsMap pets={filteredAndSortedPets} />
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
        ) : filteredAndSortedPets.length === 0 ? (
          <EmptyState
            icon={Search}
            title={isEn ? 'No results' : 'Nema rezultata'}
            description={isEn ? 'There are no reports for the selected filters. Try adjusting your filters or check back later.' : 'Nema prijava za odabrane filtere. Pokušajte prilagoditi filtere ili provjerite kasnije.'}
            action={
              <div className="flex flex-col sm:flex-row gap-3">
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setCityFilter('all');
                      setSpeciesFilter('all');
                      setStatusFilter('all');
                      setLeadFilter('all');
                    }}
                    className="rounded-full px-6"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {isEn ? 'Clear filters' : 'Očisti filtere'}
                  </Button>
                )}
                <Link href="/izgubljeni/prijavi">
                  <Button size="sm" className="bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full px-6 btn-hover">
                    <Plus className="h-4 w-4 mr-2" />
                    {isEn ? 'Report missing pet' : 'Prijavi nestanak'}
                  </Button>
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredAndSortedPets.map((pet, index) => {
              const expired = isLostPetExpired(pet);
              const expiringSoon = isLostPetExpiringSoon(pet);
              const daysLeft = lostPetDaysUntilExpiry(pet);
              const latestActivity = getLatestActivityDate(pet);
              const showRecentActivity = pet.status === 'lost' && isRecentActivity(latestActivity);
              const unreviewedCount = getUnreviewedSightingsCount(pet);
              const totalSightings = getTotalSightingsCount(pet);
              const hasLeads = totalSightings > 0;
              
              return (
                <div
                  key={pet.id}
                  className={`lost-pet-card overflow-hidden animate-fade-in-up ${expired ? 'opacity-70' : ''}`}
                  style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
                >
                  <div className="relative">
                    <Link href={"/izgubljeni/" + pet.id}>
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

                    {/* Unreviewed leads badge - prominent */}
                    {unreviewedCount > 0 && (
                      <Badge className="absolute top-4 right-4 bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-full text-xs backdrop-blur-sm shadow-lg animate-pulse">
                        <Eye className="h-3 w-3 mr-1.5 inline" />
                        {unreviewedCount} {isEn 
                          ? (unreviewedCount === 1 ? 'unreviewed lead' : 'unreviewed leads')
                          : (unreviewedCount === 1 ? 'nepregledan trag' : 'nepregledana traga')
                        }
                      </Badge>
                    )}

                    {/* Total leads badge (when no unreviewed but has leads) */}
                    {unreviewedCount === 0 && hasLeads && pet.status === 'lost' && (
                      <Badge className="absolute top-4 right-4 bg-blue-500/90 text-white font-medium px-2.5 py-1 rounded-full text-xs backdrop-blur-sm">
                        <Eye className="h-3 w-3 mr-1 inline" />
                        {totalSightings} {isEn 
                          ? (totalSightings === 1 ? 'lead' : 'leads')
                          : (totalSightings === 1 ? 'trag' : 'traga')
                        }
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

                    {/* Lead summary for lost pets */}
                    {pet.status === 'lost' && hasLeads && (
                      <div className={`rounded-xl p-3 flex items-start gap-2.5 ${
                        unreviewedCount > 0 
                          ? 'bg-violet-50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40'
                          : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40'
                      }`}>
                        <Eye className={`h-4 w-4 mt-0.5 shrink-0 ${
                          unreviewedCount > 0 ? 'text-violet-500' : 'text-blue-500'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold ${
                            unreviewedCount > 0 
                              ? 'text-violet-700 dark:text-violet-400'
                              : 'text-blue-700 dark:text-blue-400'
                          }`}>
                            {unreviewedCount > 0 
                              ? (isEn 
                                ? `${unreviewedCount} of ${totalSightings} leads need review`
                                : `${unreviewedCount} od ${totalSightings} traga treba pregled`)
                              : (isEn 
                                ? `${totalSightings} ${totalSightings === 1 ? 'lead' : 'leads'} reviewed`
                                : `${totalSightings} ${totalSightings === 1 ? 'trag pregledan' : 'traga pregledano'`)
                            }
                          </p>
                          {unreviewedCount > 0 && (
                            <p className="text-xs text-violet-600 dark:text-violet-400/80 mt-0.5">
                              {isEn ? 'Click to view and review' : 'Kliknite za pregled'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-warm-coral shrink-0" />
                      <span className="font-medium text-foreground">{pet.city}{pet.neighborhood ? (", " + pet.neighborhood) : ""}</span>
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
                      <Link href={"/izgubljeni/" + pet.id} className="block">
                        <button className={pet.status === 'found'
                            ? 'w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30'
                            : unreviewedCount > 0
                              ? 'w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all bg-violet-500 text-white hover:bg-violet-600 shadow-md shadow-violet-500/20'
                              : 'w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all bg-warm-coral/10 dark:bg-warm-coral/20 text-warm-coral hover:bg-warm-coral/15 dark:hover:bg-warm-coral/25'
                        }>
                          {pet.status === 'found'
                            ? (isEn ? 'Read reunion story' : 'Pročitajte priču')
                            : unreviewedCount > 0
                              ? (isEn ? 'Review leads' : 'Pregledaj tragove')
                              : (isEn ? 'View details' : 'Pogledaj detalje')
                          }
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
