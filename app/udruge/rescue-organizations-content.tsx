'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, HeartHandshake, MapPin, Search, X, SortAsc, SortDesc } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { CITIES } from '@/lib/types';
import type { RescueOrganization, RescueAppeal } from '@/lib/types';

interface RescueOrganizationsContentProps {
  organizations: RescueOrganization[];
  activeAppeals: RescueAppeal[];
}

type SortOption = 'newest' | 'alphabetical' | 'alphabetical-desc';

export function RescueOrganizationsContent({ organizations, activeAppeals }: RescueOrganizationsContentProps) {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Build appeal count map
  const appealCountByOrg = useMemo(() => {
    const map = new Map<string, number>();
    for (const appeal of activeAppeals) {
      map.set(appeal.organization_id, (map.get(appeal.organization_id) ?? 0) + 1);
    }
    return map;
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
  }, [organizations, search, cityFilter, sortBy]);

  const hasActiveFilters = search.trim() !== '' || cityFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setCityFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-cyan-50/40">
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
          <CardContent className="p-5 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pretraži po nazivu organizacije, opisu, gradu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11"
                aria-label="Pretraži organizacije"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Svi gradovi</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="newest">Najnovije prvo</option>
                <option value="alphabetical">A-Z (abecedno)</option>
                <option value="alphabetical-desc">Z-A (obratno)</option>
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
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
                <Button variant="outline" onClick={clearFilters} className="gap-2">
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

              return (
                <Card key={organization.id} className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold font-[var(--font-heading)] truncate">{organization.display_name}</h2>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{organization.city ?? 'Lokacija uskoro'}</span>
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">{appealCount} live apelacija</Badge>
                    </div>

                    <p className="mb-4 text-sm leading-6 text-muted-foreground line-clamp-3">
                      {organization.description ?? 'Organizacija još nije popunila javni opis.'}
                    </p>

                    <div className="mb-6 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Kontakt</p>
                      <p className="mt-1 truncate">{organization.email ?? 'Email uskoro'}{organization.phone ? (" · " + organization.phone) : ""}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <Link href={"/udruge/" + organization.slug}>
                        <Button>Profil organizacije</Button>
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
              <Button variant="outline" className="gap-2">
                Otvori dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
