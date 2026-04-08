'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  PawPrint,
  Shield,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/shared/image-upload';
import { Cat, Dog, HelpCircle } from 'lucide-react';
import type { Species } from '@/lib/types';
import { toast } from 'sonner';
import { OptimizedImage } from '@/components/ui/optimized-image';

const ONBOARDING_STORAGE_KEY = 'petpark-owner-onboarding';

interface OnboardingData {
  step: number;
  pet: {
    name: string;
    species: Species;
    breed: string;
    age: string;
    photo_url: string;
  };
  completed: boolean;
  skippedAt?: string;
}

const defaultOnboardingData: OnboardingData = {
  step: 0,
  pet: {
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    photo_url: '',
  },
  completed: false,
};

const TOTAL_STEPS = 5;

export function OwnerOnboardingWizard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [petData, setPetData] = useState(defaultOnboardingData.pet);
  const [savingPet, setSavingPet] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: OnboardingData = JSON.parse(saved);
        // If already completed or skipped, redirect to dashboard
        if (parsed.completed || parsed.skippedAt) {
          router.push('/dashboard/vlasnik');
          return;
        }
        setCurrentStep(parsed.step || 0);
        setPetData(parsed.pet || defaultOnboardingData.pet);
      } catch {
        // Invalid saved data, use defaults
      }
    }
  }, [router]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!mounted) return;
    const data: OnboardingData = {
      step: currentStep,
      pet: petData,
      completed: currentStep >= TOTAL_STEPS - 1,
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
  }, [currentStep, petData, mounted]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    const data: OnboardingData = {
      step: currentStep,
      pet: petData,
      completed: false,
      skippedAt: new Date().toISOString(),
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    router.push('/dashboard/vlasnik');
  };

  const handleComplete = async () => {
    // If pet data is filled, save the pet
    if (petData.name.trim()) {
      setSavingPet(true);
      try {
        const response = await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: petData.name,
            species: petData.species,
            breed: petData.breed || null,
            age: petData.age ? parseInt(petData.age) : null,
            weight: null,
            special_needs: null,
            photo_url: petData.photo_url || null,
          }),
        });
        if (!response.ok) {
          toast.error('Greška pri spremanju ljubimca');
        } else {
          toast.success('Ljubimac uspješno dodan!');
        }
      } catch {
        toast.error('Mrežna greška — ljubimac nije spremljen');
      } finally {
        setSavingPet(false);
      }
    }

    // Mark as completed
    const data: OnboardingData = {
      step: TOTAL_STEPS,
      pet: petData,
      completed: true,
      skippedAt: undefined,
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    router.push('/dashboard/vlasnik');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome - always can proceed
        return true;
      case 1: // Add pet - name is required
        return petData.name.trim().length > 0;
      case 2: // How to book
        return true;
      case 3: // Safety tips
        return true;
      case 4: // Finish
        return true;
      default:
        return true;
    }
  };

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              index < currentStep
                ? 'bg-warm-orange w-6'
                : index === currentStep
                ? 'bg-warm-orange h-3 w-3'
                : 'bg-muted'
            }`}
          />
          {index < TOTAL_STEPS - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                index < currentStep ? 'bg-warm-orange' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Step content components
  const WelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-warm-orange to-warm-peach shadow-lg shadow-warm-orange/20">
        <PawPrint className="h-10 w-10 text-white" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight font-[var(--font-heading)]">
          Dobrodošli u PetPark! 🎉
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Drago nam je što ste tu! PetPark je mjesto gdje vaši ljubimci dobivaju najbolju skrb — 
          bilo da trebate sittera, groomera, trenera ili samo savjete.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <div className="p-3 rounded-xl bg-warm-orange/5 border border-warm-orange/10 text-center">
          <UserCheck className="h-5 w-5 mx-auto mb-1 text-warm-orange" />
          <p className="text-xs font-medium text-warm-orange/80">Provjereni sitteri</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-teal/5 border border-warm-teal/10 text-center">
          <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-warm-teal" />
          <p className="text-xs font-medium text-warm-teal/80">Sigurna plaćanja</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-coral/5 border border-warm-coral/10 text-center">
          <Star className="h-5 w-5 mx-auto mb-1 text-warm-coral" />
          <p className="text-xs font-medium text-warm-coral/80">Recenzije</p>
        </div>
        <div className="p-3 rounded-xl bg-warm-sage/5 border border-warm-sage/10 text-center">
          <MapPin className="h-5 w-5 mx-auto mb-1 text-warm-sage" />
          <p className="text-xs font-medium text-warm-sage/80">U vašem gradu</p>
        </div>
      </div>
    </div>
  );

  const AddPetStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-warm-orange to-warm-peach shadow-md">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight font-[var(--font-heading)]">Dodajte svog prvog ljubimca</h2>
        <p className="text-muted-foreground">
          Recite nam nešto o svom ljubimcu. Možete dodati više ljubimaca kasnije.
        </p>
      </div>

      <div className="community-section-card p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pet-name">
            Ime ljubimca <span className="text-warm-coral">*</span>
          </Label>
          <Input
            id="pet-name"
            value={petData.name}
            onChange={(e) => setPetData({ ...petData, name: e.target.value })}
            placeholder="npr. Rex"
          />
        </div>

        <div className="space-y-2">
          <Label>Vrsta</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['dog', 'Pas', Dog] as const,
              ['cat', 'Mačka', Cat] as const,
              ['other', 'Ostalo', HelpCircle] as const,
            ].map(([value, label, Icon], index) => (
              <button
                key={`species-${value}-${index}`}
                type="button"
                onClick={() => setPetData({ ...petData, species: value as Species })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  petData.species === value
                    ? 'border-warm-orange bg-warm-orange/5 shadow-sm'
                    : 'border-border hover:border-warm-orange/30 hover:bg-muted/30'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2 text-warm-orange" />
                <p className="text-sm font-medium">{label}</p>
              </button>
            ))}
          </div>
        </div>

          <div className="space-y-2">
            <Label htmlFor="pet-breed">Pasmina</Label>
            <Input
              id="pet-breed"
              value={petData.breed}
              onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
              placeholder="npr. Zlatni retriever"
              className="focus:border-orange-300 focus:ring-orange-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet-age">Dob (godine)</Label>
            <Input
              id="pet-age"
              type="number"
              min="0"
              max="30"
              value={petData.age}
              onChange={(e) => setPetData({ ...petData, age: e.target.value })}
              placeholder="npr. 3"
              className="focus:border-orange-300 focus:ring-orange-200"
            />
          </div>

          <div className="space-y-2">
            <Label>Fotografija ljubimca</Label>
            <ImageUpload
              variant="square"
              bucket="pet-photos"
              entityId="onboarding"
              currentImageUrl={petData.photo_url || null}
              onUploadComplete={(urls) => {
                if (urls[0]) setPetData({ ...petData, photo_url: urls[0] });
              }}
            />
          </div>
        </div>
      </div>
  );

  const HowToBookStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 shadow-md">
          <Clock className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Kako rezervirati sittera?</h2>
        <p className="text-muted-foreground">Jednostavno je — evo kako to funkcionira:</p>
      </div>

      <div className="space-y-4">
        {[
          {
            step: 1,
            title: 'Pretražite sittere',
            description: 'Filtrirajte po gradu, usluzi i datumu. Pogledajte profile, recenzije i cijene.',
            icon: MapPin,
            color: 'bg-blue-500',
          },
          {
            step: 2,
            title: 'Pošaljite upit',
            description: 'Odaberite sittera i pošaljite upit s detaljima — datum, trajanje, posebne potrebe.',
            icon: Check,
            color: 'bg-teal-500',
          },
          {
            step: 3,
            title: 'Potvrdite rezervaciju',
            description: 'Nakon što sitter prihvati, platite sigurno putem PetParka. Novac se čuva do završetka usluge.',
            icon: Shield,
            color: 'bg-orange-500',
          },
          {
            step: 4,
            title: 'Uživajte!',
            description: 'Vaš ljubimac je u sigurnim rukama. Pratite šetnju uživo i dobivajte ažuriranja.',
            icon: Heart,
            color: 'bg-pink-500',
          },
        ].map((item) => (
          <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white shadow-sm`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {item.step}. {item.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
        <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Savjet: Sitteri s odzivom &lt; 2 sata su označeni &quot;Brzi odgovor&quot; — super za hitne situacije!
        </p>
      </div>
    </div>
  );

  const SafetyTipsStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-300 shadow-md">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Savjeti za sigurnost</h2>
        <p className="text-muted-foreground">Vaša sigurnost i sigurnost vašeg ljubimca su nam prioritet:</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: 'Prvi susret',
            description: 'Uvijek se prvo sastanite u javnom prostoru. Upoznajte sittera prije nego što ostavite ljubimca.',
            icon: UserCheck,
            color: 'from-blue-400 to-blue-300',
          },
          {
            title: 'Provjerite dokumentaciju',
            description: 'Svi sitteri na PetParku moraju proći verifikaciju. Provjerite njihovu razinu verifikacije.',
            icon: Shield,
            color: 'from-emerald-400 to-teal-300',
          },
          {
            title: 'Recenzije su važne',
            description: 'Pročitajte recenzije od drugih vlasnika. To je najbolji način da procijenite kvalitetu.',
            icon: Star,
            color: 'from-amber-400 to-yellow-300',
          },
          {
            title: 'Komunikacija',
            description: 'Budite jasni oko potreba vašeg ljubimca. Alergije, lijekovi, navike — sve je važno.',
            icon: CheckCircle2,
            color: 'from-purple-400 to-pink-300',
          },
          {
            title: 'Plaćanje kroz PetPark',
            description: 'Uvijek plaćajte putem platforme. Tako ste zaštićeni i imate povijest transakcija.',
            icon: ShieldCheck,
            color: 'from-orange-400 to-red-300',
          },
          {
            title: 'Pratite u realnom vremenu',
            description: 'Za šetnje možete pratiti lokaciju uživo i dobivati fotografije s GPS oznakom.',
            icon: MapPin,
            color: 'from-cyan-400 to-blue-300',
          },
        ].map((tip, index) => (
          <Card key={index} className="border-0 shadow-sm overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${tip.color}`} />
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${tip.color} flex items-center justify-center`}>
                  <tip.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
        <p className="text-sm text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>U slučaju problema:</strong> Naš tim podrške dostupan je 7 dana u tjednu. 
            Kontaktirajte nas putem chata ili na podrska@petpark.hr
          </span>
        </p>
      </div>
    </div>
  );

  const FinishStep = () => (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-300 shadow-lg shadow-orange-200">
        <CheckCircle2 className="h-12 w-12 text-white" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Sve je spremno! 🎉</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {petData.name
            ? `Hvala vam! ${petData.name} je dodan u vaš profil. Sada možete pretraživati sittere i rezervirati usluge.`
            : 'Hvala vam! Vaš profil je spreman. Sada možete dodati ljubimce i pretraživati sittere.'}
        </p>
      </div>

      {petData.name && (
        <Card className="border-0 shadow-sm max-w-sm mx-auto">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center overflow-hidden">
                {petData.photo_url ? (
                  <OptimizedImage
                    src={petData.photo_url}
                    alt={petData.name}
                    fill
                    className="rounded-full"
                  />
                ) : (
                  <PawPrint className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg">{petData.name}</p>
                <p className="text-sm text-muted-foreground">
                  {petData.species === 'dog' ? 'Pas' : petData.species === 'cat' ? 'Mačka' : 'Ostalo'}
                  {petData.breed && ` · ${petData.breed}`}
                  {petData.age && ` · ${petData.age} god.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-600">Što dalje?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push('/pretraga')}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Pretraži sittere <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/vlasnik')}
          >
            Idi na nadzornu ploču
          </Button>
        </div>
      </div>
    </div>
  );

  const steps = [WelcomeStep, AddPetStep, HowToBookStep, SafetyTipsStep, FinishStep];
  const CurrentStepComponent = steps[currentStep];

  if (!mounted) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header with skip option */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <PawPrint className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">PetPark</span>
          </div>
          {currentStep < TOTAL_STEPS - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-gray-600"
            >
              <SkipForward className="h-4 w-4 mr-1" /> Preskoči
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <ProgressIndicator />

        {/* Main content */}
        <div className="animate-fade-in">
          <CurrentStepComponent />
        </div>

        {/* Navigation buttons */}
        {currentStep < TOTAL_STEPS - 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'invisible' : ''}
            >
              Natrag
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || savingPet}
              className="bg-orange-500 hover:bg-orange-600 min-w-[120px]"
            >
              {savingPet ? (
                'Spremanje...'
              ) : (
                <>
                  {currentStep === TOTAL_STEPS - 2 ? 'Završi' : 'Nastavi'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step counter */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Korak {currentStep + 1} od {TOTAL_STEPS}
          {currentStep > 0 && ' · Možete se vratiti i nastaviti kasnije'}
        </p>
      </div>
    </div>
  );
}

// Export utility to check if onboarding is completed
export function isOwnerOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!saved) return false;
  try {
    const data: OnboardingData = JSON.parse(saved);
    return data.completed === true;
  } catch {
    return false;
  }
}

// Export utility to check if onboarding was skipped
export function wasOwnerOnboardingSkipped(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!saved) return false;
  try {
    const data: OnboardingData = JSON.parse(saved);
    return !!data.skippedAt && !data.completed;
  } catch {
    return false;
  }
}

// Export utility to reset onboarding
export function resetOwnerOnboarding(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
