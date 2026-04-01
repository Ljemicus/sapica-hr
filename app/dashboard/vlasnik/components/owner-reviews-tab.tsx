import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';
import type { OwnerDashboardBooking } from './owner-dashboard-types';

interface Props {
  unreviewedBookings: OwnerDashboardBooking[];
  onReview: (booking: OwnerDashboardBooking) => void;
}

export function OwnerReviewsTab({ unreviewedBookings, onReview }: Props) {
  if (unreviewedBookings.length === 0) {
    return <EmptyState icon={Star} title="Sve je recenzirano!" description="Nemate završenih rezervacija koje čekaju recenziju." />;
  }

  return (
    <div className="space-y-3">
      {unreviewedBookings.map((booking) => (
        <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={booking.sitter?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{booking.sitter?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{booking.sitter?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.start_date), 'd. MMM yyyy.', { locale: hr })}
                  </p>
                </div>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 btn-hover" size="sm" onClick={() => onReview(booking)}>
                <Star className="h-4 w-4 mr-1" /> Ocijeni
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
