'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Home,
  Clock,
  Star,
  BadgeCheck,
  Camera,
  FileCheck,
  Store,
  Dog,
  Cat,
  Euro,
  SkipForward,
  ScissorsIcon,
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

type PetSize = 'small' | 'medium' | 'large' | 'cat';
type GroomingService = 'basic' | 'full' | 'nail' | 'ear' | 'teeth' | 'de shedding' | 'breed';

interface GroomingServiceDef {
  type: GroomingService;
  label: string;
  description: string;
  icon: React.ElementType;
}

const GROOMING_SERVICES: GroomingServiceDef[] = [
  { type: 'basic', label: 'Osnovno šišanje', description: 'Šišanje dlake do odabrane dužine', icon: Scissors },
  { type: 'full', label: 'Kompletna njega', description: 'Šišanje, kupanje, sušenje i češljanje', icon: Sparkles },
  { type: 'nail', label: 'Orezivanje noktiju', description: 'Orezivanje i poliranje noktiju', icon: ScissorsIcon },
  { type: 'ear', label: 'Čišćenje ušiju', description: 'Higijena ušiju i uklanjanje dlačica', icon: Check },
  { type: 'teeth', label: 'Oralna higijena', description: 'Čišćenje zubi i svježi dah', icon: Sparkles },
  { type: 'de shedding', label: 'De-shedding tretman', description: 'Uklanjanje poddlake za dugačkodlake', icon: Dog },
  { type: 'breed', label: 'Rasno šišanje', description: 'Specijalizirano šišanje prema standardu', icon: Star },
];

const PET_SIZES: { type: PetSize; label: string; description: string; icon: React.ElementType }[] = [
  { type: 'small', label: 'Mali pas', description: 'Do 10 kg (npr. Jazavčar, Maltezer)', icon: Dog },
  { type: 'medium', label: 'Srednji pas', description: '10-25 kg (npr. Bordi Koli, Beagle)', icon: Dog },
  { type: 'large', label: 'Veliki pas', description: 'Preko 25 kg (npr. Zlatni Retriever, Ovčar)', icon: Dog },
  { type: 'cat', label: 'Mačka', description: 'Sve rase mačaka', icon: Cat },
];

