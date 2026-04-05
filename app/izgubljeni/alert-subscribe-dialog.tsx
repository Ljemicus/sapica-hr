'use client';

import { useState, useEffect } from 'react';
import { Bell, BellRing, MapPin, Loader2, Trash2 } from 'lucide-react';
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

  async function handleSubscribe() {
    if (!city) {
      toast.error(isEn ? 'Please select a city.' : 'Odaberite grad.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/lost-pets/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, species }),
      });
      if (!res.ok) throw new Error('save failed');
      toast.success(isEn ? 'Alert activated!' : 'Obavijest aktivirana!');
      setCity('');
      setSpecies('sve');
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
      <DialogContent className="sm:max-w-md">
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
          <div className="space-y-3">
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

            <Button
              onClick={handleSubscribe}
              disabled={saving || !city}
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
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="text-sm font-medium truncate">{sub.city}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {speciesLabel(sub.species)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
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
