import { Star, TrendingUp, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SitterProfile } from '@/lib/types';

interface Props {
  profile: SitterProfile | null;
  totalEarnings: number;
  pendingCount: number;
}

export function SitterDashboardStats({ profile, totalEarnings, pendingCount }: Props) {
  const stats = [
    { label: 'Prosječna ocjena', value: profile?.rating_avg?.toFixed(1) || '0.0', icon: Star, color: 'from-amber-500 to-orange-500', suffix: '' },
    { label: 'Recenzija', value: profile?.review_count || 0, icon: Star, color: 'from-blue-500 to-cyan-500', suffix: '' },
    { label: 'Ukupna zarada', value: totalEarnings, icon: TrendingUp, color: 'from-green-500 to-emerald-500', suffix: '€' },
    { label: 'Na čekanju', value: pendingCount, icon: ClipboardList, color: 'from-purple-500 to-pink-500', suffix: '' },
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
                <p className="text-2xl font-bold">{stat.value}{stat.suffix}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
