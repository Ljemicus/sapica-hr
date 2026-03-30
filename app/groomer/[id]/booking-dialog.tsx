'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle2, Scissors } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { GROOMING_SERVICE_LABELS, type Groomer, type GroomingServiceType } from '@/lib/types';
import { toast } from 'sonner';

interface GroomerBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groomer: Groomer;
}

export function GroomerBookingDialog({ open, onOpenChange, groomer }: GroomerBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const router = useRouter();

  const selectedPrice = service ? groomer.prices[service as GroomingServiceType] : 0;

  const handleSubmit = () => {
    const message = `Pozdrav! Želim zakazati termin za ${GROOMING_SERVICE_LABELS[service as GroomingServiceType]}${date ? ` na datum ${date}` : ''}${time ? ` u ${time}h` : ''}${note ? `. ${note}` : ''}.`;
    toast.success('Zahtjev pripremljen!', {
      description: 'Preusmjeravamo vas na poruke.',
    });
    onOpenChange(false);
    router.push(`/poruke?groomer=${groomer.id}&message=${encodeURIComponent(message)}`);
  };

  const steps = [
    { num: 1, label: 'Usluga' },
    { num: 2, label: 'Termin' },
    { num: 3, label: 'Potvrda' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zakaži termin</DialogTitle>
          <DialogDescription>
            Kod groomera: {groomer.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step >= s.num ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s.num ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">{s.num}</span>
                )}
                {s.label}
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Odaberite uslugu</Label>
                <div className="space-y-2">
                  {groomer.services.map((s) => (
                    <label
                      key={s}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        service === s ? 'border-pink-400 bg-pink-50 shadow-sm' : 'hover:border-pink-200 hover:bg-pink-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="service"
                          value={s}
                          checked={service === s}
                          onChange={(e) => setService(e.target.value)}
                          className="accent-pink-500"
                        />
                        <span className="font-medium text-sm">{GROOMING_SERVICE_LABELS[s]}</span>
                      </div>
                      <span className="font-bold text-orange-500">{groomer.prices[s]}&euro;</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                type="button"
                className="w-full bg-pink-500 hover:bg-pink-600"
                onClick={() => setStep(2)}
                disabled={!service}
              >
                Dalje <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Željeni datum</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="focus:border-pink-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Željeno vrijeme</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="focus:border-pink-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Napomena (opcionalno)</Label>
                <Textarea
                  placeholder="Posebne upute, veličina psa, alergije..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="focus:border-pink-300"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Natrag
                </Button>
                <Button type="button" className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={() => setStep(3)}>
                  Dalje <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 text-center border border-pink-100">
                <Scissors className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Odabrana usluga</p>
                <p className="text-lg font-bold">{GROOMING_SERVICE_LABELS[service as GroomingServiceType]}</p>
                <p className="text-3xl font-extrabold text-gradient mt-2">{selectedPrice}&euro;</p>
                {date && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {date}{time ? ` u ${time}h` : ''}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Klikom na &quot;Pošalji zahtjev&quot; bit ćete preusmjereni na poruke kako biste dogovorili termin s groomerom.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Natrag
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-pink-500 hover:bg-pink-600 btn-hover"
                  onClick={handleSubmit}
                >
                  Pošalji zahtjev
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
