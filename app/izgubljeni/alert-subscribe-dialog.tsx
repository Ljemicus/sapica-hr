'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, MapPin, Loader2, Trash2, Crosshair, Radius } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { CITIES, LOST_PET_ALERT_SPECIES_LABELS } from '@/lib/types';
import type { LostPetAlert, LostPetAlertSpecies } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/context';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

// Default radius value in km
const DEFAULT_RADIUS_KM = 5;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;

interface LocationPickerProps {
  address: string;
  setAddress: (address: string) => void;
  onGetCurrentLocation: () => void;
  isLocating: boolean;
  isEn: boolean;
}

function LocationPicker({ address, setAddress, onGetCurrentLocation, isLocating, isEn }: LocationPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{isEn ? 'Address or area' : 'Adresa ili područje'}</Label>
      <div className="flex gap-2">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={isEn ? 'e.g., Trg bana Jelačića, Zagreb' : 'npr. Trg bana Jelačića, Zagreb'}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onGetCurrentLocation}
          disabled={isLocating}
          title={isEn ? 'Use my current location' : 'Koristi moju trenutnu lokaciju'}
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        {isEn 
          ? 'Enter an address or click the location button to use your current position.' 
          : 'Unesite adresu ili kliknite gumb lokacije za korištenje trenutne pozicije.'}
      </p>
    </div>
  );
}

interface RadiusSliderProps {
  radius: number;
  setRadius: (radius: number) => void;
  isEn: boolean;
}

function RadiusSlider({ radius, setRadius, isEn }: RadiusSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Radius className="h-4 w-4 text-red-400" />
          {isEn ? 'Alert radius' : 'Polumjer obavijesti'}
        </Label>
        <span className="text-sm font-medium text-red-600">{radius} km</span>
      </div>
      <input
        type="range"
        min={MIN_RADIUS_KM}
        max={MAX_RADIUS_KM}
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{MIN_RADIUS_KM} km</span>
        <span>{MAX_RADIUS_KM} km</span>
      </div>
      <p className="text-xs text-gray-500">
        {isEn 
          ? `You'll be notified when a pet is reported within ${radius} km of this location.`
          : `Primit ćete obavijest kada se ljubimac prijavi unutar ${radius} km od ove lokacije.`}
      </p>
    </div>
  );
}

