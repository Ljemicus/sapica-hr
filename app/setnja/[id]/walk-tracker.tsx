'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Clock, MapPin, Gauge, MessageCircle, CheckCircle2, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Walk, Species } from '@/lib/types';

const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then(mod => mod.Polyline),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

interface Props {
  walk: Walk;
  sitterName: string;
  petName: string;
  petSpecies: Species | string;
  isDemo?: boolean;
}

export function WalkTracker({ walk, sitterName, petName, petSpecies, isDemo = false }: Props) {
  const [currentPointIndex, setCurrentPointIndex] = useState(
    walk.status === 'zavrsena' ? walk.route.length - 1 : 0
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const animate = useCallback(() => {
    if (walk.status !== 'u_tijeku') return;
    setCurrentPointIndex(prev => {
      if (prev >= walk.route.length - 1) return 0;
      return prev + 1;
    });
  }, [walk.status, walk.route.length]);

  useEffect(() => {
    if (walk.status !== 'u_tijeku') return;
    const interval = setInterval(animate, 1500);
    return () => clearInterval(interval);
  }, [walk.status, animate]);

  const petEmoji = petSpecies === 'dog' ? '🐕' : petSpecies === 'cat' ? '🐈' : '🐾';
  const visibleRoute = walk.status === 'u_tijeku'
    ? walk.route.slice(0, currentPointIndex + 1)
    : walk.route;
  const currentPos = walk.route[currentPointIndex];
  const center = walk.route[Math.floor(walk.route.length / 2)];

  const [nowMs] = useState<number>(() => Date.now());
  const durationMinutes = walk.end_time
    ? Math.round((new Date(walk.end_time).getTime() - new Date(walk.start_time).getTime()) / 60000)
    : Math.round((nowMs - new Date(walk.start_time).getTime()) / 60000);
  const avgSpeed = walk.distance_km > 0 && durationMinutes > 0
    ? ((walk.distance_km / durationMinutes) * 60).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/dashboard/vlasnik" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              {petEmoji} Šetnja — {petName}
            </h1>
            {isDemo && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                <Eye className="h-3.5 w-3.5 mr-1" /> Demo prikaz
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Sitter: {sitterName}</p>
        </div>
        <Badge className={`text-sm px-3 py-1.5 ${
          walk.status === 'u_tijeku'
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-gray-100 text-gray-700 border-gray-200'
        } border`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${walk.status === 'u_tijeku' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {walk.status === 'u_tijeku' ? 'U tijeku' : 'Završena'}
        </Badge>
      </div>

      {isDemo && (
        <Card className="border-amber-200 bg-amber-50/80 shadow-sm mb-6 animate-fade-in-up delay-50">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Ovo je demo GPS prikaz šetnje.</p>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  Ruta, checkpointi i statistike na ovoj stranici služe za demonstraciju funkcionalnosti. Ne prikazuju live lokaciju stvarnog privatnog bookinga.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in-up delay-100">
        {[
          { label: 'Trajanje', value: `${durationMinutes} min`, icon: Clock, color: 'from-blue-500 to-cyan-500' },
          { label: 'Udaljenost', value: `${walk.distance_km} km`, icon: MapPin, color: 'from-orange-500 to-amber-500' },
          { label: 'Prosj. brzina', value: `${avgSpeed} km/h`, icon: Gauge, color: 'from-green-500 to-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map */}
      <Card className="border-0 shadow-sm mb-6 overflow-hidden animate-fade-in-up delay-200">
        <div className="h-[350px] md:h-[450px] relative bg-gray-100">
          {mounted && (
            <>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <MapContainer
                center={[center.lat, center.lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Route polyline */}
                <Polyline
                  positions={visibleRoute.map(p => [p.lat, p.lng])}
                  pathOptions={{ color: '#f97316', weight: 4, opacity: 0.8 }}
                />
                {/* Faded remaining route */}
                {walk.status === 'u_tijeku' && currentPointIndex < walk.route.length - 1 && (
                  <Polyline
                    positions={walk.route.slice(currentPointIndex).map(p => [p.lat, p.lng])}
                    pathOptions={{ color: '#f97316', weight: 3, opacity: 0.2, dashArray: '8 8' }}
                  />
                )}
                {/* Current position marker */}
                <CircleMarker
                  center={[currentPos.lat, currentPos.lng]}
                  radius={10}
                  pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 1, weight: 3 }}
                >
                  <Popup>{walk.status === 'u_tijeku' ? `${petName} je ovdje!` : 'Završna pozicija'}</Popup>
                </CircleMarker>
                {/* Start marker */}
                <CircleMarker
                  center={[walk.route[0].lat, walk.route[0].lng]}
                  radius={7}
                  pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
                >
                  <Popup>Početak šetnje</Popup>
                </CircleMarker>
                {/* Checkpoint markers */}
                {walk.checkpoints.map((cp, i) => (
                  <CircleMarker
                    key={i}
                    center={[cp.lat, cp.lng]}
                    radius={6}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2 }}
                  >
                    <Popup>{cp.emoji} {cp.label}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </>
          )}
          {!mounted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Učitavanje mape...</div>
            </div>
          )}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="border-0 shadow-sm mb-6 animate-fade-in-up delay-300">
        <CardHeader>
          <CardTitle className="text-lg">Checkpointi šetnje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-200" />
            <div className="space-y-6">
              {walk.checkpoints.map((cp, i) => (
                <div key={i} className="relative flex items-start gap-4 pl-2">
                  <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-orange-400 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${i <= Math.floor(currentPointIndex / (walk.route.length / walk.checkpoints.length)) || walk.status === 'zavrsena' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cp.emoji}</span>
                      <span className="font-medium text-sm">{cp.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(cp.time), 'HH:mm', { locale: hr })}
                    </p>
                  </div>
                  {(i <= Math.floor(currentPointIndex / (walk.route.length / walk.checkpoints.length)) || walk.status === 'zavrsena') && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 animate-fade-in-up delay-400">
        <Link href="/poruke" className="flex-1">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover">
            <MessageCircle className="h-4 w-4 mr-2" />
            Pošalji poruku sitteru
          </Button>
        </Link>
      </div>
    </div>
  );
}
