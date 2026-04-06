// Progress bar komponenta za Obrt Wizard

'use client';

import { WizardStep } from '@/types/obrt-wizard';

interface WizardProgressProps {
  currentStep: WizardStep;
}

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: 'eligibility', label: 'Eligibilnost', number: 1 },
  { id: 'personal', label: 'Osobni podaci', number: 2 },
  { id: 'business', label: 'Obrt', number: 3 },
  { id: 'bank', label: 'Banka', number: 4 },
  { id: 'review', label: 'Pregled', number: 5 },
  { id: 'generate', label: 'Generiranje', number: 6 },
];

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-6">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`w-16 lg:w-24 h-0.5 mx-2 ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Korak {currentIndex + 1} od {STEPS.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {STEPS[currentIndex]?.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
