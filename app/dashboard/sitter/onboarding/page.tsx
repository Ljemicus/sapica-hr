'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, User, Briefcase, Calendar, PartyPopper, ArrowLeft, ArrowRight, Check, PawPrint, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const STEPS = [
  { title: 'Profilna slika', icon: Camera, description: 'Dodajte svoju fotografiju' },
  { title: 'O meni', icon: User, description: 'Predstavite se vlasnicima' },
  { title: 'Usluge i cijene', icon: Briefcase, description: 'Odaberite što nudite' },
  { title: 'Raspoloživost', icon: Calendar, description: 'Postavite svoj raspored' },
  { title: 'Gotovo!', icon: PartyPopper, description: 'Vaš profil je spreman' },
];

const SERVICES = [
  { id: 'boarding', name: 'Smještaj', emoji: '🏠', desc: 'Ljubimac boravi kod vas' },
  { id: 'walking', name: 'Šetnja', emoji: '🐕', desc: 'Šetnja u kvartu' },
  { id: 'house-sitting', name: 'Čuvanje u kući', emoji: '🏡', desc: 'Vi dolazite u dom vlasnika' },
  { id: 'drop-in', name: 'Kratki posjet', emoji: '👋', desc: 'Kratki posjet za hranjenje' },
  { id: 'daycare', name: 'Dnevna briga', emoji: '☀️', desc: 'Čuvanje tijekom dana' },
];

const DAYS = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];

export default function SitterOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const toggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/10 dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border-0 text-sm px-4 py-1.5 rounded-full font-semibold">
            <PawPrint className="h-3.5 w-3.5 mr-1.5" />
            Postavljanje profila
          </Badge>
          <h1 className="text-3xl font-extrabold font-[var(--font-heading)]">
            Postani <span className="text-gradient">PetPark Sitter</span>
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < currentStep ? 'bg-teal-500 text-white' :
                  i === currentStep ? 'bg-orange-500 text-white shadow-lg shadow-orange-200/50' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i === currentStep ? 'text-orange-500 font-semibold' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-gradient-to-r from-orange-500 to-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step content */}
        <Card className="border-0 shadow-sm rounded-2xl animate-fade-in-up">
          <CardContent className="p-6 md:p-8">
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="inline-flex p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20">
                  <Camera className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Dodajte profilnu sliku</h2>
                  <p className="text-muted-foreground text-sm">Profili sa slikom dobivaju 3x više rezervacija!</p>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 hover:border-orange-400 transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Kliknite ili povucite sliku ovdje</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG do 5MB</p>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="inline-flex p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Predstavite se</h2>
                  <p className="text-muted-foreground text-sm">Napišite kratki opis o sebi i svom iskustvu sa životinjama.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">O meni</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Npr. Obožavam životinje od malih nogu. Imam iskustva s psima i mačkama..."
                      className="mt-1.5 min-h-[120px] rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 znakova</p>
                  </div>
                  <div>
                    <Label htmlFor="experience">Godine iskustva sa životinjama</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Npr. 5"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20">
                  <Briefcase className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Usluge i cijene</h2>
                  <p className="text-muted-foreground text-sm">Odaberite usluge koje želite nuditi i postavite cijene.</p>
                </div>
                <div className="space-y-3">
                  {SERVICES.map((service) => {
                    const selected = selectedServices.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selected
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{service.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.desc}</p>
                        </div>
                        {selected && (
                          <Input
                            type="number"
                            min="1"
                            placeholder="€"
                            value={prices[service.id] || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              setPrices(prev => ({ ...prev, [service.id]: e.target.value }));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 rounded-lg text-center"
                          />
                        )}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                        }`}>
                          {selected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="inline-flex p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20">
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Raspoloživost</h2>
                  <p className="text-muted-foreground text-sm">Označite dane kada ste dostupni za čuvanje.</p>
                </div>
                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const selected = availableDays.includes(day);
                    return (
                      <div
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selected
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className={`font-medium text-sm ${selected ? 'text-purple-700 dark:text-purple-300' : ''}`}>{day}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                        }`}>
                          {selected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6 py-6">
                <div className="text-6xl animate-bounce">🎉</div>
                <div>
                  <h2 className="text-2xl font-extrabold mb-2 font-[var(--font-heading)]">
                    Tvoj profil je <span className="text-gradient">spreman</span>!
                  </h2>
                  <p className="text-muted-foreground">
                    Čestitamo! Vaš sitter profil je postavljen. Sada vas vlasnici mogu pronaći u pretrazi.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-orange-500">0€</p>
                    <p className="text-xs text-muted-foreground">Provizija</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-teal-500">24h</p>
                    <p className="text-xs text-muted-foreground">Verifikacija</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-purple-500">🐾</p>
                    <p className="text-xs text-muted-foreground">Spremni!</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link href="/dashboard/sitter">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 rounded-xl font-bold px-8">
                      Idi na nadzornu ploču
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/pretraga">
                    <Button size="lg" variant="outline" className="rounded-xl font-semibold px-8">
                      Pogledaj svoj profil
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Natrag
            </Button>
            <Button
              onClick={async () => {
                // Validate before advancing from step 3 (last data step) → save profile
                if (currentStep === 3) {
                  if (!bio || bio.length < 10) {
                    toast.error('Bio mora imati najmanje 10 znakova');
                    setCurrentStep(1);
                    return;
                  }
                  if (selectedServices.length === 0) {
                    toast.error('Odaberite barem jednu uslugu');
                    setCurrentStep(2);
                    return;
                  }
                  setSaving(true);
                  try {
                    const pricesNumeric: Record<string, number> = {};
                    for (const [key, val] of Object.entries(prices)) {
                      pricesNumeric[key] = parseInt(val) || 0;
                    }
                    const res = await fetch('/api/sitter-profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        bio,
                        experience_years: parseInt(experience) || 0,
                        services: selectedServices,
                        prices: pricesNumeric,
                        city: '',
                      }),
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => null);
                      toast.error(data?.error ? 'Greška: provjerite unos' : 'Greška pri spremanju profila');
                      setSaving(false);
                      return;
                    }
                    toast.success('Profil spremljen!');
                    router.refresh();
                  } catch {
                    toast.error('Mrežna greška');
                    setSaving(false);
                    return;
                  }
                  setSaving(false);
                }
                setCurrentStep(prev => prev + 1);
              }}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Spremanje...
                </>
              ) : currentStep === 3 ? (
                <>
                  Spremi i završi
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Dalje
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
