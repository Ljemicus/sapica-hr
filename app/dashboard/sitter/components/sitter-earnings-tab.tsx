import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SERVICE_LABELS, type Booking, type ServiceType } from '@/lib/types';

interface Props {
  thisMonthEarnings: number;
  totalEarnings: number;
  monthlyEarnings: { month: string; amount: number }[];
  maxEarning: number;
  completedBookings: (Booking & { owner: { name: string; avatar_url: string | null; email: string }; pet: { name: string; species: string; breed: string | null; special_needs: string | null } })[];
}

export function SitterEarningsTab({ thisMonthEarnings, totalEarnings, monthlyEarnings, maxEarning, completedBookings }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Ovaj mjesec</p>
            <p className="text-4xl font-extrabold text-green-600">{thisMonthEarnings}€</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Ukupno</p>
            <p className="text-4xl font-extrabold text-blue-600">{totalEarnings}€</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Zarada po mjesecima</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3 h-40">
            {monthlyEarnings.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{data.amount > 0 ? `${data.amount}€` : ''}</span>
                <div className="w-full relative" style={{ height: '100px' }}>
                  <div
                    className="bar-chart-bar absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500 to-amber-400"
                    style={{ height: `${maxEarning > 0 ? (data.amount / maxEarning) * 100 : 0}%`, minHeight: data.amount > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-xs text-muted-foreground capitalize">{data.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Završene rezervacije</CardTitle>
        </CardHeader>
        <CardContent>
          {completedBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">Nema završenih rezervacija</p>
          ) : (
            <div className="space-y-3">
              {completedBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{booking.owner?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                    </p>
                  </div>
                  <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">+{booking.total_price}€</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
