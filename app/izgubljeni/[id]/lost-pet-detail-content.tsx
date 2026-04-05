'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Calendar, Phone, Mail, Eye, EyeOff, AlertTriangle, User, MessageCircle, Tag, Shield, Loader2, CheckCircle2, Trash2, ShieldAlert, Camera, X, Heart, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ShareButtons } from '../share-buttons';
import type { LostPet, LostPetFoundMethod } from '@/lib/types';
import { LOST_PET_SPECIES_LABELS, LOST_PET_STATUS_LABELS, LOST_PET_FOUND_METHOD_LABELS } from '@/lib/types';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/contexts/auth-context';
import { uploadSightingPhoto, validateFile, createPreviewUrl, UPLOAD_ACCEPTED_TYPES } from '@/lib/upload';

const MapComponent = dynamic(() => import('./map-component'), { ssr: false });

function formatDateTime(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function daysAgo(dateStr: string, isEn: boolean) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return isEn ? 'Today' : 'Danas';
  if (diff === 1) return isEn ? 'Yesterday' : 'Jučer';
  return isEn ? `${diff} days ago` : `Prije ${diff} dana`;
}

function daysBetween(from: string, to: string) {
  return Math.max(1, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)));
}

export function LostPetDetailContent({ pet }: { pet: LostPet }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isEn = language === 'en';
  const locale = isEn ? 'en-GB' : 'hr-HR';
  const statusLabels = isEn ? { lost: 'Still missing', found: 'Found!' } : LOST_PET_STATUS_LABELS;
  const speciesLabels = isEn ? { pas: 'Dog', macka: 'Cat', ostalo: 'Other' } : LOST_PET_SPECIES_LABELS;
  const sexLabels = isEn ? { 'muško': 'Male', 'žensko': 'Female' } : { 'muško': 'Muško', 'žensko': 'Žensko' };
  const foundMethodLabels: Record<LostPetFoundMethod, string> = isEn
    ? { sighting: 'Community sighting', returned_home: 'Returned home on their own', shelter: 'Found at a shelter', other: 'Other' }
    : LOST_PET_FOUND_METHOD_LABELS;

  const [contactRevealed, setContactRevealed] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactData, setContactData] = useState<{ contact_name: string; contact_phone: string; contact_email: string } | null>(null);
  const [showSightingForm, setShowSightingForm] = useState(false);
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingDescription, setSightingDescription] = useState('');
  const [submittingSighting, setSubmittingSighting] = useState(false);
  const [sightingPhotoFile, setSightingPhotoFile] = useState<File | null>(null);
  const [sightingPhotoPreview, setSightingPhotoPreview] = useState<string | null>(null);
  const [sightingPhotoUploading, setSightingPhotoUploading] = useState(false);
  const [sightingPhotoError, setSightingPhotoError] = useState<string | null>(null);
  const [localSightings, setLocalSightings] = useState(pet.sightings);
  const [localStatus, setLocalStatus] = useState(pet.status);
  const [localFoundAt, setLocalFoundAt] = useState(pet.found_at);
  const [localFoundMethod, setLocalFoundMethod] = useState(pet.found_method);
  const [localReunionMessage, setLocalReunionMessage] = useState(pet.reunion_message);
  const [localHidden, setLocalHidden] = useState(pet.hidden);
  const [actionLoading, setActionLoading] = useState(false);

  // Mark-as-found dialog state
  const [markFoundOpen, setMarkFoundOpen] = useState(false);
  const [reunionMessageInput, setReunionMessageInput] = useState('');
  const [foundMethodInput, setFoundMethodInput] = useState<LostPetFoundMethod | ''>('');

  const isOwner = user?.id === pet.user_id;
  const isAdmin = user?.role === 'admin';

  const daysMissing = localFoundAt
    ? daysBetween(pet.date_lost, localFoundAt)
    : null;

  const handleMarkFound = async () => {
    if (!foundMethodInput) {
      toast.error(isEn ? 'Please select how the pet was found' : 'Odaberite način pronalaska');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/lost-pets/${pet.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'found',
          found_method: foundMethodInput,
          reunion_message: reunionMessageInput.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || (isEn ? 'Failed to update status' : 'Greška pri ažuriranju statusa'));
      } else {
        const { pet: updated } = await res.json();
        setLocalStatus('found');
        setLocalFoundAt(updated.found_at);
        setLocalFoundMethod(updated.found_method);
        setLocalReunionMessage(updated.reunion_message);
        setMarkFoundOpen(false);
        setReunionMessageInput('');
        setFoundMethodInput('');
        toast.success(isEn ? 'Wonderful news! So glad they\'re home!' : 'Divne vijesti! Drago nam je da je kod kuće!');
      }
    } catch {
      toast.error(isEn ? 'Failed to update status' : 'Greška pri ažuriranju statusa');
    }
    setActionLoading(false);
  };

  const handleAdminAction = async (action: 'hide' | 'unhide' | 'delete') => {
    if (action === 'delete' && !confirm(isEn ? 'Are you sure you want to delete this listing?' : 'Jeste li sigurni da želite obrisati ovaj oglas?')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/lost-pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: pet.id, action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || (isEn ? 'Action failed' : 'Akcija nije uspjela'));
      } else if (action === 'delete') {
        toast.success(isEn ? 'Listing deleted' : 'Oglas je obrisan');
        window.location.href = '/izgubljeni';
        return;
      } else {
        setLocalHidden(action === 'hide');
        toast.success(action === 'hide'
          ? (isEn ? 'Listing hidden' : 'Oglas je sakriven')
          : (isEn ? 'Listing restored' : 'Oglas je vraćen'));
      }
    } catch {
      toast.error(isEn ? 'Action failed' : 'Akcija nije uspjela');
    }
    setActionLoading(false);
  };

  const handleSightingPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSightingPhotoError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setSightingPhotoError(validationError);
      return;
    }
    if (sightingPhotoPreview) URL.revokeObjectURL(sightingPhotoPreview);
    setSightingPhotoFile(file);
    setSightingPhotoPreview(createPreviewUrl(file));
  };

  const handleSightingPhotoRemove = () => {
    if (sightingPhotoPreview) URL.revokeObjectURL(sightingPhotoPreview);
    setSightingPhotoFile(null);
    setSightingPhotoPreview(null);
    setSightingPhotoError(null);
  };

  const handleSightingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSighting(true);

    let photo_url: string | undefined;
    if (sightingPhotoFile) {
      setSightingPhotoUploading(true);
      try {
        const result = await uploadSightingPhoto(sightingPhotoFile);
        photo_url = result.url;
      } catch {
        setSightingPhotoError(isEn ? 'Photo upload failed. You can submit without the photo.' : 'Upload slike nije uspio. Možete poslati prijavu bez slike.');
        setSightingPhotoUploading(false);
        setSubmittingSighting(false);
        return;
      }
      setSightingPhotoUploading(false);
    }

    try {
      const res = await fetch(`/api/lost-pets/${pet.id}/sightings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: sightingLocation, description: sightingDescription, ...(photo_url ? { photo_url } : {}) }),
      });

      if (!res.ok) {
        toast.error(isEn ? 'There was an error submitting the sighting. Please try again.' : 'Greška pri slanju prijave. Pokušajte ponovo.');
        setSubmittingSighting(false);
        return;
      }

      const { sighting } = await res.json();
      setLocalSightings(prev => [...prev, sighting]);
    } catch {
      toast.error(isEn ? 'There was an error submitting the sighting. Please try again.' : 'Greška pri slanju prijave. Pokušajte ponovo.');
      setSubmittingSighting(false);
      return;
    }

    toast.success(isEn ? 'Thanks! Your sighting has been recorded.' : 'Hvala! Vaša prijava viđenja je zabilježena.');
    setSightingLocation('');
    setSightingDescription('');
    handleSightingPhotoRemove();
    setShowSightingForm(false);
    setSubmittingSighting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hidden banner for moderated listings */}
      {localHidden && (
        <div className="bg-yellow-600 text-white py-3 px-4 text-center">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-sm md:text-base font-bold">
            <div className="flex items-center justify-center gap-2">
              <EyeOff className="h-5 w-5" />
              <span>{isEn ? 'This listing is hidden by an administrator' : 'Ovaj oglas je sakriven od strane administratora'}</span>
            </div>
            {isAdmin && (
              <Button
                onClick={() => handleAdminAction('unhide')}
                disabled={actionLoading}
                variant="secondary"
                className="h-9 bg-white text-yellow-700 hover:bg-yellow-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                {isEn ? 'Unhide listing' : 'Prikaži oglas'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Urgent banner for lost pets */}
      {localStatus === 'lost' && !localHidden && (
        <div className="bg-red-600 text-white py-3 px-4 text-center animate-pulse">
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-bold">
            <AlertTriangle className="h-5 w-5" />
            {isEn ? `URGENT: ${pet.name} is still missing! Share to help!` : `HITNO: ${pet.name} se još traži! Podijelite i pomozite!`}
          </div>
        </div>
      )}

      {/* Celebration banner for found pets */}
      {localStatus === 'found' && !localHidden && (
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 px-4 text-center">
          <div className="container mx-auto flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-lg md:text-xl font-bold">
              <PartyPopper className="h-6 w-6" />
              {isEn ? `${pet.name} has been found!` : `${pet.name} je pronađen/a!`}
              <Heart className="h-5 w-5" />
            </div>
            {daysMissing !== null && (
              <p className="text-green-100 text-sm">
                {isEn
                  ? `Reunited after ${daysMissing} ${daysMissing === 1 ? 'day' : 'days'}`
                  : `Ponovno zajedno nakon ${daysMissing} ${daysMissing === 1 ? 'dana' : 'dana'}`}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 md:py-10">
        <Link href="/izgubljeni" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back to list' : 'Natrag na listu'}
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
                localHidden
                  ? 'bg-yellow-500 text-white'
                  : localStatus === 'lost'
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
              }`}>
                {localHidden ? <><EyeOff className="h-4 w-4 inline mr-1" />{isEn ? 'Hidden' : 'Skriveno'}</> : localStatus === 'lost' ? <>{'🔴'} {statusLabels[localStatus]}</> : <>{'🟢'} {statusLabels[localStatus]}</>}
              </Badge>
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-1">{pet.name}</h1>
                <p className="text-white/90 text-lg drop-shadow">
                  {speciesLabels[pet.species]} • {pet.breed} • {pet.color} • {sexLabels[pet.sex]}
                </p>
              </div>
            </div>

            {/* Reunion Story Card — shown when pet is found */}
            {localStatus === 'found' && (localReunionMessage || localFoundMethod) && (
              <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Heart className="h-5 w-5 text-green-600" />
                    {isEn ? 'Reunion story' : 'Priča o ponovnom susretu'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {localFoundMethod && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-300 text-green-700 bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {foundMethodLabels[localFoundMethod]}
                      </Badge>
                      {localFoundAt && (
                        <span className="text-sm text-green-600">
                          {formatDate(localFoundAt, locale)}
                        </span>
                      )}
                    </div>
                  )}
                  {localReunionMessage && (
                    <blockquote className="border-l-4 border-green-300 pl-4 italic text-green-800 leading-relaxed">
                      &ldquo;{localReunionMessage}&rdquo;
                    </blockquote>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Share Buttons */}
            <Card className={`border-2 ${localStatus === 'lost' ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}`}>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <MessageCircle className={`h-5 w-5 ${localStatus === 'lost' ? 'text-red-500' : 'text-green-500'}`} />
                  {localStatus === 'lost'
                    ? (isEn ? 'Share — every share helps!' : 'Podijeli — svako dijeljenje pomaže!')
                    : (isEn ? 'Share the good news!' : 'Podijelite dobre vijesti!')}
                </h2>
                <ShareButtons petName={pet.name} city={pet.city} petId={pet.id} size="lg" />
                <p className="text-sm text-gray-500 mt-3 text-center">{pet.share_count} {isEn ? 'shares so far' : 'dijeljenja do sad'}</p>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {isEn ? 'Description' : 'Opis'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{pet.description}</p>
                {pet.special_marks && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4" />
                      {isEn ? 'Special markings' : 'Posebne oznake'}
                    </h3>
                    <p className="text-amber-700">{pet.special_marks}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {pet.has_microchip && (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      <Shield className="h-3 w-3 mr-1" /> {isEn ? 'Has microchip' : 'Ima mikročip'}
                    </Badge>
                  )}
                  {pet.has_collar && (
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      {isEn ? 'Has collar' : 'Ima ogrlicu'}
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
                  {isEn ? 'Last seen location' : 'Lokacija nestanka'}
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
                    {isEn ? 'Reported sightings' : 'Prijavljena viđenja'} ({localSightings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {localSightings.map(sighting => (
                      <div key={sighting.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-600 mb-1">{formatDateTime(sighting.date, locale)} — {sighting.location}</p>
                        <p className="text-sm text-amber-800">{sighting.description}</p>
                        {sighting.photo_url && (
                          <div className="mt-2 relative w-full max-w-xs h-40 rounded-lg overflow-hidden border border-amber-300">
                            <Image src={sighting.photo_url} alt={isEn ? 'Sighting photo' : 'Fotografija viđenja'} fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sighting Report Form */}
            {localStatus === 'lost' && !localHidden && (
              <Card className="border-2 border-amber-300 bg-amber-50/50">
                <CardContent className="p-4 md:p-6">
                  {!showSightingForm ? (
                    <Button
                      onClick={() => setShowSightingForm(true)}
                      size="lg"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 text-lg"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      {isEn ? 'I saw this pet!' : 'Vidio/la sam ovog ljubimca!'}
                    </Button>
                  ) : (
                    <form onSubmit={handleSightingSubmit} className="space-y-4">
                      <h3 className="text-lg font-bold text-amber-800">{isEn ? 'Report a sighting' : 'Prijavi viđenje'}</h3>
                      <div>
                        <Label>{isEn ? 'Where did you see the pet? *' : 'Gdje ste vidjeli ljubimca? *'}</Label>
                        <Input
                          placeholder={isEn ? 'e.g. Maksimir Park, near the lake' : 'npr. Park Maksimir, kod jezera'}
                          required
                          value={sightingLocation}
                          onChange={(e) => setSightingLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>{isEn ? 'Description' : 'Opis'}</Label>
                        <Textarea
                          placeholder={isEn ? 'Describe what you saw...' : 'Opišite što ste vidjeli...'}
                          required
                          value={sightingDescription}
                          onChange={(e) => setSightingDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>{isEn ? 'Photo (optional)' : 'Fotografija (opcionalno)'}</Label>
                        {sightingPhotoPreview ? (
                          <div className="relative w-full max-w-xs h-40 mt-1 rounded-lg overflow-hidden border border-amber-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={sightingPhotoPreview} alt={isEn ? 'Preview' : 'Pregled'} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={handleSightingPhotoRemove}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {sightingPhotoUploading && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <label className="mt-1 flex items-center gap-2 cursor-pointer text-sm text-amber-700 hover:text-amber-900 transition-colors">
                            <Camera className="h-4 w-4" />
                            {isEn ? 'Add a photo' : 'Dodaj fotografiju'}
                            <input
                              type="file"
                              className="sr-only"
                              accept={UPLOAD_ACCEPTED_TYPES.join(',')}
                              onChange={handleSightingPhotoSelect}
                            />
                          </label>
                        )}
                        {sightingPhotoError && (
                          <p className="text-xs text-red-600 mt-1">{sightingPhotoError}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={submittingSighting || sightingPhotoUploading}>
                          {submittingSighting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isEn ? 'Sending...' : 'Slanje...'}</> : (isEn ? 'Submit report' : 'Pošalji prijavu')}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => { setShowSightingForm(false); handleSightingPhotoRemove(); }}>{isEn ? 'Cancel' : 'Odustani'}</Button>
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
                    <span>{formatDateTime(pet.date_lost, locale)} ({daysAgo(pet.date_lost, isEn)})</span>
                  </div>
                  {localStatus === 'found' && localFoundAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-green-700 font-medium">
                        {isEn ? 'Found' : 'Pronađen/a'}: {formatDate(localFoundAt, locale)}
                        {daysMissing !== null && (
                          <span className="text-green-600 font-normal">
                            {' '}({isEn
                              ? `after ${daysMissing} ${daysMissing === 1 ? 'day' : 'days'}`
                              : `nakon ${daysMissing} ${daysMissing === 1 ? 'dana' : 'dana'}`})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {isEn ? 'Owner contact' : 'Kontakt vlasnika'}
                  </h3>
                  {contactRevealed && contactData ? (
                    <div className="space-y-2">
                      <p className="font-medium">{contactData.contact_name}</p>
                      <a href={`tel:${contactData.contact_phone}`} className="flex items-center gap-2 text-sm text-green-600 hover:underline font-medium">
                        <Phone className="h-4 w-4" />
                        {contactData.contact_phone}
                      </a>
                      {contactData.contact_email && (
                        <a href={`mailto:${contactData.contact_email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <Mail className="h-4 w-4" />
                          {contactData.contact_email}
                        </a>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={async () => {
                        setContactLoading(true);
                        try {
                          const res = await fetch(`/api/lost-pets/${pet.id}/contact`);
                          if (res.ok) {
                            const data = await res.json();
                            setContactData(data);
                            setContactRevealed(true);
                          } else {
                            toast.error(isEn ? 'Could not load contact info' : 'Kontakt nije dostupan');
                          }
                        } catch {
                          toast.error(isEn ? 'Could not load contact info' : 'Kontakt nije dostupan');
                        }
                        setContactLoading(false);
                      }}
                      className="w-full"
                      variant="outline"
                      disabled={contactLoading}
                    >
                      {contactLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                      {isEn ? 'Show contact' : 'Pokaži kontakt'}
                    </Button>
                  )}
                </div>

                {/* Share */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">{isEn ? 'Share' : 'Podijeli'}</h3>
                  <ShareButtons petName={pet.name} city={pet.city} petId={pet.id} size="sm" />
                </div>

                {/* Owner actions — Mark as Found dialog */}
                {isOwner && localStatus === 'lost' && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {isEn ? 'Your listing' : 'Vaš oglas'}
                    </h3>
                    <Dialog open={markFoundOpen} onOpenChange={setMarkFoundOpen}>
                      <DialogTrigger
                        render={
                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {isEn ? 'Mark as found' : 'Označi kao pronađeno'}
                          </Button>
                        }
                      />
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {isEn ? `Great news about ${pet.name}!` : `Sretne vijesti o ${pet.name}!`}
                          </DialogTitle>
                          <DialogDescription>
                            {isEn
                              ? 'Tell the community how your pet was found. This helps others and gives your story a happy ending.'
                              : 'Recite zajednici kako je vaš ljubimac pronađen. To pomaže drugima i daje vašoj priči sretan kraj.'}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                          <div>
                            <Label className="mb-1.5 block">{isEn ? 'How was the pet found? *' : 'Kako je ljubimac pronađen? *'}</Label>
                            <Select value={foundMethodInput || undefined} onValueChange={(v) => setFoundMethodInput(v as LostPetFoundMethod)}>
                              <SelectTrigger>
                                <SelectValue placeholder={isEn ? 'Select...' : 'Odaberite...'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sighting">{foundMethodLabels.sighting}</SelectItem>
                                <SelectItem value="returned_home">{foundMethodLabels.returned_home}</SelectItem>
                                <SelectItem value="shelter">{foundMethodLabels.shelter}</SelectItem>
                                <SelectItem value="other">{foundMethodLabels.other}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="mb-1.5 block">
                              {isEn ? 'Reunion message (optional)' : 'Poruka o ponovnom susretu (opcionalno)'}
                            </Label>
                            <Textarea
                              placeholder={isEn
                                ? 'e.g. "A kind neighbor found her hiding under the porch. So grateful to everyone who shared!"'
                                : 'npr. "Susjed ga je pronašao ispod trijema. Hvala svima koji su dijelili!"'}
                              value={reunionMessageInput}
                              onChange={(e) => setReunionMessageInput(e.target.value)}
                              rows={3}
                              maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-1 text-right">{reunionMessageInput.length}/500</p>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={handleMarkFound}
                            disabled={actionLoading || !foundMethodInput}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
                            {isEn ? 'Confirm — pet is home!' : 'Potvrdi — ljubimac je kod kuće!'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Owner badge for found pets */}
                {isOwner && localStatus === 'found' && (
                  <div className="pt-4 border-t">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-800">
                        {isEn ? 'This listing is resolved' : 'Ovaj oglas je zatvoren'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin actions */}
                {isAdmin && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-orange-500" />
                      {isEn ? 'Admin actions' : 'Admin akcije'}
                    </h3>
                    <div className="space-y-2">
                      {localHidden ? (
                        <Button
                          onClick={() => handleAdminAction('unhide')}
                          disabled={actionLoading}
                          variant="outline"
                          className="w-full border-green-200 text-green-700 hover:bg-green-50"
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                          {isEn ? 'Unhide listing' : 'Prikaži oglas'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAdminAction('hide')}
                          disabled={actionLoading}
                          variant="outline"
                          className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <EyeOff className="h-4 w-4 mr-2" />}
                          {isEn ? 'Hide listing' : 'Sakrij oglas'}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleAdminAction('delete')}
                        disabled={actionLoading}
                        variant="outline"
                        className="w-full border-red-200 text-red-700 hover:bg-red-50"
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        {isEn ? 'Delete listing' : 'Obriši oglas'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
