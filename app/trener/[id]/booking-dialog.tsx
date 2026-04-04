'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { type Trainer, type TrainingProgram, type TrainerAvailabilitySlot, type TrainingType } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';

interface TrainerBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: Trainer;
  programs: TrainingProgram[];
}

const TRAINING_TYPE_LABELS_EN: Record<TrainingType, string> = {
  osnovna: 'Basic obedience',
  napredna: 'Advanced training',
  agility: 'Agility',
  ponasanje: 'Behaviour correction',
  stenci: 'Puppies',
};

export function TrainerBookingDialog({ open, onOpenChange, trainer, programs }: TrainerBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [programId, setProgramId] = useState('');
  const [date, setDate] = useState('');
  const [slotKey, setSlotKey] = useState('');
  const [petName, setPetName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<TrainerAvailabilitySlot[]>([]);
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const selectedProgram = programs.find(p => p.id === programId);

  const copy = {
    loadError: isEn ? 'Error loading time slots. Please try again.' : 'Greška pri učitavanju termina. Pokušajte ponovno.',
    slotGone: isEn ? 'This slot is no longer available. Choose another one.' : 'Termin više nije dostupan. Odaberite drugi termin.',
    submitError: isEn ? 'We could not send your request.' : 'Nismo uspjeli poslati upit',
    successTitle: isEn ? 'Your request has been sent' : 'Upit je poslan',
    successDescription: isEn ? 'The trainer now needs to confirm the appointment.' : 'Trener sada treba potvrditi termin.',
    networkError: isEn ? 'Error sending request.' : 'Greška pri slanju upita',
    steps: isEn ? ['Selection', 'Time slot', 'Send'] : ['Odabir', 'Termin', 'Slanje'],
    title: isEn ? 'Send training request' : 'Pošalji upit za trening',
    description: isEn ? `You are sending a request to trainer ${trainer.name}. The appointment is confirmed only after approval, and the training plan can be refined after the first reply.` : `Šaljete upit treneru ${trainer.name}. Termin vrijedi tek nakon potvrde, a plan treninga možete doraditi nakon prvog odgovora.`,
    chooseProgram: isEn ? 'Choose a program' : 'Odaberi program',
    noPrograms: isEn ? 'No published programs yet — send a request to the trainer for details.' : 'Nema objavljenih programa — pošaljite upit treneru za detalje.',
    priceHint: isEn ? 'Estimated hourly price:' : 'Okvirna cijena po satu:',
    next: isEn ? 'Next' : 'Dalje',
    chooseDate: isEn ? 'Choose a date' : 'Odaberi datum',
    slots: isEn ? 'Available slots' : 'Slobodni termini',
    loading: isEn ? 'Loading...' : 'Učitavanje...',
    noDateSlots: isEn ? 'No available slots for this date. Choose another date.' : 'Nema slobodnih termina za ovaj datum. Odaberite drugi datum.',
    petName: isEn ? 'Pet name (optional)' : 'Ime ljubimca (opcionalno)',
    petPlaceholder: isEn ? 'E.g. Rex' : 'Npr. Rex',
    note: isEn ? 'Note for the trainer (optional)' : 'Napomena za trenera (opcionalno)',
    notePlaceholder: isEn ? 'E.g. breed, age, training goal, behaviour issue...' : 'Npr. pasmina, dob, cilj treninga, problematično ponašanje...',
    back: isEn ? 'Back' : 'Natrag',
    selectedProgram: isEn ? 'Selected program' : 'Odabrani program',
    individual: isEn ? 'Individual training' : 'Individualni trening',
    perHour: isEn ? '/hour' : '/sat',
    petLabel: isEn ? 'Pet' : 'Ljubimac',
    whatNext: isEn ? 'What happens after you send it?' : 'Što slijedi nakon slanja?',
    next1: isEn ? '1. The trainer reviews your request.' : '1. Trener pregledava vaš upit.',
    next2: isEn ? '2. You confirm the timing and program details together.' : '2. Potvrđujete termin i detalje programa.',
    next3: isEn ? '3. Further coordination stays neatly linked to the booking.' : '3. Daljnji dogovor ostaje uredno povezan s rezervacijom.',
    sending: isEn ? 'Sending request...' : 'Šaljem upit...',
    send: isEn ? 'Send request' : 'Pošalji upit',
    weeks: isEn ? 'weeks' : 'tjedana',
    sessions: isEn ? 'sessions' : 'sesija',
  };

  const fetchSlots = useCallback(async (selectedDate: string) => {
    setSlotsLoading(true);
    setSlots([]);
    setSlotKey('');
    try {
      const res = await fetch(`/api/trainer-availability?trainer_id=${trainer.id}&from_date=${selectedDate}&to_date=${selectedDate}`);
      if (res.ok) {
        const data: TrainerAvailabilitySlot[] = await res.json();
        setSlots(data);
      }
    } catch {
      toast.error(copy.loadError);
    } finally {
      setSlotsLoading(false);
    }
  }, [trainer.id, copy.loadError]);

  useEffect(() => {
    if (date) fetchSlots(date);
  }, [date, fetchSlots]);

  const parsedSlot = slotKey ? { start_time: slotKey.split('|')[0], end_time: slotKey.split('|')[1] } : null;

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
        toast.error(copy.slotGone);
        fetchSlots(date);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error(copy.submitError);
        setLoading(false);
        return;
      }

      toast.success(copy.successTitle, { description: copy.successDescription });
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error(copy.networkError);
    } finally {
      setLoading(false);
    }
  };

  const canAdvanceToStep3 = date && parsedSlot;
  const steps = [{ num: 1, label: copy.steps[0] }, { num: 2, label: copy.steps[1] }, { num: 3, label: copy.steps[2] }];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1 mb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${step >= s.num ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                {step > s.num ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">{s.num}</span>}
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
                  <Label>{copy.chooseProgram}</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {programs.map((p) => (
                      <label key={p.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${programId === p.id ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'hover:border-indigo-200 hover:bg-indigo-50/50'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="program" value={p.id} checked={programId === p.id} onChange={(e) => setProgramId(e.target.value)} className="accent-indigo-500" />
                          <div>
                            <span className="font-medium text-sm block">{p.name}</span>
                            <span className="text-xs text-muted-foreground">{p.duration_weeks} {copy.weeks} · {p.sessions} {copy.sessions}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {isEn && p.type ? <span className="block text-[10px] text-muted-foreground mb-0.5">{TRAINING_TYPE_LABELS_EN[p.type]}</span> : null}
                          <span className="font-bold text-orange-500">{p.price}&euro;</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">{copy.noPrograms}</p>
                  <p className="text-xs text-muted-foreground">{copy.priceHint} <span className="font-bold text-orange-500">{trainer.price_per_hour}&euro;</span></p>
                </div>
              )}
              <Button type="button" className="w-full bg-indigo-500 hover:bg-indigo-600" onClick={() => setStep(2)}>{copy.next} <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>{copy.chooseDate}</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="focus:border-indigo-300" />
              </div>

              {date && (
                <div className="space-y-2">
                  <Label>{copy.slots}</Label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-4 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />{copy.loading}</div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground bg-amber-50 rounded-lg p-3">{copy.noDateSlots}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
                      {slots.map((slot) => {
                        const key = `${slot.start_time}|${slot.end_time}`;
                        return (
                          <button key={key} type="button" className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${slotKey === key ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm' : 'hover:border-indigo-200 hover:bg-indigo-50/50'}`} onClick={() => setSlotKey(key)}>
                            {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>{copy.petName}</Label>
                <Input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder={copy.petPlaceholder} className="focus:border-indigo-300" />
              </div>

              <div className="space-y-2">
                <Label>{copy.note}</Label>
                <Textarea placeholder={copy.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} className="focus:border-indigo-300" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>{copy.back}</Button>
                <Button type="button" className="flex-1 bg-indigo-500 hover:bg-indigo-600" disabled={!canAdvanceToStep3} onClick={() => setStep(3)}>{copy.next} <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 text-center border border-indigo-100">
                <GraduationCap className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                {selectedProgram ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">{copy.selectedProgram}</p>
                    <p className="text-lg font-bold">{selectedProgram.name}</p>
                    <p className="text-3xl font-extrabold text-gradient mt-2">{selectedProgram.price}&euro;</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedProgram.duration_weeks} {copy.weeks} · {selectedProgram.sessions} {copy.sessions}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">{copy.individual}</p>
                    <p className="text-3xl font-extrabold text-gradient mt-2">{trainer.price_per_hour}&euro;{copy.perHour}</p>
                  </>
                )}
                {parsedSlot && <p className="text-sm text-muted-foreground mt-3">{date} · {parsedSlot.start_time.slice(0, 5)} — {parsedSlot.end_time.slice(0, 5)}</p>}
                {petName && <p className="text-xs text-muted-foreground mt-1">{copy.petLabel}: {petName}</p>}
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{copy.whatNext}</p>
                <p>{copy.next1}</p>
                <p>{copy.next2}</p>
                <p>{copy.next3}</p>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>{copy.back}</Button>
                <Button type="button" className="flex-1 bg-indigo-500 hover:bg-indigo-600 btn-hover" disabled={loading} onClick={handleSubmit}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />{copy.sending}</> : copy.send}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
