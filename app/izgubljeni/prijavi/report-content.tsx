'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Upload, Camera, MapPin, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CITIES } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { uploadLostPetImage } from '@/lib/supabase/lost-pets';
import { toast } from 'sonner';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/context';

const ReportMapPicker = dynamic(() => import('./report-map-picker'), { ssr: false });

export function ReportLostPetContent() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [species, setSpecies] = useState<string | null>('pas');
  const [gender, setGender] = useState<string | null>('');
  const [city, setCity] = useState<string | null>('');
  const [hasMicrochip, setHasMicrochip] = useState(false);
  const [hasCollar, setHasCollar] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cityError, setCityError] = useState('');
  const [locationError, setLocationError] = useState('');

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - selectedFiles.length);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCityError('');
    setLocationError('');

    if (!user) {
      toast.error(isEn ? 'You must be logged in to report a missing pet.' : 'Morate biti prijavljeni da biste prijavili nestanak.');
      router.push('/prijava?redirect=/izgubljeni/prijavi');
      return;
    }

    // Validate city
    if (!city) {
      setCityError(isEn ? 'City is required' : 'Grad je obavezan');
      return;
    }

    // Validate location
    if (!selectedPosition) {
      setLocationError(isEn ? 'Mark the location on the map' : 'Označite lokaciju na karti');
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Upload images
    const imageUrls: string[] = [];
    for (const file of selectedFiles) {
      const url = await uploadLostPetImage(file, user.id);
      if (url) imageUrls.push(url);
    }

    try {
      const res = await fetch('/api/lost-pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name') as string,
          species: species || 'pas',
          breed: formData.get('breed') as string || '',
          color: formData.get('color') as string,
          sex: gender || undefined,
          description: formData.get('description') as string,
          special_marks: formData.get('marks') as string || '',
          neighborhood: formData.get('neighborhood') as string,
          city,
          date_lost: formData.get('date_lost') as string,
          contact_name: formData.get('contact_name') as string,
          contact_phone: formData.get('contact_phone') as string,
          contact_email: formData.get('contact_email') as string || '',
          has_microchip: hasMicrochip,
          has_collar: hasCollar,
          image_url: imageUrls.length > 0 ? imageUrls[0] : undefined,
          gallery: imageUrls.length > 0 ? imageUrls : undefined,
          location_lat: selectedPosition.lat,
          location_lng: selectedPosition.lng,
        }),
      });

      if (!res.ok) {
        toast.error(isEn ? 'There was an error submitting the report. Please try again.' : 'Greška pri slanju prijave. Pokušajte ponovo.');
        setSubmitting(false);
        return;
      }

      toast.success(isEn ? 'Report submitted successfully! Your listing is now live.' : 'Prijava uspješno poslana! Vaš oglas je objavljen.');
      setSubmitted(true);
    } catch {
      toast.error(isEn ? 'There was an error submitting the report. Please try again.' : 'Greška pri slanju prijave. Pokušajte ponovo.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">{isEn ? 'Report submitted!' : 'Prijava poslana!'}</h2>
            <p className="text-gray-600">{isEn ? 'Your lost-pet listing is live. Share it on social media for more visibility.' : 'Vaš oglas za izgubljenog ljubimca je objavljen. Podijelite ga na društvenim mrežama za veću vidljivost!'}</p>
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/izgubljeni">
                <Button className="w-full bg-red-500 hover:bg-red-600">{isEn ? 'View all listings' : 'Pogledaj sve oglase'}</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">{isEn ? 'Back to homepage' : 'Povratak na početnu'}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/50 via-white to-orange-50/30">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-red-200" />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">{isEn ? 'Report a missing pet' : 'Prijavi nestanak'}</h1>
            <p className="text-red-100 text-lg">{isEn ? "Fill in your pet's details and start the search" : 'Ispunite podatke o vašem ljubimcu i pokrenite potragu'}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/izgubljeni" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'Back to list' : 'Natrag na listu'}
        </Link>

        {!user && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm font-medium">
              {isEn ? 'You must be ' : 'Morate biti '}<Link href="/prijava?redirect=/izgubljeni/prijavi" className="text-amber-700 underline font-bold">{isEn ? 'logged in' : 'prijavljeni'}</Link>{isEn ? ' to report a missing pet.' : ' da biste prijavili nestanak ljubimca.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-500" />
                {isEn ? 'Pet photos' : 'Slike ljubimca'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image src={preview} alt={`Preview ${i + 1}`} fill sizes="96px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFilesSelected(e.dataTransfer.files);
                }}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">{isEn ? 'Drag photos here or click to upload' : 'Povucite slike ovdje ili kliknite za upload'}</p>
                <p className="text-sm text-gray-400">{isEn ? 'JPG, PNG — up to 5MB per image (max 5 images)' : 'JPG, PNG — do 5MB po slici (max 5 slika)'}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= 5}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isEn ? 'Choose photos' : 'Odaberi slike'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pet Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isEn ? 'Pet details' : 'Podaci o ljubimcu'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{isEn ? 'Pet name *' : 'Ime ljubimca *'}</Label>
                  <Input id="name" name="name" placeholder="npr. Rex" required />
                </div>
                <div>
                  <Label>{isEn ? 'Species *' : 'Vrsta *'}</Label>
                  <Select value={species} onValueChange={setSpecies}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pas">{isEn ? 'Dog' : 'Pas'}</SelectItem>
                      <SelectItem value="macka">{isEn ? 'Cat' : 'Mačka'}</SelectItem>
                      <SelectItem value="ostalo">{isEn ? 'Other' : 'Ostalo'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breed">{isEn ? 'Breed' : 'Pasmina'}</Label>
                  <Input id="breed" name="breed" placeholder="npr. Njemački ovčar" />
                </div>
                <div>
                  <Label htmlFor="color">{isEn ? 'Color *' : 'Boja *'}</Label>
                  <Input id="color" name="color" placeholder="npr. Crno-smeđi" required />
                </div>
                <div>
                  <Label>{isEn ? 'Sex' : 'Spol'}</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue placeholder={isEn ? 'Choose' : 'Odaberi'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muško">{isEn ? 'Male' : 'Muško'}</SelectItem>
                      <SelectItem value="žensko">{isEn ? 'Female' : 'Žensko'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch checked={hasMicrochip} onCheckedChange={setHasMicrochip} />
                  <Label>{isEn ? 'Has microchip' : 'Ima mikročip'}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={hasCollar} onCheckedChange={setHasCollar} />
                  <Label>{isEn ? 'Has collar with phone number' : 'Ima ogrlicu s brojem'}</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                {isEn ? 'Last seen location' : 'Lokacija nestanka'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{isEn ? 'City *' : 'Grad *'}</Label>
                  <Select value={city} onValueChange={(v) => { setCity(v); setCityError(''); }} required>
                    <SelectTrigger><SelectValue placeholder={isEn ? 'Choose city' : 'Odaberi grad'} /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cityError && <p className="text-sm text-red-500 mt-1">{cityError}</p>}
                </div>
                <div>
                  <Label htmlFor="neighborhood">{isEn ? 'Neighborhood / Street *' : 'Kvart / Ulica *'}</Label>
                  <Input id="neighborhood" name="neighborhood" placeholder="npr. Maksimir" required />
                </div>
              </div>
              <div>
                <Label>{isEn ? 'Mark the location on the map *' : 'Označite lokaciju na karti *'}</Label>
                <div className="h-64 rounded-lg overflow-hidden border mt-2">
                  <ReportMapPicker onPositionChange={(pos) => { setSelectedPosition(pos); setLocationError(''); }} />
                </div>
                {locationError && <p className="text-sm text-red-500 mt-1">{locationError}</p>}
              </div>
              <div>
                <Label htmlFor="date_lost">{isEn ? 'Date missing *' : 'Datum nestanka *'}</Label>
                <Input id="date_lost" name="date_lost" type="date" required />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>{isEn ? 'Description and details' : 'Opis i detalji'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">{isEn ? 'Situation description *' : 'Opis situacije *'}</Label>
                <Textarea id="description" name="description" placeholder={isEn ? 'Describe the circumstances and where your pet was last seen...' : 'Opišite okolnosti nestanka, gdje je zadnji put viđen...'} rows={4} required />
              </div>
              <div>
                <Label htmlFor="marks">{isEn ? 'Special markings' : 'Posebne oznake'}</Label>
                <Textarea id="marks" name="marks" placeholder={isEn ? 'Scars, spots, or other distinctive markings...' : 'Ožiljci, mrlje, posebne oznake na tijelu...'} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>{isEn ? 'Contact details' : 'Kontakt podaci'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_name">{isEn ? 'Your name *' : 'Vaše ime *'}</Label>
                <Input id="contact_name" name="contact_name" placeholder="Ime i prezime" required defaultValue={user?.name || ''} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">{isEn ? 'Phone *' : 'Telefon *'}</Label>
                  <Input id="contact_phone" name="contact_phone" type="tel" placeholder="+385 91 234 5678" required />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input id="contact_email" name="contact_email" type="email" placeholder="vas@email.hr" defaultValue={user?.email || ''} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-red-500 hover:bg-red-600 font-bold text-lg py-6 shadow-xl"
            disabled={submitting || !user}
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {isEn ? 'Submitting report...' : 'Slanje prijave...'}</>
            ) : (
              <><AlertTriangle className="h-5 w-5 mr-2" /> {isEn ? 'Publish listing — start the search!' : 'Objavi oglas — Pokreni potragu!'}</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
