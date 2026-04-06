'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
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
  SkipForward,
  Building2,
  TreePine,
  Award,
  BookOpen,
  Plus,
  X,
  Pencil,
  Save,
  Loader2,
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
import { TRAINING_TYPE_LABELS, type TrainingType } from '@/lib/types';

const TRAINING_TYPES: { type: TrainingType; label: string; description: string }[] = [
  { type: 'osnovna', label: 'Osnovna poslušnost', description: 'Naredbe sjedni, lezi, dođi, stani — temelji dobrog ponašanja' },
  { type: 'napredna', label: 'Napredna poslušnost', description: 'Off-leash kontrola, pouzdan poziv, rješavanje distrakcija' },
  { type: 'stenci', label: 'Trening za štence', description: 'Socijalizacija, učenje kroz igru, temelji za budućnost' },
  { type: 'ponasanje', label: 'Korekcija ponašanja', description: 'Agresivnost, strah, lajanje, uništavanje stvari' },
  { type: 'agility', label: 'Agility', description: 'Trake, tuneli, skokovi — sportska zabava za pse' },
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

const CITIES = ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Pula'];

interface TrainingProgramForm {
  id?: string;
  name: string;
  type: TrainingType;
  duration_weeks: number;
  sessions: number;
  price: number;
  description: string;
}

interface TrainerOnboardingData {
  step: number;
  profile: {
    bio: string;
    experienceYears: number;
    certifications: string[];
    trainingMethods: string;
  };
  specializations: TrainingType[];
  programs: TrainingProgramForm[];
  serviceAreas: {
    city: string;
    neighborhoods: string[];
  };
  trainingLocations: {
    ownerHome: boolean;
    trainerFacility: boolean;
    outdoor: boolean;
  };
  completed: boolean;
  skipped: boolean;
}

const STORAGE_KEY = 'trainer-onboarding-progress-v1';

const defaultData: TrainerOnboardingData = {
  step: 0,
  profile: {
    bio: '',
    experienceYears: 0,
    certifications: [],
    trainingMethods: '',
  },
  specializations: [],
  programs: [],
  serviceAreas: {
    city: 'Zagreb',
    neighborhoods: [],
  },
  trainingLocations: {
    ownerHome: true,
    trainerFacility: false,
    outdoor: false,
  },
  completed: false,
  skipped: false,
};

export function TrainerOnboardingWizard() {
  const router = useRouter();
  const [data, setData] = useState<TrainerOnboardingData>(defaultData);
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

  const updateData = useCallback((updates: Partial<TrainerOnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback((updates: Partial<TrainerOnboardingData['profile']>) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  }, []);

  const updateServiceAreas = useCallback((updates: Partial<TrainerOnboardingData['serviceAreas']>) => {
    setData((prev) => ({ ...prev, serviceAreas: { ...prev.serviceAreas, ...updates } }));
  }, []);

  const updateTrainingLocations = useCallback((updates: Partial<TrainerOnboardingData['trainingLocations']>) => {
    setData((prev) => ({ ...prev, trainingLocations: { ...prev.trainingLocations, ...updates } }));
  }, []);

  const goToStep = (step: number) => {
    if (step >= 0 && step <= 8) {
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
      // Save trainer profile data to API
      const response = await fetch('/api/trainer-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: data.profile.bio,
          experience_years: data.profile.experienceYears,
          certifications: data.profile.certifications,
          training_methods: data.profile.trainingMethods,
          specializations: data.specializations,
          neighborhoods: data.serviceAreas.neighborhoods,
          city: data.serviceAreas.city,
          training_locations: data.trainingLocations,
          programs: data.programs,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      updateData({ completed: true });
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Profil trenera spremljen! Dobrodošao/la u PetPark zajednicu.');
      router.refresh();
    } catch {
      toast.error('Došlo je do greške. Pokušaj ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((data.step + 1) / 9) * 100;

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Postani PetPark Trener</h1>
                  <p className="text-sm text-muted-foreground">Korak {data.step + 1} od 9</p>
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
                <SpecializationsStep
                  specializations={data.specializations}
                  onUpdate={(specializations) => updateData({ specializations })}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 3 && (
                <ProgramsStep
                  programs={data.programs}
                  onUpdate={(programs) => updateData({ programs })}
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
                <TrainingLocationsStep
                  trainingLocations={data.trainingLocations}
                  onUpdate={updateTrainingLocations}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {data.step === 6 && <VerificationStep onNext={nextStep} onBack={prevStep} />}
              {data.step === 7 && <HowItWorksStep onNext={nextStep} onBack={prevStep} />}
              {data.step === 8 && (
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
            <Sparkles className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dobrodošao/la u PetPark zajednicu trenera!
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Postani trener i pomozi vlasnicima izgraditi bolju vezu s njihovim psima. 
            Tvoj profil će biti vidljiv vlasnicima koji traže stručnu pomoć u treniranju.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ValueCard
              icon={GraduationCap}
              title="Podijeli svoje znanje"
              description="Pomozi psima i vlasnicima postati najbolja verzija sebe"
            />
            <ValueCard
              icon={Calendar}
              title="Fleksibilan raspored"
              description='Odaberi kada i gdje želiš raditi — potpuna sloboda'
            />
            <ValueCard
              icon={CreditCard}
              title="Sigurna zarada"
              description="Isplate direktno na račun, transparentna cijena po satu"
            />
          </div>

          <Button size="lg" onClick={onNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
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
  profile: TrainerOnboardingData['profile'];
  onUpdate: (updates: Partial<TrainerOnboardingData['profile']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [newCert, setNewCert] = useState('');
  const canContinue = profile.bio.length >= 50 && profile.experienceYears >= 0;

  const addCertification = () => {
    const cert = newCert.trim();
    if (cert && !profile.certifications.includes(cert)) {
      onUpdate({ certifications: [...profile.certifications, cert] });
      setNewCert('');
    }
  };

  const removeCertification = (cert: string) => {
    onUpdate({ certifications: profile.certifications.filter((c) => c !== cert) });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          Predstavi se
        </CardTitle>
        <CardDescription>
          Napiši nešto o sebi, svom iskustvu i metodama treniranja. Ovo vlasnici prvo pročitaju.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">O meni</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="npr. Ja sam certificirani trener pasa s 8 godina iskustva. Specijaliziram se za ponašanje štencadi i korekciju agresivnosti. Moja metoda se temelji na pozitivnom jačanju..."
            className="min-h-[150px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {profile.bio.length}/1000 znakova (preporučeno: barem 50)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Godine iskustva u treniranju pasa</Label>
          <Input
            id="experience"
            type="number"
            min={0}
            max={50}
            value={profile.experienceYears}
            onChange={(e) => onUpdate({ experienceYears: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Ako tek počinješ, stavi 0 — bitno je da imaš strast i želju za učenjem
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="methods">Metode treniranja</Label>
          <Textarea
            id="methods"
            value={profile.trainingMethods}
            onChange={(e) => onUpdate({ trainingMethods: e.target.value })}
            placeholder="npr. Pozitivno jačanje, clicker trening, balansirana metoda..."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Kratki opis tvog pristupa treniranju
          </p>
        </div>

        <div className="space-y-3">
          <Label>Certifikati i edukacije</Label>
          {profile.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert) => (
                <Badge key={cert} variant="secondary" className="pr-1 flex items-center gap-1">
                  <Award className="h-3 w-3 mr-1" />
                  {cert}
                  <button
                    onClick={() => removeCertification(cert)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              placeholder="npr. CPDT-KA, KPA CTP, IMDT..."
              className="focus:border-blue-300"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCertification}
              disabled={!newCert.trim()}
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 3: Specializations
function SpecializationsStep({
  specializations,
  onUpdate,
  onNext,
  onBack,
}: {
  specializations: TrainingType[];
  onUpdate: (specializations: TrainingType[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleSpecialization = (type: TrainingType) => {
    const newSpecializations = specializations.includes(type)
      ? specializations.filter((s) => s !== type)
      : [...specializations, type];
    onUpdate(newSpecializations);
  };

  const canContinue = specializations.length > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" />
          Specijalizacije
        </CardTitle>
        <CardDescription>
          U kojim područjima treniranja si stručan? Odaberi sve što odgovara.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {TRAINING_TYPES.map((training) => {
            const isSelected = specializations.includes(training.type);
            
            return (
              <button
                key={training.type}
                onClick={() => toggleSpecialization(training.type)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-border hover:border-blue-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : <Dog className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{training.label}</h3>
                      {isSelected && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Odabrano
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{training.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 4: Training Programs
function ProgramsStep({
  programs,
  onUpdate,
  onNext,
  onBack,
}: {
  programs: TrainingProgramForm[];
  onUpdate: (programs: TrainingProgramForm[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<TrainingProgramForm>({
    name: '',
    type: 'osnovna',
    duration_weeks: 4,
    sessions: 8,
    price: 0,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleOpenNew = () => {
    setForm({
      name: '',
      type: 'osnovna',
      duration_weeks: 4,
      sessions: 8,
      price: 0,
      description: '',
    });
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEdit = (index: number) => {
    setForm({ ...programs[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (form.name.trim().length < 2) {
      toast.error('Naziv programa mora imati najmanje 2 znaka');
      return;
    }
    if (form.description.trim().length < 5) {
      toast.error('Opis mora imati najmanje 5 znakova');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      if (editingIndex !== null) {
        const updated = [...programs];
        updated[editingIndex] = { ...form, id: programs[editingIndex].id || crypto.randomUUID() };
        onUpdate(updated);
        toast.success('Program ažuriran!');
      } else {
        onUpdate([...programs, { ...form, id: crypto.randomUUID() }]);
        toast.success('Program dodan!');
      }
      setSaving(false);
      setShowForm(false);
      setEditingIndex(null);
    }, 300);
  };

  const handleDelete = (index: number) => {
    const updated = programs.filter((_, i) => i !== index);
    onUpdate(updated);
    toast.success('Program obrisan');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Programi treniranja
        </CardTitle>
        <CardDescription>
          Dodaj programe koje nudiš s detaljima o trajanju, broju sesija i cijeni.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program form */}
        {showForm && (
          <div className="border rounded-xl p-4 space-y-4 bg-blue-50/50">
            <p className="font-medium text-sm">
              {editingIndex !== null ? 'Uredi program' : 'Novi program'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Naziv programa *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="npr. Osnovna poslušnost za štence"
                />
              </div>
              <div className="space-y-2">
                <Label>Vrsta treninga *</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TrainingType })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {TRAINING_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Trajanje (tjedana) *</Label>
                <Input
                  type="number"
                  min={1}
                  max={52}
                  value={form.duration_weeks}
                  onChange={(e) => setForm({ ...form, duration_weeks: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Broj sesija *</Label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={form.sessions}
                  onChange={(e) => setForm({ ...form, sessions: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cijena (&euro;) *</Label>
                <Input
                  type="number"
                  min={0}
                  max={100000}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opis programa *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Opišite što program uključuje, za koga je namijenjen..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                Odustani
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Spremanje...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    {editingIndex !== null ? 'Spremi promjene' : 'Dodaj program'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Add new button */}
        {!showForm && (
          <Button
            variant="outline"
            onClick={handleOpenNew}
            className="w-full border-dashed border-2 hover:border-blue-300 hover:bg-blue-50/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj novi program
          </Button>
        )}

        {/* Programs list */}
        {programs.length > 0 && (
          <div className="space-y-3">
            {programs.map((program, index) => (
              <div
                key={program.id || index}
                className="border rounded-xl p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{program.name}</h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {TRAINING_TYPE_LABELS[program.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {program.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{program.duration_weeks} tj.</span>
                      <span>{program.sessions} sesija</span>
                      <span className="font-medium text-blue-600">{program.price} &euro;</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
                      onClick={() => handleEdit(index)}
                      disabled={showForm}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => handleDelete(index)}
                      disabled={showForm}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
  serviceAreas: TrainerOnboardingData['serviceAreas'];
  onUpdate: (updates: Partial<TrainerOnboardingData['serviceAreas']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const neighborhoods =
    serviceAreas.city === 'Zagreb'
      ? ZAGREB_NEIGHBORHOODS
      : serviceAreas.city === 'Split'
      ? SPLIT_NEIGHBORHOODS
      : serviceAreas.city === 'Rijeka'
      ? RIJEKA_NEIGHBORHOODS
      : [];

  const toggleNeighborhood = (neighborhood: string) => {
    const newNeighborhoods = serviceAreas.neighborhoods.includes(neighborhood)
      ? serviceAreas.neighborhoods.filter((n) => n !== neighborhood)
      : [...serviceAreas.neighborhoods, neighborhood];
    onUpdate({ neighborhoods: newNeighborhoods });
  };

  const canContinue = serviceAreas.neighborhoods.length > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Područje djelovanja
        </CardTitle>
        <CardDescription>
          U kojem gradu i kvartovima radiš? Vlasnici traženu trenere u blizini.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Grad</Label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <Button
                key={city}
                type="button"
                variant={serviceAreas.city === city ? 'default' : 'outline'}
                onClick={() => onUpdate({ city, neighborhoods: [] })}
                className={serviceAreas.city === city ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
            Odaberi sve kvartove gdje možeš pružati usluge treniranja
          </p>
          {neighborhoods.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {neighborhoods.map((neighborhood) => {
                const isSelected = serviceAreas.neighborhoods.includes(neighborhood);
                return (
                  <button
                    key={neighborhood}
                    onClick={() => toggleNeighborhood(neighborhood)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {neighborhood}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Za ovaj grad unesi kvartove ručno (npr. &quot;Centar&quot;, &quot;Stari grad&quot;):
            </p>
          )}
          {serviceAreas.neighborhoods.length === 0 && (
            <p className="text-sm text-amber-600">Odaberi barem jedan kvart</p>
          )}
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={canContinue} />
      </CardContent>
    </Card>
  );
}

// Step 6: Training Locations
function TrainingLocationsStep({
  trainingLocations,
  onUpdate,
  onNext,
  onBack,
}: {
  trainingLocations: TrainerOnboardingData['trainingLocations'];
  onUpdate: (updates: Partial<TrainerOnboardingData['trainingLocations']>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const locations = [
    {
      key: 'ownerHome' as const,
      icon: Home,
      title: 'Kod vlasnika',
      description: 'Dolaziš u dom vlasnika i radiš s psom u njegovom okruženju',
    },
    {
      key: 'trainerFacility' as const,
      icon: Building2,
      title: 'U vlastitom prostoru',
      description: 'Vlasnik dolazi k tebi u tvoj trening centar ili dvorište',
    },
    {
      key: 'outdoor' as const,
      icon: TreePine,
      title: 'Na otvorenom',
      description: 'Parkovi, šetnice, plaže — treniranje u stvarnom svijetu',
    },
  ];

  const toggleLocation = (key: keyof TrainerOnboardingData['trainingLocations']) => {
    onUpdate({ [key]: !trainingLocations[key] });
  };

  const canContinue = trainingLocations.ownerHome || trainingLocations.trainerFacility || trainingLocations.outdoor;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Lokacije treniranja
        </CardTitle>
        <CardDescription>
          Gdje možeš održavati treninge? Odaberi sve što odgovara.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {locations.map((location) => {
            const isSelected = trainingLocations[location.key];
            const Icon = location.icon;
            
            return (
              <button
                key={location.key}
                onClick={() => toggleLocation(location.key)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-border hover:border-blue-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{location.title}</h3>
                      {isSelected && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Odabrano
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{location.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!canContinue && (
          <p className="text-sm text-amber-600">Odaberi barem jednu lokaciju</p>
        )}

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
          <Shield className="w-5 h-5 text-blue-500" />
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
            title="Verifikacija certifikata"
            description="Upload certifikata ili diplome za dodatno povjerenje."
            status="recommended"
          />
          <VerificationItem
            icon={Shield}
            title="Pozadinska provjera"
            description="Dobrovoljna provjera za dodatnu sigurnost vlasnika."
            status="optional"
          />
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Zašto verifikacija?</h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• Verificirani treneri dobivaju <strong>do 3x više rezervacija</strong></li>
                <li>• Vlasnici se osjećaju sigurnije</li>
                <li>• Tvoj profil dobiva &quot;Certificirani trener&quot; značku</li>
              </ul>
            </div>
          </div>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 8: How It Works
function HowItWorksStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
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
            description="Vlasnik ti šalje upit s detaljima o psu i željenom terminu."
          />
          <HowItWorksItem
            step={2}
            icon={Clock}
            title="Ti potvrđuješ dostupnost"
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
            icon={GraduationCap}
            title="Održavaš trening"
            description="Radiš s psom i vlasnikom, pratiš napredak."
          />
          <HowItWorksItem
            step={5}
            icon={Star}
            title="Isplata i recenzija"
            description="Nakon uspješnog treninga, dobivaš isplatu i recenziju."
          />
        </div>

        <div className="rounded-xl bg-muted p-4">
          <h4 className="font-medium mb-2">Što trebaš znati:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Platforma zadržava 15% provizije</li>
            <li>• Isplate se vrše tjedan dana nakon završetka treninga</li>
            <li>• Otkazivanje u zadnji tren utječe na tvoju ocjenu</li>
            <li>• Komunikacija mora ostati na platformi (zaštita)</li>
          </ul>
        </div>

        <StepNavigation onNext={onNext} onBack={onBack} canContinue={true} />
      </CardContent>
    </Card>
  );
}

// Step 9: Review
function ReviewStep({
  data,
  onFinish,
  onBack,
  isLoading,
}: {
  data: TrainerOnboardingData;
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
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
            {data.profile.trainingMethods && (
              <p className="text-sm text-muted-foreground">
                Metode: {data.profile.trainingMethods}
              </p>
            )}
          </ReviewSection>

          <ReviewSection title="Specijalizacije">
            {data.specializations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {TRAINING_TYPE_LABELS[spec]}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nema odabranih specijalizacija</p>
            )}
          </ReviewSection>

          <ReviewSection title="Programi">
            {data.programs.length > 0 ? (
              <div className="space-y-2">
                {data.programs.map((program) => (
                  <div key={program.id} className="text-sm">
                    <span className="font-medium">{program.name}</span>
                    <span className="text-muted-foreground"> — {program.price}€</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nema dodanih programa</p>
            )}
          </ReviewSection>

          <ReviewSection title="Područje">
            <p className="text-sm">
              {data.serviceAreas.city} — {data.serviceAreas.neighborhoods.join(', ')}
            </p>
          </ReviewSection>

          <ReviewSection title="Lokacije treniranja">
            <div className="flex flex-wrap gap-2">
              {data.trainingLocations.ownerHome && (
                <Badge variant="secondary">Kod vlasnika</Badge>
              )}
              {data.trainingLocations.trainerFacility && (
                <Badge variant="secondary">U vlastitom prostoru</Badge>
              )}
              {data.trainingLocations.outdoor && (
                <Badge variant="secondary">Na otvorenom</Badge>
              )}
            </div>
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
          <Button onClick={onFinish} disabled={isLoading} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <>Spremam...</>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Aktiviraj profil trenera
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
      <Icon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
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
      <Button onClick={onNext} disabled={!canContinue} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
        {step}
      </div>
      <div className="flex-1 pb-4 border-b last:border-0 last:pb-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-blue-500" />
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
