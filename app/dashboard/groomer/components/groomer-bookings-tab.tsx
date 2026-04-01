import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CheckCircle2, Loader2, Scissors, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GROOMING_SERVICE_LABELS,
  GROOMER_BOOKING_STATUS_LABELS,
  GROOMER_BOOKING_STATUS_COLORS,
} from '@/lib/types';
import type { GroomerBookingsTabProps, GroomerBookingStatus, GroomingServiceType } from './groomer-dashboard-types';

export function GroomerBookingsTab({ bookings, updatingId, onUpdateStatus }: GroomerBookingsTabProps) {
  if (bookings.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <Scissors className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">Nemate nadolazećih rezervacija.</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
                    onClick={() => onUpdateStatus(booking.id, 'confirmed')}
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
                    onClick={() => onUpdateStatus(booking.id, 'rejected')}
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
  );
}