const SPECIALIZATIONS = [
  'Poodle šišanje',
  'Terijeri',
  'Dugačkodlake rase',
  'Kovrdžave rase',
  'Anksiozni ljubimci',
  'Seniori',
  'Štenci',
  'Mačke',
  'Show grooming',
  'Kreativno šišanje',
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

interface GroomerOnboardingData {
  step: number;
  profile: {
    bio: string;
    experienceYears: number;
    specializations: string[];
    salonName: string;
  };
  services: {
    groomingServices: GroomingService[];
    prices: Record<`${GroomingService}-${PetSize}`, number>;
  };
  serviceAreas: {
    city: string;
    neighborhoods: string[];
  };
  location: {
    address: string;
    hasParking: boolean;
    isMobile: boolean;
  };
  completed: boolean;
  skipped: boolean;
}

const STORAGE_KEY = 'groomer-onboarding-progress-v1';

const defaultPrices: Record<`${GroomingService}-${PetSize}`, number> = {
  'basic-small': 25,
  'basic-medium': 35,
  'basic-large': 50,
  'basic-cat': 30,
  'full-small': 40,
  'full-medium': 55,
  'full-large': 75,
  'full-cat': 45,
  'nail-small': 10,
  'nail-medium': 12,
  'nail-large': 15,
  'nail-cat': 10,
  'ear-small': 8,
  'ear-medium': 10,
  'ear-large': 12,
  'ear-cat': 8,
  'teeth-small': 15,
  'teeth-medium': 18,
  'teeth-large': 20,
  'teeth-cat': 15,
  'de shedding-small': 30,
  'de shedding-medium': 40,
  'de shedding-large': 55,
  'de shedding-cat': 35,
  'breed-small': 45,
  'breed-medium': 60,
  'breed-large': 85,
  'breed-cat': 0,
};

const defaultData: GroomerOnboardingData = {
  step: 0,
  profile: {
    bio: '',
    experienceYears: 0,
    specializations: [],
    salonName: '',
  },
  services: {
    groomingServices: [],
    prices: { ...defaultPrices },
  },
  serviceAreas: {
    city: 'Zagreb',
    neighborhoods: [],
  },
  location: {
    address: '',
    hasParking: true,
    isMobile: false,
  },
  completed: false,
  skipped: false,
};

export function GroomerOnboardingWizard() {
  const router = useRouter();
  const [data, setData] = useState<GroomerOnboardingData>(defaultData);
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

  const updateData = useCallback((updates: Partial<GroomerOnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback((updates: Partial<GroomerOnboardingData['profile']>) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  }, []);

  const updateServices = useCallback((updates: Partial<GroomerOnboardingData['services']>) => {
    setData((prev) => ({ ...prev, services: { ...prev.services, ...updates } }));
  }, []);

  const updateServiceAreas = useCallback((updates: Partial<GroomerOnboardingData['serviceAreas']>) => {
    setData((prev) => ({ ...prev, serviceAreas: { ...prev.serviceAreas, ...updates } }));
  }, []);

  const updateLocation = useCallback((updates: Partial<GroomerOnboardingData['location']>) => {
    setData((prev) => ({ ...prev, location: { ...prev.location, ...updates } }));
  }, []);

  const goToStep = (step: number) => {
    if (step >= 0 && step <= 7) {
      updateData({ step });
    }
  };

  const nextStep = () => goToStep(data.step + 1);
  const prevStep = () => goToStep(data.step - 1);

  const skipOnboarding = () => {
    updateData({ skipped: true });
    toast.info('Možeš nastaviti kasnije. Tvoj napredak je spremljen.');
    router.push('/dashboard/groomer');
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // Save profile data to API
      const response = await fetch('/api/groomers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: data.profile.bio,
          experience_years: data.profile.experienceYears,
          specializations: data.profile.specializations,
          salon_name: data.profile.salonName,
          services: data.services.groomingServices,
          prices: data.services.prices,
          city: data.serviceAreas.city,
          neighborhoods: data.serviceAreas.neighborhoods,
          address: data.location.address,
          has_parking: data.location.hasParking,
          is_mobile: data.location.isMobile,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      updateData({ completed: true });
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Profil je spremljen! Dobrodošao/la u PetPark Groomer zajednicu.');
      router.push('/dashboard/groomer');
      router.refresh();
    } catch {
      toast.error('Došlo je do greške. Pokušaj ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((data.step + 1) / 8) * 100;

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Postani PetPark Groomer</h1>
                  <p className="text-sm text-muted-foreground">Korak {data.step + 1} od 8</p>
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
                  services={data.services}
                  onUpdate={updateServices}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 3 && (
                <PricingStep
                  services={data.services}
                  onUpdate={updateServices}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 4 && (
                <ServiceAreasStep
                  serviceAreas={data.serviceAreas}
                  onUpdate={updateServiceAreas}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 5 && (
                <LocationStep
                  location={data.location}
                  onUpdate={updateLocation}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 6 && <VerificationStep onNext={nextStep} onBack={prevStep} />}
              {data.step === 7 && (
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 mb-6">
            <Sparkles className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dobrodošao/la u PetPark Groomer zajednicu!
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Proširi svoju klijentelu i povećaj zaradu putem najveće platforme za njegu ljubimaca u Hrvatskoj. 
            Tvoj salon će biti vidljiv tisućama vlasnika koji traže profesionalne groomere.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ValueCard
              icon={Scissors}
              title="Profesionalni alati"
              description="Prikaži svoje vještine i specijalizacije"
            />
            <ValueCard
              icon={Calendar}
              title="Fleksibilan raspored"
              description='Upravljaj terminima kako ti odgovara'
            />
            <ValueCard
              icon={CreditCard}
              title="Sigurna naplata"
              description="Online rezervacije s unaprijednom uplatom"
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
  profile: GroomerOnboardingData['profile'];
  onUpdate: (updates: Partial<GroomerOnboardingData['profile']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = profile.bio.length >= 50 && profile.salonName.length >= 2;

  const toggleSpecialization = (spec: string) => {
    const specializations = profile.specializations.includes(spec)
      ? profile.specializations.filter((s) => s !== spec)
      : [...profile.specializations, spec];
    onUpdate({ specializations });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          Predstavi se
        </CardTitle>
        <CardDescription>
          Napiši nešto o sebi, svom iskustvu i specijalizacijama. Ovo klijenti prvo pročitaju.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="salonName">Naziv salona</Label>
          <Input
            id="salonName"
            value={profile.salonName}
            onChange={(e) => onUpdate({ salonName: e.target.value })}
            placeholder="npr. 'Happy Paws Grooming' ili 'Ana Pet Styling'"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">O meni</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="npr. Profesionalni groomer s 5 godina iskustva. Specijalizirana sam za Poodle i druge kovrdžave rase. Koristim samo premium proizvode..."
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {profile.bio.length}/500 znakova (preporučeno: barem 50)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Godine iskustva</Label>
          <Input
            id="experience"
            type="number"
            min={0}
            max={50}
            value={profile.experienceYears}
            onChange={(e) => onUpdate({ experienceYears: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Ako tek počinješ, stavi 0 — bitno je da si strastven/a i želiš učiti
          </p>
        </div>

        <div className="space-y-3">
          <Label>Specijalizacije</Label>
          <p className="text-sm text-muted-foreground">
            Odaberi svoje specijalizacije (opcionalno)
          </p>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => {
              const isSelected = profile.specializations.includes(spec);
              return (
                <button
                  key={spec}
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-pink-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 3: Services
function ServicesStep({
  services,
  onUpdate,
  onNext,
  onBack,
}: {
  services: GroomerOnboardingData['services'];
  onUpdate: (updates: Partial<GroomerOnboardingData['services']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleService = (type: GroomingService) => {
    const groomingServices = services.groomingServices.includes(type)
      ? services.groomingServices.filter((s) => s !== type)
      : [...services.groomingServices, type];
    onUpdate({ groomingServices });
  };

  const canContinue = services.groomingServices.length > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-pink-500" />
          Odaberi usluge
        </CardTitle>
        <CardDescription>
          Koje usluge nudiš? Cijene ćeš postaviti u sljedećem koraku.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {GROOMING_SERVICES.map((service) => {
            const isSelected = services.groomingServices.includes(service.type);
            const Icon = service.icon as React.ElementType;
            
            return (
              <div
                key={service.type}
                className={`rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-pink-300 bg-pink-50/50'
                    : 'border-border hover:border-pink-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleService(service.type)}
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-pink-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{service.label}</h3>
                      {isSelected && (
                        <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                          Odabrano
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
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

// Step 4: Pricing
function PricingStep({
  services,
  onUpdate,
  onNext,
  onBack,
}: {
  services: GroomerOnboardingData['services'];
  onUpdate: (updates: Partial<GroomerOnboardingData['services']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const updatePrice = (serviceType: GroomingService, petSize: PetSize, price: number) => {
    const key: `${GroomingService}-${PetSize}` = `${serviceType}-${petSize}`;
    onUpdate({
      prices: { ...services.prices, [key]: price },
    });
  };

  const selectedServices = GROOMING_SERVICES.filter((s) =>
    services.groomingServices.includes(s.type)
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="w-5 h-5 text-pink-500" />
          Postavi cijene
        </CardTitle>
        <CardDescription>
          Postavi cijene za svaku uslugu i veličinu ljubimca. Možeš ih kasnije promijeniti.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {selectedServices.map((service) => (
            <div key={service.type} className="rounded-xl border p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <service.icon className="w-4 h-4 text-pink-500" />
                {service.label}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PET_SIZES.map((size) => (
                  <div key={size.type} className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{size.label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={500}
                        value={services.prices[`${service.type}-${size.type}`]}
                        onChange={(e) =>
                          updatePrice(service.type, size.type, parseInt(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">€</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Savjet za cijene</h4>
              <p className="text-sm text-amber-800 mt-1">
                Pogledaj cijene konkurencije u svom gradu. Previsoke cijene mogu odbiti klijente, 
                a preniske mogu dovesti u pitanje kvalitetu.
              </p>
            </div>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 5: Service Areas
function ServiceAreasStep({
  serviceAreas,
  onUpdate,
  onNext,
  onBack,
}: {
  serviceAreas: GroomerOnboardingData['serviceAreas'];
  onUpdate: (updates: Partial<GroomerOnboardingData['serviceAreas']>) => void;
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
          <MapPin className="w-5 h-5 text-pink-500" />
          Područje djelovanja
        </CardTitle>
        <CardDescription>
          U kojem gradu i kvartovima primaš klijente? Klijenti traže groomere u blizini.
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
          <Label>Kvartovi koje pokrivaš</Label>
          <p className="text-sm text-muted-foreground">
            Odaberi sve kvartove gdje primiš klijente ili gdje mogu doći do tebe
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
                      ? 'bg-pink-500 text-white'
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

// Step 6: Location
function LocationStep({
  location,
  onUpdate,
  onNext,
  onBack,
}: {
  location: GroomerOnboardingData['location'];
  onUpdate: (updates: Partial<GroomerOnboardingData['location']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = location.address.length >= 5;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-pink-500" />
          Lokacija salona
        </CardTitle>
        <CardDescription>
          Dodaj adresu i informacije o lokaciji. Ovo će biti vidljivo klijentima.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">Adresa salona</Label>
          <Input
            id="address"
            value={location.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder="npr. Ilica 123, Zagreb"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Home className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Parking dostupan</h3>
                <p className="text-sm text-muted-foreground">Ima li klijentima gdje parkirati?</p>
              </div>
            </div>
            <Button
              type="button"
              variant={location.hasParking ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ hasParking: !location.hasParking })}
            >
              {location.hasParking ? 'Da' : 'Ne'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Mobilni groomer</h3>
                <p className="text-sm text-muted-foreground">Dolaziš li kod klijenata?</p>
              </div>
            </div>
            <Button
              type="button"
              variant={location.isMobile ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ isMobile: !location.isMobile })}
            >
              {location.isMobile ? 'Da' : 'Ne'}
            </Button>
          </div>
        </div>

        <div className="rounded-xl bg-muted p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Fotografije salona
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Dodaj fotografije svog salona kasnije u postavkama profila. 
            Dobre slike povećavaju broj rezervacija.
          </p>
          <Button variant="outline" size="sm" disabled className="opacity-50">
            Dodaj fotografije (kasnije)
          </Button>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 7: Verification
function VerificationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-pink-500" />
          Verifikacija
        </CardTitle>
        <CardDescription>
          Zaštiti klijente i izgradi povjerenje — verificiraj svoj profil.
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
            description="Dodaj svoju sliku kako bi klijenti znali s kim komuniciraju."
            status="recommended"
          />
          <VerificationItem
            icon={FileCheck}
            title="Verifikacija identiteta"
            description="Upload osobne iskaznice ili putovnice za dodatno povjerenje."
            status="optional"
          />
          <VerificationItem
            icon={Store}
            title="Obrt/ Firma"
            description="Ako imaš registriran obrt ili firmu, dodaj podatke za profesionalni izgled."
            status="optional"
          />
        </div>

        <div className="rounded-xl bg-pink-50 border border-pink-200 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-pink-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-pink-900">Zašto verifikacija?</h4>
              <ul className="mt-2 space-y-1 text-sm text-pink-800">
                <li>• Verificirani groomeri dobivaju <strong>do 3x više rezervacija</strong></li>
                <li>• Klijenti se osjećaju sigurnije</li>
                <li>• Tvoj profil dobiva &quot;Verificirani&quot; značku</li>
              </ul>
            </div>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 8: Review
function ReviewStep({
  data,
  onFinish,
  onBack,
  isLoading,
}: {
  data: GroomerOnboardingData;
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          Pregled i potvrda
        </CardTitle>
        <CardDescription>
          Provjeri svoje podatke prije nego što aktiviraš profil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <ReviewSection title="Salon">
            <p className="text-sm font-medium">{data.profile.salonName}</p>
            <p className="text-sm text-muted-foreground mt-1">{data.profile.bio || 'Nije uneseno'}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Iskustvo: {data.profile.experienceYears} godina
            </p>
            {data.profile.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.profile.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            )}
          </ReviewSection>

          <ReviewSection title="Usluge">
            {data.services.groomingServices.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.services.groomingServices.map((service) => (
                  <Badge key={service} variant="secondary">
                    {GROOMING_SERVICES.find((s) => s.type === service)?.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nema odabranih usluga</p>
            )}
          </ReviewSection>

          <ReviewSection title="Lokacija">
            <p className="text-sm">{data.location.address}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {data.serviceAreas.city} — {data.serviceAreas.neighborhoods.join(', ')}
            </p>
            <div className="flex gap-2 mt-2">
              {data.location.hasParking && <Badge variant="outline">Parking</Badge>}
              {data.location.isMobile && <Badge variant="outline">Mobilni</Badge>}
            </div>
          </ReviewSection>
        </div>

        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Spremno za objavu!</h4>
              <p className="text-sm text-green-800 mt-1">
                Nakon aktivacije, tvoj salon postaje vidljiv klijentima. 
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
      <Icon className="w-8 h-8 mx-auto mb-2 text-pink-500" />
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

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}
