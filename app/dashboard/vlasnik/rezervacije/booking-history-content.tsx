'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CalendarCheck, Star, RefreshCw, ArrowLeft, Clock, Dog, Cat, Loader2, Scissors, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/contexts/auth-context';

type FilterTab = 'sve' | 'u_tijeku' | 'zavrsene' | 'otkazane';

interface BookingRow {
  id: string;
  start_date: string;
  end_date: string;
  status: 'completed' | 'cancelled' | 'accepted' | 'pending' | 'rejected';
  total_price: number;
  service_type: string;
  sitter: { name: string } | null;
  pet: { name: string; species: string } | null;
  has_review?: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: 'Završeno', color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  accepted: { label: 'U tijeku', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  pending: { label: 'Na čekanju', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rejected: { label: 'Odbijeno', color: 'bg-red-50 text-red-700 border-red-200' },
};

const SERVICE_LABELS: Record<string, string> = {
  boarding: 'Smještaj',
  house_sitting: 'Čuvanje u kući',
  drop_in: 'Kratki posjet',
  dog_walking: 'Šetnja',
  day_care: 'Dnevna briga',
};

const sitterGradients: Record<string, string> = {
  A: 'from-orange-400 to-amber-300',
  M: 'from-teal-400 to-cyan-300',
  I: 'from-purple-400 to-pink-300',
  T: 'from-blue-400 to-indigo-300',
  P: 'from-rose-400 to-pink-300',
  L: 'from-green-400 to-emerald-300',
};

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'sve', label: 'Sve' },
  { key: 'u_tijeku', label: 'U tijeku' },
  { key: 'zavrsene', label: 'Završene' },
  { key: 'otkazane', label: 'Otkazane' },
];

interface GroomingBookingRow {
  id: string;
  groomer_id: string;
  service: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  pet_name: string | null;
  pet_type: string | null;
  note: string | null;
  groomer?: { name: string; city: string } | null;
}

const GROOMING_SERVICE_LABELS: Record<string, string> = {
  sisanje: 'Šišanje',
  kupanje: 'Kupanje',
  trimanje: 'Trimanje',
  nokti: 'Nokti',
  cetkanje: 'Četkanje',
};

const GROOMING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Na čekanju', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Potvrđeno', color: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Odbijeno', color: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Završeno', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

export function BookingHistoryContent() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('sve');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [groomingBookings, setGroomingBookings] = useState<GroomingBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [groomingLoading, setGroomingLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch sitting bookings
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
          setBookings(Array.isArray(data) ? data as BookingRow[] : []);
        }
      } catch {
        // silently fail — empty state shown
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user?.id]);

  // Fetch grooming bookings
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
        setGroomingBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
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
            {groomingBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length > 0 && (
              <Badge className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0">
                {groomingBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Sitting Tab ── */}
        <TabsContent value="sitting">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {filterTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeFilter === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(tab.key)}
                className={activeFilter === tab.key ? 'bg-orange-500 hover:bg-orange-600' : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="Nema rezervacija"
              description="Nema rezervacija u ovoj kategoriji."
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((booking) => {
                const petSpecies = booking.pet?.species || 'dog';
                const PetIcon = petSpecies === 'dog' ? Dog : Cat;
                const sitterInitial = booking.sitter?.name?.charAt(0) || '?';
                const gradient = sitterGradients[sitterInitial] || 'from-orange-400 to-amber-300';
                const status = statusConfig[booking.status] || statusConfig.pending;
                return (
                  <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow card-hover">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold`}>
                            {sitterInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <h3 className="font-semibold">{booking.sitter?.name || 'Nepoznato'}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <PetIcon className="h-3.5 w-3.5" />
                                {booking.pet?.name || 'Nepoznato'} · {SERVICE_LABELS[booking.service_type] || booking.service_type}
                              </p>
                            </div>
                            <Badge className={`${status.color} border flex-shrink-0`}>
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <span className="font-bold text-lg text-orange-500">{booking.total_price}€</span>
                            <div className="flex gap-2">
                              <Link href="/pretraga">
                                <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Ponovi
                                </Button>
                              </Link>
                              {booking.status === 'completed' && (
                                <Link href="/dashboard/vlasnik">
                                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 btn-hover">
                                    <Star className="h-3.5 w-3.5 mr-1" /> Recenzija
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Grooming Tab ── */}
        <TabsContent value="grooming">
          {groomingLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : groomingBookings.length === 0 ? (
            <EmptyState
              icon={Scissors}
              title="Nema grooming termina"
              description="Još niste rezervirali grooming uslugu."
            />
          ) : (
            <div className="space-y-3">
              {groomingBookings.map((gb) => {
                const gStatus = GROOMING_STATUS_CONFIG[gb.status] || GROOMING_STATUS_CONFIG.pending;
                const canCancel = gb.status === 'pending' || gb.status === 'confirmed';
                return (
                  <Card key={gb.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Scissors className="h-4 w-4 text-pink-500" />
                            <span className="font-semibold">
                              {GROOMING_SERVICE_LABELS[gb.service] || gb.service}
                            </span>
                            <Badge className={`text-[10px] ${gStatus.color} border`}>
                              {gStatus.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-0.5">
                            {gb.groomer && (
                              <p>✂️ {gb.groomer.name} — {gb.groomer.city}</p>
                            )}
                            <p>
                              📅 {format(new Date(gb.date + 'T00:00'), 'd. MMMM yyyy.', { locale: hr })} —{' '}
                              {gb.start_time.slice(0, 5)} - {gb.end_time.slice(0, 5)}
                            </p>
                            {gb.pet_name && (
                              <p>🐾 {gb.pet_name} ({gb.pet_type === 'macka' ? 'Mačka' : 'Pas'})</p>
                            )}
                            <p className="font-medium text-orange-600">💰 {gb.price}€</p>
                          </div>
                        </div>
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex-shrink-0"
                            disabled={cancellingId === gb.id}
                            onClick={() => handleCancelGrooming(gb.id)}
                          >
                            {cancellingId === gb.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Otkaži
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
