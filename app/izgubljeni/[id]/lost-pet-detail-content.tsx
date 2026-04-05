'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Calendar, Eye, EyeOff, AlertTriangle, MessageCircle, Tag, Shield, Loader2, CheckCircle2, Trash2, Camera, X, Heart, PartyPopper, Clock, RefreshCw, Printer, Megaphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ShareButtons } from '../share-buttons';
import type { LostPet, LostPetFoundMethod, LostPetSightingStatus, LostPetUpdate } from '@/lib/types';
import { LOST_PET_SPECIES_LABELS, LOST_PET_STATUS_LABELS, LOST_PET_FOUND_METHOD_LABELS, isLostPetExpired, isLostPetExpiringSoon, lostPetDaysUntilExpiry, LOST_PET_LISTING_DURATION_DAYS } from '@/lib/types';
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

function getUpdateAccent(category: LostPetUpdate['category'] | 'sighting' | 'found') {
  switch (category) {
    case 'search':
      return 'bg-warm-coral/10 text-warm-coral';
    case 'status':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300';
    case 'sighting':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300';
    case 'found':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300';
    default:
      return 'bg-muted text-foreground';
  }
}

const LEAD_STATUS_META: Record<LostPetSightingStatus, { hr: string; en: string; className: string }> = {
  new: { hr: 'Nova dojava', en: 'New lead', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300' },
  helpful: { hr: 'Korisna', en: 'Helpful', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
  false_lead: { hr: 'Lažna dojava', en: 'False lead', className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300' },
  resolved: { hr: 'Obrađeno', en: 'Resolved', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
};

function getLeadStatusMeta(status: LostPetSightingStatus | undefined, isEn: boolean) {
  const meta = LEAD_STATUS_META[status || 'new'];
  return { label: isEn ? meta.en : meta.hr, className: meta.className };
}

function getUpdateLabel(category: LostPetUpdate['category'] | 'sighting' | 'found', isEn: boolean) {
  if (category === 'search') return isEn ? 'Search update' : 'Novost u potrazi';
  if (category === 'status') return isEn ? 'Owner status' : 'Status vlasnika';
  if (category === 'sighting') return isEn ? 'Community sighting' : 'Viđenje iz zajednice';
  if (category === 'found') return isEn ? 'Happy ending' : 'Sretan kraj';
  return isEn ? 'Owner note' : 'Bilješka vlasnika';
}

export function LostPetDetailContent({ pet }: { pet: LostPet }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isEn = language === 'en';
  const locale = isEn ? 'en-GB' : 'hr-HR';
  const statusLabels = isEn ? { lost: 'Still missing', found: 'Found!', expired: 'Listing expired' } : LOST_PET_STATUS_LABELS;
  const speciesLabels = isEn ? { pas: 'Dog', macka: 'Cat', ostalo: 'Other' } : LOST_PET_SPECIES_LABELS;
  const sexLabels = isEn ? { 'muško': 'Male', 'žensko': 'Female' } : { 'muško': 'Muško', 'žensko': 'Žensko' };
  const foundMethodLabels: Record<LostPetFoundMethod, string> = isEn
    ? { sighting: 'Community sighting', returned_home: 'Returned home on their own', shelter: 'Found at a shelter', other: 'Other' }
    : LOST_PET_FOUND_METHOD_LABELS;

  const [relayName, setRelayName] = useState('');
  const [relayPhone, setRelayPhone] = useState('');
  const [relayEmail, setRelayEmail] = useState('');
  const [relayLocationHint, setRelayLocationHint] = useState('');
  const [relayMessage, setRelayMessage] = useState('');
  const [relayQuickLead, setRelayQuickLead] = useState(false);
  const [relaySubmitting, setRelaySubmitting] = useState(false);
  const [relaySubmitted, setRelaySubmitted] = useState(false);
  const [relayError, setRelayError] = useState<string | null>(null);
  const [showSightingForm, setShowSightingForm] = useState(false);
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingDescription, setSightingDescription] = useState('');
  const [submittingSighting, setSubmittingSighting] = useState(false);
  const [sightingPhotoFile, setSightingPhotoFile] = useState<File | null>(null);
  const [sightingPhotoPreview, setSightingPhotoPreview] = useState<string | null>(null);
  const [sightingPhotoUploading, setSightingPhotoUploading] = useState(false);
  const [sightingPhotoError, setSightingPhotoError] = useState<string | null>(null);
  const [localSightings, setLocalSightings] = useState(pet.sightings);
  const [localUpdates, setLocalUpdates] = useState(pet.updates);
  const [localStatus, setLocalStatus] = useState(pet.status);
  const [localFoundAt, setLocalFoundAt] = useState(pet.found_at);
  const [localFoundMethod, setLocalFoundMethod] = useState(pet.found_method);
  const [localReunionMessage, setLocalReunionMessage] = useState(pet.reunion_message);
  const [localHidden, setLocalHidden] = useState(pet.hidden);
  const [localExpiresAt, setLocalExpiresAt] = useState(pet.expires_at);
  const [actionLoading, setActionLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [ownerUpdateText, setOwnerUpdateText] = useState('');
  const [ownerUpdateSubmitting, setOwnerUpdateSubmitting] = useState(false);
  const [leadActionLoadingId, setLeadActionLoadingId] = useState<string | null>(null);

  const [markFoundOpen, setMarkFoundOpen] = useState(false);
  const [reunionMessageInput, setReunionMessageInput] = useState('');
  const [foundMethodInput, setFoundMethodInput] = useState<LostPetFoundMethod | ''>('');

  const isOwner = user?.id === pet.user_id;
  const isAdmin = user?.role === 'admin';

  const petWithLocalExpiry = { ...pet, expires_at: localExpiresAt, status: localStatus };
  const expired = isLostPetExpired(petWithLocalExpiry);
  const expiringSoon = isLostPetExpiringSoon(petWithLocalExpiry);
  const daysLeft = lostPetDaysUntilExpiry(petWithLocalExpiry);

  const daysMissing = localFoundAt
    ? daysBetween(pet.date_lost, localFoundAt)
    : null;

  const timelineItems = [
    ...localUpdates.map((update) => ({
      id: `update-${update.id}`,
      date: update.date,
      kind: 'update' as const,
      category: update.category || 'note',
      title: getUpdateLabel(update.category || 'note', isEn),
      text: update.text,
    })),
    ...localSightings.map((sighting) => ({
      id: `sighting-${sighting.id}`,
      date: sighting.date,
      kind: 'sighting' as const,
      category: 'sighting' as const,
      title: getUpdateLabel('sighting', isEn),
      text: sighting.description,
      location: sighting.location,
      photo_url: sighting.photo_url,
      lead_status: sighting.status,
      reviewed_at: sighting.reviewed_at,
    })),
    ...(localFoundAt
      ? [{
          id: 'found-event',
          date: localFoundAt,
          kind: 'found' as const,
          category: 'found' as const,
          title: getUpdateLabel('found', isEn),
          text: localReunionMessage || (isEn ? `${pet.name} is back home.` : `${pet.name} je opet kod kuće.`),
        }]
      : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOwnerUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerUpdateText.trim()) return;

    setOwnerUpdateSubmitting(true);
    try {
      const res = await fetch(`/api/lost-pets/${pet.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ownerUpdateText.trim(), category: 'note' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || (isEn ? 'Failed to post update' : 'Greška pri objavi novosti'));
      } else {
        const data = await res.json();
        setLocalUpdates(Array.isArray(data.updates) ? data.updates : []);
        setOwnerUpdateText('');
        toast.success(isEn ? 'Update posted' : 'Novost je objavljena');
      }
    } catch {
      toast.error(isEn ? 'Failed to post update' : 'Greška pri objavi novosti');
    }
    setOwnerUpdateSubmitting(false);
  };

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

  const handleRenew = async () => {
    setRenewLoading(true);
    try {
      const res = await fetch(`/api/lost-pets/${pet.id}/renew`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || (isEn ? 'Failed to renew listing' : 'Greška pri obnavljanju oglasa'));
      } else {
        const { pet: updated } = await res.json();
        setLocalExpiresAt(updated.expires_at);
        setLocalStatus(updated.status);
        toast.success(isEn
          ? `Listing renewed for ${LOST_PET_LISTING_DURATION_DAYS} more days`
          : `Oglas je obnovljen za još ${LOST_PET_LISTING_DURATION_DAYS} dana`);
      }
    } catch {
      toast.error(isEn ? 'Failed to renew listing' : 'Greška pri obnavljanju oglasa');
    }
    setRenewLoading(false);
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

  const handleLeadStatusUpdate = async (sightingId: string, leadStatus: LostPetSightingStatus) => {
    setLeadActionLoadingId(sightingId);
    try {
      const res = await fetch(`/api/lost-pets/${pet.id}/sightings/${sightingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: leadStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || (isEn ? 'Could not update lead status' : 'Status dojave nije spremljen'));
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.sightings)) setLocalSightings(data.sightings);
      toast.success(isEn ? 'Lead status updated' : 'Status dojave je ažuriran');
    } catch {
      toast.error(isEn ? 'Could not update lead status' : 'Status dojave nije spremljen');
    } finally {
      setLeadActionLoadingId(null);
    }
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
  const handleRelaySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRelaySubmitting(true);
    setRelayError(null);

    try {
      const res = await fetch(`/api/lost-pets/${pet.id}/relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: relayName,
          phone: relayPhone,
          email: relayEmail,
          location_hint: relayLocationHint,
          message: relayMessage,
          quick_lead: relayQuickLead,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const validationErrors = data?.details
          ? Object.values(data.details).flat().filter(Boolean).join(' · ')
          : null;
        const message = validationErrors || data?.message || (isEn ? 'Could not send your report right now.' : 'Dojava se trenutačno ne može poslati.');
        setRelayError(message);
        toast.error(message);
        setRelaySubmitting(false);
        return;
      }

      setRelaySubmitted(true);
      setRelayName('');
      setRelayPhone('');
      setRelayEmail('');
      setRelayLocationHint('');
      setRelayMessage('');
      setRelayQuickLead(false);
      toast.success(isEn ? 'Your report was forwarded to the owner.' : 'Vaša dojava je proslijeđena vlasniku.');
    } catch {
      const message = isEn ? 'Network error. Please try again.' : 'Mrežna greška. Pokušajte ponovno.';
      setRelayError(message);
      toast.error(message);
    }

    setRelaySubmitting(false);
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Status banners */}
      {localHidden && (
        <div className="bg-amber-500 text-white py-3 px-4 text-center">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              <span>{isEn ? 'This listing is hidden by an administrator' : 'Ovaj oglas je sakriven od strane administratora'}</span>
            </div>
            {isAdmin && (
              <Button onClick={() => handleAdminAction('unhide')} disabled={actionLoading} size="sm" className="bg-white text-amber-700 hover:bg-amber-50 rounded-full h-8 px-4 text-xs font-semibold">
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                {isEn ? 'Unhide' : 'Prikaži'}
              </Button>
            )}
          </div>
        </div>
      )}

      {expired && !localHidden && (
        <div className="bg-muted-foreground/80 text-white py-3 px-4 text-center">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{isEn ? 'This listing has expired' : 'Ovaj oglas je istekao'}</span>
            </div>
            {isOwner && (
              <Button onClick={handleRenew} disabled={renewLoading} size="sm" className="bg-white text-foreground hover:bg-gray-50 rounded-full h-8 px-4 text-xs font-semibold">
                {renewLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                {isEn ? `Renew for ${LOST_PET_LISTING_DURATION_DAYS} days` : `Obnovi za ${LOST_PET_LISTING_DURATION_DAYS} dana`}
              </Button>
            )}
          </div>
        </div>
      )}

      {expiringSoon && !localHidden && daysLeft !== null && (
        <div className="bg-amber-500 text-white py-3 px-4 text-center">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{isEn ? `This listing expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` : `Ovaj oglas ističe za ${daysLeft} ${daysLeft === 1 ? 'dan' : 'dana'}`}</span>
            </div>
            {isOwner && (
              <Button onClick={handleRenew} disabled={renewLoading} size="sm" className="bg-white text-amber-700 hover:bg-amber-50 rounded-full h-8 px-4 text-xs font-semibold">
                {renewLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                {isEn ? `Renew for ${LOST_PET_LISTING_DURATION_DAYS} days` : `Obnovi za ${LOST_PET_LISTING_DURATION_DAYS} dana`}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Urgent banner for lost pets */}
      {localStatus === 'lost' && !localHidden && !expired && (
        <div className="bg-warm-coral text-white py-3.5 px-4 text-center">
          <div className="container mx-auto flex items-center justify-center gap-2.5 text-sm font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            {isEn ? `${pet.name} is still missing — share to help!` : `${pet.name} se još traži — podijelite i pomozite!`}
          </div>
        </div>
      )}

      {/* Found celebration banner */}
      {localStatus === 'found' && !localHidden && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-warm-teal text-white py-4 px-4 text-center">
          <div className="container mx-auto flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-lg font-bold font-[var(--font-heading)]">
              <PartyPopper className="h-5 w-5" />
              {isEn ? `${pet.name} has been found!` : `${pet.name} je pronađen/a!`}
              <Heart className="h-5 w-5" />
            </div>
            {daysMissing !== null && (
              <p className="text-emerald-100 text-sm">
                {isEn ? `Reunited after ${daysMissing} ${daysMissing === 1 ? 'day' : 'days'}` : `Ponovno zajedno nakon ${daysMissing} ${daysMissing === 1 ? 'dana' : 'dana'}`}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-8 md:py-12">
        <Link href="/izgubljeni" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-warm-orange transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back to list' : 'Natrag na listu'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden community-section-card animate-fade-in-up">
              <div className="relative h-72 md:h-[28rem] bg-muted">
                <Image
                  src={pet.image_url}
                  alt={pet.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>

              {/* Status badge */}
              <Badge className={`absolute top-5 left-5 font-semibold px-4 py-2 rounded-full text-sm hover:opacity-100 ${
                localHidden ? 'bg-amber-500 text-white' :
                expired ? 'bg-foreground/60 text-white backdrop-blur-sm' :
                localStatus === 'lost' ? 'bg-warm-coral text-white' :
                'bg-emerald-500 text-white'
              }`}>
                {localHidden ? <><EyeOff className="h-4 w-4 inline mr-1.5" />{isEn ? 'Hidden' : 'Skriveno'}</> :
                 expired ? <><Clock className="h-4 w-4 inline mr-1.5" />{isEn ? 'Expired' : 'Istekao'}</> :
                 localStatus === 'lost' ? <><AlertTriangle className="h-4 w-4 inline mr-1.5" />{statusLabels[localStatus]}</> :
                 <><CheckCircle2 className="h-4 w-4 inline mr-1.5" />{statusLabels[localStatus]}</>}
              </Badge>

              {/* Pet info overlay */}
              <div className="absolute bottom-5 left-5 right-5">
                <h1 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] text-white drop-shadow-lg mb-1">{pet.name}</h1>
                <p className="text-white/85 text-lg drop-shadow">
                  {speciesLabels[pet.species]} · {pet.breed} · {pet.color} · {sexLabels[pet.sex]}
                </p>
              </div>
            </div>

            {/* Reunion Story */}
            {localStatus === 'found' && (localReunionMessage || localFoundMethod) && (
              <div className="community-section-card overflow-hidden animate-fade-in-up delay-100">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 md:p-8">
                  <h2 className="flex items-center gap-2 text-lg font-bold font-[var(--font-heading)] text-emerald-800 dark:text-emerald-300 mb-4">
                    <Heart className="h-5 w-5 text-emerald-500" />
                    {isEn ? 'Reunion story' : 'Priča o ponovnom susretu'}
                  </h2>
                  {localFoundMethod && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border-0 rounded-full">
                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                        {foundMethodLabels[localFoundMethod]}
                      </Badge>
                      {localFoundAt && (
                        <span className="text-sm text-emerald-600 dark:text-emerald-400/80">{formatDate(localFoundAt, locale)}</span>
                      )}
                    </div>
                  )}
                  {localReunionMessage && (
                    <blockquote className="border-l-4 border-emerald-300 dark:border-emerald-700 pl-4 italic text-emerald-800 dark:text-emerald-300 leading-relaxed text-lg">
                      &ldquo;{localReunionMessage}&rdquo;
                    </blockquote>
                  )}
                </div>
              </div>
            )}

            {/* Share */}
            <div className={`community-section-card p-6 md:p-8 animate-fade-in-up delay-200 ${
              localStatus === 'lost'
                ? 'bg-warm-coral/5 dark:bg-warm-coral/10 border-warm-coral/20'
                : 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/30'
            }`}>
              <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4 flex items-center gap-2">
                <MessageCircle className={`h-5 w-5 ${localStatus === 'lost' ? 'text-warm-coral' : 'text-emerald-500'}`} />
                {localStatus === 'lost'
                  ? (isEn ? 'Share — every share helps!' : 'Podijeli — svako dijeljenje pomaže!')
                  : (isEn ? 'Share the good news!' : 'Podijelite dobre vijesti!')}
              </h2>
              <ShareButtons petName={pet.name} city={pet.city} petId={pet.id} size="lg" />
              <p className="text-sm text-muted-foreground mt-4 text-center">{pet.share_count} {isEn ? 'shares so far' : 'dijeljenja do sad'}</p>
            </div>

            {/* Description */}
            <div className="community-section-card p-6 md:p-8 animate-fade-in-up delay-300">
              <h2 className="text-lg font-bold font-[var(--font-heading)] flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-warm-orange" />
                {isEn ? 'Description' : 'Opis'}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{pet.description}</p>
              {pet.special_marks && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-1 text-sm">
                    <Tag className="h-4 w-4" />
                    {isEn ? 'Special markings' : 'Posebne oznake'}
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400/80 text-sm">{pet.special_marks}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {pet.has_microchip && (
                  <Badge className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-50 border-0 rounded-full">
                    <Shield className="h-3 w-3 mr-1.5" /> {isEn ? 'Has microchip' : 'Ima mikročip'}
                  </Badge>
                )}
                {pet.has_collar && (
                  <Badge className="bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 hover:bg-purple-50 border-0 rounded-full">
                    {isEn ? 'Has collar' : 'Ima ogrlicu'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Location Map */}
            <div className="community-section-card overflow-hidden animate-fade-in-up delay-400">
              <div className="p-6 md:p-8 pb-0">
                <h2 className="text-lg font-bold font-[var(--font-heading)] flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-warm-coral" />
                  {isEn ? 'Last seen location' : 'Lokacija nestanka'}
                </h2>
                <p className="text-muted-foreground font-medium mb-4">{pet.neighborhood}, {pet.city}</p>
              </div>
              <div className="h-64 md:h-80">
                <MapComponent lat={pet.location_lat} lng={pet.location_lng} name={pet.name} />
              </div>
            </div>

            {/* Owner update composer */}
            {isOwner && localStatus === 'lost' && !localHidden && !expired && (
              <div className="community-section-card p-6 md:p-8 animate-fade-in-up delay-500">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-11 w-11 rounded-2xl bg-warm-coral/10 text-warm-coral flex items-center justify-center shrink-0">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-[var(--font-heading)]">{isEn ? 'Post an owner update' : 'Objavi novost vlasnika'}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isEn ? 'Share where you looked, what changed, or what people should watch for next.' : 'Napišite gdje ste tražili, što se promijenilo ili na što ljudi trebaju paziti.'}
                    </p>
                  </div>
                </div>
                <form onSubmit={handleOwnerUpdateSubmit} className="space-y-3">
                  <Textarea
                    value={ownerUpdateText}
                    onChange={(e) => setOwnerUpdateText(e.target.value)}
                    rows={4}
                    maxLength={280}
                    placeholder={isEn ? 'e.g. We searched Trsat this morning and left flyers near the park. Last possible sighting was around 8 AM.' : 'npr. Jutros smo pretražili Trsat i ostavili letke oko parka. Zadnje moguće viđenje bilo je oko 8h.'}
                    className="rounded-2xl"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">{ownerUpdateText.trim().length}/280</p>
                    <Button type="submit" disabled={ownerUpdateSubmitting || ownerUpdateText.trim().length < 2} className="rounded-xl bg-warm-coral hover:bg-warm-coral/90 text-white">
                      {ownerUpdateSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEn ? 'Posting...' : 'Objava...'}</> : <>{isEn ? 'Post update' : 'Objavi novost'}</>}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Updates timeline */}
            {timelineItems.length > 0 && (
              <div className="community-section-card p-6 md:p-8 animate-fade-in-up delay-500">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="h-5 w-5 text-warm-coral" />
                  <h2 className="text-lg font-bold font-[var(--font-heading)]">{isEn ? 'Timeline' : 'Tijek događaja'}</h2>
                </div>
                <div className="space-y-4">
                  {timelineItems.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold ${getUpdateAccent(item.category)}`}>
                          {item.kind === 'sighting' ? <Eye className="h-4 w-4" /> : item.kind === 'found' ? <Heart className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                        </div>
                        {index !== timelineItems.length - 1 && <div className="w-px flex-1 bg-border/60 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <Badge className={`${getUpdateAccent(item.category)} border-0 rounded-full px-2.5 py-0.5 text-[11px]`}>
                            {formatDateTime(item.date, locale)}
                          </Badge>
                        </div>
                        {'location' in item && item.location ? (
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">{item.location}</p>
                        ) : null}
                        {'lead_status' in item ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge className={`${getLeadStatusMeta(item.lead_status, isEn).className} border-0 rounded-full px-2.5 py-0.5 text-[11px]`}>
                              {getLeadStatusMeta(item.lead_status, isEn).label}
                            </Badge>
                            {item.reviewed_at ? (
                              <span className="text-[11px] text-muted-foreground">
                                {isEn ? 'Reviewed' : 'Obrađeno'} {formatDateTime(item.reviewed_at, locale)}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.text}</p>
                        {'photo_url' in item && item.photo_url ? (
                          <div className="mt-3 relative w-full max-w-xs h-40 rounded-xl overflow-hidden border border-border/50">
                            <Image src={item.photo_url} alt={isEn ? 'Timeline photo' : 'Fotografija u tijeku događaja'} fill className="object-cover" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sightings */}
            {localSightings.length > 0 && (
              <div className="community-section-card p-6 md:p-8">
                <div className="flex flex-col gap-2 mb-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-[var(--font-heading)] flex items-center gap-2">
                      <Eye className="h-5 w-5 text-amber-500" />
                      {isEn ? 'Reported sightings & leads' : 'Prijavljena viđenja i dojave'} ({localSightings.length})
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isEn ? 'Owners can quickly mark which community leads were useful, false alarms, or already handled.' : 'Vlasnik može brzo označiti koje su dojave korisne, lažne ili već obrađene.'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {localSightings.map((sighting) => {
                    const statusMeta = getLeadStatusMeta(sighting.status, isEn);
                    const isUpdatingThis = leadActionLoadingId === sighting.id;
                    return (
                      <div key={sighting.id} className="rounded-2xl border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400/90">{formatDateTime(sighting.date, locale)} — {sighting.location}</p>
                              <Badge className={`${statusMeta.className} border-0 rounded-full`}>{statusMeta.label}</Badge>
                              {sighting.reviewed_at ? (
                                <span className="text-[11px] text-muted-foreground">
                                  {isEn ? 'Reviewed' : 'Obrađeno'} {formatDateTime(sighting.reviewed_at, locale)}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-amber-900 dark:text-amber-200">{sighting.description}</p>
                          </div>
                          {isOwner && localStatus === 'lost' && !localHidden && !expired ? (
                            <div className="flex flex-wrap gap-2 md:max-w-[18rem] md:justify-end">
                              {[
                                { value: 'helpful' as const, label: isEn ? 'Helpful' : 'Korisna' },
                                { value: 'false_lead' as const, label: isEn ? 'False lead' : 'Lažna dojava' },
                                { value: 'resolved' as const, label: isEn ? 'Resolved' : 'Obrađeno' },
                              ].map((option) => (
                                <Button
                                  key={option.value}
                                  type="button"
                                  size="sm"
                                  variant={sighting.status === option.value ? 'default' : 'outline'}
                                  className="rounded-full"
                                  disabled={isUpdatingThis}
                                  onClick={() => handleLeadStatusUpdate(sighting.id, option.value)}
                                >
                                  {isUpdatingThis && sighting.status !== option.value ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {sighting.photo_url ? (
                          <div className="mt-3 relative w-full max-w-xs h-40 rounded-xl overflow-hidden border border-amber-300/50">
                            <Image src={sighting.photo_url} alt={isEn ? 'Sighting photo' : 'Fotografija viđenja'} fill className="object-cover" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sighting Report Form */}
            {localStatus === 'lost' && !localHidden && !expired && (
              <div className="community-section-card p-6 md:p-8 bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/40 dark:border-amber-800/30">
                {!showSightingForm ? (
                  <Button
                    onClick={() => setShowSightingForm(true)}
                    size="lg"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-14 rounded-xl text-base btn-hover"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    {isEn ? 'I saw this pet!' : 'Vidio/la sam ovog ljubimca!'}
                  </Button>
                ) : (
                  <form onSubmit={handleSightingSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold font-[var(--font-heading)] text-amber-800 dark:text-amber-300">{isEn ? 'Report a sighting' : 'Prijavi viđenje'}</h3>
                    <div>
                      <Label>{isEn ? 'Where did you see the pet? *' : 'Gdje ste vidjeli ljubimca? *'}</Label>
                      <Input
                        placeholder={isEn ? 'e.g. Maksimir Park, near the lake' : 'npr. Park Maksimir, kod jezera'}
                        required
                        value={sightingLocation}
                        onChange={(e) => setSightingLocation(e.target.value)}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label>{isEn ? 'Description' : 'Opis'}</Label>
                      <Textarea
                        placeholder={isEn ? 'Describe what you saw...' : 'Opišite što ste vidjeli...'}
                        required
                        value={sightingDescription}
                        onChange={(e) => setSightingDescription(e.target.value)}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label>{isEn ? 'Photo (optional)' : 'Fotografija (opcionalno)'}</Label>
                      {sightingPhotoPreview ? (
                        <div className="relative w-full max-w-xs h-40 mt-1 rounded-xl overflow-hidden border border-amber-300/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sightingPhotoPreview} alt={isEn ? 'Preview' : 'Pregled'} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleSightingPhotoRemove}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          {sightingPhotoUploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <label className="mt-1 flex items-center gap-2 cursor-pointer text-sm text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors">
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
                        <p className="text-xs text-destructive mt-1">{sightingPhotoError}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 rounded-xl" disabled={submittingSighting || sightingPhotoUploading}>
                        {submittingSighting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isEn ? 'Sending...' : 'Slanje...'}</> : (isEn ? 'Submit report' : 'Pošalji prijavu')}
                      </Button>
                      <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setShowSightingForm(false); handleSightingPhotoRemove(); }}>{isEn ? 'Cancel' : 'Odustani'}</Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="community-sidebar-panel sticky top-20 p-6 space-y-5">
              {/* Quick Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-warm-coral shrink-0" />
                  <span className="font-medium">{pet.neighborhood}, {pet.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{formatDateTime(pet.date_lost, locale)} ({daysAgo(pet.date_lost, isEn)})</span>
                </div>
                {localStatus === 'found' && localFoundAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {isEn ? 'Found' : 'Pronađen/a'}: {formatDate(localFoundAt, locale)}
                      {daysMissing !== null && (
                        <span className="font-normal text-emerald-600 dark:text-emerald-400/80">
                          {' '}({isEn ? `after ${daysMissing} ${daysMissing === 1 ? 'day' : 'days'}` : `nakon ${daysMissing} ${daysMissing === 1 ? 'dana' : 'dana'}`})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact relay */}
              <div className="pt-5 border-t border-border/30 space-y-4">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">
                    {isEn ? 'Send a report to the owner' : 'Pošalji dojavu vlasniku'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isEn
                      ? 'Your message is forwarded through PetPark so the owner can reply without exposing private contact details publicly.'
                      : 'Poruka ide preko PetParka tako da vlasnik može dobiti dojavu bez javnog otkrivanja privatnih kontakata.'}
                  </p>
                </div>

                {relaySubmitted ? (
                  <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/20 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                          {isEn ? 'Report sent' : 'Dojava poslana'}
                        </p>
                        <p className="text-sm text-emerald-700/90 dark:text-emerald-300/80 mt-1">
                          {isEn
                            ? 'The owner received your message. If you left a phone number or email, they can contact you directly.'
                            : 'Vlasnik je dobio tvoju poruku. Ako si ostavio/la telefon ili email, može ti se javiti direktno.'}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => { setRelaySubmitted(false); setRelayError(null); }}>
                      {isEn ? 'Send another update' : 'Pošalji novu dojavu'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRelaySubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="relay-name">{isEn ? 'Your name (optional)' : 'Vaše ime (opcionalno)'}</Label>
                        <Input id="relay-name" value={relayName} onChange={(e) => setRelayName(e.target.value)} className="mt-1 rounded-xl" placeholder={isEn ? 'So the owner knows who is calling' : 'Da vlasnik zna tko se javlja'} maxLength={120} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="relay-phone">{isEn ? 'Phone' : 'Telefon'}</Label>
                          <Input id="relay-phone" type="tel" value={relayPhone} onChange={(e) => setRelayPhone(e.target.value)} className="mt-1 rounded-xl" placeholder={isEn ? 'Required if no email' : 'Obavezno ako nema emaila'} maxLength={40} />
                        </div>
                        <div>
                          <Label htmlFor="relay-email">Email</Label>
                          <Input id="relay-email" type="email" value={relayEmail} onChange={(e) => setRelayEmail(e.target.value)} className="mt-1 rounded-xl" placeholder={isEn ? 'Required if no phone' : 'Obavezno ako nema telefona'} maxLength={255} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="relay-location">{isEn ? 'Where did you see them? (optional)' : 'Gdje ste ga/je vidjeli? (opcionalno)'}</Label>
                        <Input id="relay-location" value={relayLocationHint} onChange={(e) => setRelayLocationHint(e.target.value)} className="mt-1 rounded-xl" placeholder={isEn ? 'Street, park, beach, neighbourhood…' : 'Ulica, park, plaža, kvart…'} maxLength={160} />
                      </div>
                      <div>
                        <Label htmlFor="relay-message">{isEn ? 'Message' : 'Poruka'}</Label>
                        <Textarea id="relay-message" value={relayMessage} onChange={(e) => setRelayMessage(e.target.value)} className="mt-1 min-h-[120px] rounded-2xl" placeholder={isEn ? 'Write what you saw, when, and any useful detail…' : 'Napišite što ste vidjeli, kada i sve korisne detalje…'} maxLength={2000} required />
                      </div>
                      <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 px-3.5 py-3 cursor-pointer">
                        <input type="checkbox" checked={relayQuickLead} onChange={(e) => setRelayQuickLead(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border" />
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          <span className="block font-medium text-foreground">{isEn ? 'This is a quick lead' : 'Ovo je brza dojava'}</span>
                          {isEn ? 'Tick this if the owner should react fast because the sighting is very fresh.' : 'Uključite ako bi vlasnik trebao reagirati odmah jer je viđenje jako svježe.'}
                        </span>
                      </label>
                    </div>

                    {relayError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
                        {relayError}
                      </div>
                    )}

                    <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex items-start gap-2.5">
                      <Shield className="h-4 w-4 shrink-0 mt-0.5 text-warm-coral" />
                      <span>
                        {isEn ? 'Private contacts stay hidden on the page. The owner only receives the details you choose to share in this form.' : 'Privatni kontakti ostaju skriveni na stranici. Vlasnik dobiva samo podatke koje ovdje odlučite ostaviti.'}
                      </span>
                    </div>

                    <Button type="submit" className="w-full rounded-xl bg-warm-coral hover:bg-warm-coral/90 text-white font-semibold btn-hover" disabled={relaySubmitting}>
                      {relaySubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {isEn ? 'Sending report...' : 'Slanje dojave...'}</> : <><MessageCircle className="h-4 w-4 mr-2" />{isEn ? 'Send report to owner' : 'Pošalji dojavu vlasniku'}</>}
                    </Button>
                  </form>
                )}
              </div>

              {/* Share */}
              <div className="pt-5 border-t border-border/30">
                <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">{isEn ? 'Share' : 'Podijeli'}</h3>
                <ShareButtons petName={pet.name} city={pet.city} petId={pet.id} size="sm" />
              </div>

              {/* Print flyer */}
              <div className="pt-5 border-t border-border/30">
                <Link href={`/izgubljeni/${pet.id}/letak`} target="_blank">
                  <Button variant="outline" className="w-full rounded-xl gap-2">
                    <Printer className="h-4 w-4" />
                    {isEn ? 'Print flyer' : 'Isprintaj letak'}
                  </Button>
                </Link>
              </div>

              {/* Owner expiry info */}
              {isOwner && localStatus === 'lost' && localExpiresAt && (
                <div className="pt-5 border-t border-border/30">
                  <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">
                    {isEn ? 'Listing expiry' : 'Istek oglasa'}
                  </h3>
                  {expired ? (
                    <div className="bg-muted rounded-xl p-4 text-center space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {isEn ? 'This listing has expired and is no longer prominently shown.' : 'Ovaj oglas je istekao i više se ne prikazuje istaknuto.'}
                      </p>
                      <Button onClick={handleRenew} disabled={renewLoading} className="w-full bg-warm-teal hover:bg-warm-teal/90 text-white font-semibold rounded-xl">
                        {renewLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        {isEn ? `Renew for ${LOST_PET_LISTING_DURATION_DAYS} days` : `Obnovi za ${LOST_PET_LISTING_DURATION_DAYS} dana`}
                      </Button>
                    </div>
                  ) : expiringSoon && daysLeft !== null ? (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 text-center space-y-3">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        {isEn ? `Expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` : `Ističe za ${daysLeft} ${daysLeft === 1 ? 'dan' : 'dana'}`}
                      </p>
                      <Button onClick={handleRenew} disabled={renewLoading} variant="outline" className="w-full rounded-xl border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                        {renewLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        {isEn ? `Renew for ${LOST_PET_LISTING_DURATION_DAYS} days` : `Obnovi za ${LOST_PET_LISTING_DURATION_DAYS} dana`}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isEn
                        ? `Active until ${new Date(localExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : `Aktivan do ${new Date(localExpiresAt).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                    </p>
                  )}
                </div>
              )}

              {/* Owner actions — Mark as Found dialog */}
              {isOwner && localStatus === 'lost' && (
                <div className="pt-5 border-t border-border/30">
                  <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">
                    {isEn ? 'Your listing' : 'Vaš oglas'}
                  </h3>
                  <Dialog open={markFoundOpen} onOpenChange={setMarkFoundOpen}>
                    <DialogTrigger
                      render={
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {isEn ? 'Mark as found' : 'Označi kao pronađeno'}
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-md rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-[var(--font-heading)] text-xl">
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
                            <SelectTrigger className="rounded-xl">
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
                            className="rounded-xl"
                          />
                          <p className="text-xs text-muted-foreground mt-1 text-right">{reunionMessageInput.length}/500</p>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleMarkFound}
                          disabled={actionLoading || !foundMethodInput}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
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
                <div className="pt-5 border-t border-border/30">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-4 text-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      {isEn ? 'This listing is resolved' : 'Ovaj oglas je zatvoren'}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin actions */}
              {isAdmin && (
                <div className="pt-5 border-t border-border/30">
                  <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">
                    {isEn ? 'Admin' : 'Admin'}
                  </h3>
                  <div className="space-y-2">
                    {localHidden ? (
                      <Button onClick={() => handleAdminAction('unhide')} disabled={actionLoading} variant="outline" className="w-full rounded-xl border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                        {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                        {isEn ? 'Unhide listing' : 'Prikaži oglas'}
                      </Button>
                    ) : (
                      <Button onClick={() => handleAdminAction('hide')} disabled={actionLoading} variant="outline" className="w-full rounded-xl border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20">
                        {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <EyeOff className="h-4 w-4 mr-2" />}
                        {isEn ? 'Hide listing' : 'Sakrij oglas'}
                      </Button>
                    )}
                    <Button onClick={() => handleAdminAction('delete')} disabled={actionLoading} variant="outline" className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5">
                      {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      {isEn ? 'Delete listing' : 'Obriši oglas'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
