'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, GraduationCap, Plus, X } from 'lucide-react';
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
  TRAINING_TYPE_LABELS,
  type Trainer,
  type TrainingType,
} from '@/lib/types';

interface TrainerDashboardContentProps {
  trainer: Trainer;
}

export function TrainerDashboardContent({ trainer }: TrainerDashboardContentProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [newCert, setNewCert] = useState('');
  const [form, setForm] = useState({
    name: trainer.name,
    bio: trainer.bio || '',
    city: trainer.city,
    phone: trainer.phone || '',
    email: trainer.email || '',
    address: trainer.address || '',
    specializations: trainer.specializations || [],
    price_per_hour: trainer.price_per_hour,
    certificates: trainer.certificates || [],
  });

  const handleToggleSpecialization = (spec: TrainingType) => {
    const specializations = form.specializations.includes(spec)
      ? form.specializations.filter((s) => s !== spec)
      : [...form.specializations, spec];
    setForm({ ...form, specializations });
  };

  const handleAddCertificate = () => {
    const cert = newCert.trim();
    if (cert && !form.certificates.includes(cert)) {
      setForm({ ...form, certificates: [...form.certificates, cert] });
      setNewCert('');
    }
  };

  const handleRemoveCertificate = (cert: string) => {
    setForm({ ...form, certificates: form.certificates.filter((c) => c !== cert) });
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Ime mora imati najmanje 2 znaka');
      return;
    }
    if (form.specializations.length === 0) {
      toast.error('Odaberite barem jednu specijalizaciju');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/trainer-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Profil spremljen!');
        startTransition(() => router.refresh());
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Trener Dashboard</h1>
          <p className="text-muted-foreground text-sm">{trainer.name} — {trainer.city}</p>
        </div>
        {trainer.certified && (
          <Badge className="bg-green-100 text-green-700 border-green-200 ml-auto">Certificiran</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{trainer.rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Ocjena</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{trainer.review_count}</p>
            <p className="text-xs text-muted-foreground">Recenzija</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{trainer.specializations?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Specijalizacija</p>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Vaše ime"
                className="focus:border-orange-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Opišite svoje iskustvo i pristup treniranju..."
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
            <CardTitle className="text-lg">Specijalizacije i cijena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {(Object.entries(TRAINING_TYPE_LABELS) as [TrainingType, string][]).map(
                ([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-3 rounded-xl border hover:border-orange-200 transition-colors"
                  >
                    <Switch
                      checked={form.specializations.includes(key)}
                      onCheckedChange={() => handleToggleSpecialization(key)}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                )
              )}
            </div>
            <div className="space-y-2">
              <Label>Cijena po satu (&euro;)</Label>
              <Input
                type="number"
                value={form.price_per_hour}
                onChange={(e) => setForm({ ...form, price_per_hour: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-32 focus:border-orange-300"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Certifikati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.certificates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.certificates.map((cert) => (
                  <Badge key={cert} variant="secondary" className="pr-1 flex items-center gap-1">
                    {cert}
                    <button
                      onClick={() => handleRemoveCertificate(cert)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="Naziv certifikata"
                className="focus:border-orange-300"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertificate())}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCertificate}
                disabled={!newCert.trim()}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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
    </div>
  );
}
