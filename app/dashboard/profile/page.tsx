'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, User, MapPin, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  type PublisherProfile,
  type PublisherProfileType,
  PUBLISHER_PROFILE_TYPE_LABELS,
  PUBLISHER_PROFILE_TYPE_EMOJI,
  CITIES,
} from '@/lib/types';

const DASHBOARD_ROUTES: Partial<Record<PublisherProfileType, string>> = {
  vlasnik: '/dashboard/vlasnik',
  čuvar: '/dashboard/sitter',
  groomer: '/dashboard/groomer',
  udomljavanje: '/dashboard/adoption',
};

export default function DashboardProfilePage() {
  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/publisher-profile');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.profile) {
            const p = data.profile as PublisherProfile;
            setProfile(p);
            setDisplayName(p.display_name);
            setBio(p.bio ?? '');
            setCity(p.city ?? '');
            setPhone(p.phone ?? '');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/publisher-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          bio: bio || null,
          city: city || null,
          phone: phone || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        toast.success('Profil je spremljen!');
      } else {
        toast.error('Greška pri spremanju profila.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Učitavanje profila...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Nemate još kreiran profil.</p>
        <Link href="/onboarding/publisher-type">
          <Button>Kreiraj profil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href={DASHBOARD_ROUTES[profile.type] ?? '/dashboard/vlasnik'}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Natrag na nadzornu ploču
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)]">
                Moj profil
              </h1>
              <Badge variant="secondary" className="mt-1">
                {PUBLISHER_PROFILE_TYPE_EMOJI[profile.type]}{' '}
                {PUBLISHER_PROFILE_TYPE_LABELS[profile.type]}
              </Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Ime za prikaz
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Vaše ime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> O meni
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Kratki opis o vama..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Grad
                </Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Odaberite grad</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Telefon
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+385 ..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || !displayName.trim()}>
                {saving ? 'Spremam...' : 'Spremi promjene'}
                {!saving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
