'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  ArrowLeft, Printer, Syringe, AlertTriangle, Pill,
  Stethoscope, FileText, Phone, MapPin, QrCode, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { Pet, PetPassport } from '@/lib/types';

interface Props {
  pet: Pet;
  passport: PetPassport;
}

const speciesEmoji: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐰',
};

const severityColors: Record<string, string> = {
  blaga: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  umjerena: 'bg-orange-100 text-orange-700 border-orange-200',
  ozbiljna: 'bg-red-100 text-red-700 border-red-200',
};

export function PetPassportView({ pet, passport }: Props) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl print:max-w-none print:p-0">
      <div className="print:hidden">
        <Link href="/dashboard/vlasnik" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Natrag na nadzornu ploču
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center shadow-lg text-3xl">
            {speciesEmoji[pet.species] || '🐾'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{pet.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{pet.species === 'dog' ? 'Pas' : pet.species === 'cat' ? 'Mačka' : 'Ostalo'}</span>
              {pet.breed && <><span>•</span><span>{pet.breed}</span></>}
              {pet.age && <><span>•</span><span>{pet.age} god.</span></>}
              {pet.weight && <><span>•</span><span>{pet.weight} kg</span></>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Link href={`/ljubimac/${pet.id}/kartica`}>
            <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
              <Share2 className="h-4 w-4 mr-1" /> Kartica
            </Button>
          </Link>
          <Button
            variant="outline"
            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-1" /> Ispis
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Vaccinations */}
        <Card className="border-0 shadow-sm animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Syringe className="h-4 w-4 text-white" />
              </div>
              Cijepljenja
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passport.vaccinations.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nema zabilježenih cijepljenja.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Cjepivo</th>
                      <th className="pb-2 font-medium text-muted-foreground">Datum</th>
                      <th className="pb-2 font-medium text-muted-foreground">Veterinar</th>
                      <th className="pb-2 font-medium text-muted-foreground">Sljedeći termin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passport.vaccinations.map((v, i) => {
                      const isOverdue = new Date(v.next_date) < new Date();
                      return (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 font-medium">{v.name}</td>
                          <td className="py-3 text-muted-foreground">{format(new Date(v.date), 'd. MMM yyyy.', { locale: hr })}</td>
                          <td className="py-3 text-muted-foreground">{v.vet}</td>
                          <td className="py-3">
                            <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                              {format(new Date(v.next_date), 'd. MMM yyyy.', { locale: hr })}
                              {isOverdue && ' ⚠️'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="border-0 shadow-sm animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              Alergije
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passport.allergies.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nema zabilježenih alergija.</p>
            ) : (
              <div className="space-y-3">
                {passport.allergies.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <Badge className={`${severityColors[a.severity]} border flex-shrink-0`}>
                      {a.severity === 'blaga' ? 'Blaga' : a.severity === 'umjerena' ? 'Umjerena' : 'Ozbiljna'}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="border-0 shadow-sm animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Pill className="h-4 w-4 text-white" />
              </div>
              Lijekovi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passport.medications.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nema trenutnih lijekova.</p>
            ) : (
              <div className="space-y-3">
                {passport.medications.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{m.name}</p>
                      <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">{m.dose}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.schedule}</p>
                    <p className="text-xs text-muted-foreground">
                      Od: {format(new Date(m.start_date), 'd. MMM yyyy.', { locale: hr })}
                      {m.end_date ? ` — Do: ${format(new Date(m.end_date), 'd. MMM yyyy.', { locale: hr })}` : ' — Trajno'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vet Info */}
        <Card className="border-0 shadow-sm animate-fade-in-up delay-400">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              Veterinar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{passport.vet_info.name}</p>
                {passport.vet_info.emergency && (
                  <Badge className="bg-red-100 text-red-700 border border-red-200">Hitni kontakt</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <a href={`tel:${passport.vet_info.phone}`} className="hover:text-orange-500">{passport.vet_info.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{passport.vet_info.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-0 shadow-sm animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              Posebne napomene
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-100">
              {passport.notes}
            </p>
          </CardContent>
        </Card>

        {/* QR Code Placeholder */}
        <Card className="border-0 shadow-sm animate-fade-in-up delay-600">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <QrCode className="h-4 w-4 text-white" />
              </div>
              QR Kod
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              {/* CSS-drawn QR placeholder */}
              <div className="w-32 h-32 bg-white border-2 border-gray-800 rounded-lg p-2 relative">
                <div className="absolute top-2 left-2 w-6 h-6 border-2 border-gray-800 bg-gray-800 rounded-sm" />
                <div className="absolute top-2 right-2 w-6 h-6 border-2 border-gray-800 bg-gray-800 rounded-sm" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-gray-800 bg-gray-800 rounded-sm" />
                <div className="grid grid-cols-5 gap-0.5 absolute inset-0 m-auto w-14 h-14">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div
                      key={i}
                      className={`rounded-[1px] ${[0,1,3,5,7,8,10,12,14,16,17,19,21,23,24].includes(i) ? 'bg-gray-800' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Skenirajte za pristup zdravstvenom kartonu
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, footer, .print\\:hidden { display: none !important; }
          body { font-size: 12px; }
          .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
