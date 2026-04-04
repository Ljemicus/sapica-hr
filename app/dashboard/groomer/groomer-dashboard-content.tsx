'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, eachDayOfInterval, isWeekend } from 'date-fns';
import { Calendar, Clock, Scissors, UserPen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { type GroomerBookingStatus } from '@/lib/types';
import { GroomerDashboardStats } from './components/groomer-dashboard-stats';
import { GroomerBookingsTab } from './components/groomer-bookings-tab';
import { GroomerAvailabilityTab } from './components/groomer-availability-tab';
import { GroomerProfileTab } from './components/groomer-profile-tab';
import type { GroomerDashboardProps } from './components/groomer-dashboard-types';

export function GroomerDashboardContent({ groomer, bookings, availability }: GroomerDashboardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');

  const handleStatusUpdate = async (bookingId: string, status: GroomerBookingStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/groomer-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, groomerId: groomer.id }),
      });
      if (res.ok) {
        toast.success(status === 'confirmed' ? 'Termin potvrđen! ✅' : 'Termin odbijen.');
        startTransition(() => router.refresh());
      } else {
        toast.error('Greška pri ažuriranju');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateSlots = async () => {
    setGeneratingSlots(true);
    try {
      const days = eachDayOfInterval({
        start: new Date(),
        end: addDays(new Date(), 28),
      }).filter((d) => !isWeekend(d));

      const slots = days.flatMap((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return [
          { date: dateStr, start_time: '09:00', end_time: '10:00' },
          { date: dateStr, start_time: '10:00', end_time: '11:00' },
          { date: dateStr, start_time: '11:00', end_time: '12:00' },
          { date: dateStr, start_time: '13:00', end_time: '14:00' },
          { date: dateStr, start_time: '14:00', end_time: '15:00' },
          { date: dateStr, start_time: '15:00', end_time: '16:00' },
          { date: dateStr, start_time: '16:00', end_time: '17:00' },
        ];
      });

      const res = await fetch('/api/groomer-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groomer_id: groomer.id, slots }),
      });

      if (res.ok) {
        toast.success(`${slots.length} termina dodano! 📅`, {
          description: 'Pon-Pet, 09:00-17:00, sljedećih 4 tjedna',
        });
        startTransition(() => router.refresh());
      } else {
        toast.error('Greška pri generiranju termina');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setGeneratingSlots(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
          <Scissors className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Groomer Dashboard</h1>
          <p className="text-muted-foreground text-sm">{groomer.name} — {groomer.city}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-r from-pink-50 to-rose-50 p-4 mb-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Što traži pažnju?</p>
            <p className="text-sm text-muted-foreground">Potvrdite nove termine, održavajte raspored punim i provjerite kako vaš profil izgleda novim klijentima.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{pendingBookings.length} na čekanju</span>
            <span>•</span>
            <span>{upcomingBookings.length} potvrđenih</span>
            <span>•</span>
            <span>{availability.length} otvorenih slotova</span>
          </div>
        </div>
      </div>

      <GroomerDashboardStats
        pendingBookingsCount={pendingBookings.length}
        upcomingBookingsCount={upcomingBookings.length}
        availabilityCount={availability.length}
      />

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings" className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Termini
            {pendingBookings.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Raspored
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1.5">
            <UserPen className="h-4 w-4" />
            Profil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <GroomerBookingsTab
            bookings={bookings}
            updatingId={updatingId}
            onUpdateStatus={handleStatusUpdate}
          />
        </TabsContent>

        <TabsContent value="availability">
          <GroomerAvailabilityTab
            availability={availability}
            generatingSlots={generatingSlots}
            onGenerateSlots={handleGenerateSlots}
          />
        </TabsContent>

        <TabsContent value="profile">
          <GroomerProfileTab
            groomer={groomer}
            onProfileUpdated={() => startTransition(() => router.refresh())}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
