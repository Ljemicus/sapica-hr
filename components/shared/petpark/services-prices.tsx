'use client';

import { Scissors, Droplets, Sparkles, Home, Dog, House, Eye, Sun, Heart } from 'lucide-react';

const serviceIcons: Record<string, React.ElementType> = {
  sisanje: Scissors,
  kupanje: Droplets,
  trimanje: Scissors,
  nokti: Scissors,
  cetkanje: Sparkles,
  boarding: Home,
  walking: Dog,
  'house-sitting': House,
  'drop-in': Eye,
  daycare: Sun,
};

const serviceColors: Record<string, string> = {
  sisanje: 'from-pink-500 to-rose-500',
  kupanje: 'from-blue-500 to-cyan-500',
  trimanje: 'from-purple-500 to-pink-500',
  nokti: 'from-orange-500 to-amber-500',
  cetkanje: 'from-teal-500 to-emerald-500',
  boarding: 'from-orange-500 to-amber-500',
  walking: 'from-emerald-500 to-teal-500',
  'house-sitting': 'from-blue-500 to-cyan-500',
  'drop-in': 'from-purple-500 to-violet-500',
  daycare: 'from-rose-500 to-orange-500',
};

const serviceColorsBg: Record<string, string> = {
  sisanje: 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400',
  kupanje: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
  trimanje: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
  nokti: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
  cetkanje: 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400',
  boarding: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
  walking: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
  'house-sitting': 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
  'drop-in': 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
  daycare: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
};

interface ServicePrice {
  service: string;
  label: string;
  price: number;
}

interface ServicesPricesProps {
  services: ServicePrice[];
  unitLabel?: string;
  emptyMessage?: string;
}

export function ServicesPrices({ services, unitLabel = 'po usluzi', emptyMessage }: ServicesPricesProps) {
  const activeServices = services.filter((s) => s.price > 0);

  if (activeServices.length === 0) {
    return (
      <div className="detail-section-card p-10 md:p-12 text-center">
        <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
          <Heart className="h-7 w-7 text-warm-orange" />
        </div>
        <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">Usluge i cijene</p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {emptyMessage || 'Cijena po dogovoru'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {activeServices.map((item) => {
        const Icon = serviceIcons[item.service] || Heart;
        const color = serviceColors[item.service] || 'from-orange-500 to-amber-500';
        const bgColor = serviceColorsBg[item.service] || 'bg-orange-50 text-orange-600';
        return (
          <div key={item.service} className="detail-section-card p-6 group cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${bgColor}`}>
                {item.price > 0 ? `${item.price}€ ${unitLabel}` : 'Cijena po dogovoru'}
              </div>
            </div>
            <h3 className="font-bold text-base font-[var(--font-heading)]">{item.label}</h3>
          </div>
        );
      })}
    </div>
  );
}
