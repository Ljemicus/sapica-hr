'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, PawPrint } from 'lucide-react';
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
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BookingInput>({
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

    const { error } = await supabase.from('bookings').insert({
      owner_id: userId,
      sitter_id: data.sitter_id,
      pet_id: data.pet_id,
      service_type: data.service_type,
      start_date: data.start_date,
      end_date: data.end_date,
      total_price: totalPrice,
      note: data.note || null,
      status: 'pending',
    });

    if (error) {
      toast.error('Greška pri kreiranju rezervacije');
      setLoading(false);
      return;
    }

    toast.success('Rezervacija poslana! Čekajte potvrdu od sittera.');
    onOpenChange(false);
    router.push('/dashboard/vlasnik');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rezerviraj uslugu</DialogTitle>
          <DialogDescription>
            Kod sittera: {profile.user?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('sitter_id')} />

          <div className="space-y-2">
            <Label>Ljubimac</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <p className="text-xs text-muted-foreground">
                Nemate dodanih ljubimaca. Dodajte ih u nadzornoj ploči.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Usluga</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Početak</Label>
              <Input type="date" {...register('start_date')} min={new Date().toISOString().split('T')[0]} />
              {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Završetak</Label>
              <Input type="date" {...register('end_date')} min={startDate || new Date().toISOString().split('T')[0]} />
              {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Napomena (opcionalno)</Label>
            <Textarea placeholder="Posebne upute ili informacije za sittera..." {...register('note')} />
          </div>

          {selectedService && startDate && endDate && (
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Ukupna cijena</p>
              <p className="text-2xl font-bold text-orange-500">{calculatePrice()}&euro;</p>
            </div>
          )}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {loading ? 'Šaljem zahtjev...' : 'Pošalji zahtjev za rezervaciju'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
