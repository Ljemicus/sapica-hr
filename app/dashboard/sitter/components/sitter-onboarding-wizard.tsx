'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Home,
  Dog,
  Clock,
  Star,
  BadgeCheck,
  Camera,
  FileCheck,
  X,
  Save,
  SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { type ServiceType } from '@/lib/types';

const SERVICES: { type: ServiceType; label: string; description: string; icon: React.ElementType }[] = [
  { type: 'boarding', label: 'Čuvanje preko noći', description: 'Ljubimac ostaje kod tebe', icon: Home },
  { type: 'daycare', label: 'Dnevni boravak', description: 'Briga tijekom dana', icon: Clock },
  { type: 'walking', label: 'Šetnja pasa', description: 'Šetnje po potrebi', icon: Dog },
  { type: 'house-sitting', label: 'Čuvanje u domu vlasnika', description: 'Ti dolaziš k njima', icon: MapPin },
  { type: 'drop-in', label: 'Brzi posjet', description: 'Kratki check-in', icon: Check },
];

const ZAGREB_NEIGHBORHOODS = [
  'Centar', 'Trešnjevka', 'Trnje', 'Maksimir', 'Dubrava', 'Novaki',
  'Medveščak', 'Knežija', 'Rudeš', 'Srednjaci', 'Voltino', 'Jarun',
  'Prečko', 'Savica', 'Sigečica', 'Borongaj', 'Klara', 'Remete',
];

const SPLIT_NEIGHBORHOODS = [
  'Centar', 'Bacvice', 'Znjan', 'Meje', 'Manuš', 'Lučac',
  'Skalice', 'Kman', 'Sućidar', 'Plokite', 'Pujanke', 'Spinut',
];

const RIJEKA_NEIGHBORHOODS = [
  'Centar', 'Belveder', 'Kantrida', 'Pećine', 'Sušak', 'Trsat',
  'Kozala', 'Potok', 'Škurinje', 'Banderovo', 'Marčeljeva Draga',
];

interface SitterOnboardingData {
  step: number;
  profile: {
    bio: string;
    experienceYears: number;
    services: ServiceType[];
    prices: Record<ServiceType, number>;
  };
  serviceAreas: {
    city: string;
    neighborhoods: string[];
  };
  completed: boolean;
  skipped: boolean;
}

const STORAGE_KEY = 'sitter-onboarding-progress-v1';

const defaultData: SitterOnboardingData = {
  step: 0,
  profile: {
    bio: '',
    experienceYears: 0,
    services: [],
    prices: { boarding: 25, daycare: 20, walking: 15, 'house-sitting': 30, 'drop-in': 10 },
  },
  serviceAreas: {
    city: 'Zagreb',
    neighborhoods: [],
  },
  completed: false,
  skipped: false,
};

