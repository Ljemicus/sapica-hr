import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { STATUS_LABELS, SERVICE_LABELS, type ServiceType } from '@/lib/types';
import { statusColors, statusDotColors, type OwnerDashboardBooking } from './owner-dashboard-types';

interface Props {
  bookings: OwnerDashboardBooking[];
  onCancelBooking: (bookingId: string) => void;
}

export function OwnerBookingsTab({ bookings, onCancelBooking }: Props) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nemate rezervacija"
        description="Pretražite sittere i napravite svoju prvu rezervaciju."
        action={<a href="/pretraga"><Button className="bg-orange-500 hover:bg-orange-600 btn-hover">Pretraži sittere</Button></a>}
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="relative flex gap-4">
            <div className="hidden sm:flex flex-col items-center pt-5">
              <div className={`w-3 h-3 rounded-full ${statusDotColors[booking.status]} ring-4 ring-white z-10`} />
            </div>
            <Card className="flex-1 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={booking.sitter?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{booking.sitter?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.sitter?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[booking.status]} border`}>
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-500">{booking.total_price}€</span>
                    {(booking.status === 'pending' || booking.status === 'accepted') && (
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => onCancelBooking(booking.id)}>
                        Otkaži
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
