'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/shared/image-upload';
import type { AdoptionListing, AdoptionListingImage } from '@/lib/types';
import {
  ADOPTION_SPECIES_LABELS,
  ADOPTION_GENDER_LABELS,
  ADOPTION_SIZE_LABELS,
  CITIES,
} from '@/lib/types';

interface AdoptionListingFormProps {
  listing?: AdoptionListing;
}

type FormData = {
  name: string;
  species: string;
  breed: string;
  age_months: string;
  gender: string;
  size: string;
  weight_kg: string;
  color: string;
  sterilized: boolean;
  vaccinated: boolean;
  microchipped: boolean;
  good_with_kids: boolean | null;
  good_with_pets: boolean | null;
  description: string;
  personality: string;
  special_needs: string;
  city: string;
  contact_phone: string;
  contact_email: string;
  is_urgent: boolean;
};

function toFormData(listing?: AdoptionListing): FormData {
  return {
    name: listing?.name ?? '',
    species: listing?.species ?? '',
    breed: listing?.breed ?? '',
    age_months: listing?.age_months != null ? String(listing.age_months) : '',
    gender: listing?.gender ?? '',
    size: listing?.size ?? '',
    weight_kg: listing?.weight_kg != null ? String(listing.weight_kg) : '',
    color: listing?.color ?? '',
    sterilized: listing?.sterilized ?? false,
    vaccinated: listing?.vaccinated ?? false,
    microchipped: listing?.microchipped ?? false,
    good_with_kids: listing?.good_with_kids ?? null,
    good_with_pets: listing?.good_with_pets ?? null,
    description: listing?.description ?? '',
    personality: listing?.personality ?? '',
    special_needs: listing?.special_needs ?? '',
    city: listing?.city ?? '',
    contact_phone: listing?.contact_phone ?? '',
    contact_email: listing?.contact_email ?? '',
    is_urgent: listing?.is_urgent ?? false,
  };
}

function toPayload(form: FormData) {
  return {
    name: form.name,
    species: form.species,
    breed: form.breed || undefined,
    age_months: form.age_months ? Number(form.age_months) : undefined,
    gender: form.gender || undefined,
    size: form.size || undefined,
    weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
    color: form.color || undefined,
    sterilized: form.sterilized,
    vaccinated: form.vaccinated,
    microchipped: form.microchipped,
    good_with_kids: form.good_with_kids,
    good_with_pets: form.good_with_pets,
    description: form.description,
    personality: form.personality || undefined,
    special_needs: form.special_needs || undefined,
    city: form.city,
    contact_phone: form.contact_phone || undefined,
    contact_email: form.contact_email || undefined,
    is_urgent: form.is_urgent,
  };
}

