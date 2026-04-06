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
  Dog,
  Cat,
  Home,
  Award,
  Stethoscope,
  FileCheck,
  BadgeCheck,
  Camera,
  X,
  SkipForward,
  Plus,
  Trash2,
  Euro,
  Info,
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
import { ImageUpload } from '@/components/shared/image-upload';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────────────────

interface PuppyListing {
  id: string;
  breed: string;
  count: number;
  ageWeeks: number;
  priceFrom: number;
  priceTo: number;
  availableFrom: string;
  photos: string[];
  description: string;
}

interface HealthTest {
  id: string;
  name: string;
  status: 'done' | 'pending' | 'not_applicable';
  date?: string;
  documentUrl?: string;
}

interface BreederOnboardingData {
  step: number;
  profile: {
    kennelName: string;
    bio: string;
    experienceYears: number;
    breedingPhilosophy: string;
    website?: string;
  };
  breeds: string[];
  puppies: PuppyListing[];
  facility: {
    city: string;
    address: string;
    description: string;
    photos: string[];
    facilities: string[];
  };
  healthTests: HealthTest[];
  certifications: {
    fciRegistered: boolean;
    fciNumber?: string;
    clubMember: boolean;
    clubName?: string;
  };
  completed: boolean;
  skipped: boolean;
}

const STORAGE_KEY = 'breeder-onboarding-progress-v1';

const DOG_BREEDS = [
  'Labrador retriever', 'Zlatni retriver', 'Njemački ovčar', 'Francuski buldog',
  'Maltezer', 'Dalmatinac', 'Husky', 'Border collie', 'Bernski planinski pas',
  'Cavalier King Charles', 'Yorkshire terrier', 'Bichon frise', 'Beagle',
  'Boxer', 'Doberman', 'Rottweiler', 'Shih tzu', 'Chihuahua', 'Pudla',
  'Schnauzer', 'Cocker španijel', 'Njemački bokser', 'Samojski pas',
  'Akita', 'Šarplaninac', 'Hrvatski ovčar', 'Talijanski hrt',
];

const CAT_BREEDS = [
  'Britanska kratkodlaka', 'Maine Coon', 'Ragdoll', 'Bengalska', 'Sijamska',
  'Perzijska', 'Sibirska', 'Norveška šumska', 'Ragamuffin', 'Devon rex',
  'Sphynx', 'Munchkin', 'Scottish fold', 'Abesinka',
];

const ALL_BREEDS = [...DOG_BREEDS, ...CAT_BREEDS].sort();

const CITIES = ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Dubrovnik', 'Varaždin', 'Karlovac', 'Šibenik'];

const FACILITY_FEATURES = [
  'Klimatizirani prostor', 'Ograđeno dvorište', 'Unutarnji prostor za igru',
  'Veterinarska stanica u blizini', '24/7 nadzor', 'Mogućnost video poziva',
  'Odvojeni prostori za mame i štence', 'Socijalizacijski program',
  'Dostava moguća', 'Međunarodna dostava', 'Osiguranje životinja',
];

const DEFAULT_HEALTH_TESTS: HealthTest[] = [
  { id: 'hd', name: 'HD (displazija kukova)', status: 'pending' },
  { id: 'ed', name: 'ED (displazija lakata)', status: 'pending' },
  { id: 'dna', name: 'DNA testiranje', status: 'pending' },
  { id: 'eyes', name: 'Očne bolesti', status: 'pending' },
  { id: 'heart', name: 'Srčane bolesti', status: 'pending' },
  { id: 'patella', name: 'Patella (koljeno)', status: 'pending' },
];

const defaultData: BreederOnboardingData = {
  step: 0,
  profile: {
    kennelName: '',
    bio: '',
    experienceYears: 0,
    breedingPhilosophy: '',
    website: '',
  },
  breeds: [],
  puppies: [],
  facility: {
    city: 'Zagreb',
    address: '',
    description: '',
    photos: [],
    facilities: [],
  },
  healthTests: DEFAULT_HEALTH_TESTS,
  certifications: {
    fciRegistered: false,
    fciNumber: '',
    clubMember: false,
    clubName: '',
  },
  completed: false,
  skipped: false,
};

