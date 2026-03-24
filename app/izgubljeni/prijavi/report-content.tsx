'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Upload, Camera, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CITIES } from '@/lib/types';
import { toast } from 'sonner';

const ReportMapPicker = dynamic(() => import('./report-map-picker'), { ssr: false });

export function ReportLostPetContent() {
  const [submitted, setSubmitted] = useState(false);
  const [species, setSpecies] = useState<string | null>('pas');
  const [city, setCity] = useState<string | null>('');
  const [hasMicrochip, setHasMicrochip] = useState(false);
  const [hasCollar, setHasCollar] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Prijava uspješno poslana! Vaš oglas je objavljen.');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Prijava poslana!</h2>
            <p className="text-gray-600">Vaš oglas za izgubljenog ljubimca je objavljen. Podijelite ga na društvenim mrežama za veću vidljivost!</p>
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/izgubljeni">
                <Button className="w-full bg-red-500 hover:bg-red-600">Pogledaj sve oglase</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Povratak na početnu</Button>
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
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Prijavi nestanak</h1>
            <p className="text-red-100 text-lg">Ispunite podatke o vašem ljubimcu i pokrenite potragu</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/izgubljeni" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Natrag na listu
        </Link>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-500" />
                Slike ljubimca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-300'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); toast.info('Upload slika — demo verzija'); }}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">Povucite slike ovdje ili kliknite za upload</p>
                <p className="text-sm text-gray-400">JPG, PNG — do 5MB po slici</p>
                <Button type="button" variant="outline" className="mt-4" onClick={() => toast.info('Upload slika — demo verzija')}>
                  <Camera className="h-4 w-4 mr-2" />
                  Odaberi slike
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pet Info */}
          <Card>
            <CardHeader>
              <CardTitle>Podaci o ljubimcu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ime ljubimca *</Label>
                  <Input id="name" placeholder="npr. Rex" required />
                </div>
                <div>
                  <Label>Vrsta *</Label>
                  <Select value={species} onValueChange={setSpecies}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pas">Pas</SelectItem>
                      <SelectItem value="macka">Mačka</SelectItem>
                      <SelectItem value="ostalo">Ostalo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breed">Pasmina</Label>
                  <Input id="breed" placeholder="npr. Njemački ovčar" />
                </div>
                <div>
                  <Label htmlFor="color">Boja *</Label>
                  <Input id="color" placeholder="npr. Crno-smeđi" required />
                </div>
                <div>
                  <Label>Spol</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muško">Muško</SelectItem>
                      <SelectItem value="žensko">Žensko</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch checked={hasMicrochip} onCheckedChange={setHasMicrochip} />
                  <Label>Ima mikročip</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={hasCollar} onCheckedChange={setHasCollar} />
                  <Label>Ima ogrlicu s brojem</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Lokacija nestanka
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Grad *</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger><SelectValue placeholder="Odaberi grad" /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="neighborhood">Kvart / Ulica *</Label>
                  <Input id="neighborhood" placeholder="npr. Maksimir" required />
                </div>
              </div>
              <div>
                <Label>Označite lokaciju na karti</Label>
                <div className="h-64 rounded-lg overflow-hidden border mt-2">
                  <ReportMapPicker onPositionChange={setSelectedPosition} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_lost">Datum nestanka *</Label>
                  <Input id="date_lost" type="date" required />
                </div>
                <div>
                  <Label htmlFor="time_lost">Vrijeme nestanka</Label>
                  <Input id="time_lost" type="time" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Opis i detalji</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Opis situacije *</Label>
                <Textarea id="description" placeholder="Opišite okolnosti nestanka, gdje je zadnji put viđen..." rows={4} required />
              </div>
              <div>
                <Label htmlFor="marks">Posebne oznake</Label>
                <Textarea id="marks" placeholder="Ožiljci, mrlje, posebne oznake na tijelu..." rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt podaci</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_name">Vaše ime *</Label>
                <Input id="contact_name" placeholder="Ime i prezime" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Telefon *</Label>
                  <Input id="contact_phone" type="tel" placeholder="+385 91 234 5678" required />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input id="contact_email" type="email" placeholder="vas@email.hr" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full bg-red-500 hover:bg-red-600 font-bold text-lg py-6 shadow-xl">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Objavi oglas — Pokreni potragu!
          </Button>
        </form>
      </div>
    </div>
  );
}
