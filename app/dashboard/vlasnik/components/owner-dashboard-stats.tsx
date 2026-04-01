import { Calendar, Clock, PawPrint, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  petsCount: number;
  activeBookingsCount: number;
  completedCount: number;
  totalSpent: number;
}

export function OwnerDashboardStats({ petsCount, activeBookingsCount, completedCount, totalSpent }: Props) {
  const stats = [
    { label: 'Ljubimaca', value: petsCount, icon: PawPrint, color: 'from-orange-500 to-amber-500' },
    { label: 'Aktivne rez.', value: activeBookingsCount, icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { label: 'Završene rez.', value: completedCount, icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { label: 'Ukupno potrošeno', value: `${totalSpent}€`, icon: Star, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <Card key={stat.label} className={`border-0 shadow-sm animate-fade-in-up delay-${(i + 1) * 100}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
