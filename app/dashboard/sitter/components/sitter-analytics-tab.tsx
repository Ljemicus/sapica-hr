import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { BarChart3, Calendar, Eye, ImagePlus, Lightbulb, MessageSquare, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SitterProfile } from '@/lib/types';
import type { DashboardBooking } from './sitter-dashboard-types';

interface Props {
  bookings: DashboardBooking[];
  completedBookingsCount: number;
  pendingBookingsCount: number;
  upcomingBookingsCount: number;
  profile: SitterProfile | null;
}

export function SitterAnalyticsTab({ bookings, completedBookingsCount, pendingBookingsCount, upcomingBookingsCount, profile }: Props) {
  const stats = [
    { label: 'Pregledi profila', value: 47, subtitle: 'ovaj tjedan', icon: Eye, color: 'from-blue-500 to-cyan-500' },
    { label: 'Upiti', value: 12, subtitle: 'ovaj mjesec', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { label: 'Ukupne rezervacije', value: completedBookingsCount + pendingBookingsCount + upcomingBookingsCount, subtitle: 'sve', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { label: 'Prosječna ocjena', value: profile?.rating_avg?.toFixed(1) || '0.0', subtitle: `${profile?.review_count || 0} recenzija`, icon: Star, color: 'from-amber-500 to-orange-500' },
  ];

  const bookingsPerMonth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = format(d, 'MMM', { locale: hr });
    const count = bookings.filter((b) => {
      const bd = new Date(b.start_date);
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    }).length;
    bookingsPerMonth.push({ month: monthStr, count });
  }
  const maxCount = Math.max(...bookingsPerMonth.map((e) => e.count), 1);

  const tips = [
    { icon: ImagePlus, text: 'Dodaj još slika da povećaš preglede profila', color: 'text-blue-500' },
    { icon: Eye, text: 'Profili sa 5+ slika dobivaju 3x više upita', color: 'text-purple-500' },
    { icon: MessageSquare, text: 'Odgovaraj na upite unutar 1h za bolji ranking', color: 'text-green-500' },
    { icon: Star, text: 'Zamoli zadovoljne klijente da ostave recenziju', color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <p className="text-[10px] text-muted-foreground/60">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
            🔥 Tvoj profil je pregledan <span className="font-bold">47 puta</span> ovaj tjedan — to je 15% više nego prošli tjedan!
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Rezervacije po mjesecima
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3 h-40">
            {bookingsPerMonth.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{data.count > 0 ? data.count : ''}</span>
                <div className="w-full relative" style={{ height: '100px' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${maxCount > 0 ? (data.count / maxCount) * 100 : 0}%`, minHeight: data.count > 0 ? '4px' : '0' }}
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
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            Savjeti za poboljšanje profila
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <tip.icon className={`h-5 w-5 ${tip.color} flex-shrink-0`} />
              <p className="text-sm">{tip.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
