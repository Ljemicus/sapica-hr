'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, eachDayOfInterval, isWeekend } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  Scissors, Calendar, CheckCircle2, XCircle, Clock, Loader2, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  GROOMING_SERVICE_LABELS,
  GROOMER_BOOKING_STATUS_LABELS,
  GROOMER_BOOKING_STATUS_COLORS,
  type Groomer,
  type GroomerBooking,
  type GroomerAvailabilitySlot,
  type GroomingServiceType,
  type GroomerBookingStatus,
} from '@/lib/types';

interface Props {
  groomer: Groomer;
  bookings: GroomerBooking[];
  availability: GroomerAvailabilitySlot[];
}

export function GroomerDashboardContent({ groomer, bookings, availability }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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
        body: JSON.stringify({ status }),
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
          <Scissors className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Groomer Dashboard</h1>
          <p className="text-muted-foreground text-sm">{groomer.name} — {groomer.city}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
            <p className="text-xs text-muted-foreground">Na čekanju</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{upcomingBookings.length}</p>
            <p className="text-xs text-muted-foreground">Potvrđeni</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{availability.length}</p>
            <p className="text-xs text-muted-foreground">Slobodnih termina</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
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
        </TabsList>

        {/* ── Bookings Tab ── */}
        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Scissors className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Nemate nadolazećih rezervacija.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {GROOMING_SERVICE_LABELS[booking.service as GroomingServiceType] || booking.service}
                          </span>
                          <Badge className={`text-[10px] ${GROOMER_BOOKING_STATUS_COLORS[booking.status as GroomerBookingStatus]}`}>
                            {GROOMER_BOOKING_STATUS_LABELS[booking.status as GroomerBookingStatus] || booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          <p>
                            📅 {format(new Date(booking.date + 'T00:00'), 'd. MMMM yyyy.', { locale: hr })} —{' '}
                            {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                          </p>
                          {booking.pet_name && (
                            <p>🐾 {booking.pet_name} ({booking.pet_type === 'macka' ? 'Mačka' : 'Pas'})</p>
                          )}
                          {booking.note && <p className="italic">💬 {booking.note}</p>}
                          <p className="font-medium text-orange-600">💰 {booking.price}€</p>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 h-8"
                            disabled={updatingId === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          >
                            {updatingId === booking.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            disabled={updatingId === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Availability Tab ── */}
        <TabsContent value="availability">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upravljanje rasporedom</CardTitle>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleGenerateSlots}
                  disabled={generatingSlots}
                >
                  {generatingSlots ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Primijeni radne sate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Kliknite &quot;Primijeni radne sate&quot; za dodavanje standardnih termina (Pon-Pet, 09-17h, 1h slotovi) za sljedećih 4 tjedna.
              </p>
            </CardHeader>
            <CardContent>
              {availability.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nemate postavljene termine.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Koristite gumb iznad za generiranje radnog rasporeda.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Group by date */}
                  {Object.entries(
                    availability.reduce<Record<string, typeof availability>>((acc, slot) => {
                      const key = slot.date;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(slot);
                      return acc;
                    }, {})
                  )
                    .slice(0, 14) // Show first 14 days
                    .map(([date, dateSlots]) => (
                      <div key={date}>
                        <p className="font-medium text-sm mb-2 capitalize">
                          {format(new Date(date + 'T00:00'), 'EEEE, d. MMMM', { locale: hr })}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {dateSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium"
                            >
                              {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
