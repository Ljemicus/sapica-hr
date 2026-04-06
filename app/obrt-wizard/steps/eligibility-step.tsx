// Korak 1: Eligibilnost

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface EligibilityStepProps {
  onNext: (data: {
    hasResidenceInCroatia: boolean;
    hasValidID: boolean;
    hasBankAccount: boolean;
    hasOIB: boolean;
  }) => void;
  initialData?: {
    hasResidenceInCroatia: boolean;
    hasValidID: boolean;
    hasBankAccount: boolean;
    hasOIB: boolean;
  };
}

export function EligibilityStep({ onNext, initialData }: EligibilityStepProps) {
  const [requirements, setRequirements] = useState({
    hasResidenceInCroatia: initialData?.hasResidenceInCroatia ?? false,
    hasValidID: initialData?.hasValidID ?? false,
    hasBankAccount: initialData?.hasBankAccount ?? false,
    hasOIB: initialData?.hasOIB ?? false,
  });

  const allChecked = Object.values(requirements).every(Boolean);

  const handleToggle = (key: keyof typeof requirements) => {
    setRequirements(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = () => {
    if (allChecked) {
      onNext(requirements);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Provjera eligibilnosti</h2>
        <p className="text-gray-600 mt-2">
          Prije nego što započnemo, provjerimo imaš li sve potrebno za otvaranje obrta.
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Otvorenje obrta u Hrvatskoj je <strong>besplatno</strong> i traje 10-15 minuta online.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Označi sve što imaš:</h3>
        
        <div className="space-y-3">
          <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Checkbox
              checked={requirements.hasResidenceInCroatia}
              onCheckedChange={() => handleToggle('hasResidenceInCroatia')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">Prebivalište u Hrvatskoj</span>
              <p className="text-sm text-gray-500 mt-1">
                Imam prijavljeno prebivalište na teritoriju Republike Hrvatske.
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Checkbox
              checked={requirements.hasValidID}
              onCheckedChange={() => handleToggle('hasValidID')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">Valjana osobna iskaznica</span>
              <p className="text-sm text-gray-500 mt-1">
                Imam valjanu osobnu iskaznicu ili putovnicu.
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Checkbox
              checked={requirements.hasBankAccount}
              onCheckedChange={() => handleToggle('hasBankAccount')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">Žiro račun u banci</span>
              <p className="text-sm text-gray-500 mt-1">
                Imam otvoren žiro račun u banci u Hrvatskoj.
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Checkbox
              checked={requirements.hasOIB}
              onCheckedChange={() => handleToggle('hasOIB')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">OIB</span>
              <p className="text-sm text-gray-500 mt-1">
                Imam dodijeljen Osobni identifikacijski broj.
              </p>
            </div>
          </label>
        </div>
      </div>

      {!allChecked && (
        <p className="text-sm text-amber-600 text-center">
          Označi sve stavke kako bi mogao nastaviti.
        </p>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!allChecked}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          Nastavi
        </Button>
      </div>
    </div>
  );
}