export function AlertSubscribeDialog() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<LostPetAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [city, setCity] = useState<string>('');
  const [species, setSpecies] = useState<LostPetAlertSpecies>('sve');
  
  // Geo-fencing state
  const [useRadius, setUseRadius] = useState(false);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_KM);
  const [address, setAddress] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    loadSubscriptions();
  }, [open, user]);

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const res = await fetch('/api/lost-pets/alerts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(Array.isArray(data.alerts) ? data.alerts : []);
      }
    } catch {
      // silently fail on load
    } finally {
      setLoading(false);
    }
  }

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(isEn ? 'Geolocation is not supported by your browser.' : 'Geolokacija nije podržana u vašem pregledniku.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLat(position.coords.latitude);
        setLocationLng(position.coords.longitude);
        setAddress(isEn ? 'Current location' : 'Trenutna lokacija');
        setIsLocating(false);
        toast.success(isEn ? 'Location captured!' : 'Lokacija spremljena!');
      },
      (error) => {
        setIsLocating(false);
        let message = isEn ? 'Could not get location.' : 'Nije moguće dohvatiti lokaciju.';
        if (error.code === error.PERMISSION_DENIED) {
          message = isEn ? 'Location permission denied.' : 'Dopuštenje za lokaciju odbijeno.';
        }
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [isEn]);

  async function handleSubscribe() {
    if (!city) {
      toast.error(isEn ? 'Please select a city.' : 'Odaberite grad.');
      return;
    }
    
    // Validate radius mode has location
    if (useRadius && !locationLat && !address) {
      toast.error(isEn ? 'Please enter an address or use current location.' : 'Unesite adresu ili koristite trenutnu lokaciju.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        city,
        species,
        use_radius: useRadius,
        ...(useRadius && {
          radius_km: radius,
          location_lat: locationLat,
          location_lng: locationLng,
          address: address || null,
        }),
      };
      
      const res = await fetch('/api/lost-pets/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save failed');
      toast.success(isEn ? 'Alert activated!' : 'Obavijest aktivirana!');
      
      // Reset form
      setCity('');
      setSpecies('sve');
      setUseRadius(false);
      setRadius(DEFAULT_RADIUS_KM);
      setAddress('');
      setLocationLat(null);
      setLocationLng(null);
      
      await loadSubscriptions();
    } catch {
      toast.error(isEn ? 'Could not save alert.' : 'Nije moguće spremiti obavijest.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/lost-pets/alerts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      toast.success(isEn ? 'Alert removed.' : 'Obavijest uklonjena.');
    } catch {
      toast.error(isEn ? 'Could not remove alert.' : 'Brisanje nije uspjelo.');
    }
  }

  const speciesLabel = (s: LostPetAlertSpecies) =>
    isEn
      ? ({ pas: 'Dogs', macka: 'Cats', ostalo: 'Other', sve: 'All species' }[s])
      : LOST_PET_ALERT_SPECIES_LABELS[s];

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => toast.info(isEn ? 'Sign in to set up alerts.' : 'Prijavite se za postavljanje obavijesti.')}
      >
        <Bell className="h-4 w-4 mr-2" />
        {isEn ? 'Notify me' : 'Obavijesti me'}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <Bell className="h-4 w-4 mr-2" />
          {isEn ? 'Notify me' : 'Obavijesti me'}
          {subscriptions.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs bg-red-100 text-red-600">
              {subscriptions.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-red-500" />
            {isEn ? 'Lost pet alerts' : 'Obavijesti o izgubljenim ljubimcima'}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Get notified when a pet goes missing in your area.'
              : 'Primajte obavijesti kad se prijavi izgubljen ljubimac u vašem području.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* New subscription form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{isEn ? 'City' : 'Grad'}</Label>
              <Select value={city} onValueChange={(val) => setCity(val ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder={isEn ? 'Select a city' : 'Odaberite grad'} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{isEn ? 'Species' : 'Vrsta'}</Label>
              <Select value={species} onValueChange={(val) => setSpecies((val ?? 'sve') as LostPetAlertSpecies)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sve">{isEn ? 'All species' : 'Sve vrste'}</SelectItem>
                  <SelectItem value="pas">{isEn ? 'Dogs' : 'Psi'}</SelectItem>
                  <SelectItem value="macka">{isEn ? 'Cats' : 'Mačke'}</SelectItem>
                  <SelectItem value="ostalo">{isEn ? 'Other' : 'Ostalo'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Radius toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium cursor-pointer" htmlFor="radius-mode">
                  {isEn ? 'Radius-based alerts' : 'Obavijesti unutar polumjera'}
                </Label>
                <p className="text-xs text-gray-500">
                  {isEn ? 'Get notified only within a specific radius' : 'Primajte obavijesti samo unutar određenog polumjera'}
                </p>
              </div>
              <Switch
                id="radius-mode"
                checked={useRadius}
                onCheckedChange={setUseRadius}
              />
            </div>

            {/* Radius controls - only shown when radius mode is enabled */}
            {useRadius && (
              <div className="space-y-4 rounded-lg border border-red-100 bg-red-50/50 p-4">
                <LocationPicker
                  address={address}
                  setAddress={setAddress}
                  onGetCurrentLocation={getCurrentLocation}
                  isLocating={isLocating}
                  isEn={isEn}
                />
                <RadiusSlider radius={radius} setRadius={setRadius} isEn={isEn} />
              </div>
            )}

            <Button
              onClick={handleSubscribe}
              disabled={saving || !city || (useRadius && !locationLat && !address)}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              {isEn ? 'Subscribe' : 'Pretplati se'}
            </Button>
          </div>

          {/* Existing subscriptions */}
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : subscriptions.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-xs text-gray-500 uppercase tracking-wider">
                {isEn ? 'Active alerts' : 'Aktivne obavijesti'}
              </Label>
              {subscriptions.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg border p-3 bg-gray-50"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{sub.city}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {speciesLabel(sub.species)}
                        </Badge>
                      </div>
                      {sub.radius_km && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Radius className="h-3 w-3" />
                          <span>{sub.radius_km} km</span>
                          {sub.address && (
                            <span className="truncate ml-1">• {sub.address}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 shrink-0"
                    onClick={() => handleDelete(sub.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline">{isEn ? 'Done' : 'Gotovo'}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
