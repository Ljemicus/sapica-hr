import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { OwnerActiveWalk } from './owner-dashboard-types';

interface Props {
  activeWalks: OwnerActiveWalk[];
}

export function OwnerActiveWalks({ activeWalks }: Props) {
  if (activeWalks.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in-up delay-500">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Aktivne šetnje ({activeWalks.length})
      </h3>
      <div className="space-y-3">
        {activeWalks.map((walk) => (
          <Card key={walk.id} className="border-0 shadow-sm border-l-4 border-l-green-400">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{walk.petName} šeće s {walk.sitterName}</p>
                    <p className="text-xs text-muted-foreground">{walk.distance_km} km • U tijeku</p>
                  </div>
                </div>
                <Link href={`/setnja/${walk.id}`}>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 btn-hover">
                    <MapPin className="h-4 w-4 mr-1" /> Prati uživo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
