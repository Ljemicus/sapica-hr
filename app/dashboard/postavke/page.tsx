'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Tag,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PostavkePage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled] = useState(false);

  const [rezervacije, setRezervacije] = useState(true);
  const [poruke, setPoruke] = useState(true);
  const [promocije, setPromocije] = useState(true);
  const [izgubljeni, setIzgubljeni] = useState(true);

  function handleSave() {
    toast.success('Postavke su spremljene!');
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

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6"
          >
            <Save className="mr-2 h-4 w-4" />
            Spremi promjene
          </Button>
        </div>
      </div>
    </div>
  );
}
