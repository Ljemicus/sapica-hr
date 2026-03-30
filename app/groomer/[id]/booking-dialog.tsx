'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  ChevronRight, ChevronLeft, CheckCircle2, Scissors, Clock, Calendar, PawPrint, Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { GROOMING_SERVICE_LABELS, type Groomer, type GroomingServiceType, type GroomerAvailabilitySlot } from '@/lib/types';
import { toast } from 'sonner';

interface GroomerBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groomer: Groomer;
  initialDate?: string;
  initialSlot?: GroomerAvailabilitySlot | null;
}

export function GroomerBookingDialog({ open, onOpenChange, groomer, initialDate, initialSlot }: GroomerBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<GroomerAvailabilitySlot | null>(null);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'pas' | 'macka'>('pas');
  const [note, setNote] = useState('');
  const [slots, setSlots] = useState<GroomerAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const router = useRouter();

  const selectedPrice = service ? groomer.prices[service as GroomingServiceType] : 0;

  // Fetch available slots
  useEffect(() => {
    if (!open) return;
    const fromDate = new Date().toISOString().split('T')[0];
    const toDate = addDays(new Date(), 60).toISOString().split('T')[0];
    setLoading(true);
    fetch(`/api/groomer-availability?groomer_id=${groomer.id}&from_date=${fromDate}&to_date=${toDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [open, groomer.id]);

  useEffect(() => {
    if (!open) return;
    if (initialDate) {
      setSelectedDate(initialDate);
      setStep(service ? 2 : 1);
    }
    if (initialSlot) {
      setSelectedDate(initialSlot.date);
      setSelectedSlot(initialSlot);
      setStep(service ? 3 : 1);
    }
  }, [open, initialDate, initialSlot, service]);

  // Available dates set
  const availableDates = useMemo(() => new Set(slots.map((s) => s.date)), [slots]);

  // Slots for selected date
  const dateSlots = useMemo(
    () => slots.filter((s) => s.date === selectedDate),
    [slots, selectedDate]
  );

  // Calendar days
  const { days, startDay } = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    return {
      days: eachDayOfInterval({ start: monthStart, end: monthEnd }),
      startDay: monthStart.getDay(),
    };
  }, [calendarMonth]);

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/groomer-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groomer_id: groomer.id,
          service,
          date: selectedSlot.date,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          price: selectedPrice,
          pet_name: petName || null,
          pet_type: petType,
          note: note || null,
        }),
      });

      if (res.status === 409) {
        toast.error('Termin je zauzet!', { description: 'Odaberite drugi termin.' });
        setStep(2);
        setSelectedSlot(null);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        toast.error('Greška pri rezervaciji', { description: 'Pokušajte ponovo.' });
        setSubmitting(false);
        return;
      }

      toast.success('Termin rezerviran! 🎉', {
        description: `${GROOMING_SERVICE_LABELS[service as GroomingServiceType]} — ${format(new Date(selectedSlot.date + 'T00:00'), 'd. MMMM', { locale: hr })} u ${selectedSlot.start_time.slice(0, 5)}h`,
      });
      onOpenChange(false);
      router.push('/dashboard/vlasnik/rezervacije');
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Usluga' },
    { num: 2, label: 'Termin' },
    { num: 3, label: 'Detalji' },
    { num: 4, label: 'Potvrda' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zakaži termin</DialogTitle>
          <DialogDescription>Kod groomera: {groomer.name}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  step >= s.num ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">
                    {s.num}
                  </span>
                )}
                {s.label}
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300 mx-0.5" />}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {/* ── Step 1: Service ── */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Odaberite uslugu</Label>
                <div className="space-y-2">
                  {groomer.services.map((s) => (
                    <label
                      key={s}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        service === s
                          ? 'border-pink-400 bg-pink-50 shadow-sm'
                          : 'hover:border-pink-200 hover:bg-pink-50/50'
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

          {/* ── Step 2: Date & Time ── */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                  <span className="ml-2 text-muted-foreground">Učitavam termine...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">Groomer trenutno nema dostupnih termina.</p>
                  <p className="text-xs text-muted-foreground mt-1">Kontaktirajte groomera za više informacija.</p>
                </div>
              ) : (
                <>
                  {/* Mini Calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        Odaberite datum
                      </Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center capitalize">
                          {format(calendarMonth, 'LLLL yyyy.', { locale: hr })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'].map((d) => (
                        <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: startDay }, (_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const hasSlots = availableDates.has(dateStr);
                        const isPast = isBefore(day, new Date()) && !isToday(day);
                        const isSelected = selectedDate === dateStr;

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            disabled={!hasSlots || isPast}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedSlot(null);
                            }}
                            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-pink-500 text-white shadow-md'
                                : hasSlots && !isPast
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            } ${isToday(day) && !isSelected ? 'ring-1 ring-orange-400' : ''}`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Slobodni termini — {format(new Date(selectedDate + 'T00:00'), 'd. MMMM', { locale: hr })}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {dateSlots.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                isSelected
                                  ? 'border-pink-400 bg-pink-50 shadow-sm'
                                  : 'hover:border-pink-200 hover:bg-pink-50/50'
                              }`}
                            >
                              <span className="font-semibold text-sm">
                                {slot.start_time.slice(0, 5)}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                — {slot.end_time.slice(0, 5)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Natrag
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                  onClick={() => setStep(3)}
                  disabled={!selectedSlot}
                >
                  Dalje <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Pet Details ── */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Ime ljubimca</Label>
                <Input
                  placeholder="npr. Rex, Miki, Luna..."
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="focus:border-pink-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Vrsta</Label>
                <div className="flex gap-3">
                  {([['pas', '🐕 Pas'], ['macka', '🐈 Mačka']] as const).map(([val, label]) => (
                    <label
                      key={val}
                      className={`flex-1 p-3 rounded-xl border text-center cursor-pointer transition-all ${
                        petType === val ? 'border-pink-400 bg-pink-50 shadow-sm' : 'hover:border-pink-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="petType"
                        value={val}
                        checked={petType === val}
                        onChange={() => setPetType(val)}
                        className="sr-only"
                      />
                      <span className="font-medium">{label}</span>
                    </label>
                  ))}
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
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Natrag
                </Button>
                <Button type="button" className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={() => setStep(4)}>
                  Dalje <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 4 && selectedSlot && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100 space-y-3">
                <div className="text-center">
                  <Scissors className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-lg font-bold">{GROOMING_SERVICE_LABELS[service as GroomingServiceType]}</p>
                  <p className="text-3xl font-extrabold text-gradient mt-1">{selectedPrice}&euro;</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <Calendar className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="font-medium">
                      {format(new Date(selectedSlot.date + 'T00:00'), 'd. MMMM yyyy.', { locale: hr })}
                    </p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <Clock className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="font-medium">
                      {selectedSlot.start_time.slice(0, 5)} — {selectedSlot.end_time.slice(0, 5)}
                    </p>
                  </div>
                </div>
                {petName && (
                  <div className="bg-white/70 rounded-lg p-3 text-center text-sm">
                    <PawPrint className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="font-medium">
                      {petName} ({petType === 'pas' ? '🐕 Pas' : '🐈 Mačka'})
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Groomer će potvrditi vaš termin. Dobit ćete obavijest o statusu.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)}>
                  Natrag
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-pink-500 hover:bg-pink-600 btn-hover"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Šaljem...
                    </>
                  ) : (
                    'Rezerviraj termin'
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