export default function AdoptionListingForm({ listing }: AdoptionListingFormProps) {
  const router = useRouter();
  const isEdit = !!listing;
  const [form, setForm] = useState<FormData>(() => toFormData(listing));
  const [images, setImages] = useState<AdoptionListingImage[]>(listing?.images ?? []);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    const payload = { ...toPayload(form), images };

    const url = isEdit
      ? `/api/adoption-listings/${listing.id}`
      : '/api/adoption-listings';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(isEdit ? 'Oglas ažuriran' : 'Oglas kreiran');
      router.push('/dashboard/adoption');
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      const details = data?.error?.details?.fieldErrors;
      if (details) {
        const msgs = Object.entries(details)
          .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
          .join('\n');
        toast.error(msgs);
      } else {
        toast.error(data?.error?.message ?? 'Greška pri spremanju');
      }
    }
    setSaving(false);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard/adoption" className="text-sm text-muted-foreground hover:underline">
        &larr; Natrag na oglase
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">
        {isEdit ? 'Uredi oglas' : 'Novi oglas za udomljavanje'}
      </h1>

      <div className="space-y-6">
        {/* Basic info */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Osnovni podaci</h2>

          <div className="space-y-2">
            <Label htmlFor="name">Ime životinje *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Npr. Rex"
              className="focus:border-teal-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vrsta *</Label>
              <Select value={form.species} onValueChange={(v) => update('species', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Odaberi vrstu" /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ADOPTION_SPECIES_LABELS) as [string, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Pasmina</Label>
              <Input
                id="breed"
                value={form.breed}
                onChange={(e) => update('breed', e.target.value)}
                placeholder="Npr. Labrador"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Spol</Label>
              <Select value={form.gender} onValueChange={(v) => update('gender', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ADOPTION_GENDER_LABELS) as [string, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Veličina</Label>
              <Select value={form.size} onValueChange={(v) => update('size', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ADOPTION_SIZE_LABELS) as [string, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_months">Starost (mjeseci)</Label>
              <Input
                id="age_months"
                type="number"
                min={0}
                max={360}
                value={form.age_months}
                onChange={(e) => update('age_months', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Težina (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                min={0}
                max={200}
                step={0.1}
                value={form.weight_kg}
                onChange={(e) => update('weight_kg', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Boja</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => update('color', e.target.value)}
                placeholder="Npr. Smeđa"
              />
            </div>
          </div>
        </Card>

        {/* Health */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Zdravlje i navike</h2>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.sterilized}
                onCheckedChange={(v) => update('sterilized', v)}
              />
              <Label>Steriliziran/a</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.vaccinated}
                onCheckedChange={(v) => update('vaccinated', v)}
              />
              <Label>Cijepljen/a</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.microchipped}
                onCheckedChange={(v) => update('microchipped', v)}
              />
              <Label>Čipiran/a</Label>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <Label>Dobro s djecom</Label>
              <Select
                value={form.good_with_kids === null ? 'unknown' : form.good_with_kids ? 'yes' : 'no'}
                onValueChange={(v) => update('good_with_kids', v === 'unknown' ? null : v === 'yes')}
              >
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Ne znam</SelectItem>
                  <SelectItem value="yes">Da</SelectItem>
                  <SelectItem value="no">Ne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dobro s drugim ljubimcima</Label>
              <Select
                value={form.good_with_pets === null ? 'unknown' : form.good_with_pets ? 'yes' : 'no'}
                onValueChange={(v) => update('good_with_pets', v === 'unknown' ? null : v === 'yes')}
              >
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Ne znam</SelectItem>
                  <SelectItem value="yes">Da</SelectItem>
                  <SelectItem value="no">Ne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Opis</h2>

          <div className="space-y-2">
            <Label htmlFor="description">Opis životinje * (min 20 znakova)</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Opišite životinju, njezin karakter, povijest..."
              className="focus:border-teal-300"
            />
            <p className={`text-xs ${form.description.length >= 20 ? 'text-muted-foreground' : 'text-amber-500 dark:text-amber-400'}`}>
              {form.description.length} znakova (minimalno 20)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Osobnost</Label>
            <Textarea
              id="personality"
              rows={3}
              value={form.personality}
              onChange={(e) => update('personality', e.target.value)}
              placeholder="Npr. Vesela, igriva, voli ljude..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_needs">Posebne potrebe</Label>
            <Textarea
              id="special_needs"
              rows={2}
              value={form.special_needs}
              onChange={(e) => update('special_needs', e.target.value)}
              placeholder="Npr. Potrebna terapija, dijeta..."
            />
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Fotografije</h2>
          <p className="text-sm text-muted-foreground">
            Dodajte do 8 fotografija. Barem jedna je potrebna za objavu oglasa.
          </p>
          <ImageUpload
            variant="dropzone"
            maxFiles={8}
            bucket="pet-photos"
            entityId={listing?.id ?? 'new-listing'}
            onUploadComplete={(urls) => {
              setImages(urls.map((url, i) => ({
                url,
                alt: form.name || null,
                is_primary: i === 0 && images.length === 0,
              })));
            }}
          />
          {/* Show existing images when editing */}
          {listing && images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={img.url} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
                  >
                    &times;
                  </button>
                  {img.is_primary && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded-full">Glavna</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Location & contact */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Lokacija i kontakt</h2>

          <div className="space-y-2">
            <Label>Grad *</Label>
            <Select value={form.city} onValueChange={(v) => update('city', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Odaberi grad" /></SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Kontakt telefon</Label>
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={(e) => update('contact_phone', e.target.value)}
                placeholder="+385..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Kontakt email</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => update('contact_email', e.target.value)}
                placeholder="email@primjer.hr"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_urgent}
              onCheckedChange={(v) => update('is_urgent', v)}
            />
            <Label>Hitan oglas</Label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/adoption" className={buttonVariants({ variant: 'outline' })}>
            Odustani
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {saving ? 'Spremanje...' : isEdit ? 'Spremi promjene' : 'Kreiraj skicu'}
          </Button>
        </div>
      </div>
    </div>
  );
}
