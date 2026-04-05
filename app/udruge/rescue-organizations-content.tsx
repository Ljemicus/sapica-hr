'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, HeartHandshake, MapPin, RefreshCw, Search, Shield, X, Dog, Cat, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { CITIES, getAppealProgressPct } from '@/lib/types';
import type { RescueOrganization, RescueAppeal } from '@/lib/types';

interface RescueOrganizationsContentProps {
  organizations: RescueOrganization[];
  activeAppeals: RescueAppeal[];
}

type SortOption = 'newest' | 'alphabetical' | 'alphabetical-desc';
type SpeciesFilter = 'all' | 'dog' | 'cat' | 'other';

const SPECIES_LABELS: Record<SpeciesFilter, string> = {
  all: 'Sve vrste',
  dog: 'Psi',
  cat: 'Mačke',
  other: 'Ostalo',
};

const SPECIES_EMOJI: Record<Exclude<SpeciesFilter, 'all'>, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐾',
};

export function RescueOrganizationsContent({ organizations, activeAppeals }: RescueOrganizationsContentProps) {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  // Build appeal count map and species map (inferred from appeals)
  const { appealCountByOrg, appealGoalsByOrg, speciesByOrg } = useMemo(() => {
    const countMap = new Map<string, number>();
    const goalMap = new Map<string, { raised: number; target: number }>();
    const speciesMap = new Map<string, Set<string>>();
    
    for (const appeal of activeAppeals) {
      // Count appeals
      countMap.set(appeal.organization_id, (countMap.get(appeal.organization_id) ?? 0) + 1);
      
      // Track goal progress
      const current = goalMap.get(appeal.organization_id) ?? { raised: 0, target: 0 };
      goalMap.set(appeal.organization_id, {
        raised: current.raised + appeal.raised_amount_cents,
        target: current.target + appeal.target_amount_cents,
      });
      
      // Track species from appeals
      if (appeal.species) {
        const orgSpecies = speciesMap.get(appeal.organization_id) ?? new Set<string>();
        orgSpecies.add(appeal.species.toLowerCase());
        speciesMap.set(appeal.organization_id, orgSpecies);
      }
    }
    
    return { appealCountByOrg: countMap, appealGoalsByOrg: goalMap, speciesByOrg: speciesMap };
  }, [activeAppeals]);

  // Get unique cities from organizations that have a city
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    for (const org of organizations) {
      if (org.city) cities.add(org.city);
    }
    return Array.from(cities).sort();
  }, [organizations]);

  // Filter and sort organizations
  const filteredOrganizations = useMemo(() => {
    let result = [...organizations];

    // Apply search filter
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter((org) => {
        const haystack = [org.display_name, org.description, org.city, org.legal_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    // Apply city filter
    if (cityFilter !== 'all') {
      result = result.filter((org) => org.city === cityFilter);
    }

    // Apply species filter (inferred from appeals)
    if (speciesFilter !== 'all') {
      result = result.filter((org) => {
        const orgSpecies = speciesByOrg.get(org.id);
        if (!orgSpecies) return false;
        
        if (speciesFilter === 'other') {
          // For "other", match if there's any species that's not dog or cat
          return Array.from(orgSpecies).some(s => s !== 'dog' && s !== 'cat');
        }
        
        return orgSpecies.has(speciesFilter);
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.display_name.localeCompare(b.display_name, 'hr'));
        break;
      case 'alphabetical-desc':
        result.sort((a, b) => b.display_name.localeCompare(a.display_name, 'hr'));
        break;
    }

    return result;
  }, [organizations, search, cityFilter, speciesFilter, sortBy, speciesByOrg]);

  const hasActiveFilters = search.trim() !== '' || cityFilter !== 'all' || speciesFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setCityFilter('all');
    setSpeciesFilter('all');
    setSortBy('newest');
  };

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (pullStartY !== null && window.scrollY === 0) {
      const distance = e.touches[0].clientY - pullStartY;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    }
  }, [pullStartY]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      window.location.reload();
    }
    setPullStartY(null);
    setPullDistance(0);
  }, [pullDistance]);

  // Keyboard shortcut for refresh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        setIsRefreshing(true);
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getVerificationBadge = (org: RescueOrganization) => {
    if (org.verification_status === 'approved') {
      return (
        <Badge className="shrink-0 bg-blue-50 text-blue-700 border-0 gap-1">
          <BadgeCheck className="h-3 w-3" />
          Verificirana
        </Badge>
      );
    }
    if (org.verification_status === 'pending') {
      return (
        <Badge variant="outline" className="shrink-0 gap-1 text-amber-600 border-amber-200">
          <Shield className="h-3 w-3" />
          U provjeri
        </Badge>
      );
    }
    return null;
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-cyan-50/40"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none transition-transform duration-200 md:hidden"
        style={{ transform: `translateY(${Math.min(pullDistance - 60, 0)}px)` }}
      >
        <div className="bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 text-emerald-600 ${pullDistance > 80 ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium text-emerald-700">
            {pullDistance > 80 ? 'Otpusti za osvježavanje...' : 'Povuci za osvježavanje...'}
          </span>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">Rescue directory</Badge>
            <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)] md:text-4xl">
              Aktivne organizacije koje su prošle onboarding i mogu objavljivati apelacije
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Directory više nije mock vitrina — prikazuje samo rescue organizacije koje su aktivne u sustavu. Donacije još nisu dio javnog flowa, ali identitet, opis i live apelacije jesu.
            </p>
          </div>

          <div className="rounded-2xl border bg-white/90 p-4 shadow-sm lg:max-w-sm">
            <p className="text-sm font-semibold">Što je javno već sad</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>• listing aktivnih organizacija</li>
              <li>• profil pojedine organizacije</li>
              <li>• live apelacije vezane uz tu organizaciju</li>
            </ul>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-4 md:p-5 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pretraži po nazivu organizacije, opisu, gradu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 text-base"
                aria-label="Pretraži organizacije"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filters Row - Mobile optimized touch targets */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {/* City Filter */}
              <div className="relative min-w-[140px]">
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="h-12 min-h-[48px] w-full px-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <option value="all">🏙️ Svi gradovi</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Species Filter */}
              <div className="relative min-w-[140px]">
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value as SpeciesFilter)}
                  className="h-12 min-h-[48px] w-full px-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <option value="all">🐾 Sve vrste</option>
                  <option value="dog">🐕 Psi</option>
                  <option value="cat">🐈 Mačke</option>
                  <option value="other">🐰 Ostalo</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Sort Dropdown */}
              <div className="relative min-w-[140px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-12 min-h-[48px] w-full px-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <option value="newest">📅 Najnovije prvo</option>
                  <option value="alphabetical">🔤 A-Z (abecedno)</option>
                  <option value="alphabetical-desc">🔤 Z-A (obratno)</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Clear Filters - Desktop */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="default"
                  onClick={clearFilters}
                  className="gap-1.5 text-muted-foreground hover:text-foreground h-12 min-h-[48px]"
                >
                  <X className="h-3.5 w-3.5" />
                  Poništi filtere
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Prikazano <span className="font-semibold text-foreground">{filteredOrganizations.length}</span> od{' '}
                <span className="font-semibold text-foreground">{organizations.length}</span> organizacija
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {filteredOrganizations.length === 0 ? (
          <EmptyState
            icon={hasActiveFilters ? Search : HeartHandshake}
            title={hasActiveFilters ? 'Nema rezultata' : 'Trenutno nema aktivnih organizacija'}
            description={
              hasActiveFilters
                ? 'Pokušajte promijeniti filtere ili pojam pretrage.'
                : 'Nema aktivnih rescue organizacija za javni prikaz.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters} className="gap-2 h-12">
                  <X className="h-4 w-4" />
                  Poništi filtere
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrganizations.map((organization) => {
              const appealCount = appealCountByOrg.get(organization.id) ?? 0;
              const goalData = appealGoalsByOrg.get(organization.id);
              const orgSpecies = speciesByOrg.get(organization.id);
              const isVerified = organization.verification_status === 'approved';
              
              // Calculate progress if there are goals
              const progress = goalData && goalData.target > 0 
                ? Math.min(100, Math.round((goalData.raised / goalData.target) * 100))
                : null;

              return (
                <Card key={organization.id} className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="flex h-full flex-col p-5 md:p-6">
                    {/* Header with verification badge */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="text-xl font-semibold font-[var(--font-heading)] truncate">{organization.display_name}</h2>
                          {isVerified && (
                            <span title="Verificirana organizacija">
                              <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{organization.city ?? 'Lokacija uskoro'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Verification & Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getVerificationBadge(organization)}
                      {appealCount > 0 && (
                        <Badge variant="outline" className="shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                          {appealCount} {appealCount === 1 ? 'apelacija' : 'apelacije'}
                        </Badge>
                      )}
                    </div>

                    {/* Species badges */}
                    {orgSpecies && orgSpecies.size > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {Array.from(orgSpecies).slice(0, 3).map((species) => (
                          <Badge 
                            key={species} 
                            variant="secondary" 
                            className="text-xs bg-emerald-50 text-emerald-700 border-0"
                          >
                            {SPECIES_EMOJI[species as Exclude<SpeciesFilter, 'all'>] || '🐾'} {species === 'dog' ? 'Psi' : species === 'cat' ? 'Mačke' : species}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="mb-4 text-sm leading-6 text-muted-foreground line-clamp-3">
                      {organization.description ?? 'Organizacija još nije popunila javni opis.'}
                    </p>

                    {/* Goal Progress Bar */}
                    {progress !== null && progress > 0 && (
                      <div className="mb-4 rounded-xl bg-emerald-50 p-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-emerald-800">Skupljeno</span>
                          <span className="text-emerald-700">{progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-emerald-600">
                          {formatCurrency(goalData?.raised ?? 0)} od {formatCurrency(goalData?.target ?? 0)}
                        </p>
                      </div>
                    )}

                    <div className="mb-6 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Kontakt</p>
                      <p className="mt-1 truncate">{organization.email ?? 'Email uskoro'}{organization.phone ? (" · " + organization.phone) : ""}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <Link href={"/udruge/" + organization.slug}>
                        <Button className="h-11 px-4">Profil organizacije</Button>
                      </Link>
                      <Link href={`/apelacije`} className="text-sm font-medium text-emerald-700 hover:underline shrink-0">
                        Sve apelacije
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom Info Card */}
        <Card className="mt-8 border-0 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                Rescue dashboard i javni directory sada dijele isti data model
              </p>
              <p className="text-sm text-muted-foreground">
                Owner uređuje organizaciju u dashboardu, a javni sloj objavljuje samo active podatke iz iste baze.
              </p>
            </div>
            <Link href="/dashboard/rescue">
              <Button variant="outline" className="gap-2 h-11">
                Otvori dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat('hr-HR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(amountCents / 100);
}
