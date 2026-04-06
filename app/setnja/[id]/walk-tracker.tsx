'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Clock, MapPin, Gauge, MessageCircle, CheckCircle2, ArrowLeft, Navigation, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
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

export function WalkTracker({ walk: initialWalk, sitterName, petName, petSpecies, isDemo = false }: Props) {
  const [walk, setWalk] = useState(initialWalk);
  const [mounted, setMounted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Intentional hydration pattern - suppressing warning
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Subscribe to real-time walk updates
  useEffect(() => {
    if (walk.status !== 'u_tijeku') return;

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
          setWalk((prev) => ({ ...prev, ...updated }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walk.id, walk.status, supabase]);

  // Calculate elapsed time for active walks
  useEffect(() => {
    if (walk.status !== 'u_tijeku') {
      if (walk.end_time) {
        // Calculate final elapsed time for completed walks
        const finalElapsed = Math.round((new Date(walk.end_time).getTime() - new Date(walk.start_time).getTime()) / 1000);
        // Use timeout to avoid synchronous setState during render
        setTimeout(() => setElapsed(finalElapsed), 0);
      }
      return;
    }

    const startTime = new Date(walk.start_time).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [walk.status, walk.start_time, walk.end_time]);

  const petEmoji = petSpecies === 'dog' ? '🐕' : petSpecies === 'cat' ? '🐈' : '🐾';
  
  // Use actual route from walk data
  const route = walk.route || [];
  const currentPos = route.length > 0 ? route[route.length - 1] : { lat: 45.815, lng: 15.982 };
  const center = route.length > 0 
    ? route[Math.floor(route.length / 2)] 
    : { lat: 45.815, lng: 15.982 };

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const _durationMinutes = Math.round(elapsed / 60);
  const avgSpeed = walk.distance_km > 0 && elapsed > 0
    ? ((walk.distance_km / elapsed) * 3600).toFixed(1)
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
          {walk.status === 'u_tijeku' ? 'Uživo' : 'Završena'}
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
          { label: 'Trajanje', value: formatElapsed(elapsed), icon: Clock, color: 'from-blue-500 to-cyan-500' },
          { label: 'Udaljenost', value: `${walk.distance_km.toFixed(2)} km`, icon: MapPin, color: 'from-orange-500 to-amber-500' },
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
                {route.length >= 2 && (
                  <Polyline
                    positions={route.map(p => [p.lat, p.lng])}
                    pathOptions={{ color: '#f97316', weight: 4, opacity: 0.8 }}
                  />
                )}
                {/* Current position marker */}
                {route.length > 0 && (
                  <CircleMarker
                    center={[currentPos.lat, currentPos.lng]}
                    radius={10}
                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 1, weight: 3 }}
                  >
                    <Popup>{walk.status === 'u_tijeku' ? `${petName} je ovdje!` : 'Završna pozicija'}</Popup>
                  </CircleMarker>
                )}
                {/* Start marker */}
                {route.length > 0 && (
                  <CircleMarker
                    center={[route[0].lat, route[0].lng]}
                    radius={7}
                    pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
                  >
                    <Popup>Početak šetnje</Popup>
                  </CircleMarker>
                )}
                {/* Checkpoint markers */}
                {walk.checkpoints?.map((cp, i) => (
                  <CircleMarker
                    key={i}
                    center={[cp.lat, cp.lng]}
                    radius={8}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
                  >
                    <Popup>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cp.emoji}</span>
                        <span>{cp.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(cp.time), 'HH:mm', { locale: hr })}
                      </p>
                    </Popup>
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

      {/* Checkpoints */}
      {walk.checkpoints && walk.checkpoints.length > 0 && (
        <Card className="border-0 shadow-sm mb-6 animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5" /> Checkpointi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {walk.checkpoints.map((cp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full text-sm"
                >
                  <span>{cp.emoji}</span>
                  <span className="font-medium">{cp.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(cp.time), 'HH:mm', { locale: hr })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 animate-fade-in-up delay-400">
        <Link href="/poruke" className="flex-1">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover">
            <MessageCircle className="h-4 w-4 mr-2" />
            Pošalji poruku sitteru
          </Button>
        </Link>
        {walk.booking_id && (
          <Link href={`/azuriranja/${walk.booking_id}`} className="flex-1">
            <Button variant="outline" className="w-full hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Pogledaj ažuriranja
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
