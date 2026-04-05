'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, MapPin, Calendar, Plus, Filter, AlertTriangle, Map, List, Loader2, CheckCircle2, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/50 via-white to-orange-50/30">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white">
        <div className="absolute inset-0 paw-pattern opacity-[0.05]" />
        <div className="container mx-auto px-4 py-16 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              {loading ? '...' : (isEn ? `${lostCount} ${lostCount === 1 ? 'pet is currently missing' : 'pets are currently missing'}` : `${lostCount} ljubimaca se trenutno traži`)}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              {isEn ? 'Lost pets' : 'Izgubljeni ljubimci'}
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              {isEn ? 'Every share increases the chance of a pet getting back home. Help by spreading the word.' : 'Svako dijeljenje povećava šansu da se ljubimac vrati kući. Pomozite — podijelite!'}
            </p>
            <Link href="/izgubljeni/prijavi">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8 py-6 shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                {isEn ? 'Report a missing pet' : 'Prijavi nestanak ljubimca'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-gray-100 dark:border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{isEn ? 'Filter' : 'Filtriraj'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isEn ? 'All cities' : 'Svi gradovi'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isEn ? 'All cities' : 'Svi gradovi'}</SelectItem>
                {CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isEn ? 'All species' : 'Sve vrste'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isEn ? 'All species' : 'Sve vrste'}</SelectItem>
                <SelectItem value="pas">{isEn ? 'Dog' : 'Pas'}</SelectItem>
                <SelectItem value="macka">{isEn ? 'Cat' : 'Mačka'}</SelectItem>
                <SelectItem value="ostalo">{isEn ? 'Other' : 'Ostalo'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isEn ? 'All statuses' : 'Svi statusi'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isEn ? 'All statuses' : 'Svi statusi'}</SelectItem>
                <SelectItem value="lost">{isEn ? 'Still missing' : 'Još se traži'}</SelectItem>
                <SelectItem value="found">{isEn ? 'Found!' : 'Pronađen!'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="container mx-auto px-4 mt-6">
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
            className={view === 'list' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <List className="h-4 w-4 mr-2" />
            {isEn ? 'List' : 'Lista'}
          </Button>
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('map')}
            className={view === 'map' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Map className="h-4 w-4 mr-2" />
            {isEn ? 'Map' : 'Mapa'}
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            {loading ? '...' : `${pets.length} ${isEn ? 'results' : 'rezultata'}`}
          </span>
          <div className="ml-auto">
            <AlertSubscribeDialog />
          </div>
        </div>
      </section>

      {/* Map View */}
      {view === 'map' && (
        <section className="container mx-auto px-4 mt-4">
          <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
            <LostPetsMap pets={pets} />
          </div>
        </section>
      )}

      {/* Pet Cards */}
      <section className={`container mx-auto px-4 py-8 md:py-12 ${view === 'map' ? 'hidden' : ''}`}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            <span className="ml-3 text-muted-foreground">{isEn ? 'Loading...' : 'Učitavanje...'}</span>
          </div>
        ) : pets.length === 0 ? (
          <EmptyState
            icon={Search}
            title={isEn ? 'No results' : 'Nema rezultata'}
            description={isEn ? 'There are no reports for the selected filters. Try another city, species, or status.' : 'Nema prijava za odabrane filtere. Pokušajte promijeniti grad, vrstu ili status.'}
            action={
              <Link href="/izgubljeni/prijavi">
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {isEn ? 'Report missing pet' : 'Prijavi nestanak'}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => {
              const expired = isLostPetExpired(pet);
              const expiringSoon = isLostPetExpiringSoon(pet);
              const daysLeft = lostPetDaysUntilExpiry(pet);
              return (
              <Card key={pet.id} className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
                expired ? 'border-gray-300 hover:border-gray-400 opacity-70' :
                pet.status === 'lost' ? 'border-red-200 hover:border-red-300' : 'border-green-200 hover:border-green-300'
              }`}>
                <div className="relative">
                  <Link href={`/izgubljeni/${pet.id}`}>
                    <div className="relative h-56 bg-gray-100">
                      <Image
                        src={pet.image_url}
                        alt={pet.name}
                        fill
                        className={`object-cover${expired ? ' grayscale' : ''}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </Link>
                  {expired ? (
                    <Badge className="absolute top-3 left-3 text-sm font-bold px-3 py-1 bg-gray-500 text-white hover:bg-gray-600">
                      <Clock className="h-3.5 w-3.5 mr-1 inline" /> {isEn ? 'Listing expired' : 'Oglas istekao'}
                    </Badge>
                  ) : (
                    <Badge className={`absolute top-3 left-3 text-sm font-bold px-3 py-1 ${
                      pet.status === 'lost'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}>
                      {pet.status === 'lost' ? '🔴' : '🟢'} {statusLabels[pet.status]}
                    </Badge>
                  )}
                  {expiringSoon && daysLeft !== null && (
                    <Badge className="absolute top-3 right-3 text-xs font-medium px-2 py-1 bg-amber-500 text-white">
                      <Clock className="h-3 w-3 mr-1 inline" />
                      {isEn ? `Expires in ${daysLeft}d` : `Ističe za ${daysLeft}d`}
                    </Badge>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">{pet.name}</h3>
                    <p className="text-sm text-white/90 drop-shadow">
                      {speciesLabels[pet.species]} • {pet.breed} • {pet.color}
                    </p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  {/* Found reunion summary */}
                  {pet.status === 'found' && pet.found_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-start gap-2">
                      <Heart className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-green-700">
                          {isEn
                            ? `Found after ${Math.max(1, Math.floor((new Date(pet.found_at).getTime() - new Date(pet.date_lost).getTime()) / 86400000))} days`
                            : `Pronađen/a nakon ${Math.max(1, Math.floor((new Date(pet.found_at).getTime() - new Date(pet.date_lost).getTime()) / 86400000))} dana`}
                        </p>
                        {pet.reunion_message && (
                          <p className="text-xs text-green-600 mt-0.5 line-clamp-2 italic">&ldquo;{pet.reunion_message}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="font-medium">{pet.city}{pet.neighborhood ? `, ${pet.neighborhood}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{formatDate(pet.date_lost, locale)} ({daysAgo(pet.date_lost, isEn)})</span>
                  </div>

                  {/* Share buttons */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{pet.share_count} {isEn ? 'shares' : 'dijeljenja'}</span>
                    </div>
                    <ShareButtons
                      petName={pet.name}
                      city={pet.city}
                      petId={pet.id}
                    />
                  </div>

                  <Link href={`/izgubljeni/${pet.id}`} className="block">
                    <Button variant="outline" size="sm" className={`w-full mt-1 font-medium ${
                      pet.status === 'lost' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}>
                      {pet.status === 'found'
                        ? (isEn ? 'Read reunion story' : 'Pročitajte priču')
                        : (isEn ? 'View details' : 'Pogledaj detalje')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
