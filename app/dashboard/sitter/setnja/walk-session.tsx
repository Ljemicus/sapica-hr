'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  ArrowLeft, Play, Pause, Square, Clock, MapPin, Gauge,
  AlertTriangle, Navigation, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Booking } from '@/lib/types';

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

interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

type WalkState = 'idle' | 'active' | 'paused' | 'finished';

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5000,
};

const INITIAL_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
};

interface Props {
  userId: string;
  bookings: (Booking & { pet: { name: string; species: string } })[];
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function WalkSession({ userId, bookings }: Props) {
  const [walkState, setWalkState] = useState<WalkState>('idle');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [endNote, setEndNote] = useState('');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [walkId, setWalkId] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabaseRef = useRef(createClient());

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer
  useEffect(() => {
    if (walkState === 'active' && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [walkState, startTime]);

  const addRoutePoint = useCallback((position: GeolocationPosition) => {
    const point: RoutePoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: Date.now(),
    };
    setRoutePoints(prev => {
      const newPoints = [...prev, point];
      // Calculate distance from last point
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const d = haversineDistance(last.lat, last.lng, point.lat, point.lng);
        setDistance(prevDist => prevDist + d);
      }
      return newPoints;
    });
  }, []);

  const handleGeoError = useCallback((error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setGeoError('Lokacija nije dopuštena. Omogućite pristup lokaciji u postavkama preglednika.');
        break;
      case error.POSITION_UNAVAILABLE:
        setGeoError('Lokacija trenutno nije dostupna. Provjerite je li GPS uključen.');
        break;
      case error.TIMEOUT:
        setGeoError('Dohvat lokacije je istekao. Pokušajte ponovo.');
        break;
    }
  }, []);