const TOTAL_STEPS = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function BreederOnboardingWizard() {
  const router = useRouter();
  const [data, setData] = useState<BreederOnboardingData>(defaultData);
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

  const updateData = useCallback((updates: Partial<BreederOnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback((updates: Partial<BreederOnboardingData['profile']>) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  }, []);

  const updateFacility = useCallback((updates: Partial<BreederOnboardingData['facility']>) => {
    setData((prev) => ({ ...prev, facility: { ...prev.facility, ...updates } }));
  }, []);

  const updateCertifications = useCallback((updates: Partial<BreederOnboardingData['certifications']>) => {
    setData((prev) => ({ ...prev, certifications: { ...prev.certifications, ...updates } }));
  }, []);

  const goToStep = (step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      updateData({ step });
    }
  };

  const nextStep = () => goToStep(data.step + 1);
  const prevStep = () => goToStep(data.step - 1);

  const skipOnboarding = () => {
    updateData({ skipped: true });
    toast.info('Možeš nastaviti kasnije. Tvoj napredak je spremljen.');
    router.push('/dashboard/breeder');
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // Save breeder profile data to API
      const response = await fetch('/api/breeder-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kennel_name: data.profile.kennelName,
          bio: data.profile.bio,
          experience_years: data.profile.experienceYears,
          breeding_philosophy: data.profile.breedingPhilosophy,
          website: data.profile.website,
          breeds: data.breeds,
          puppies: data.puppies,
          facility_city: data.facility.city,
          facility_address: data.facility.address,
          facility_description: data.facility.description,
          facility_photos: data.facility.photos,
          facilities: data.facility.facilities,
          health_tests: data.healthTests,
          fci_registered: data.certifications.fciRegistered,
          fci_number: data.certifications.fciNumber,
          club_member: data.certifications.clubMember,
          club_name: data.certifications.clubName,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      updateData({ completed: true });
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Profil je spremljen! Dobrodošli u PetPark zajednicu uzgajivača.');
      router.push('/dashboard/breeder');
    } catch {
      toast.error('Došlo je do greške. Pokušaj ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((data.step + 1) / TOTAL_STEPS) * 100;

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Postani PetPark Uzgajivač</h1>
                  <p className="text-sm text-muted-foreground">Korak {data.step + 1} od {TOTAL_STEPS}</p>
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
                <BreedsStep
                  breeds={data.breeds}
                  onUpdate={(breeds) => updateData({ breeds })}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 3 && (
                <PuppiesStep
                  puppies={data.puppies}
                  onUpdate={(puppies) => updateData({ puppies })}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 4 && (
                <FacilityStep
                  facility={data.facility}
                  onUpdate={updateFacility}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 5 && (
                <HealthTestsStep
                  healthTests={data.healthTests}
                  onUpdate={(healthTests) => updateData({ healthTests })}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 6 && (
                <CertificationsStep
                  certifications={data.certifications}
                  onUpdate={updateCertifications}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 7 && (
                <HowItWorksStep
                  onFinish={finishOnboarding}
                  onBack={prevStep}
                  isLoading={isLoading}
                  data={data}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Components
// ─────────────────────────────────────────────────────────────────────────────

// Step 1: Welcome
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-8 md:p-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 mb-6">
            <Sparkles className="w-10 h-10 text-teal-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dobrodošli u PetPark zajednicu uzgajivača!
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Povežite se s budućim vlasnicima koji traže odgovornog uzgajivača. 
            Vaš profil će biti vidljiv tisućama obitelji koje traže savršenog ljubimca.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ValueCard
              icon={Heart}
              title="Povežite se s vlasnicima"
              description="Direktan kontakt s ozbiljnim kupcima koji traže zdrave ljubimce"
            />
            <ValueCard
              icon={Award}
              title="Izgradite reputaciju"
              description="Recenzije i ocjene pomažu vam izgraditi povjerenje"
            />
            <ValueCard
              icon={Shield}
              title="Verificirani profil"
              description="FCI registracija i zdravstveni testovi povećavaju vjerodostojnost"
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
  profile: BreederOnboardingData['profile'];
  onUpdate: (updates: Partial<BreederOnboardingData['profile']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = profile.kennelName.length >= 2 && profile.bio.length >= 50;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-500" />
          Predstavite svoju uzgajivačnicu
        </CardTitle>
        <CardDescription>
          Upišite osnovne podatke o sebi i svojoj uzgajivačnici. Ovo je prvo što vide potencijalni kupci.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="kennel-name">
            Naziv uzgajivačnice / kennela <span className="text-red-500">*</span>
          </Label>
          <Input
            id="kennel-name"
            value={profile.kennelName}
            onChange={(e) => onUpdate({ kennelName: e.target.value })}
            placeholder="npr. Zlatna Šapa Kennel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">
            O nama <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="npr. Obiteljska uzgajivačnica s 15 godina iskustva u uzgoju labradora. Svi naši psi su zdravstveno testirani i dolaze s kompletnom dokumentacijom..."
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {profile.bio.length}/1000 znakova (preporučeno: barem 50)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="philosophy">Filozofija uzgoja</Label>
          <Textarea
            id="philosophy"
            value={profile.breedingPhilosophy}
            onChange={(e) => onUpdate({ breedingPhilosophy: e.target.value })}
            placeholder="npr. Naglasak stavljamo na zdravlje, temperament i socijalizaciju štenca. Svaki štene odrasta u kući uz puno pažnje..."
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="experience">Godine iskustva</Label>
            <Input
              id="experience"
              type="number"
              min={0}
              max={100}
              value={profile.experienceYears}
              onChange={(e) => onUpdate({ experienceYears: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Web stranica (opcionalno)</Label>
            <Input
              id="website"
              type="url"
              value={profile.website}
              onChange={(e) => onUpdate({ website: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 3: Breeds
function BreedsStep({
  breeds,
  onUpdate,
  onNext,
  onBack,
}: {
  breeds: string[];
  onUpdate: (breeds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [customBreed, setCustomBreed] = useState('');

  const toggleBreed = (breed: string) => {
    if (breeds.includes(breed)) {
      onUpdate(breeds.filter((b) => b !== breed));
    } else {
      onUpdate([...breeds, breed]);
    }
  };

  const addCustomBreed = () => {
    if (customBreed.trim() && !breeds.includes(customBreed.trim())) {
      onUpdate([...breeds, customBreed.trim()]);
      setCustomBreed('');
    }
  };

  const removeBreed = (breed: string) => {
    onUpdate(breeds.filter((b) => b !== breed));
  };

  const canContinue = breeds.length > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dog className="w-5 h-5 text-teal-500" />
          Pasme s kojima radite
        </CardTitle>
        <CardDescription>
          Odaberite sve pasme koje uzgajate. Kupci će moći filtrirati prema ovome.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected breeds */}
        {breeds.length > 0 && (
          <div className="space-y-2">
            <Label>Odabrane pasme ({breeds.length})</Label>
            <div className="flex flex-wrap gap-2">
              {breeds.map((breed) => (
                <Badge key={breed} variant="secondary" className="bg-teal-100 text-teal-700 gap-1">
                  {breed}
                  <button onClick={() => removeBreed(breed)} className="ml-1 hover:text-teal-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Common breeds */}
        <div className="space-y-3">
          <Label>Popularne pasme</Label>
          <div className="flex flex-wrap gap-2">
            {DOG_BREEDS.slice(0, 12).map((breed) => (
              <button
                key={breed}
                onClick={() => toggleBreed(breed)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  breeds.includes(breed)
                    ? 'bg-teal-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {breeds.includes(breed) && <Check className="w-3 h-3 inline mr-1" />}
                {breed}
              </button>
            ))}
          </div>
        </div>

        {/* Cat breeds */}
        <div className="space-y-3">
          <Label>Popularne mačje rase</Label>
          <div className="flex flex-wrap gap-2">
            {CAT_BREEDS.slice(0, 8).map((breed) => (
              <button
                key={breed}
                onClick={() => toggleBreed(breed)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  breeds.includes(breed)
                    ? 'bg-teal-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {breeds.includes(breed) && <Check className="w-3 h-3 inline mr-1" />}
                {breed}
              </button>
            ))}
          </div>
        </div>

        {/* Custom breed */}
        <div className="space-y-2">
          <Label>Dodaj vlastitu pasminu</Label>
          <div className="flex gap-2">
            <Input
              value={customBreed}
              onChange={(e) => setCustomBreed(e.target.value)}
              placeholder="npr. Mješanac"
              onKeyDown={(e) => e.key === 'Enter' && addCustomBreed()}
            />
            <Button type="button" onClick={addCustomBreed} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 4: Puppies/Litters
function PuppiesStep({
  puppies,
  onUpdate,
  onNext,
  onBack,
}: {
  puppies: PuppyListing[];
  onUpdate: (puppies: PuppyListing[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [editingPuppy, setEditingPuppy] = useState<PuppyListing | null>(null);

  const addPuppy = () => {
    const newPuppy: PuppyListing = {
      id: Math.random().toString(36).substring(2, 9),
      breed: '',
      count: 1,
      ageWeeks: 0,
      priceFrom: 0,
      priceTo: 0,
      availableFrom: '',
      photos: [],
      description: '',
    };
    setEditingPuppy(newPuppy);
  };

  const savePuppy = () => {
    if (!editingPuppy) return;
    
    const existingIndex = puppies.findIndex((p) => p.id === editingPuppy.id);
    if (existingIndex >= 0) {
      const updated = [...puppies];
      updated[existingIndex] = editingPuppy;
      onUpdate(updated);
    } else {
      onUpdate([...puppies, editingPuppy]);
    }
    setEditingPuppy(null);
  };

  const removePuppy = (id: string) => {
    onUpdate(puppies.filter((p) => p.id !== id));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-500" />
          Dostupni štenci / legla
        </CardTitle>
        <CardDescription>
          Dodajte svoja trenutno dostupna legla. Kupci će vidjeti ove informacije i moći će vas kontaktirati.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Puppy list */}
        {puppies.length > 0 && (
          <div className="space-y-3">
            {puppies.map((puppy) => (
              <div key={puppy.id} className="rounded-xl border p-4 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{puppy.breed}</h4>
                    <p className="text-sm text-muted-foreground">
                      {puppy.count} {puppy.count === 1 ? 'štene' : 'štenca'} · 
                      {puppy.ageWeeks > 0 ? ` ${puppy.ageWeeks} tjedana` : ' uskoro'} · 
                      €{puppy.priceFrom}{puppy.priceTo > puppy.priceFrom && ` - €${puppy.priceTo}`}
                    </p>
                    {puppy.availableFrom && (
                      <p className="text-xs text-muted-foreground">
                        Dostupno od: {new Date(puppy.availableFrom).toLocaleDateString('hr-HR')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPuppy(puppy)}
                    >
                      Uredi
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePuppy(puppy.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new button */}
        {!editingPuppy && (
          <Button variant="outline" onClick={addPuppy} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Dodaj leglo
          </Button>
        )}

        {/* Edit form */}
        {editingPuppy && (
          <div className="rounded-xl border p-4 space-y-4 bg-muted/20">
            <h4 className="font-medium">
              {puppies.find((p) => p.id === editingPuppy.id) ? 'Uredi leglo' : 'Novo leglo'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pasmina</Label>
                <Input
                  value={editingPuppy.breed}
                  onChange={(e) => setEditingPuppy({ ...editingPuppy, breed: e.target.value })}
                  placeholder="npr. Labrador"
                />
              </div>
              <div className="space-y-2">
                <Label>Broj štenca</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingPuppy.count}
                  onChange={(e) => setEditingPuppy({ ...editingPuppy, count: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starost (tjedana)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingPuppy.ageWeeks}
                  onChange={(e) => setEditingPuppy({ ...editingPuppy, ageWeeks: parseInt(e.target.value) || 0 })}
                  placeholder="0 = tek rođeni"
                />
              </div>
              <div className="space-y-2">
                <Label>Dostupno od</Label>
                <Input
                  type="date"
                  value={editingPuppy.availableFrom}
                  onChange={(e) => setEditingPuppy({ ...editingPuppy, availableFrom: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cijena od (€)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingPuppy.priceFrom}
                  onChange={(e) => setEditingPuppy({ ...editingPuppy, priceFrom: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cijena do (€)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingPuppy.priceTo}
                  onChange={(e) => setEditingPuppy({ ...editingPuppy, priceTo: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea
                value={editingPuppy.description}
                onChange={(e) => setEditingPuppy({ ...editingPuppy, description: e.target.value })}
                placeholder="Boja, roditelji, karakteristike..."
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingPuppy(null)} className="flex-1">
                Odustani
              </Button>
              <Button onClick={savePuppy} className="flex-1">
                Spremi
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Nemate trenutno dostupnih legla?</h4>
              <p className="text-sm text-blue-800 mt-1">
                Nema problema! Možete preskočiti ovaj korak i dodati legla kasnije iz nadzorne ploče.
              </p>
            </div>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 5: Facility
function FacilityStep({
  facility,
  onUpdate,
  onNext,
  onBack,
}: {
  facility: BreederOnboardingData['facility'];
  onUpdate: (updates: Partial<BreederOnboardingData['facility']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleFacility = (feature: string) => {
    if (facility.facilities.includes(feature)) {
      onUpdate({ facilities: facility.facilities.filter((f) => f !== feature) });
    } else {
      onUpdate({ facilities: [...facility.facilities, feature] });
    }
  };

  const canContinue = Boolean(facility.city && facility.address.length >= 5);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-teal-500" />
          Informacije o uzgajivačnici
        </CardTitle>
        <CardDescription>
          Opšite svoj objekt i lokaciju. Fotografije objekta povećavaju povjerenje kupaca.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Grad</Label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => onUpdate({ city })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  facility.city === city
                    ? 'bg-teal-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {facility.city === city && <Check className="w-3 h-3 inline mr-1" />}
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresa</Label>
          <Input
            id="address"
            value={facility.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder="Ulica i broj"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facility-desc">Opis objekta</Label>
          <Textarea
            id="facility-desc"
            value={facility.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="npr. Naš objekt se prostire na 500m² s ograđenim dvorištem, klimatiziranim unutarnjim prostorom..."
            className="min-h-[100px] resize-none"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Sadržaji i pogodnosti</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FACILITY_FEATURES.map((feature) => (
              <button
                key={feature}
                onClick={() => toggleFacility(feature)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                  facility.facilities.includes(feature)
                    ? 'border-teal-300 bg-teal-50/50'
                    : 'border-border hover:border-teal-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    facility.facilities.includes(feature)
                      ? 'bg-teal-500 text-white'
                      : 'bg-muted'
                  }`}
                >
                  {facility.facilities.includes(feature) && <Check className="w-3 h-3" />}
                </div>
                <span className="text-sm">{feature}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Fotografije objekta</Label>
          <ImageUpload
            variant="dropzone"
            bucket="generic"
            entityId="breeder-facility"
            maxFiles={5}
            onUploadComplete={(urls) => onUpdate({ photos: urls })}
          />
          {facility.photos.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {facility.photos.length} fotografija spremljeno
            </p>
          )}
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 6: Health Tests
function HealthTestsStep({
  healthTests,
  onUpdate,
  onNext,
  onBack,
}: {
  healthTests: HealthTest[];
  onUpdate: (tests: HealthTest[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const updateTest = (id: string, updates: Partial<HealthTest>) => {
    onUpdate(healthTests.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-500" />
          Zdravstvena testiranja
        </CardTitle>
        <CardDescription>
          Navedite koja zdravstvena testiranja provodite na svojim psima. Ovo je ključno za povjerenje kupaca.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {healthTests.map((test) => (
            <div key={test.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                </div>
                <div className="flex gap-1">
                  {(['done', 'pending', 'not_applicable'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateTest(test.id, { status })}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        test.status === status
                          ? status === 'done'
                            ? 'bg-green-100 text-green-700'
                            : status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {status === 'done' && 'Radim'}
                      {status === 'pending' && 'U planu'}
                      {status === 'not_applicable' && 'N/D'}
                    </button>
                  ))}
                </div>
              </div>
              
              {test.status === 'done' && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Datum zadnjeg testa</Label>
                      <Input
                        type="date"
                        value={test.date || ''}
                        onChange={(e) => updateTest(test.id, { date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-emerald-900">Zašto su testiranja važna?</h4>
              <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                <li>• Povećavaju povjerenje kupaca</li>
                <li>• Dokazuju odgovornost uzgajivača</li>
                <li>• Smanjuju rizik od nasljednih bolesti</li>
                <li>• Verificirani uzgajivači dobivaju više upita</li>
              </ul>
            </div>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 7: Certifications
function CertificationsStep({
  certifications,
  onUpdate,
  onNext,
  onBack,
}: {
  certifications: BreederOnboardingData['certifications'];
  onUpdate: (updates: Partial<BreederOnboardingData['certifications']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-500" />
          Certifikacije i registracije
        </CardTitle>
        <CardDescription>
          Navedite svoje članstva i registracije. FCI registracija je veliki plus za kupce.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* FCI Registration */}
        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">FCI registracija</h4>
                <p className="text-sm text-muted-foreground">Međunarodna kinološka federacija</p>
              </div>
            </div>
            <button
              onClick={() => onUpdate({ fciRegistered: !certifications.fciRegistered })}
              className={`w-12 h-6 rounded-full transition-colors ${
                certifications.fciRegistered ? 'bg-teal-500' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  certifications.fciRegistered ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          
          {certifications.fciRegistered && (
            <div className="pt-2 border-t">
              <Label className="text-sm">FCI broj registracije</Label>
              <Input
                value={certifications.fciNumber}
                onChange={(e) => onUpdate({ fciNumber: e.target.value })}
                placeholder="npr. HR12345"
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* Club Membership */}
        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Članstvo u klubu</h4>
                <p className="text-sm text-muted-foreground">HKS, HKL ili drugi kinološki klub</p>
              </div>
            </div>
            <button
              onClick={() => onUpdate({ clubMember: !certifications.clubMember })}
              className={`w-12 h-6 rounded-full transition-colors ${
                certifications.clubMember ? 'bg-teal-500' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  certifications.clubMember ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          
          {certifications.clubMember && (
            <div className="pt-2 border-t">
              <Label className="text-sm">Naziv kluba</Label>
              <Input
                value={certifications.clubName}
                onChange={(e) => onUpdate({ clubName: e.target.value })}
                placeholder="npr. Hrvatski kinološki savez"
                className="mt-1"
              />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Verifikacija</h4>
              <p className="text-sm text-amber-800 mt-1">
                Nakon završetka onboardinga, naš tim će pregledati vaše podatke. 
                Verificirani uzgajivači dobivaju posebnu značku i više vidljivosti.
              </p>
            </div>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 8: How It Works & Review
function HowItWorksStep({
  onFinish,
  onBack,
  isLoading,
  data,
}: {
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
  data: BreederOnboardingData;
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Check className="w-5 h-5 text-teal-500" />
          Pregled i kako funkcionira
        </CardTitle>
        <CardDescription>
          Pregledajte svoje podatke i saznajte kako će kupci kontaktirati vas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Summary */}
        <div className="space-y-4">
          <ReviewSection title="Uzgajivačnica">
            <p className="font-medium">{data.profile.kennelName}</p>
            <p className="text-sm text-muted-foreground">{data.profile.experienceYears} godina iskustva</p>
          </ReviewSection>

          <ReviewSection title="Pasme">
            <div className="flex flex-wrap gap-1">
              {data.breeds.map((breed) => (
                <Badge key={breed} variant="secondary" className="text-xs">
                  {breed}
                </Badge>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="Lokacija">
            <p className="text-sm">{data.facility.city} — {data.facility.address}</p>
          </ReviewSection>

          {data.puppies.length > 0 && (
            <ReviewSection title="Aktivna legla">
              <p className="text-sm">{data.puppies.length} dostupnih legla</p>
            </ReviewSection>
          )}

          <ReviewSection title="Certifikacije">
            <div className="flex flex-wrap gap-2">
              {data.certifications.fciRegistered && (
                <Badge className="bg-blue-100 text-blue-700">FCI Registrirani</Badge>
              )}
              {data.certifications.clubMember && (
                <Badge className="bg-purple-100 text-purple-700">Član kluba</Badge>
              )}
            </div>
          </ReviewSection>
        </div>

        <Separator />

        {/* How It Works */}
        <div className="space-y-4">
          <h4 className="font-medium">Kako funkcioniraju upiti?</h4>
          
          <div className="space-y-3">
            <HowItWorksItem
              step={1}
              icon={Check}
              title="Kupac pregledava vaš profil"
              description="Potencijalni kupci vide vaše legla, pasme i certifikacije."
            />
            <HowItWorksItem
              step={2}
              icon={Calendar}
              title="Šalju upit putem forme"
              description="Kupci popunjavaju formu s detaljima o interesu. Vi dobivate email obavijest."
            />
            <HowItWorksItem
              step={3}
              icon={CreditCard}
              title="Komunicirate direktno"
              description="Odgovorite na upit i dogovorite sastanak ili video poziv."
            />
            <HowItWorksItem
              step={4}
              icon={Heart}
              title="Recenzija nakon uspješne prodaje"
              description="Kupci mogu ostaviti recenziju koja pomaže izgraditi vašu reputaciju."
            />
          </div>
        </div>

        <div className="rounded-xl bg-teal-50 border border-teal-200 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-teal-900">Važne napomene</h4>
              <ul className="mt-2 space-y-1 text-sm text-teal-800">
                <li>• Platforma ne naplaćuje proviziju na prodaju štenca</li>
                <li>• Uvijek se sastanite s kupcem prije prodaje</li>
                <li>• Osigurajte kompletnu dokumentaciju (rodovnica, cjepna knjižica)</li>
                <li>• Pratite zakonske propise o zaštiti životinja</li>
              </ul>
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
                Završi i objavi profil
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

function ValueCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-muted/50 p-4 text-center">
      <Icon className="w-8 h-8 mx-auto mb-2 text-teal-500" />
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

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3">
      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</h5>
      {children}
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
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
        {step}
      </div>
      <div className="flex-1 pb-3 border-b last:border-0 last:pb-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-teal-500" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
