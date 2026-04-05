'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Tag,
  AlertTriangle,
  Save,
  MapPin,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { LostPetAlertSubscription, LostPetAlertSpecies } from '@/lib/types';
import { LOST_PET_ALERT_SPECIES_LABELS } from '@/lib/types';
import { AlertSubscribeDialog } from '@/app/izgubljeni/alert-subscribe-dialog';

export default function PostavkePage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const [rezervacije, setRezervacije] = useState(true);
  const [poruke, setPoruke] = useState(true);
  const [promocije, setPromocije] = useState(true);
  const [izgubljeni, setIzgubljeni] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertSubs, setAlertSubs] = useState<LostPetAlertSubscription[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notification-preferences', { cache: 'no-store' });
        if (!res.ok) throw new Error('load failed');
        const data = await res.json();
        setEmailEnabled(Boolean(data.email_enabled));
        setPushEnabled(Boolean(data.push_enabled));
        setSmsEnabled(Boolean(data.sms_enabled));
        setRezervacije(Boolean(data.bookings_enabled));
        setPoruke(Boolean(data.messages_enabled));
        setPromocije(Boolean(data.promotions_enabled));
        setIzgubljeni(Boolean(data.lost_pets_enabled));
      } catch {
        toast.error('Nije moguće učitati postavke.');
      } finally {
        setLoading(false);
      }
    };
    load();

    const loadAlerts = async () => {
      try {
        const res = await fetch('/api/lost-pets/alerts', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setAlertSubs(Array.isArray(data.alerts) ? data.alerts : []);
        }
      } catch {
        // silently fail
      } finally {
        setAlertsLoading(false);
      }
    };
    loadAlerts();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_enabled: emailEnabled,
          push_enabled: pushEnabled,
          sms_enabled: smsEnabled,
          bookings_enabled: rezervacije,
          messages_enabled: poruke,
          promotions_enabled: promocije,
          lost_pets_enabled: izgubljeni,
        }),
      });
      if (!res.ok) throw new Error('save failed');
      toast.success('Postavke su spremljene!');
    } catch {
      toast.error('Spremanje nije uspjelo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/60 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back link */}
        <Link
          href="/dashboard/vlasnik"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Natrag na nadzornu ploču
        </Link>

        {/* Header */}
        <div className="space-y-2">
          {loading && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-500 shadow-sm border">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Učitavanje postavki...
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)]">
              Postavke obavijesti
            </h1>
          </div>
          <p className="text-gray-500">
            Upravljajte načinima primanja obavijesti
          </p>
        </div>

        {/* Channels card */}
        <Card className="border-0 shadow-sm rounded-2xl animate-fade-in-up">
          <CardContent className="p-6 space-y-0">
            <h2 className="text-lg font-semibold mb-4">Kanali obavijesti</h2>

            {/* Email */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <Label htmlFor="email-toggle" className="cursor-pointer">
                  Email obavijesti
                </Label>
              </div>
              <Switch
                id="email-toggle"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            {/* Push */}
            <div className="flex items-center justify-between py-4 border-t">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-500" />
                <Label htmlFor="push-toggle" className="cursor-pointer">
                  Push obavijesti
                </Label>
              </div>
              <Switch
                id="push-toggle"
                checked={pushEnabled}
                onCheckedChange={setPushEnabled}
              />
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between py-4 border-t">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <Label
                  htmlFor="sms-toggle"
                  className="cursor-pointer text-gray-400"
                >
                  SMS obavijesti
                </Label>
                <Badge variant="secondary" className="text-xs">
                  Uskoro
                </Badge>
              </div>
              <Switch id="sms-toggle" checked={smsEnabled} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Categories card */}
        <Card className="border-0 shadow-sm rounded-2xl animate-fade-in-up">
          <CardContent className="p-6 space-y-0">
            <h2 className="text-lg font-semibold mb-4">
              Kategorije obavijesti
            </h2>

            {/* Rezervacije */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <Label
                    htmlFor="rezervacije-toggle"
                    className="cursor-pointer font-medium"
                  >
                    Rezervacije
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Obavijesti o novim, potvrđenim i otkazanim rezervacijama
                  </p>
                </div>
              </div>
              <Switch
                id="rezervacije-toggle"
                checked={rezervacije}
                onCheckedChange={setRezervacije}
              />
            </div>

            {/* Poruke */}
            <div className="flex items-center justify-between py-4 border-t">
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <Label
                    htmlFor="poruke-toggle"
                    className="cursor-pointer font-medium"
                  >
                    Poruke
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Obavijesti o novim porukama od vlasnika i sittera
                  </p>
                </div>
              </div>
              <Switch
                id="poruke-toggle"
                checked={poruke}
                onCheckedChange={setPoruke}
              />
            </div>

            {/* Promocije */}
            <div className="flex items-center justify-between py-4 border-t">
              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <Label
                    htmlFor="promocije-toggle"
                    className="cursor-pointer font-medium"
                  >
                    Promocije
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Posebne ponude, popusti i novosti
                  </p>
                </div>
              </div>
              <Switch
                id="promocije-toggle"
                checked={promocije}
                onCheckedChange={setPromocije}
              />
            </div>

            {/* Izgubljeni ljubimci */}
            <div className="flex items-center justify-between py-4 border-t">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <Label
                    htmlFor="izgubljeni-toggle"
                    className="cursor-pointer font-medium"
                  >
                    Izgubljeni ljubimci u mom području
                  </Label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Obavijesti kad se prijavi izgubljen ljubimac u vašem gradu
                  </p>
                </div>
              </div>
              <Switch
                id="izgubljeni-toggle"
                checked={izgubljeni}
                onCheckedChange={setIzgubljeni}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lost pet alert subscriptions */}
        <Card className="border-0 shadow-sm rounded-2xl animate-fade-in-up">
          <CardContent className="p-6 space-y-0">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Obavijesti o izgubljenim ljubimcima</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Gradovi i vrste za koje primajte obavijesti o novim prijavama izgubljenih ljubimaca.
                </p>
              </div>
              <AlertSubscribeDialog />
            </div>
            {alertsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : alertSubs.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">
                Nemate aktivnih obavijesti.{' '}
                <Link href="/izgubljeni" className="text-orange-500 hover:underline">
                  Postavite prvu
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {alertSubs.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border p-3 bg-gray-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                      <span className="text-sm font-medium truncate">{sub.city}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {LOST_PET_ALERT_SPECIES_LABELS[sub.species as LostPetAlertSpecies] ?? sub.species}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/lost-pets/alerts?id=${sub.id}`, { method: 'DELETE' });
                          if (!res.ok) throw new Error();
                          setAlertSubs(prev => prev.filter(s => s.id !== sub.id));
                          toast.success('Obavijest uklonjena.');
                        } catch {
                          toast.error('Brisanje nije uspjelo.');
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Spremanje...' : 'Spremi promjene'}
          </Button>
        </div>
      </div>
    </div>
  );
}
