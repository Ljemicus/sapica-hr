'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  Building2, 
  FileText, 
  Megaphone,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const WIZARD_STORAGE_KEY = 'rescue-onboarding-progress';
const WIZARD_COMPLETED_KEY = 'rescue-onboarding-completed';
const WIZARD_SKIPPED_KEY = 'rescue-onboarding-skipped';

export type WizardStep = 'welcome' | 'organization' | 'documents' | 'appeal';

interface WizardProgress {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  stepData: Record<string, unknown>;
}

interface RescueOnboardingWizardProps {
  organizationId?: string;
  hasDocuments: boolean;
  hasAppeals: boolean;
  onComplete?: () => void;
}

const steps: { id: WizardStep; label: string; icon: typeof Building2 }[] = [
  { id: 'welcome', label: 'Dobrodošli', icon: Sparkles },
  { id: 'organization', label: 'Organizacija', icon: Building2 },
  { id: 'documents', label: 'Dokumenti', icon: FileText },
  { id: 'appeal', label: 'Prva apelacija', icon: Megaphone },
];

export function RescueOnboardingWizard({ 
  organizationId, 
  hasDocuments, 
  hasAppeals,
  onComplete 
}: RescueOnboardingWizardProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [_isLoading, _setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    const skipWizard = () => {
      setIsVisible(false);
    };

    // Check if wizard was skipped or completed
    const isSkipped = localStorage.getItem(WIZARD_SKIPPED_KEY);
    const isCompleted = localStorage.getItem(WIZARD_COMPLETED_KEY);
    
    if (isSkipped || isCompleted) {
      skipWizard();
      return;
    }

    // Check if user has already set up everything
    if (organizationId && hasDocuments && hasAppeals) {
      localStorage.setItem(WIZARD_COMPLETED_KEY, 'true');
      skipWizard();
      return;
    }

    // Load saved progress
    const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (saved) {
      try {
        const progress: WizardProgress = JSON.parse(saved);
        // Use timeout to avoid synchronous setState during render
        setTimeout(() => {
          setCurrentStep(progress.currentStep);
          setCompletedSteps(progress.completedSteps);
        }, 0);
      } catch {
        // Invalid saved data, start fresh
      }
    }

    // Determine starting step based on current state
    setTimeout(() => {
      if (organizationId && hasDocuments && !hasAppeals) {
        setCurrentStep('appeal');
      } else if (organizationId && !hasDocuments) {
        setCurrentStep('documents');
      } else if (organizationId) {
        setCurrentStep('organization');
      }
      setIsVisible(true);
    }, 0);
  }, [organizationId, hasDocuments, hasAppeals]);

  // Save progress to localStorage
  const saveProgress = useCallback((step: WizardStep, completed: WizardStep[]) => {
    const progress: WizardProgress = {
      currentStep: step,
      completedSteps: completed,
      stepData: {},
    };
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(progress));
  }, []);

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const newCompleted = [...completedSteps];
      if (!newCompleted.includes(currentStep)) {
        newCompleted.push(currentStep);
      }
      const nextStep = steps[currentIndex + 1].id;
      setCompletedSteps(newCompleted);
      setCurrentStep(nextStep);
      saveProgress(nextStep, newCompleted);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].id;
      setCurrentStep(prevStep);
      saveProgress(prevStep, completedSteps);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(WIZARD_SKIPPED_KEY, 'true');
    setIsVisible(false);
    toast.info('Možete nastaviti s postavkama kasnije. Čarobnjak će biti dostupan na dashboardu.');
  };

  const handleComplete = () => {
    const newCompleted = [...completedSteps, currentStep];
    setCompletedSteps(newCompleted);
    localStorage.setItem(WIZARD_COMPLETED_KEY, 'true');
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    setIsVisible(false);
    onComplete?.();
    toast.success('Čestitamo! Vaša organizacija je spremna za akciju.');
  };

  const handleStepClick = (stepId: WizardStep) => {
    // Only allow clicking on completed steps or the current step
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex <= currentIndex || completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
      saveProgress(stepId, completedSteps);
    }
  };

  const handleCreateOrganization = () => {
    // Scroll to organization form
    const orgForm = document.getElementById('organization-form');
    if (orgForm) {
      orgForm.scrollIntoView({ behavior: 'smooth' });
      toast.info('Ispunite podatke o organizaciji i kliknite "Spremi organizaciju"');
    }
    handleNext();
  };

  const handleUploadDocuments = () => {
    // Scroll to documents section
    const docsSection = document.getElementById('verification-documents');
    if (docsSection) {
      docsSection.scrollIntoView({ behavior: 'smooth' });
      toast.info('Uploadajte potrebne dokumente za verifikaciju');
    }
    handleNext();
  };

  const handleCreateAppeal = () => {
    router.push('/dashboard/rescue/apelacije/novo');
    handleComplete();
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsMinimized(false)}
          className="shadow-lg gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Nastavi uvodni vodič
        </Button>
      </div>
    );
  }

  const currentStepData = steps.find(s => s.id === currentStep);
  const StepIcon = currentStepData?.icon || Sparkles;
  const isLastStep = currentStep === 'appeal';
  const isFirstStep = currentStep === 'welcome';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-warm-orange to-warm-teal">
              <StepIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Rescue vodič</h2>
              <p className="text-sm text-muted-foreground">
                Korak {steps.findIndex(s => s.id === currentStep) + 1} od {steps.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMinimized(true)}
            >
              Smanji
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, _index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = step.id === currentStep;
              const StepIconInner = step.icon;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`group flex flex-col items-center gap-2 transition-colors ${
                    isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={!isCompleted && step.id !== currentStep}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted 
                      ? 'border-warm-teal bg-warm-teal text-white' 
                      : isCurrent 
                        ? 'border-warm-orange bg-warm-orange/10 text-warm-orange'
                        : 'border-border bg-card text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIconInner className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    isCurrent ? 'text-warm-orange' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Progress line */}
          <div className="relative mt-2 h-1 w-full rounded-full bg-muted">
            <div 
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-warm-orange to-warm-teal transition-all"
              style={{ 
                width: `${((steps.findIndex(s => s.id === currentStep) + (completedSteps.includes(currentStep) ? 1 : 0)) / (steps.length - 1)) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6">
          {currentStep === 'welcome' && (
            <WelcomeStep 
              onNext={handleNext}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 'organization' && (
            <OrganizationStep 
              onNext={handleCreateOrganization}
              onPrevious={handlePrevious}
              organizationId={organizationId}
            />
          )}
          {currentStep === 'documents' && (
            <DocumentsStep 
              onNext={handleUploadDocuments}
              onPrevious={handlePrevious}
              hasDocuments={hasDocuments}
            />
          )}
          {currentStep === 'appeal' && (
            <AppealStep 
              onComplete={handleCreateAppeal}
              onPrevious={handlePrevious}
              hasAppeals={hasAppeals}
            />
          )}
        </CardContent>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Natrag
          </Button>
          
          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button onClick={handleNext}>
                Dalje
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-orange-500 to-teal-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                Završi
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Step Components

function WelcomeStep({ onNext: _onNext, onSkip: _onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-teal-500">
        <Sparkles className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold">Dobrodošli u Rescue program!</h3>
      <p className="text-muted-foreground">
        Ovim kratkim vodičem pomoći ćemo vam postaviti vašu organizaciju i objaviti prvu apelaciju.
        
      </p>
      <div className="rounded-lg bg-muted p-4 text-left text-sm">
        <p className="font-medium">U sljedećim koracima ćemo:</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Postaviti profil vaše organizacije
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Uploadati dokumente za verifikaciju
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Kreirati prvu apelaciju za donacije
          </li>
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Vodič možete preskočiti u bilo kojem trenutku i nastaviti kasnije.
      </p>
    </div>
  );
}

function OrganizationStep({ 
  onNext: _onNext, 
  onPrevious: _onPrevious, 
  organizationId 
}: { 
  onNext: () => void; 
  onPrevious: () => void;
  organizationId?: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Postavite svoju organizaciju</h3>
      <p className="text-muted-foreground">
        Prvo moramo prikupiti osnovne informacije o vašoj organizaciji. 
        To uključuje ime, opis, kontakt podatke i link za donacije.
      </p>
      
      {organizationId ? (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Organizacija je već kreirana!</span>
          </div>
          <p className="mt-1 text-sm">
            Možete nastaviti na sljedeći korak ili urediti postojeće podatke u formi ispod.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
          <p className="text-sm">
            <strong>Napomena:</strong> Nakon što kliknete &quot;Nastavi&quot;, odvest ćemo vas do forme 
            gdje možete ispuniti podatke o organizaciji.
          </p>
        </div>
      )}
    </div>
  );
}

function DocumentsStep({ 
  onNext: _onNext, 
  onPrevious: _onPrevious, 
  hasDocuments 
}: { 
  onNext: () => void; 
  onPrevious: () => void;
  hasDocuments: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Verifikacijski dokumenti</h3>
      <p className="text-muted-foreground">
        Za objavljivanje apelacija, moramo verificirati vašu organizaciju. 
        Uploadajte relevantne dokumente kao što su:
      </p>
      
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-muted-foreground" />
          Rješenje o registraciji udruge
        </li>
        <li className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-muted-foreground" />
          Dokaz o statusu charity organizacije
        </li>
        <li className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-muted-foreground" />
          Potvrda banke o IBAN računu
        </li>
        <li className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-muted-foreground" />
          Identifikacijski dokument odgovorne osobe
        </li>
      </ul>
      
      {hasDocuments ? (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Dokumenti su uploadani!</span>
          </div>
          <p className="mt-1 text-sm">
            Vaši dokumenti su na pregledu. Nakon odobrenja, moći ćete objaviti apelacije.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
          <p className="text-sm">
            <strong>Važno:</strong> Bez verifikacijskih dokumenata ne možete objaviti javne apelacije.
          </p>
        </div>
      )}
    </div>
  );
}

function AppealStep({ 
  onComplete: _onComplete, 
  onPrevious: _onPrevious, 
  hasAppeals 
}: { 
  onComplete: () => void; 
  onPrevious: () => void;
  hasAppeals: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Kreirajte prvu apelaciju</h3>
      <p className="text-muted-foreground">
        Sada ste spremni kreirati svoju prvu apelaciju! Apelacija vam omogućuje 
        prikupljanje donacija za životinje koje brinete.
      </p>
      
      <div className="rounded-lg bg-muted p-4 text-sm">
        <p className="font-medium">Savjeti za uspješnu apelaciju:</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>• Napišite dirljivu priču o životinji</li>
          <li>• Dodajte kvalitetne fotografije</li>
          <li>• Postavite realan cilj iznosa</li>
          <li>• Redovito objavljujte ažuriranja</li>
        </ul>
      </div>
      
      {hasAppeals ? (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Već imate apelaciju!</span>
          </div>
          <p className="mt-1 text-sm">
            Uspješno ste završili uvodni vodič. Možete kreirati dodatne apelacije u bilo kojem trenutku.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// Hook for consuming components to check wizard state
export function useRescueOnboarding() {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isSkipped, setIsSkipped] = useState<boolean | null>(null);

  useEffect(() => {
    // Use timeout to avoid synchronous setState during render
    setTimeout(() => {
      setIsCompleted(!!localStorage.getItem(WIZARD_COMPLETED_KEY));
      setIsSkipped(!!localStorage.getItem(WIZARD_SKIPPED_KEY));
    }, 0);
  }, []);

  const resetWizard = useCallback(() => {
    localStorage.removeItem(WIZARD_COMPLETED_KEY);
    localStorage.removeItem(WIZARD_SKIPPED_KEY);
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    setIsCompleted(false);
    setIsSkipped(false);
  }, []);

  const startWizard = useCallback(() => {
    localStorage.removeItem(WIZARD_COMPLETED_KEY);
    localStorage.removeItem(WIZARD_SKIPPED_KEY);
    setIsCompleted(false);
    setIsSkipped(false);
  }, []);

  return {
    isCompleted,
    isSkipped,
    resetWizard,
    startWizard,
  };
}
