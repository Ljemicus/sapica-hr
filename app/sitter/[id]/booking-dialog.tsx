'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { bookingSchema, type BookingInput } from '@/lib/validations';
import { SERVICE_LABELS, type SitterProfile, type User, type Pet, type ServiceType } from '@/lib/types';
import { toast } from 'sonner';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: SitterProfile & { user: User };
  userId: string;
}

export function BookingDialog({ open, onOpenChange, profile, userId }: BookingDialogProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      sitter_id: profile.user_id,
    },
  });

  const selectedService = watch('service_type');
  const startDate = watch('start_date');
  const endDate = watch('end_date');


  useEffect(() => {
    const fetchPets = async () => {
      const { data } = await supabase.from('pets').select('*').eq('owner_id', userId);
      setPets(data || []);
    };
    fetchPets();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase is a stable client ref
  }, [userId]);

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
    const totalPrice = calculatePrice();

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
      toast.error('Greška pri kreiranju rezervacije');
      setLoading(false);
      return;
    }

    toast.success('Rezervacija poslana! Čekajte potvrdu od sittera.');
    onOpenChange(false);
    router.push('/dashboard/vlasnik');
    router.refresh();
  };

  const steps = [
    { num: 1, label: 'Usluga' },
    { num: 2, label: 'Detalji' },
    { num: 3, label: 'Potvrda' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rezerviraj uslugu</DialogTitle>
          <DialogDescription>
            Kod sittera: {profile.user?.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
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
                <Label>Ljubimac</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
                  {...register('pet_id')}
                >
                  <option value="">Odaberite ljubimca</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species === 'dog' ? 'Pas' : pet.species === 'cat' ? 'Mačka' : 'Ostalo'})
                    </option>
                  ))}
                </select>
                {errors.pet_id && <p className="text-sm text-red-500">{errors.pet_id.message}</p>}
                {pets.length === 0 && (
                  <p className="text-xs text-muted-foreground bg-amber-50 rounded-lg p-2">
                    Nemate dodanih ljubimaca. Dodajte ih u nadzornoj ploči.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Usluga</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
                  {...register('service_type')}
                >
                  <option value="">Odaberite uslugu</option>
                  {profile.services.map((service) => (
                    <option key={service} value={service}>
                      {SERVICE_LABELS[service]} — {profile.prices[service]}&euro;
                    </option>
                  ))}
                </select>
                {errors.service_type && <p className="text-sm text-red-500">{errors.service_type.message}</p>}
              </div>

              <Button type="button" className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => setStep(2)}>
                Dalje <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Početak</Label>
                  <Input type="date" {...register('start_date')} min={new Date().toISOString().split('T')[0]} className="focus:border-orange-300" />
                  {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Završetak</Label>
                  <Input type="date" {...register('end_date')} min={startDate || new Date().toISOString().split('T')[0]} className="focus:border-orange-300" />
                  {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Napomena (opcionalno)</Label>
                <Textarea placeholder="Posebne upute ili informacije za sittera..." {...register('note')} className="focus:border-orange-300" />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Natrag
                </Button>
                <Button type="button" className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={() => setStep(3)}>
                  Dalje <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {selectedService && startDate && endDate && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 text-center border border-orange-100">
                  <p className="text-sm text-muted-foreground mb-1">Ukupna cijena</p>
                  <p className="text-4xl font-extrabold text-gradient">{calculatePrice()}&euro;</p>
                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                    <p>{SERVICE_LABELS[selectedService as ServiceType]}</p>
                    <p>{startDate} — {endDate}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Natrag
                </Button>
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
                  {loading ? 'Šaljem...' : 'Pošalji zahtjev'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
