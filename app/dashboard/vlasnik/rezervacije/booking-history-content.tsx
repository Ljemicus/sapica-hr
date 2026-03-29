'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CalendarCheck, Star, RefreshCw, ArrowLeft, Clock, Dog, Cat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';

type FilterTab = 'sve' | 'u_tijeku' | 'zavrsene' | 'otkazane';

interface MockBooking {
  id: string;
  sitterName: string;
  sitterInitial: string;
  petName: string;
  petSpecies: 'dog' | 'cat';
  startDate: string;
  endDate: string;
  status: 'completed' | 'cancelled' | 'accepted';
  price: number;
  serviceType: string;
  hasReview: boolean;
}

const mockBookings: MockBooking[] = [
  { id: '1', sitterName: 'Ana Kovačević', sitterInitial: 'A', petName: 'Rex', petSpecies: 'dog', startDate: '2026-03-15', endDate: '2026-03-18', status: 'accepted', price: 120, serviceType: 'Smještaj', hasReview: false },
  { id: '2', sitterName: 'Marko Novak', sitterInitial: 'M', petName: 'Luna', petSpecies: 'cat', startDate: '2026-03-10', endDate: '2026-03-12', status: 'accepted', price: 60, serviceType: 'Čuvanje u kući', hasReview: false },
  { id: '3', sitterName: 'Ivana Jurić', sitterInitial: 'I', petName: 'Rex', petSpecies: 'dog', startDate: '2026-02-20', endDate: '2026-02-25', status: 'completed', price: 200, serviceType: 'Smještaj', hasReview: true },
  { id: '4', sitterName: 'Tomislav Babić', sitterInitial: 'T', petName: 'Luna', petSpecies: 'cat', startDate: '2026-02-10', endDate: '2026-02-12', status: 'completed', price: 80, serviceType: 'Kratki posjet', hasReview: false },
  { id: '5', sitterName: 'Ana Kovačević', sitterInitial: 'A', petName: 'Rex', petSpecies: 'dog', startDate: '2026-01-15', endDate: '2026-01-20', status: 'completed', price: 250, serviceType: 'Smještaj', hasReview: true },
  { id: '6', sitterName: 'Petra Šimunović', sitterInitial: 'P', petName: 'Rex', petSpecies: 'dog', startDate: '2026-01-05', endDate: '2026-01-06', status: 'cancelled', price: 40, serviceType: 'Šetnja', hasReview: false },
  { id: '7', sitterName: 'Marko Novak', sitterInitial: 'M', petName: 'Luna', petSpecies: 'cat', startDate: '2025-12-20', endDate: '2025-12-27', status: 'completed', price: 280, serviceType: 'Čuvanje u kući', hasReview: true },
  { id: '8', sitterName: 'Luka Perić', sitterInitial: 'L', petName: 'Rex', petSpecies: 'dog', startDate: '2025-12-10', endDate: '2025-12-12', status: 'completed', price: 100, serviceType: 'Dnevna briga', hasReview: false },
  { id: '9', sitterName: 'Ivana Jurić', sitterInitial: 'I', petName: 'Luna', petSpecies: 'cat', startDate: '2025-11-25', endDate: '2025-11-28', status: 'cancelled', price: 120, serviceType: 'Smještaj', hasReview: false },
  { id: '10', sitterName: 'Ana Kovačević', sitterInitial: 'A', petName: 'Rex', petSpecies: 'dog', startDate: '2025-11-10', endDate: '2025-11-15', status: 'completed', price: 200, serviceType: 'Smještaj', hasReview: true },
];

const statusConfig = {
  completed: { label: 'Završeno', color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Otkazano', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  accepted: { label: 'U tijeku', color: 'bg-blue-50 text-blue-700 border-blue-200' },
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

  const filtered = mockBookings.filter((b) => {
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

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nema rezervacija"
          description="Nema rezervacija u ovoj kategoriji."
        />
      ) : (
        <div className="space-y-4 animate-fade-in-up delay-200">
          {filtered.map((booking) => {
            const PetIcon = booking.petSpecies === 'dog' ? Dog : Cat;
            const gradient = sitterGradients[booking.sitterInitial] || 'from-orange-400 to-amber-300';
            return (
              <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow card-hover">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold`}>
                        {booking.sitterInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold">{booking.sitterName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <PetIcon className="h-3.5 w-3.5" />
                            {booking.petName} · {booking.serviceType}
                          </p>
                        </div>
                        <Badge className={`${statusConfig[booking.status].color} border flex-shrink-0`}>
                          {statusConfig[booking.status].label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(booking.startDate), 'd. MMM', { locale: hr })} — {format(new Date(booking.endDate), 'd. MMM yyyy.', { locale: hr })}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="font-bold text-lg text-orange-500">{booking.price}€</span>
                        <div className="flex gap-2">
                          <Link href="/pretraga">
                            <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Ponovi rezervaciju
                            </Button>
                          </Link>
                          {booking.status === 'completed' && !booking.hasReview && (
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
