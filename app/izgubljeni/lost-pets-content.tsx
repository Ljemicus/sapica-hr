'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, MapPin, Calendar, Phone, Mail, Eye, Plus, Filter, AlertTriangle, Map, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { LostPet } from '@/lib/types';
import { LOST_PET_SPECIES_LABELS, LOST_PET_STATUS_LABELS, CITIES } from '@/lib/types';
import { fetchLostPets } from '@/lib/supabase/lost-pets';
import { ShareButtons } from './share-buttons';

const LostPetsMap = dynamic(() => import('@/components/shared/lost-pets-map'), { ssr: false });

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Danas';
  if (diff === 1) return 'Jučer';
  return `Prije ${diff} dana`;
}

export function LostPetsContent() {
  const [pets, setPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string | null>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string | null>('all');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchLostPets({
        city: cityFilter && cityFilter !== 'all' ? cityFilter : undefined,
        species: speciesFilter && speciesFilter !== 'all' ? speciesFilter : undefined,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      });
      setPets(data);
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
              {loading ? '...' : `${lostCount} ljubimaca se trenutno traži`}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Izgubljeni ljubimci
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Svako dijeljenje povećava šansu da se ljubimac vrati kući. Pomozite — podijelite!
            </p>
            <Link href="/izgubljeni/prijavi">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8 py-6 shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                Prijavi nestanak ljubimca
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filtriraj</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Svi gradovi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi gradovi</SelectItem>
                {CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sve vrste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve vrste</SelectItem>
                <SelectItem value="pas">Pas</SelectItem>
                <SelectItem value="macka">Mačka</SelectItem>
                <SelectItem value="ostalo">Ostalo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Svi statusi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="lost">Još se traži</SelectItem>
                <SelectItem value="found">Pronađen!</SelectItem>
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
            Lista
          </Button>
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('map')}
            className={view === 'map' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Map className="h-4 w-4 mr-2" />
            Mapa
          </Button>
          <span className="text-sm text-gray-500 ml-2">
            {loading ? '...' : `${pets.length} rezultata`}
          </span>
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
            <span className="ml-3 text-gray-500">Učitavanje...</span>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nema rezultata za odabrane filtere.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Card key={pet.id} className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
                pet.status === 'lost' ? 'border-red-200 hover:border-red-300' : 'border-green-200 hover:border-green-300'
              }`}>
                <div className="relative">
                  <Link href={`/izgubljeni/${pet.id}`}>
                    <div className="relative h-56 bg-gray-100">
                      <Image
                        src={pet.image_url}
                        alt={pet.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </Link>
                  <Badge className={`absolute top-3 left-3 text-sm font-bold px-3 py-1 ${
                    pet.status === 'lost'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}>
                    {pet.status === 'lost' ? '🔴' : '🟢'} {LOST_PET_STATUS_LABELS[pet.status]}
                  </Badge>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">{pet.name}</h3>
                    <p className="text-sm text-white/90 drop-shadow">
                      {LOST_PET_SPECIES_LABELS[pet.species]} • {pet.breed} • {pet.color}
                    </p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="font-medium">{pet.city}{pet.neighborhood ? `, ${pet.neighborhood}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{formatDate(pet.date_lost)} ({daysAgo(pet.date_lost)})</span>
                  </div>

                  {/* Contact reveal */}
                  <div className="pt-2 border-t">
                    {revealedContacts.has(pet.id) ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-green-500" />
                          <a href={`tel:${pet.contact_phone}`} className="text-green-600 font-medium hover:underline">{pet.contact_phone}</a>
                        </div>
                        {pet.contact_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-blue-500" />
                            <a href={`mailto:${pet.contact_email}`} className="text-blue-600 hover:underline">{pet.contact_email}</a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setRevealedContacts(prev => new Set(prev).add(pet.id))}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Pokaži kontakt
                      </Button>
                    )}
                  </div>

                  {/* Share buttons */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{pet.share_count} dijeljenja</span>
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
                      Pogledaj detalje
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
