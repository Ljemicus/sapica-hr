'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck, Dog, Scissors } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { BookingHistorySittingTab } from './components/booking-history-sitting-tab';
import { BookingHistoryGroomingTab } from './components/booking-history-grooming-tab';
import type { BookingRow, FilterTab, GroomingBookingRow } from './components/booking-history-types';

export function BookingHistoryContent() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('sve');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [groomingBookings, setGroomingBookings] = useState<GroomingBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [groomingLoading, setGroomingLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchBookings() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/bookings?fields=owner-history', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setBookings(Array.isArray(data) ? (data as BookingRow[]) : []);
        }
      } catch {
        // silently fail — empty state shown
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user?.id]);

  useEffect(() => {
    async function fetchGroomingBookings() {
      if (!user?.id) {
        setGroomingLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/groomer-bookings');
        if (res.ok) {
          const data = await res.json();
          setGroomingBookings(Array.isArray(data) ? data : []);
        }
      } catch {
        // silently fail
      } finally {
        setGroomingLoading(false);
      }
    }
    fetchGroomingBookings();
  }, [user?.id]);

  const handleCancelGrooming = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/groomer-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        toast.success('Termin otkazan');
        setGroomingBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
      } else {
        toast.error('Greška pri otkazivanju');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeFilter === 'sve') return true;
    if (activeFilter === 'u_tijeku') return b.status === 'accepted';
    if (activeFilter === 'zavrsene') return b.status === 'completed';
    if (activeFilter === 'otkazane') return b.status === 'cancelled';
    return true;
  });

  const activeGroomingCount = groomingBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 animate-fade-in-up">
        <Link href="/dashboard/vlasnik" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
        </Link>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
            <CalendarCheck className="h-5 w-5 text-white" />
          </div>
          Rezervacije
        </h1>
        <p className="text-muted-foreground mt-1">Pregled svih vaših rezervacija</p>
      </div>

      <Tabs defaultValue="sitting" className="animate-fade-in-up delay-100">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="sitting" className="flex items-center gap-1.5">
            <Dog className="h-4 w-4" />
            Čuvanje
          </TabsTrigger>
          <TabsTrigger value="grooming" className="flex items-center gap-1.5">
            <Scissors className="h-4 w-4" />
            Grooming
            {activeGroomingCount > 0 && (
              <Badge className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0">{activeGroomingCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sitting">
          <BookingHistorySittingTab
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            loading={loading}
            filteredBookings={filtered}
          />
        </TabsContent>

        <TabsContent value="grooming">
          <BookingHistoryGroomingTab
            groomingLoading={groomingLoading}
            groomingBookings={groomingBookings}
            cancellingId={cancellingId}
            onCancelGrooming={handleCancelGrooming}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
