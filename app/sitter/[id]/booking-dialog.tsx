'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
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
    steps: isEn ? ['Select', 'Details', 'Confirm'] : ['Odabir', 'Detalji', 'Potvrda'],
    title: isEn ? 'Book this sitter' : 'Rezerviraj sittera',
    description: isEn
      ? `Send a booking request to ${(profile as any).name || profile.user?.name}. The booking is confirmed only after approval.`
      : `Pošaljite upit sitteru ${(profile as any).name || profile.user?.name}. Termin vrijedi tek nakon potvrde.`,
    pet: isEn ? 'Pet' : 'Ljubimac',
    choosePet: isEn ? 'Choose a pet' : 'Odaberi ljubimca',
    noPets: isEn ? 'You do not have any pets added yet. Add a pet in your profile first, then come back here.' : 'Nemate dodanih ljubimaca. Prvo dodajte ljubimca u svom profilu pa se vratite ovdje.',
    service: isEn ? 'Service' : 'Usluga',
    chooseService: isEn ? 'Choose a service' : 'Odaberi uslugu',
    next: isEn ? 'Continue' : 'Nastavi',
    startDate: isEn ? 'Start date' : 'Datum početka',
    endDate: isEn ? 'End date' : 'Datum završetka',
    note: isEn ? 'Note for the sitter (optional)' : 'Napomena za sittera (opcionalno)',
    notePlaceholder: isEn ? 'E.g. routine, medication, habits, special instructions...' : 'Npr. rutina, lijekovi, navike, posebne upute...',
    back: isEn ? 'Back' : 'Natrag',
    estimatedTotal: isEn ? 'Estimated total' : 'Procjena ukupne cijene',
    finalConfirmation: isEn ? 'The sitter gives the final confirmation' : 'Konačnu potvrdu daje sitter',
    whatNext: isEn ? 'What happens next?' : 'Što slijedi?',
    next1: isEn ? 'The sitter receives your request.' : 'Sitter prima vaš upit.',
    next2: isEn ? 'You confirm the details together.' : 'Potvrđujete detalje zajedno.',
    next3: isEn ? 'The booking appears on your dashboard.' : 'Rezervacija se pojavljuje na dashboardu.',
    sending: isEn ? 'Sending...' : 'Šaljem...',
    submit: isEn ? 'Send request' : 'Pošalji upit',
  };

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      sitter_id: (profile as any).id,
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
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header with warm gradient */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/30 dark:via-amber-950/20 dark:to-card px-6 pt-6 pb-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-extrabold font-[var(--font-heading)]">{copy.title}</DialogTitle>
            <DialogDescription className="text-sm mt-1">{copy.description}</DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1 mt-4">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  step >= s.num
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}>
                  {step > s.num ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step >= s.num ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>{s.num}</span>
                  )}
                  {s.label}
                </div>
                {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 pt-4 space-y-4">
          <input type="hidden" {...register('sitter_id')} />

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{copy.pet}</Label>
                <select
                  className="premium-select"
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
                  <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
                    {copy.noPets}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{copy.service}</Label>
                <select
                  className="premium-select"
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

              <Button
                type="button"
                className="w-full bg-orange-500 hover:bg-orange-600 btn-hover rounded-full h-12 font-bold"
                onClick={async () => {
                  const valid = await trigger(['pet_id', 'service_type']);
                  if (valid) setStep(2);
                }}
              >
                {copy.next} <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{copy.startDate}</Label>
                  <Input type="date" {...register('start_date')} min={new Date().toISOString().split('T')[0]} className="rounded-xl h-11 focus:border-orange-300" />
                  {errors.start_date && <p className="text-sm text-red-500">{translateFormError(errors.start_date.message, language)}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{copy.endDate}</Label>
                  <Input type="date" {...register('end_date')} min={startDate || new Date().toISOString().split('T')[0]} className="rounded-xl h-11 focus:border-orange-300" />
                  {errors.end_date && <p className="text-sm text-red-500">{translateFormError(errors.end_date.message, language)}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{copy.note}</Label>
                <Textarea placeholder={copy.notePlaceholder} {...register('note')} className="rounded-xl focus:border-orange-300 min-h-[80px]" />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-full h-12 font-semibold" onClick={() => setStep(1)}>
                  {copy.back}
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover rounded-full h-12 font-bold"
                  onClick={async () => {
                    const valid = await trigger(['start_date', 'end_date']);
                    if (valid) setStep(3);
                  }}
                >
                  {copy.next} <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {selectedService && startDate && endDate && (
                <div className="rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/20 dark:via-amber-950/10 dark:to-card p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">{copy.estimatedTotal}</p>
                  <p className="text-5xl font-extrabold text-gradient font-[var(--font-heading)]">{calculatePrice()}&euro;</p>
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">{serviceLabel(selectedService as ServiceType)}</p>
                    <p>{startDate} — {endDate}</p>
                    <p className="opacity-70">{copy.finalConfirmation}</p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 p-4 text-sm space-y-2">
                <p className="font-bold text-foreground text-xs uppercase tracking-wider">{copy.whatNext}</p>
                <div className="space-y-1.5 text-muted-foreground text-[13px]">
                  <p className="flex items-start gap-2"><span className="inline-flex h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center text-orange-600 text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>{copy.next1}</p>
                  <p className="flex items-start gap-2"><span className="inline-flex h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center text-orange-600 text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>{copy.next2}</p>
                  <p className="flex items-start gap-2"><span className="inline-flex h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center text-orange-600 text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>{copy.next3}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-full h-12 font-semibold" onClick={() => setStep(2)}>
                  {copy.back}
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover rounded-full h-12 font-bold" disabled={loading}>
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
