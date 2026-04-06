'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, Calendar, Dog } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Pet, ServiceType } from '@/lib/types';
import { SERVICE_LABELS } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';
import { AIMatchingResults } from '@/components/matching/ai-matching-results';

interface SmartBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pets: Pet[];
}

const SERVICE_LABELS_EN: Record<ServiceType, string> = {
  boarding: 'Overnight stay',
  walking: 'Dog walking',
  'house-sitting': 'House sitting',
  'drop-in': 'Drop-in visit',
  daycare: 'Day care',
};

export function SmartBookingDialog({ open, onOpenChange, pets }: SmartBookingDialogProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';
  
  const [step, setStep] = useState<'input' | 'matching'>('input');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceType | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showMatching, setShowMatching] = useState(false);

  const copy = {
    title: isEn ? 'Find the Perfect Sitter' : 'Pronađite Savršenog Čuvara',
    description: isEn 
      ? 'Our AI will match you with the best sitters for your pet based on location, experience, and your specific needs.'
      : 'Naš AI će vas spojiti s najboljim čuvarima za vašeg ljubimca temeljem lokacije, iskustva i vaših specifičnih potreba.',
    petLabel: isEn ? 'Which pet needs care?' : 'Koji ljubimac treba skrb?',
    serviceLabel: isEn ? 'What service do you need?' : 'Koja usluga vam treba?',
    datesLabel: isEn ? 'When do you need care?' : 'Kada vam treba skrb?',
    startLabel: isEn ? 'Start date' : 'Početak',
    endLabel: isEn ? 'End date' : 'Završetak',
    findSitters: isEn ? 'Find Best Sitters' : 'Pronađi Najbolje Čuvare',
    finding: isEn ? 'Finding matches...' : 'Tražim podudaranja...',
    noPets: isEn 
      ? 'You need to add a pet first. Go to your dashboard to add one.'
      : 'Prvo morate dodati ljubimca. Idite na dashboard da ga dodate.',
  };

  const canSearch = selectedPet && selectedService && startDate && endDate;

  const handleFindSitters = () => {
    if (!canSearch) return;
    setShowMatching(true);
    setStep('matching');
  };

  const handleSelectSitter = (sitterId: string) => {
    // Navigate to sitter profile with pre-filled booking params
    const params = new URLSearchParams({
      pet: selectedPet,
      service: selectedService,
      start: startDate,
      end: endDate,
    });
    router.push(`/sitter/${sitterId}?${params.toString()}`);
    onOpenChange(false);
  };

  const reset = () => {
    setStep('input');
    setShowMatching(false);
    setSelectedPet('');
    setSelectedService('');
    setStartDate('');
    setEndDate('');
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(reset, 300);
    }
  }, [open]);

  if (pets.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.noPets}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <DialogTitle>{copy.title}</DialogTitle>
          </div>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6 py-4">
            {/* Pet Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Dog className="h-4 w-4 text-slate-400" />
                {copy.petLabel}
              </Label>
              <Select value={selectedPet} onValueChange={(v) => setSelectedPet(v || '')}>
                <SelectTrigger>
                  <SelectValue placeholder={isEn ? 'Select pet' : 'Odaberi ljubimca'} />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species === 'dog' ? (isEn ? 'Dog' : 'Pas') : pet.species === 'cat' ? (isEn ? 'Cat' : 'Mačka') : (isEn ? 'Other' : 'Ostalo')})
                      {pet.breed && ` - ${pet.breed}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-400" />
                {copy.serviceLabel}
              </Label>
              <Select value={selectedService} onValueChange={(v) => setSelectedService(v as ServiceType)}>
                <SelectTrigger>
                  <SelectValue placeholder={isEn ? 'Select service' : 'Odaberi uslugu'} />
                </SelectTrigger>
                <SelectContent>
                  {(['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'] as ServiceType[]).map((service) => (
                    <SelectItem key={service} value={service}>
                      {isEn ? SERVICE_LABELS_EN[service] : SERVICE_LABELS[service]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {copy.datesLabel}
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">{copy.startLabel}</Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">{copy.endLabel}</Label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleFindSitters}
              disabled={!canSearch}
              className="w-full bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 text-white shadow-lg shadow-orange-200"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {copy.findSitters}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'matching' && showMatching && (
          <div className="py-4">
            <AIMatchingResults
              petId={selectedPet}
              serviceType={selectedService as ServiceType}
              startDate={startDate}
              endDate={endDate}
              onSelectSitter={handleSelectSitter}
              onClose={() => setStep('input')}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
