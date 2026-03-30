'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle2, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { TRAINING_TYPE_LABELS, type Trainer, type TrainingProgram } from '@/lib/types';
import { toast } from 'sonner';

interface TrainerBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: Trainer;
  programs: TrainingProgram[];
}

export function TrainerBookingDialog({ open, onOpenChange, trainer, programs }: TrainerBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [programId, setProgramId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const router = useRouter();

  const selectedProgram = programs.find(p => p.id === programId);

  const handleSubmit = () => {
    const programName = selectedProgram?.name || TRAINING_TYPE_LABELS[trainer.specializations[0]];
    const message = `Pozdrav! Zanima me ${programName ? `program "${programName}"` : 'trening'}${date ? ` s početkom od ${date}` : ''}${time ? ` u ${time}h` : ''}${note ? `. ${note}` : ''}.`;
    toast.success('Zahtjev pripremljen!', {
      description: 'Preusmjeravamo vas na poruke.',
    });
    onOpenChange(false);
    router.push(`/poruke?trainer=${trainer.id}&message=${encodeURIComponent(message)}`);
  };

  const steps = [
    { num: 1, label: 'Program' },
    { num: 2, label: 'Termin' },
    { num: 3, label: 'Potvrda' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zakaži trening</DialogTitle>
          <DialogDescription>
            Kod trenera: {trainer.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step >= s.num ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
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
              {programs.length > 0 ? (
                <div className="space-y-2">
                  <Label>Odaberite program</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {programs.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          programId === p.id ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'hover:border-indigo-200 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="program"
                            value={p.id}
                            checked={programId === p.id}
                            onChange={(e) => setProgramId(e.target.value)}
                            className="accent-indigo-500"
                          />
                          <div>
                            <span className="font-medium text-sm block">{p.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {p.duration_weeks} tjedana · {p.sessions} sesija
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-orange-500">{p.price}&euro;</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">Nema specifičnih programa — kontaktirajte trenera za detalje.</p>
                  <p className="text-xs text-muted-foreground">Cijena po satu: <span className="font-bold text-orange-500">{trainer.price_per_hour}&euro;</span></p>
                </div>
              )}
              <Button
                type="button"
                className="w-full bg-indigo-500 hover:bg-indigo-600"
                onClick={() => setStep(2)}
              >
                Dalje <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Željeni datum početka</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="focus:border-indigo-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Željeno vrijeme</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="focus:border-indigo-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Napomena (opcionalno)</Label>
                <Textarea
                  placeholder="Ime psa, pasmina, dob, problematično ponašanje..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="focus:border-indigo-300"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Natrag
                </Button>
                <Button type="button" className="flex-1 bg-indigo-500 hover:bg-indigo-600" onClick={() => setStep(3)}>
                  Dalje <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 text-center border border-indigo-100">
                <GraduationCap className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                {selectedProgram ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">Odabrani program</p>
                    <p className="text-lg font-bold">{selectedProgram.name}</p>
                    <p className="text-3xl font-extrabold text-gradient mt-2">{selectedProgram.price}&euro;</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProgram.duration_weeks} tjedana · {selectedProgram.sessions} sesija
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">Individualni trening</p>
                    <p className="text-3xl font-extrabold text-gradient mt-2">{trainer.price_per_hour}&euro;/sat</p>
                  </>
                )}
                {date && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Početak: {date}{time ? ` u ${time}h` : ''}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Klikom na &quot;Pošalji zahtjev&quot; bit ćete preusmjereni na poruke kako biste dogovorili termin s trenerom.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Natrag
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 btn-hover"
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
