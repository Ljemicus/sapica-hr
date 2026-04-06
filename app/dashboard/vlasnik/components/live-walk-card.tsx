'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { Walk } from '@/lib/types';

interface LiveWalkCardProps {
  walk: Walk & { sitterName: string; petName: string };
}

export function LiveWalkCard({ walk }: LiveWalkCardProps) {
  const [liveWalk, setLiveWalk] = useState(walk);
  const [elapsed, setElapsed] = useState(0);
  const supabase = createClient();

  // Subscribe to real-time walk updates
  useEffect(() => {
    const channel = supabase
      .channel(`walk-${walk.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'walks',
          filter: `id=eq.${walk.id}`,
        },
        (payload) => {
          const updated = payload.new as Walk;
          setLiveWalk((prev) => ({ ...prev, ...updated }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walk.id, supabase]);

  // Calculate elapsed time
  useEffect(() => {
    if (liveWalk.status !== 'u_tijeku') return;
    
    const startTime = new Date(liveWalk.start_time).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [liveWalk.status, liveWalk.start_time]);

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const lastUpdate = liveWalk.checkpoints.length > 0 
    ? formatDistanceToNow(new Date(liveWalk.checkpoints[liveWalk.checkpoints.length - 1].time), { locale: hr, addSuffix: true })
    : null;

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-green-400 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm flex-shrink-0">
              <Navigation className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {liveWalk.petName} šeće s {liveWalk.sitterName}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1" />
                  Uživo
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatElapsed(elapsed)}
                </span>
              </div>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Lokacija ažurirana {lastUpdate}
                </p>
              )}
            </div>
          </div>
          <Link href={`/setnja/${liveWalk.id}`}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 btn-hover flex-shrink-0">
              <MapPin className="h-4 w-4 mr-1" /> Prati
            </Button>
          </Link>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{liveWalk.distance_km.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">km</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-lg font-bold text-gray-900">
              {liveWalk.route.length > 1 
                ? ((liveWalk.distance_km / (elapsed / 3600)) || 0).toFixed(1)
                : '0.0'}
            </p>
            <p className="text-xs text-muted-foreground">km/h</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{liveWalk.route.length}</p>
            <p className="text-xs text-muted-foreground">točaka</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
