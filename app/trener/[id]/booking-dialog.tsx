'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { type Trainer, type TrainingProgram, type TrainerAvailabilitySlot } from '@/lib/types';
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
  const [slotKey, setSlotKey] = useState(''); // "start_time|end_time"
  const [petName, setPetName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<TrainerAvailabilitySlot[]>([]);
  const router = useRouter();

  const selectedProgram = programs.find(p => p.id === programId);

  const fetchSlots = useCallback(async (selectedDate: string) => {
    setSlotsLoading(true);
    setSlots([]);
    setSlotKey('');
    try {
      const res = await fetch(
        `/api/trainer-availability?trainer_id=${trainer.id}&from_date=${selectedDate}&to_date=${selectedDate}`
      );
      if (res.ok) {
        const data: TrainerAvailabilitySlot[] = await res.json();
        setSlots(data);
      }
    } finally {
      setSlotsLoading(false);
    }
  }, [trainer.id]);

  useEffect(() => {
    if (date) fetchSlots(date);
  }, [date, fetchSlots]);

  const parsedSlot = slotKey ? {
    start_time: slotKey.split('|')[0],
    end_time: slotKey.split('|')[1],
  } : null;

  const handleSubmit = async () => {
    if (!date || !parsedSlot) return;

    setLoading(true);
    try {
      const res = await fetch('/api/trainer-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: trainer.id,
          program_id: programId || null,
          date,
          start_time: parsedSlot.start_time,
          end_time: parsedSlot.end_time,
          pet_name: petName || null,
          note: note || null,
        }),
      });

      if (res.status === 409) {
        toast.error('Termin je zauzet. Odaberite drugi termin.');
        // Refresh slots for this date
        fetchSlots(date);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error('Greška pri kreiranju rezervacije');
        setLoading(false);
        return;
      }

      toast.success('Rezervacija poslana!', {
        description: 'Trener će potvrditi vaš termin.',
      });
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error('Greška pri slanju zahtjeva');
    } finally {
      setLoading(false);
    }
  };

  const canAdvanceToStep3 = date && parsedSlot;

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
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="focus:border-indigo-300"
                />
              </div>

              {date && (
                <div className="space-y-2">
                  <Label>Slobodni termini</Label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-4 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Učitavanje...
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground bg-amber-50 rounded-lg p-3">
                      Nema slobodnih termina za ovaj datum. Odaberite drugi datum.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
                      {slots.map((slot) => {
                        const key = `${slot.start_time}|${slot.end_time}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                              slotKey === key
                                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'hover:border-indigo-200 hover:bg-indigo-50/50'
                            }`}
                            onClick={() => setSlotKey(key)}
                          >
                            {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Ime ljubimca (opcionalno)</Label>
                <Input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Npr. Rex"
                  className="focus:border-indigo-300"
                />
              </div>

              <div className="space-y-2">
                <Label>Napomena (opcionalno)</Label>
                <Textarea
                  placeholder="Pasmina, dob, problematično ponašanje..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="focus:border-indigo-300"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Natrag
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600"
                  disabled={!canAdvanceToStep3}
                  onClick={() => setStep(3)}
                >
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
                {parsedSlot && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {date} · {parsedSlot.start_time.slice(0, 5)} — {parsedSlot.end_time.slice(0, 5)}
                  </p>
                )}
                {petName && (
                  <p className="text-xs text-muted-foreground mt-1">Ljubimac: {petName}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Natrag
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 btn-hover"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Šaljem...
                    </>
                  ) : (
                    'Pošalji zahtjev'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
