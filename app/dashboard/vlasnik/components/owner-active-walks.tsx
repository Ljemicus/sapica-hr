import Link from 'next/link';
import { MapPin, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LiveWalkCard } from './live-walk-card';
import type { OwnerActiveWalk } from './owner-dashboard-types';

interface Props {
  activeWalks: OwnerActiveWalk[];
}

export function OwnerActiveWalks({ activeWalks }: Props) {
  if (activeWalks.length === 0) {
    return (
      <Card className="border-0 shadow-sm border-l-4 border-l-gray-300 mb-8 animate-fade-in-up delay-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-600">Nema aktivnih šetnji</p>
                <p className="text-xs text-muted-foreground">
                  Kad vaš sitter započne šetnju, vidjet ćete ju ovdje.
                </p>
              </div>
            </div>
            <Link href="/dashboard/vlasnik/rezervacije">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-1" /> Povijest
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8 animate-fade-in-up delay-500">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Aktivne šetnje ({activeWalks.length})
        </h3>
        <Link href="/dashboard/vlasnik/rezervacije">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-orange-600">
            <History className="h-4 w-4 mr-1" /> Povijest šetnji
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {activeWalks.map((walk) => (
          <LiveWalkCard key={walk.id} walk={walk} />
        ))}
      </div>
    </div>
  );
}