  const stopWatchingPosition = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatchingPosition = useCallback(() => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      addRoutePoint,
      handleGeoError,
      GEOLOCATION_OPTIONS
    );
  }, [addRoutePoint, handleGeoError]);

  const persistWalkEnd = useCallback(async () => {
    if (!walkId) return;

    await supabaseRef.current
      .from('walks')
      .update({
        end_time: new Date().toISOString(),
        status: 'zavrsena',
        distance_km: Number(distance.toFixed(2)),
        route: routePoints.map((point) => ({ lat: point.lat, lng: point.lng })),
        checkpoints: [],
      })
      .eq('id', walkId);
  }, [distance, routePoints, walkId]);

  const startWalk = async () => {
    if (!navigator.geolocation) {
      setGeoError('Vaš preglednik ne podržava geolokaciju. Koristite moderan preglednik (Chrome, Firefox, Safari).');
      return;
    }

    if (!selectedBookingId || !selectedBooking) {
      toast.error('Odaberite rezervaciju za šetnju');
      return;
    }

    setGeoError(null);

    // Get initial position first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const now = Date.now();
        const point: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: now,
        };
        setRoutePoints([point]);
        setStartTime(now);
        setWalkState('active');
        setDistance(0);
        setElapsed(0);

        // Create walk in DB
        const petId = selectedBooking?.pet_id || '';
        const { data, error } = await supabaseRef.current
          .from('walks')
          .insert({
            sitter_id: userId,
            pet_id: petId,
            booking_id: selectedBookingId,
            start_time: new Date(now).toISOString(),
            status: 'u_tijeku',
            distance_km: 0,
            route: [{ lat: point.lat, lng: point.lng }],
            checkpoints: [],
          })
          .select()
          .single();

        if (error || !data?.id) {
          setWalkState('idle');
          setRoutePoints([]);
          setStartTime(null);
          toast.error('Šetnja nije spremljena. Pokušajte ponovo.');
          return;
        }

        setWalkId(data.id);

        toast.success('Šetnja započeta!');

        // Start watching position
        startWatchingPosition();
      },
      handleGeoError,
      INITIAL_GEOLOCATION_OPTIONS
    );
  };

  const pauseWalk = () => {
    stopWatchingPosition();
    setWalkState('paused');
    toast('Šetnja pauzirana');
  };

  const resumeWalk = () => {
    if (!navigator.geolocation) {
      setGeoError('Vaš preglednik ne podržava geolokaciju. Koristite moderan preglednik (Chrome, Firefox, Safari).');
      return;
    }

    setWalkState('active');
    startWatchingPosition();
    toast('Šetnja nastavljena');
  };

  const endWalk = async () => {
    stopWatchingPosition();
    setWalkState('finished');

    const durationMin = Math.round(elapsed / 60);
    const distKm = distance.toFixed(2);

    await persistWalkEnd();

    setShowEndDialog(false);
    toast.success(`Šetnja završena! Trajanje: ${durationMin}min, ${distKm}km`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatchingPosition();
    };
  }, [stopWatchingPosition]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const avgSpeed = elapsed > 0 ? ((distance / elapsed) * 3600).toFixed(1) : '0.0';
  const currentPos = routePoints.length > 0 ? routePoints[routePoints.length - 1] : null;
  const centerPos = currentPos || { lat: 45.815, lng: 15.982 }; // Zagreb default

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/dashboard/sitter" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
      </Link>

      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Navigation className="h-7 w-7 text-orange-500" /> Šetnja
        </h1>
        <p className="text-muted-foreground mt-1">Pratite šetnju u stvarnom vremenu</p>
      </div>

      {/* Geo Error */}
      {geoError && (
        <Card className="border-0 shadow-sm mb-6 border-l-4 border-l-red-400 animate-fade-in-up">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 text-sm">Greška s lokacijom</p>
              <p className="text-sm text-muted-foreground mt-1">{geoError}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Savjet: Provjerite postavke preglednika → Privatnost → Lokacija. Na mobitelu uključite GPS/lokacijske usluge.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Selector (only when idle) */}
      {walkState === 'idle' && (
        <div className="mb-6 animate-fade-in-up delay-100">
          {bookings.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Nemate aktivnih rezervacija</p>
                <p className="text-sm text-muted-foreground mt-1">Prihvatite rezervaciju da biste mogli započeti šetnju.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Odaberite rezervaciju
              </h3>
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    selectedBookingId === booking.id ? 'ring-2 ring-orange-400 bg-orange-50/50' : ''
                  }`}
                  onClick={() => setSelectedBookingId(booking.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.pet?.name} ({booking.pet?.species === 'dog' ? 'Pas' : 'Mačka'})</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                      </p>
                    </div>
                    {selectedBookingId === booking.id && (
                      <Badge className="bg-orange-100 text-orange-700 border-0">Odabrano</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button
                className="w-full bg-green-600 hover:bg-green-700 btn-hover mt-4 h-12 text-base"
                onClick={startWalk}
                disabled={!selectedBookingId}
              >
                <Play className="h-5 w-5 mr-2" /> Započni šetnju
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Walk UI */}
      {walkState !== 'idle' && (
        <>
          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in-up">
            {[
              { label: 'Trajanje', value: formatTime(elapsed), icon: Clock, color: 'from-blue-500 to-cyan-500' },
              { label: 'Udaljenost', value: `${distance.toFixed(2)} km`, icon: MapPin, color: 'from-orange-500 to-amber-500' },
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

          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge className={`text-sm px-3 py-1.5 border ${
              walkState === 'active'
                ? 'bg-green-100 text-green-700 border-green-200'
                : walkState === 'paused'
                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                walkState === 'active' ? 'bg-green-500 animate-pulse' : walkState === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              {walkState === 'active' ? 'U tijeku' : walkState === 'paused' ? 'Pauzirana' : 'Završena'}
            </Badge>
            {selectedBooking && (
              <span className="text-sm text-muted-foreground">
                {selectedBooking.pet?.name}
              </span>
            )}
          </div>

          {/* Map */}
          <Card className="border-0 shadow-sm mb-6 overflow-hidden animate-fade-in-up delay-100">
            <div className="h-[350px] md:h-[450px] relative bg-gray-100">
              {mounted && (
                <>
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                  <MapContainer
                    center={[centerPos.lat, centerPos.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {routePoints.length >= 2 && (
                      <Polyline
                        positions={routePoints.map(p => [p.lat, p.lng])}
                        pathOptions={{ color: '#f97316', weight: 4, opacity: 0.8 }}
                      />
                    )}
                    {/* Start marker */}
                    {routePoints.length > 0 && (
                      <CircleMarker
                        center={[routePoints[0].lat, routePoints[0].lng]}
                        radius={7}
                        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1, weight: 2 }}
                      >
                        <Popup>Početak šetnje</Popup>
                      </CircleMarker>
                    )}
                    {/* Current position */}
                    {currentPos && (
                      <CircleMarker
                        center={[currentPos.lat, currentPos.lng]}
                        radius={10}
                        pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 1, weight: 3 }}
                      >
                        <Popup>Trenutna pozicija</Popup>
                      </CircleMarker>
                    )}
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

          {/* Controls */}
          {walkState !== 'finished' && (
            <div className="flex gap-3 mb-6 animate-fade-in-up delay-200">
              {walkState === 'active' ? (
                <Button
                  variant="outline"
                  className="flex-1 h-12 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200"
                  onClick={pauseWalk}
                >
                  <Pause className="h-5 w-5 mr-2" /> Pauziraj
                </Button>
              ) : (
                <Button
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 btn-hover"
                  onClick={resumeWalk}
                >
                  <Play className="h-5 w-5 mr-2" /> Nastavi
                </Button>
              )}
              <Button
                className="flex-1 h-12 bg-red-500 hover:bg-red-600"
                onClick={() => setShowEndDialog(true)}
              >
                <Square className="h-5 w-5 mr-2" /> Završi šetnju
              </Button>
            </div>
          )}

          {/* End Walk Dialog */}
          {showEndDialog && (
            <Card className="border-0 shadow-sm mb-6 border-l-4 border-l-orange-400 animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-lg">Završi šetnju?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dodajte bilješku (opcionalno)</p>
                  <Textarea
                    value={endNote}
                    onChange={(e) => setEndNote(e.target.value)}
                    placeholder="Npr. Pas je bio veseo, pili smo vodu u parku..."
                    rows={3}
                    className="focus:border-orange-300"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEndDialog(false)}
                  >
                    Odustani
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    onClick={endWalk}
                  >
                    <Square className="h-4 w-4 mr-2" /> Završi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Finished Summary */}
          {walkState === 'finished' && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 animate-fade-in-up">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-green-700 mb-2">Šetnja završena!</h3>
                <div className="flex justify-center gap-6 text-sm text-green-600">
                  <span>{formatTime(elapsed)}</span>
                  <span>{distance.toFixed(2)} km</span>
                  <span>{avgSpeed} km/h</span>
                </div>
                {endNote && (
                  <div className="mt-4 p-3 bg-white/60 rounded-xl text-sm text-left flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{endNote}</span>
                  </div>
                )}
                <Link href="/dashboard/sitter">
                  <Button className="mt-6 bg-orange-500 hover:bg-orange-600 btn-hover">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Natrag na ploču
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
