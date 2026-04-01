import Link from 'next/link';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CalendarCheck, Cat, Clock, Dog, Loader2, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { SERVICE_LABELS } from '@/lib/types';
import { filterTabs, sitterGradients, statusConfig } from './booking-history-constants';
import type { BookingRow, FilterTab } from './booking-history-types';

interface Props {
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  loading: boolean;
  filteredBookings: BookingRow[];
}

export function BookingHistorySittingTab({ activeFilter, onFilterChange, loading, filteredBookings }: Props) {
  return (
    <>
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeFilter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(tab.key)}
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
      ) : filteredBookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Nema rezervacija" description="Nema rezervacija u ovoj kategoriji." />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
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
                            {booking.pet?.name || 'Nepoznato'} · {SERVICE_LABELS[booking.service_type as keyof typeof SERVICE_LABELS] || booking.service_type}
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
    </>
  );
}
