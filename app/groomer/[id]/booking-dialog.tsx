'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import {
  ChevronRight, ChevronLeft, CheckCircle2, Scissors, Clock, Calendar, PawPrint, Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { GROOMING_SERVICE_LABELS, type GroomingServiceType, type GroomerAvailabilitySlot } from '@/lib/types';
import type { PublicGroomerProfile } from '@/lib/public/provider-profile-sanitizers';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';

interface GroomerBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groomer: PublicGroomerProfile;
  initialDate?: string;
  initialSlot?: GroomerAvailabilitySlot | null;
}

const GROOMING_SERVICE_LABELS_EN: Record<GroomingServiceType, string> = {
  sisanje: 'Haircut',
  kupanje: 'Bath',
  trimanje: 'Hand stripping',
  nokti: 'Nails',
  cetkanje: 'Brushing',
};

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
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;

  const serviceLabel = (value: GroomingServiceType) => isEn ? GROOMING_SERVICE_LABELS_EN[value] : GROOMING_SERVICE_LABELS[value];

  const copy = {
    loadError: isEn ? 'Error loading time slots. Please try again.' : 'Greška pri učitavanju termina. Pokušajte ponovno.',
    slotGoneTitle: isEn ? 'This slot is no longer available' : 'Termin više nije dostupan',
    slotGoneDescription: isEn ? 'Choose another slot.' : 'Odaberite drugi termin.',
    submitErrorTitle: isEn ? 'We could not send your request' : 'Nismo uspjeli poslati upit',
    submitErrorDescription: isEn ? 'Please try again.' : 'Pokušajte ponovno.',
    successTitle: isEn ? 'Your appointment request has been sent' : 'Upit za termin je poslan',
    networkError: isEn ? 'Network error. Please try again.' : 'Mrežna greška. Pokušajte ponovno.',
    steps: isEn ? ['Selection', 'Time slot', 'Details', 'Send'] : ['Odabir', 'Termin', 'Detalji', 'Slanje'],
    title: isEn ? 'Send appointment request' : 'Pošalji upit za termin',
    description: isEn ? `You are sending a request to groomer ${groomer.name}. The appointment is confirmed only after approval, and service details can still be adjusted after the reply.` : `Šaljete upit groomeru ${groomer.name}. Termin vrijedi tek nakon potvrde, a detalje usluge možete dodatno uskladiti nakon odgovora.`,
    chooseService: isEn ? 'Choose a service' : 'Odaberi uslugu',
    next: isEn ? 'Next' : 'Dalje',
    loadingSlots: isEn ? 'Loading time slots...' : 'Učitavam termine...',
    noSlotsTitle: isEn ? 'This groomer currently has no open slots.' : 'Groomer trenutno nema otvorene termine.',
    noSlotsText: isEn ? 'Send a message or try another date.' : 'Pošaljite poruku ili pokušajte s drugim datumom.',
    chooseDate: isEn ? 'Choose a date' : 'Odaberi datum',
    weekdays: isEn ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
    freeSlots: isEn ? 'Available slots' : 'Slobodni termini',
    back: isEn ? 'Back' : 'Natrag',
    petName: isEn ? 'Pet name' : 'Ime ljubimca',
    petNamePlaceholder: isEn ? 'e.g. Rex, Miki, Luna...' : 'npr. Rex, Miki, Luna...',
    petType: isEn ? 'Pet type' : 'Vrsta ljubimca',
    dog: isEn ? '🐕 Dog' : '🐕 Pas',
    cat: isEn ? '🐈 Cat' : '🐈 Mačka',
    note: isEn ? 'Note for the groomer (optional)' : 'Napomena za groomera (opcionalno)',
    notePlaceholder: isEn ? 'E.g. size, skin sensitivity, allergies, special instructions...' : 'Npr. veličina, osjetljivost kože, alergije, posebne upute...',
    firstConfirm: isEn ? 'The groomer needs to confirm this time slot first. You will get a notification as soon as they reply.' : 'Groomer prvo treba potvrditi termin. Dobit ćete obavijest čim odgovori.',
    whatNext: isEn ? 'What happens after you send it?' : 'Što slijedi nakon slanja?',
    next1: isEn ? '1. The groomer receives your request.' : '1. Groomer prima upit za termin.',
    next2: isEn ? '2. You receive confirmation or a proposal for a different slot.' : '2. Dobivate potvrdu ili prijedlog drugog termina.',
    next3: isEn ? '3. The booking appears in your bookings.' : '3. Rezervacija se pojavljuje u vašim rezervacijama.',
    sending: isEn ? 'Sending request...' : 'Šaljem upit...',
    send: isEn ? 'Send request' : 'Pošalji upit',
  };

  const selectedPrice = service ? groomer.prices[service as GroomingServiceType] : 0;

  useEffect(() => {
    if (!open) return;
    const fromDate = new Date().toISOString().split('T')[0];
    const toDate = addDays(new Date(), 60).toISOString().split('T')[0];
    setLoading(true);
    fetch(`/api/groomer-availability?groomer_id=${groomer.id}&from_date=${fromDate}&to_date=${toDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => {
        setSlots([]);
        toast.error(copy.loadError);
      })
      .finally(() => setLoading(false));
  }, [open, groomer.id, copy.loadError]);

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

  const availableDates = useMemo(() => new Set(slots.map((s) => s.date)), [slots]);
  const dateSlots = useMemo(() => slots.filter((s) => s.date === selectedDate), [slots, selectedDate]);

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
        toast.error(copy.slotGoneTitle, { description: copy.slotGoneDescription });
        setStep(2);
        setSelectedSlot(null);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        toast.error(copy.submitErrorTitle, { description: copy.submitErrorDescription });
        setSubmitting(false);
        return;
      }

      toast.success(copy.successTitle, {
        description: `${serviceLabel(service as GroomingServiceType)} — ${format(new Date(selectedSlot.date + 'T00:00'), isEn ? 'MMMM d' : 'd. MMMM', { locale })} ${isEn ? 'at' : 'u'} ${selectedSlot.start_time.slice(0, 5)}h`,
      });
      onOpenChange(false);
      router.push('/dashboard/vlasnik/rezervacije');
    } catch {
      toast.error(copy.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: copy.steps[0] },
    { num: 2, label: copy.steps[1] },
    { num: 3, label: copy.steps[2] },
    { num: 4, label: copy.steps[3] },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1 mb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${step >= s.num ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-400'}`}>
                {step > s.num ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">{s.num}</span>}
                {s.label}
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300 mx-0.5" />}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>{copy.chooseService}</Label>
                <div className="space-y-2">
                  {groomer.services.map((s) => (
                    <label key={s} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${service === s ? 'border-pink-400 bg-pink-50 shadow-sm' : 'hover:border-pink-200 hover:bg-pink-50/50'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="service" value={s} checked={service === s} onChange={(e) => setService(e.target.value)} className="accent-pink-500" />
                        <span className="font-medium text-sm">{serviceLabel(s)}</span>
                      </div>
                      <span className="font-bold text-orange-500">{groomer.prices[s]}&euro;</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="button" className="w-full bg-pink-500 hover:bg-pink-600" onClick={() => setStep(2)} disabled={!service}>
                {copy.next} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                  <span className="ml-2 text-muted-foreground">{copy.loadingSlots}</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">{copy.noSlotsTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{copy.noSlotsText}</p>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        {copy.chooseDate}
                      </Label>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center capitalize">
                          {format(calendarMonth, isEn ? 'LLLL yyyy' : 'LLLL yyyy.', { locale })}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {copy.weekdays.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: startDay }, (_, i) => <div key={`empty-${i}`} />)}
                      {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const hasSlots = availableDates.has(dateStr);
                        const isPast = isBefore(day, new Date()) && !isToday(day);
                        const isSelected = selectedDate === dateStr;
                        return (
                          <button key={dateStr} type="button" disabled={!hasSlots || isPast} onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${isSelected ? 'bg-pink-500 text-white shadow-md' : hasSlots && !isPast ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' : 'bg-gray-50 text-gray-300 cursor-not-allowed'} ${isToday(day) && !isSelected ? 'ring-1 ring-orange-400' : ''}`}>
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-orange-500" />
                        {copy.freeSlots} — {format(new Date(selectedDate + 'T00:00'), isEn ? 'MMMM d' : 'd. MMMM', { locale })}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {dateSlots.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <button key={slot.id} type="button" onClick={() => setSelectedSlot(slot)} className={`p-3 rounded-xl border text-center transition-all ${isSelected ? 'border-pink-400 bg-pink-50 shadow-sm' : 'hover:border-pink-200 hover:bg-pink-50/50'}`}>
                              <span className="font-semibold text-sm">{slot.start_time.slice(0, 5)}</span>
                              <span className="text-[10px] text-muted-foreground block">— {slot.end_time.slice(0, 5)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>{copy.back}</Button>
                <Button type="button" className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={() => setStep(3)} disabled={!selectedSlot}>{copy.next} <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>{copy.petName}</Label>
                <Input placeholder={copy.petNamePlaceholder} value={petName} onChange={(e) => setPetName(e.target.value)} className="focus:border-pink-300" />
              </div>
              <div className="space-y-2">
                <Label>{copy.petType}</Label>
                <div className="flex gap-3">
                  {([['pas', copy.dog], ['macka', copy.cat]] as const).map(([val, label]) => (
                    <label key={val} className={`flex-1 p-3 rounded-xl border text-center cursor-pointer transition-all ${petType === val ? 'border-pink-400 bg-pink-50 shadow-sm' : 'hover:border-pink-200'}`}>
                      <input type="radio" name="petType" value={val} checked={petType === val} onChange={() => setPetType(val)} className="sr-only" />
                      <span className="font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{copy.note}</Label>
                <Textarea placeholder={copy.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} className="focus:border-pink-300" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>{copy.back}</Button>
                <Button type="button" className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={() => setStep(4)}>{copy.next} <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 4 && selectedSlot && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100 space-y-3">
                <div className="text-center">
                  <Scissors className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-lg font-bold">{serviceLabel(service as GroomingServiceType)}</p>
                  <p className="text-3xl font-extrabold text-gradient mt-1">{selectedPrice}&euro;</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <Calendar className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="font-medium">{format(new Date(selectedSlot.date + 'T00:00'), isEn ? 'MMMM d, yyyy' : 'd. MMMM yyyy.', { locale })}</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <Clock className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="font-medium">{selectedSlot.start_time.slice(0, 5)} — {selectedSlot.end_time.slice(0, 5)}</p>
                  </div>
                </div>
                {petName && (
                  <div className="bg-white/70 rounded-lg p-3 text-center text-sm">
                    <PawPrint className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="font-medium">{petName} ({petType === 'pas' ? copy.dog : copy.cat})</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">{copy.firstConfirm}</p>
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{copy.whatNext}</p>
                <p>{copy.next1}</p>
                <p>{copy.next2}</p>
                <p>{copy.next3}</p>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)}>{copy.back}</Button>
                <Button type="button" className="flex-1 bg-pink-500 hover:bg-pink-600 btn-hover" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{copy.sending}</> : copy.send}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
