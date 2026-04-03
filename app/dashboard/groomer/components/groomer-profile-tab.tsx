'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CITIES,
  GROOMING_SERVICE_LABELS,
  GROOMER_SPECIALIZATION_LABELS,
  type Groomer,
  type GroomingServiceType,
  type GroomerSpecialization,
} from '@/lib/types';

interface GroomerProfileTabProps {
  groomer: Groomer;
  onProfileUpdated: () => void;
}

export function GroomerProfileTab({ groomer, onProfileUpdated }: GroomerProfileTabProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: groomer.name,
    bio: groomer.bio || '',
    city: groomer.city,
    phone: groomer.phone || '',
    email: groomer.email || '',
    address: groomer.address || '',
    specialization: groomer.specialization,
    services: groomer.services || [],
    prices: groomer.prices || {},
  });

  const handleToggleService = (service: GroomingServiceType) => {
    const services = form.services.includes(service)
      ? form.services.filter((s) => s !== service)
      : [...form.services, service];
    const prices = { ...form.prices };
    if (!services.includes(service)) {
      delete prices[service];
    }
    setForm({ ...form, services, prices });
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Ime mora imati najmanje 2 znaka');
      return;
    }
    if (form.services.length === 0) {
      toast.error('Odaberite barem jednu uslugu');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/groomer-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Profil spremljen!');
        onProfileUpdated();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Greška pri spremanju');
      }
    } catch {
      toast.error('Mrežna greška');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Osnovni podaci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ime / naziv *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Vaše ime ili naziv salona"
              className="focus:border-orange-300"
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Opišite svoje iskustvo i usluge..."
              rows={4}
              className="focus:border-orange-300"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grad *</Label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300"
              >
                <option value="">Odaberite grad</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+385 91 234 5678"
                className="focus:border-orange-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@primjer.hr"
                className="focus:border-orange-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresa</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ulica i broj, grad"
                className="focus:border-orange-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Specijalizacija</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(GROOMER_SPECIALIZATION_LABELS) as [GroomerSpecialization, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, specialization: key })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.specialization === key
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Usluge i cijene</CardTitle>
            {groomer.verified && (
              <Badge className="bg-green-100 text-green-700 border-green-200">Verificiran profil</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.entries(GROOMING_SERVICE_LABELS) as [GroomingServiceType, string][]).map(
            ([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl border hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.services.includes(key)}
                    onCheckedChange={() => handleToggleService(key)}
                  />
                  <span className="text-sm">{label}</span>
                </div>
                {form.services.includes(key) && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      className="w-20 h-8 text-sm focus:border-orange-300"
                      placeholder="0"
                      value={form.prices[key] || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prices: {
                            ...form.prices,
                            [key]: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <span className="text-sm text-muted-foreground">&euro;</span>
                  </div>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full bg-orange-500 hover:bg-orange-600 btn-hover"
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Spremanje...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Spremi profil
          </>
        )}
      </Button>
    </div>
  );
}