export function SitterOnboardingWizard() {
  const router = useRouter();
  const [data, setData] = useState<SitterOnboardingData>(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...defaultData, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isHydrated]);

  const updateData = useCallback((updates: Partial<SitterOnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback((updates: Partial<SitterOnboardingData['profile']>) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  }, []);

  const updateServiceAreas = useCallback((updates: Partial<SitterOnboardingData['serviceAreas']>) => {
    setData((prev) => ({ ...prev, serviceAreas: { ...prev.serviceAreas, ...updates } }));
  }, []);

  const goToStep = (step: number) => {
    if (step >= 0 && step <= 6) {
      updateData({ step });
    }
  };

  const nextStep = () => goToStep(data.step + 1);
  const prevStep = () => goToStep(data.step - 1);

  const skipOnboarding = () => {
    updateData({ skipped: true });
    toast.info('Možeš nastaviti kasnije. Tvoj napredak je spremljen.');
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // Save profile data to API
      const response = await fetch('/api/sitter-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: data.profile.bio,
          experience_years: data.profile.experienceYears,
          services: data.profile.services,
          prices: data.profile.prices,
          neighborhoods: data.serviceAreas.neighborhoods,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      updateData({ completed: true });
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Profil je spremljen! Dobrodošao/la u PetPark zajednicu.');
      router.refresh();
    } catch {
      toast.error('Došlo je do greške. Pokušaj ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((data.step + 1) / 7) * 100;

  if (!isHydrated) return null;

  // If completed or skipped, don't show
  if (data.completed || data.skipped) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Postani PetPark Sitter</h1>
                  <p className="text-sm text-muted-foreground">Korak {data.step + 1} od 7</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={skipOnboarding} className="text-muted-foreground">
                <SkipForward className="w-4 h-4 mr-2" />
                Preskoči za sada
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={data.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {data.step === 0 && <WelcomeStep onNext={nextStep} />}
              {data.step === 1 && (
                <ProfileStep
                  profile={data.profile}
                  onUpdate={updateProfile}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 2 && (
                <ServicesStep
                  profile={data.profile}
                  onUpdate={updateProfile}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 3 && (
                <ServiceAreasStep
                  serviceAreas={data.serviceAreas}
                  onUpdate={updateServiceAreas}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 4 && <VerificationStep onNext={nextStep} onBack={prevStep} />}
              {data.step === 5 && <HowItWorksStep onNext={nextStep} onBack={prevStep} />}
              {data.step === 6 && (
                <ReviewStep
                  data={data}
                  onFinish={finishOnboarding}
                  onBack={prevStep}
                  isLoading={isLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-8 md:p-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-6">
            <Sparkles className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dobrodošao/la u PetPark zajednicu!
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Postani sitter i zaradi radeći ono što voliš — brinući se o ljubimcima. 
            Tvoj profil će biti vidljiv tisućama vlasnika koji traže pouzdanu skrb za svoje ljubimce.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ValueCard
              icon={Heart}
              title="Rad s ljubimcima"
              description="Provedi vrijeme s psićima i mačkama i zaradi od toga"
            />
            <ValueCard
              icon={Calendar}
              title="Fleksibilan raspored"
              description='Odaberi kada želiš raditi — potpuna sloboda'
            />
            <ValueCard
              icon={CreditCard}
              title="Sigurna zarada"
              description="Isplate direktno na račun, svaki tjedan"
            />
          </div>

          <Button size="lg" onClick={onNext} className="gap-2">
            Započni
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 2: Profile
function ProfileStep({
  profile,
  onUpdate,
  onNext,
  onBack,
}: {
  profile: SitterOnboardingData['profile'];
  onUpdate: (updates: Partial<SitterOnboardingData['profile']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = profile.bio.length >= 50 && profile.experienceYears >= 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          Predstavi se
        </CardTitle>
        <CardDescription>
          Napiši nešto o sebi i svom iskustvu s ljubimcima. Ovo vlasnici prvo pročitaju.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">O meni</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="npr. Imam 5 godina iskustva s psima svih veličina. Volim duge šetnje i imam ograđeni dvorišni prostor. Dostupan sam i vikendom..."
            className="min-h-[150px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {profile.bio.length}/500 znakova (preporučeno: barem 50)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Godine iskustva s ljubimcima</Label>
          <Input
            id="experience"
            type="number"
            min={0}
            max={50}
            value={profile.experienceYears}
            onChange={(e) => onUpdate({ experienceYears: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Ako tek počinješ, stavi 0 — bitno je da si odgovoran/na i voliš životinje
          </p>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 3: Services
function ServicesStep({
  profile,
  onUpdate,
  onNext,
  onBack,
}: {
  profile: SitterOnboardingData['profile'];
  onUpdate: (updates: Partial<SitterOnboardingData['profile']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleService = (type: ServiceType) => {
    const services = profile.services.includes(type)
      ? profile.services.filter((s) => s !== type)
      : [...profile.services, type];
    onUpdate({ services });
  };

  const updatePrice = (type: ServiceType, price: number) => {
    onUpdate({
      prices: { ...profile.prices, [type]: price },
    });
  };

  const canContinue = profile.services.length > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dog className="w-5 h-5 text-orange-500" />
          Odaberi usluge
        </CardTitle>
        <CardDescription>
          Koje usluge nudiš i po kojim cijenama? Ovo možeš kasnije promijeniti.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {SERVICES.map((service) => {
            const isSelected = profile.services.includes(service.type);
            const Icon = service.icon as React.ElementType;
            
            return (
              <div
                key={service.type}
                className={`rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-orange-300 bg-orange-50/50'
                    : 'border-border hover:border-orange-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleService(service.type)}
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{service.label}</h3>
                      {isSelected && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          Odabrano
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    
                    {isSelected && (
                      <div className="flex items-center gap-3">
                        <Label className="text-sm whitespace-nowrap">Cijena (€):</Label>
                        <Input
                          type="number"
                          min={5}
                          max={200}
                          value={profile.prices[service.type]}
                          onChange={(e) => updatePrice(service.type, parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">
                          {service.type === 'walking' ? 'po šetnji' : 'po danu'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 4: Service Areas
function ServiceAreasStep({
  serviceAreas,
  onUpdate,
  onNext,
  onBack,
}: {
  serviceAreas: SitterOnboardingData['serviceAreas'];
  onUpdate: (updates: Partial<SitterOnboardingData['serviceAreas']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const neighborhoods =
    serviceAreas.city === 'Zagreb'
      ? ZAGREB_NEIGHBORHOODS
      : serviceAreas.city === 'Split'
      ? SPLIT_NEIGHBORHOODS
      : RIJEKA_NEIGHBORHOODS;

  const toggleNeighborhood = (neighborhood: string) => {
    const neighborhoods = serviceAreas.neighborhoods.includes(neighborhood)
      ? serviceAreas.neighborhoods.filter((n) => n !== neighborhood)
      : [...serviceAreas.neighborhoods, neighborhood];
    onUpdate({ neighborhoods });
  };

  const canContinue = serviceAreas.neighborhoods.length > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          Područje djelovanja
        </CardTitle>
        <CardDescription>
          U kojem gradu i kvartovima radiš? Vlasnici traže sittere u blizini.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Grad</Label>
          <div className="flex gap-2">
            {['Zagreb', 'Split', 'Rijeka'].map((city) => (
              <Button
                key={city}
                type="button"
                variant={serviceAreas.city === city ? 'default' : 'outline'}
                onClick={() => onUpdate({ city, neighborhoods: [] })}
                className="flex-1"
              >
                {city}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Kvartovi u kojima radiš</Label>
          <p className="text-sm text-muted-foreground">
            Odaberi sve kvartove gdje možeš pružati usluge
          </p>
          <div className="flex flex-wrap gap-2">
            {neighborhoods.map((neighborhood) => {
              const isSelected = serviceAreas.neighborhoods.includes(neighborhood);
              return (
                <button
                  key={neighborhood}
                  onClick={() => toggleNeighborhood(neighborhood)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                  {neighborhood}
                </button>
              );
            })}
          </div>
          {serviceAreas.neighborhoods.length === 0 && (
            <p className="text-sm text-amber-600">Odaberi barem jedan kvart</p>
          )}
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 5: Verification
function VerificationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          Verifikacija
        </CardTitle>
        <CardDescription>
          Zaštiti vlasnike i izgradi povjerenje — verificiraj svoj profil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <VerificationItem
            icon={BadgeCheck}
            title="Email verifikacija"
            description="Potvrdi svoj email da bismo znali da si stvarna osoba."
            status="required"
          />
          <VerificationItem
            icon={Camera}
            title="Profilna fotografija"
            description="Dodaj svoju sliku kako bi vlasnici znali s kim komuniciraju."
            status="recommended"
          />
          <VerificationItem
            icon={FileCheck}
            title="Verifikacija identiteta"
            description="Upload osobne iskaznice ili putovnice za dodatno povjerenje."
            status="optional"
          />
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Zašto verifikacija?</h4>
              <ul className="mt-2 space-y-1 text-sm text-amber-800">
                <li>• Verificirani sitteri dobivaju <strong>do 3x više rezervacija</strong></li>
                <li>• Vlasnici se osjećaju sigurnije</li>
                <li>• Tvoj profil dobiva "Verificirani" značku</li>
              </ul>
            </div>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 6: How It Works
function HowItWorksStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Kako funkcioniraju rezervacije
        </CardTitle>
        <CardDescription>
          Brzo objašnjenje procesa — od upita do isplate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <HowItWorksItem
            step={1}
            icon={Check}
            title="Vlasnik šalje upit"
            description="Vlasnik ti šalje upit s detaljima o ljubimcu i datuma."
          />
          <HowItWorksItem
            step={2}
            icon={Clock}
            title="Ti prihvaćaš ili odbijaš"
            description="Imaš 24 sata za odgovor. Brza reakcija = bolja ocjena."
          />
          <HowItWorksItem
            step={3}
            icon={CreditCard}
            title="Vlasnik plaća unaprijed"
            description="Novac se blokira na sigurnom escrow računu."
          />
          <HowItWorksItem
            step={4}
            icon={Heart}
            title="Briniš o ljubimcu"
            description="Uživaš s ljubimcem i šalješ ažuriranja vlasniku."
          />
          <HowItWorksItem
            step={5}
            icon={Star}
            title="Isplata i recenzija"
            description="Nakon uspješnog čuvanja, dobivaš isplatu i recenziju."
          />
        </div>

        <div className="rounded-xl bg-muted p-4">
          <h4 className="font-medium mb-2">Što trebaš znati:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Platforma zadržava 15% provizije</li>
            <li>• Isplate se vrše tjedan dana nakon završetka čuvanja</li>
            <li>• Otkazivanje u zadnji tren utječe na tvoju ocjenu</li>
            <li>• Komunikacija mora ostati na platformi (zaštita)</li>
          </ul>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 7: Review
function ReviewStep({
  data,
  onFinish,
  onBack,
  isLoading,
}: {
  data: SitterOnboardingData;
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          Pregled i potvrda
        </CardTitle>
        <CardDescription>
          Provjeri svoje podatke prije nego što aktiviraš profil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <ReviewSection title="O meni">
            <p className="text-sm">{data.profile.bio || 'Nije uneseno'}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Iskustvo: {data.profile.experienceYears} godina
            </p>
          </ReviewSection>

          <ReviewSection title="Usluge">
            {data.profile.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.profile.services.map((service) => (
                  <Badge key={service} variant="secondary">
                    {SERVICES.find((s) => s.type === service)?.label} — €{data.profile.prices[service]}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nema odabranih usluga</p>
            )}
          </ReviewSection>

          <ReviewSection title="Područje">
            <p className="text-sm">
              {data.serviceAreas.city} — {data.serviceAreas.neighborhoods.join(', ')}
            </p>
          </ReviewSection>
        </div>

        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Spremno za objavu!</h4>
              <p className="text-sm text-green-800 mt-1">
                Nakon aktivacije, tvoj profil postaje vidljiv vlasnicima. 
                Možeš kasnije uređivati sve podatke u postavkama profila.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Natrag
          </Button>
          <Button onClick={onFinish} disabled={isLoading} className="flex-1 gap-2">
            {isLoading ? (
              <>Spremam...</>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Aktiviraj profil
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper Components
function ValueCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-muted/50 p-4 text-center">
      <Icon className="w-8 h-8 mx-auto mb-2 text-orange-500" />
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepNavigation({
  onNext,
  onBack,
  canContinue,
}: {
  onNext: () => void;
  onBack: () => void;
  canContinue: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Natrag
      </Button>
      <Button onClick={onNext} disabled={!canContinue} className="flex-1">
        Dalje
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function VerificationItem({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status: 'required' | 'recommended' | 'optional';
}) {
  const statusLabels = {
    required: { text: 'Obavezno', class: 'bg-red-100 text-red-700' },
    recommended: { text: 'Preporučeno', class: 'bg-amber-100 text-amber-700' },
    optional: { text: 'Opcionalno', class: 'bg-blue-100 text-blue-700' },
  };

  return (
    <div className="flex items-start gap-4 rounded-xl border p-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium">{title}</h3>
          <Badge variant="secondary" className={statusLabels[status].class}>
            {statusLabels[status].text}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function HowItWorksItem({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-sm">
        {step}
      </div>
      <div className="flex-1 pb-4 border-b last:border-0 last:pb-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-orange-500" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}
