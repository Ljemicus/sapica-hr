'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Calendar, Phone, Mail, Eye, AlertTriangle, User, MessageCircle, Tag, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShareButtons } from '../share-buttons';
import type { LostPet } from '@/lib/types';
import { LOST_PET_SPECIES_LABELS, LOST_PET_STATUS_LABELS } from '@/lib/types';
import { addSighting } from '@/lib/supabase/lost-pets';
import { toast } from 'sonner';

const MapComponent = dynamic(() => import('./map-component'), { ssr: false });

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('hr-HR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function daysAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Danas';
  if (diff === 1) return 'Jučer';
  return `Prije ${diff} dana`;
}

export function LostPetDetailContent({ pet }: { pet: LostPet }) {
  const [contactRevealed, setContactRevealed] = useState(false);
  const [showSightingForm, setShowSightingForm] = useState(false);
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingDescription, setSightingDescription] = useState('');
  const [submittingSighting, setSubmittingSighting] = useState(false);
  const [localSightings, setLocalSightings] = useState(pet.sightings);

  const handleSightingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSighting(true);

    const { error } = await addSighting(pet.id, {
      location: sightingLocation,
      description: sightingDescription,
    });

    if (error) {
      toast.error('Greška pri slanju prijave. Pokušajte ponovo.');
      setSubmittingSighting(false);
      return;
    }

    setLocalSightings(prev => [...prev, {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      location: sightingLocation,
      description: sightingDescription,
    }]);

    toast.success('Hvala! Vaša prijava viđenja je zabilježena.');
    setSightingLocation('');
    setSightingDescription('');
    setShowSightingForm(false);
    setSubmittingSighting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Urgent banner for lost pets */}
      {pet.status === 'lost' && (
        <div className="bg-red-600 text-white py-3 px-4 text-center animate-pulse">
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-bold">
            <AlertTriangle className="h-5 w-5" />
            HITNO: {pet.name} se još traži! Podijelite i pomozite!
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 md:py-10">
        <Link href="/izgubljeni" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Natrag na listu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="relative h-72 md:h-96 bg-gray-100">
                <Image
                  src={pet.image_url}
                  alt={pet.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <Badge className={`absolute top-4 left-4 text-base font-bold px-4 py-2 ${
                pet.status === 'lost'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}>
                {pet.status === 'lost' ? '🔴' : '🟢'} {LOST_PET_STATUS_LABELS[pet.status]}
              </Badge>
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-1">{pet.name}</h1>
                <p className="text-white/90 text-lg drop-shadow">
                  {LOST_PET_SPECIES_LABELS[pet.species]} • {pet.breed} • {pet.color} • {pet.sex}
                </p>
              </div>
            </div>

            {/* Share Buttons - PROMINENT */}
            <Card className={`border-2 ${pet.status === 'lost' ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}`}>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-red-500" />
                  Podijeli — svako dijeljenje pomaže!
                </h2>
                <ShareButtons petName={pet.name} city={pet.city} petId={pet.id} size="lg" />
                <p className="text-sm text-gray-500 mt-3 text-center">{pet.share_count} dijeljenja do sad</p>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Opis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{pet.description}</p>
                {pet.special_marks && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4" />
                      Posebne oznake
                    </h3>
                    <p className="text-amber-700">{pet.special_marks}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {pet.has_microchip && (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      <Shield className="h-3 w-3 mr-1" /> Ima mikročip
                    </Badge>
                  )}
                  {pet.has_collar && (
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      Ima ogrlicu
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Lokacija nestanka
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 font-medium">{pet.neighborhood}, {pet.city}</p>
                <div className="h-64 md:h-80 rounded-lg overflow-hidden border">
                  <MapComponent lat={pet.location_lat} lng={pet.location_lng} name={pet.name} />
                </div>
              </CardContent>
            </Card>

            {/* Sightings */}
            {localSightings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-amber-500" />
                    Prijavljena viđenja
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {localSightings.map(sighting => (
                      <div key={sighting.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-600 mb-1">{formatDateTime(sighting.date)} — {sighting.location}</p>
                        <p className="text-sm text-amber-800">{sighting.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sighting Report Form */}
            {pet.status === 'lost' && (
              <Card className="border-2 border-amber-300 bg-amber-50/50">
                <CardContent className="p-4 md:p-6">
                  {!showSightingForm ? (
                    <Button
                      onClick={() => setShowSightingForm(true)}
                      size="lg"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 text-lg"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      Vidio/la sam ovog ljubimca!
                    </Button>
                  ) : (
                    <form onSubmit={handleSightingSubmit} className="space-y-4">
                      <h3 className="text-lg font-bold text-amber-800">Prijavi viđenje</h3>
                      <div>
                        <Label>Gdje ste vidjeli ljubimca? *</Label>
                        <Input
                          placeholder="npr. Park Maksimir, kod jezera"
                          required
                          value={sightingLocation}
                          onChange={(e) => setSightingLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea
                          placeholder="Opišite što ste vidjeli..."
                          required
                          value={sightingDescription}
                          onChange={(e) => setSightingDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={submittingSighting}>
                          {submittingSighting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Slanje...</> : 'Pošalji prijavu'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowSightingForm(false)}>Odustani</Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="sticky top-20">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="font-medium">{pet.neighborhood}, {pet.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{formatDateTime(pet.date_lost)} ({daysAgo(pet.date_lost)})</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Kontakt vlasnika
                  </h3>
                  {contactRevealed ? (
                    <div className="space-y-2">
                      <p className="font-medium">{pet.contact_name}</p>
                      <a href={`tel:${pet.contact_phone}`} className="flex items-center gap-2 text-sm text-green-600 hover:underline font-medium">
                        <Phone className="h-4 w-4" />
                        {pet.contact_phone}
                      </a>
                      {pet.contact_email && (
                        <a href={`mailto:${pet.contact_email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <Mail className="h-4 w-4" />
                          {pet.contact_email}
                        </a>
                      )}
                    </div>
                  ) : (
                    <Button onClick={() => setContactRevealed(true)} className="w-full" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Pokaži kontakt
                    </Button>
                  )}
                </div>

                {/* Share */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Podijeli</h3>
                  <ShareButtons petName={pet.name} city={pet.city} petId={pet.id} size="sm" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
