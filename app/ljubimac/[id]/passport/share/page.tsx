import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Syringe, AlertTriangle, Pill, Stethoscope, FileText, QrCode, PawPrint } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { PetPassport, Pet } from '@/lib/types';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

async function getPetWithPassport(petId: string): Promise<{ pet: Pet; passport: PetPassport } | null> {
  const supabase = await createClient();
  
  const [{ data: pet }, { data: passport }] = await Promise.all([
    supabase.from('pets').select('*').eq('id', petId).single(),
    supabase.from('pet_passports').select('*').eq('pet_id', petId).single(),
  ]);
  
  if (!pet) return null;
  
  return {
    pet: pet as Pet,
    passport: (passport || {
      pet_id: petId,
      vaccinations: [],
      allergies: [],
      medications: [],
      vet_info: { name: '', phone: '', address: '', emergency: false },
      notes: '',
    }) as PetPassport,
  };
}

const ALLERGY_SEVERITIES: Record<string, { label: string; color: string }> = {
  blaga: { label: 'Blaga', color: 'bg-yellow-100 text-yellow-800' },
  umjerena: { label: 'Umjerena', color: 'bg-orange-100 text-orange-800' },
  ozbiljna: { label: 'Ozbiljna', color: 'bg-red-100 text-red-800' },
};

export default async function SharePassportPage({ params }: SharePageProps) {
  const { id } = await params;
  const data = await getPetWithPassport(id);
  
  if (!data) {
    notFound();
  }
  
  const { pet, passport } = data;

  const getVaccinationStatus = (nextDate: string) => {
    if (!nextDate) return { label: 'Nema datuma', color: 'bg-gray-100 text-gray-800' };
    const date = parseISO(nextDate);
    if (isPast(date)) return { label: 'ISTEKLO', color: 'bg-red-100 text-red-800 border-red-300' };
    return { label: 'Važeće', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-teal-50/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-warm-orange to-warm-teal rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <PawPrint className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">🐾 Pet Passport</h1>
              <p className="text-white/80">
                {pet.name} · {pet.breed || pet.species} · {pet.age ? `${pet.age} god.` : ''}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-white/80">
            <QrCode className="h-4 w-4" />
            <span>Digitalni zdravstveni karton — PetPark.hr</span>
          </div>
        </div>

        {/* Emergency Info Alert */}
        {passport.allergies?.some(a => a.severity === 'ozbiljna') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">OZBILJNE ALERGIJE</h3>
              <p className="text-sm text-red-700">
                Ovaj ljubimac ima ozbiljne alergije. Pogledajte sekciju alergija prije bilo kakve interakcije.
              </p>
            </div>
          </div>
        )}

        {/* Vaccinations */}
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Syringe className="h-5 w-5 text-warm-orange" />
              Cijepljenja
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passport.vaccinations?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nema podataka o cijepljenjima</p>
            ) : (
              <div className="space-y-3">
                {passport.vaccinations.map((vax, index) => {
                  const status = getVaccinationStatus(vax.next_date);
                  return (
                    <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vax.name}</span>
                          <Badge variant="outline" className={status.color}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(vax.date), 'd.M.yyyy.')}
                          {vax.next_date && ` → sljedeće: ${format(parseISO(vax.next_date), 'd.M.yyyy.')}`}
                        </p>
                        {vax.vet && <p className="text-xs text-muted-foreground">Vet: {vax.vet}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allergies */}
        {passport.allergies?.length > 0 && (
          <Card className="border-0 shadow-sm mb-4 border-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Alergije
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {passport.allergies.map((allergy, index) => {
                  const severity = ALLERGY_SEVERITIES[allergy.severity] || ALLERGY_SEVERITIES.blaga;
                  return (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{allergy.name}</span>
                        <Badge className={severity.color}>{severity.label}</Badge>
                      </div>
                      {allergy.notes && <p className="text-sm text-muted-foreground">{allergy.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medications */}
        {passport.medications?.length > 0 && (
          <Card className="border-0 shadow-sm mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-500" />
                Lijekovi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {passport.medications.map((med, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="font-medium">{med.name}</span>
                    <p className="text-sm text-muted-foreground">Doza: {med.dose}</p>
                    {med.schedule && <p className="text-sm text-muted-foreground">Raspored: {med.schedule}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vet Info */}
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-warm-teal" />
              Veterinar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passport.vet_info?.name ? (
              <div className="space-y-2">
                <p className="font-medium">{passport.vet_info.name}</p>
                {passport.vet_info.phone && (
                  <p className="text-sm text-muted-foreground">
                    <a href={`tel:${passport.vet_info.phone}`} className="text-warm-orange hover:underline">
                      {passport.vet_info.phone}
                    </a>
                    {passport.vet_info.emergency && (
                      <Badge className="ml-2 bg-red-100 text-red-800">Hitna 24/7</Badge>
                    )}
                  </p>
                )}
                {passport.vet_info.address && (
                  <p className="text-sm text-muted-foreground">{passport.vet_info.address}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nema podataka o veterinaru</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {passport.notes && (
          <Card className="border-0 shadow-sm mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-warm-coral" />
                Dodatne bilješke
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{passport.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Generirano putem PetPark.hr</p>
          <p className="text-xs mt-1">Vlasnik je odgovoran za točnost podataka</p>
        </div>
      </div>
    </div>
  );
}
