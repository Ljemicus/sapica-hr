'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { bookingSchema, type BookingInput } from '@/lib/validations';
import { SERVICE_LABELS, type SitterProfile, type User, type Pet, type ServiceType } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';
import { translateFormError } from '@/lib/i18n/form-errors';
import { toast } from 'sonner';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SitterProfile & { user: User };
  userId?: string;
  pets: Pet[];
}

const SERVICE_LABELS_EN: Record<ServiceType, string> = {
  boarding: 'Overnight stay',
  walking: 'Dog walking',
  'house-sitting': 'House sitting',
  'drop-in': 'Drop-in visit',
  daycare: 'Day care',
};

export function BookingDialog({ open, onOpenChange, profile, userId: _userId, pets }: BookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const serviceLabel = (service: ServiceType) => (isEn ? SERVICE_LABELS_EN[service] : SERVICE_LABELS[service]);

  const copy = {
    submitError: isEn ? 'We could not send your request. Please try again.' : 'Nismo uspjeli poslati upit. Pokušajte ponovno.',
    submitSuccess: isEn ? 'Your request has been sent. The sitter now needs to confirm it.' : 'Upit je poslan. Sitter ga sada treba potvrditi.',
    networkError: isEn ? 'Network error. Check your internet connection.' : 'Mrežna greška. Provjerite internetsku vezu.',
    steps: isEn ? ['Selection', 'Details', 'Send'] : ['Odabir', 'Detalji', 'Slanje'],
    title: isEn ? 'Send booking request' : 'Pošalji upit za rezervaciju',
    description: isEn
      ? `You are sending a request to sitter ${profile.user?.name}. The booking is confirmed only after approval, and you can also finalize details in messages.`
      : `Šaljete upit sitteru ${profile.user?.name}. Termin vrijedi tek nakon potvrde, a detalje možete dogovoriti i kroz poruke.`,
    pet: isEn ? 'Pet' : 'Ljubimac',
    choosePet: isEn ? 'Choose a pet' : 'Odaberi ljubimca',
    noPets: isEn ? 'You do not have any pets added yet. Add a pet in your profile first, then come back here.' : 'Nemate dodanih ljubimaca. Prvo dodajte ljubimca u svom profilu pa se vratite ovdje.',
    service: isEn ? 'Service' : 'Usluga',
    chooseService: isEn ? 'Choose a service' : 'Odaberi uslugu',
    next: isEn ? 'Next' : 'Dalje',
    startDate: isEn ? 'Start date' : 'Datum početka',
    endDate: isEn ? 'End date' : 'Datum završetka',
    note: isEn ? 'Note for the sitter (optional)' : 'Napomena za sittera (opcionalno)',
    notePlaceholder: isEn ? 'E.g. routine, medication, habits, special instructions...' : 'Npr. rutina, lijekovi, navike, posebne upute...',
    back: isEn ? 'Back' : 'Natrag',
    estimatedTotal: isEn ? 'Estimated total price' : 'Procjena ukupne cijene',
    finalConfirmation: isEn ? 'The sitter gives the final confirmation for the booking' : 'Konačnu potvrdu termina daje sitter',
    whatNext: isEn ? 'What happens after you send it?' : 'Što slijedi nakon slanja?',
    next1: isEn ? '1. The sitter receives your request.' : '1. Sitter prima vaš upit.',
    next2: isEn ? '2. You confirm the details and timing together.' : '2. Potvrđujete detalje i termin.',
    next3: isEn ? '3. The booking appears on your dashboard.' : '3. Rezervacija postaje vidljiva na vašem dashboardu.',
    sending: isEn ? 'Sending request...' : 'Šaljem upit...',
    submit: isEn ? 'Send request' : 'Pošalji upit',
  };

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      sitter_id: profile.user_id,
    },
  });

  const selectedService = watch('service_type');
  const startDate = watch('start_date');
  const endDate = watch('end_date');

  const calculatePrice = () => {
    if (!selectedService || !startDate || !endDate) return 0;
    const price = profile.prices[selectedService as ServiceType] || 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return price * days;
  };

  const onSubmit = async (data: BookingInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sitter_id: data.sitter_id,
          pet_id: data.pet_id,
          service_type: data.service_type,
          start_date: data.start_date,
          end_date: data.end_date,
          note: data.note || null,
        }),
      });

      if (!response.ok) {
        toast.error(copy.submitError);
        return;
      }

      toast.success(copy.submitSuccess);
      onOpenChange(false);
      router.push('/dashboard/vlasnik');
      router.refresh();
    } catch {
      toast.error(copy.networkError);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: copy.steps[0] },
    { num: 2, label: copy.steps[1] },
    { num: 3, label: copy.steps[2] },
  ];

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
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step >= s.num ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('sitter_id')} />

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>{copy.pet}</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
                  {...register('pet_id')}
                >
                  <option value="">{copy.choosePet}</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species === 'dog' ? (isEn ? 'Dog' : 'Pas') : pet.species === 'cat' ? (isEn ? 'Cat' : 'Mačka') : (isEn ? 'Other' : 'Ostalo')})
                    </option>
                  ))}
                </select>
                {errors.pet_id && <p className="text-sm text-red-500">{translateFormError(errors.pet_id.message, language)}</p>}
                {pets.length === 0 && (
                  <p className="text-xs text-muted-foreground bg-amber-50 rounded-lg p-2">
                    {copy.noPets}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{copy.service}</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
                  {...register('service_type')}
                >
                  <option value="">{copy.chooseService}</option>
                  {profile.services.map((service) => (
                    <option key={service} value={service}>
                      {serviceLabel(service)} — {profile.prices[service]}&euro;
                    </option>
                  ))}
                </select>
                {errors.service_type && <p className="text-sm text-red-500">{translateFormError(errors.service_type.message, language)}</p>}
              </div>

              <Button type="button" className="w-full bg-orange-500 hover:bg-orange-600" onClick={async () => {
                const valid = await trigger(['pet_id', 'service_type']);
                if (valid) setStep(2);
              }}>
                {copy.next} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{copy.startDate}</Label>
                  <Input type="date" {...register('start_date')} min={new Date().toISOString().split('T')[0]} className="focus:border-orange-300" />
                  {errors.start_date && <p className="text-sm text-red-500">{translateFormError(errors.start_date.message, language)}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{copy.endDate}</Label>
                  <Input type="date" {...register('end_date')} min={startDate || new Date().toISOString().split('T')[0]} className="focus:border-orange-300" />
                  {errors.end_date && <p className="text-sm text-red-500">{translateFormError(errors.end_date.message, language)}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{copy.note}</Label>
                <Textarea placeholder={copy.notePlaceholder} {...register('note')} className="focus:border-orange-300" />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  {copy.back}
                </Button>
                <Button type="button" className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={async () => {
                  const valid = await trigger(['start_date', 'end_date']);
                  if (valid) setStep(3);
                }}>
                  {copy.next} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {selectedService && startDate && endDate && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 text-center border border-orange-100">
                  <p className="text-sm text-muted-foreground mb-1">{copy.estimatedTotal}</p>
                  <p className="text-4xl font-extrabold text-gradient">{calculatePrice()}&euro;</p>
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>{serviceLabel(selectedService as ServiceType)}</p>
                    <p>{startDate} — {endDate}</p>
                    <p>{copy.finalConfirmation}</p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{copy.whatNext}</p>
                <p>{copy.next1}</p>
                <p>{copy.next2}</p>
                <p>{copy.next3}</p>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  {copy.back}
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
                  {loading ? copy.sending : copy.submit}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
