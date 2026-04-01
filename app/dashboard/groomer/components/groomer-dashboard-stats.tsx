import { Card, CardContent } from '@/components/ui/card';
import type { GroomerStatsProps } from './groomer-dashboard-types';

export function GroomerDashboardStats({ pendingBookingsCount, upcomingBookingsCount, availabilityCount }: GroomerStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingBookingsCount}</p>
          <p className="text-xs text-muted-foreground">Na čekanju</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{upcomingBookingsCount}</p>
          <p className="text-xs text-muted-foreground">Potvrđeni</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{availabilityCount}</p>
          <p className="text-xs text-muted-foreground">Slobodnih termina</p>
        </CardContent>
      </Card>
    </div>
  );
}
