import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Loader2, Scissors, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { GROOMING_SERVICE_LABELS, GROOMING_STATUS_CONFIG } from './booking-history-constants';
import type { GroomingBookingRow } from './booking-history-types';

interface Props {
  groomingLoading: boolean;
  groomingBookings: GroomingBookingRow[];
  cancellingId: string | null;
  onCancelGrooming: (bookingId: string) => void;
}

export function BookingHistoryGroomingTab({ groomingLoading, groomingBookings, cancellingId, onCancelGrooming }: Props) {
  if (groomingLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (groomingBookings.length === 0) {
    return <EmptyState icon={Scissors} title="Nema grooming termina" description="Još niste rezervirali grooming uslugu." />;
  }

  return (
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
                    <span className="font-semibold">{GROOMING_SERVICE_LABELS[gb.service] || gb.service}</span>
                    <Badge className={`text-[10px] ${gStatus.color} border`}>
                      {gStatus.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    {gb.groomer && <p>✂️ {gb.groomer.name} — {gb.groomer.city}</p>}
                    <p>
                      📅 {format(new Date(gb.date + 'T00:00'), 'd. MMMM yyyy.', { locale: hr })} — {gb.start_time.slice(0, 5)} - {gb.end_time.slice(0, 5)}
                    </p>
                    {gb.pet_name && <p>🐾 {gb.pet_name} ({gb.pet_type === 'macka' ? 'Mačka' : 'Pas'})</p>}
                    <p className="font-medium text-orange-600">💰 {gb.price}€</p>
                  </div>
                </div>
                {canCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex-shrink-0"
                    disabled={cancellingId === gb.id}
                    onClick={() => onCancelGrooming(gb.id)}
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
  );
}
