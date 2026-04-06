'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Navigation, 
  Calendar,
  ChevronRight,
  Route,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Walk } from '@/lib/types';

interface WalkHistoryListProps {
  walks: (Walk & { sitterName: string; petName: string })[];
}

export function WalkHistoryList({ walks }: WalkHistoryListProps) {
  const [filter, setFilter] = useState<'all' | 'zavrsena'>('all');

  const filteredWalks = filter === 'all' 
    ? walks 
    : walks.filter(w => w.status === filter);

  const totalDistance = walks
    .filter(w => w.status === 'zavrsena')
    .reduce((sum, w) => sum + w.distance_km, 0);

  const totalWalks = walks.filter(w => w.status === 'zavrsena').length;

  if (walks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard/vlasnik" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
        </Link>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Route className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Još nema šetnji</h2>
            <p className="text-muted-foreground mb-6">
              Vaši ljubimci još nisu bili na šetnji. Rezervirajte sittera da biste započeli.
            </p>
            <Link href="/pretraga">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Pronađi sittera
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/dashboard/vlasnik" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
      </Link>

      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Route className="h-7 w-7 text-orange-500" /> Povijest šetnji
        </h1>
        <p className="text-muted-foreground mt-1">Pregled svih šetnji vaših ljubimaca</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up delay-100">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{totalWalks}</p>
              <p className="text-xs text-muted-foreground">Završenih šetnji</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{totalDistance.toFixed(1)} km</p>
              <p className="text-xs text-muted-foreground">Ukupno pređeno</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hidden md:block">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {Math.round(totalDistance * 12)} min
              </p>
              <p className="text-xs text-muted-foreground">Procj. vrijeme</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 animate-fade-in-up delay-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sve
        </button>
        <button
          onClick={() => setFilter('zavrsena')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'zavrsena' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Završene
        </button>
      </div>

      {/* Walk List */}
      <div className="space-y-3 animate-fade-in-up delay-300">
        {filteredWalks.map((walk) => {
          const duration = walk.end_time 
            ? Math.round((new Date(walk.end_time).getTime() - new Date(walk.start_time).getTime()) / 60000)
            : null;
          
          const avgSpeed = duration && duration > 0 
            ? ((walk.distance_km / duration) * 60).toFixed(1)
            : '0.0';

          return (
            <Link key={walk.id} href={`/setnja/${walk.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
                        walk.status === 'zavrsena'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      }`}>
                        {walk.status === 'zavrsena' ? (
                          <Navigation className="h-6 w-6 text-white" />
                        ) : (
                          <MapPin className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{walk.petName}</p>
                          <Badge className={`text-xs ${
                            walk.status === 'zavrsena'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {walk.status === 'zavrsena' ? 'Završena' : 'U tijeku'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(walk.start_time), 'd. MMM yyyy.', { locale: hr })}
                          </span>
                          <span>•</span>
                          <span>{walk.sitterName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="font-semibold">{walk.distance_km.toFixed(2)} km</p>
                        <p className="text-xs text-muted-foreground">
                          {duration ? `${duration} min` : 'U tijeku'} • {avgSpeed} km/h
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
