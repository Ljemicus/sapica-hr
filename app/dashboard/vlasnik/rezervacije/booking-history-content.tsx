'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CalendarCheck, Star, RefreshCw, ArrowLeft, Clock, Dog, Cat, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { createClient } from '@/lib/supabase/client';
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

export function BookingHistoryContent() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('sve');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchBookings() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('bookings')
          .select('id, start_date, end_date, status, total_price, service_type, sitter:users!sitter_id(name), pet:pets(name, species)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setBookings(data as unknown as BookingRow[]);
        }
      } catch {
        // silently fail — empty state shown
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user?.id]);

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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-in-up delay-100 flex-wrap">
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
        <div className="space-y-4 animate-fade-in-up delay-200">
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
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Ponovi rezervaciju
                            </Button>
                          </Link>
                          {booking.status === 'completed' && (
                            <Link href="/dashboard/vlasnik">
                              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 btn-hover">
                                <Star className="h-3.5 w-3.5 mr-1" /> Ostavi recenziju
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
    </div>
  );
}
