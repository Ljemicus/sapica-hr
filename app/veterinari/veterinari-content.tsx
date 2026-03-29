'use client';

import { useState, useMemo } from 'react';
import { MapPin, Phone, Clock, Star, Stethoscope, Search, AlertTriangle, PawPrint, Siren } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CITIES } from '@/lib/types';

interface VetClinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  rating: number;
  reviewCount: number;
  emergency: boolean;
  services: string[];
}

const VET_CLINICS: VetClinic[] = [
  { id: 'v1', name: 'Veterinarska stanica Zagreb', address: 'Heinzelova 55', city: 'Zagreb', phone: '01 2441 241', hours: 'Non-stop', rating: 4.7, reviewCount: 89, emergency: true, services: ['Kirurgija', 'Interna medicina', 'Stomatologija'] },
  { id: 'v2', name: 'Vetmobile Zagreb', address: 'Savska cesta 41', city: 'Zagreb', phone: '01 4843 385', hours: 'Pon-Pet 08-20, Sub 09-14', rating: 4.5, reviewCount: 52, emergency: false, services: ['Cijepljenje', 'Mikročipiranje', 'Dermatologija'] },
  { id: 'v3', name: 'Klinika za male životinje', address: 'Vladimira Nazora 12', city: 'Zagreb', phone: '01 3794 200', hours: 'Pon-Pet 09-19, Sub 09-13', rating: 4.8, reviewCount: 134, emergency: false, services: ['Ortopedija', 'Kardiologija', 'Neurologija'] },
  { id: 'v4', name: 'Veterinarska ambulanta Rexter', address: 'Ulica grada Vukovara 284', city: 'Zagreb', phone: '01 6151 666', hours: 'Pon-Sub 08-20', rating: 4.6, reviewCount: 45, emergency: true, services: ['Hitna pomoć', 'Kirurgija', 'Laboratorij'] },
  { id: 'v5', name: 'Vet Point Split', address: 'Poljička cesta 26', city: 'Split', phone: '021 465 555', hours: 'Pon-Pet 08-20, Sub 09-14', rating: 4.4, reviewCount: 67, emergency: false, services: ['Interna medicina', 'Dermatologija', 'Stomatologija'] },
  { id: 'v6', name: 'Veterinarska stanica Split', address: 'Katalinićeva 2', city: 'Split', phone: '021 344 455', hours: 'Non-stop', rating: 4.6, reviewCount: 78, emergency: true, services: ['Hitna pomoć', 'Kirurgija', 'Rendgen'] },
  { id: 'v7', name: 'Veterinarska ambulanta Canimaris', address: 'Spinčićeva 4', city: 'Split', phone: '021 535 000', hours: 'Pon-Pet 09-18, Sub 09-13', rating: 4.3, reviewCount: 31, emergency: false, services: ['Cijepljenje', 'Preventiva', 'Mikročipiranje'] },
  { id: 'v8', name: 'Veterinarska stanica Rijeka', address: 'Zvonimirova 5', city: 'Rijeka', phone: '051 325 670', hours: 'Non-stop', rating: 4.5, reviewCount: 91, emergency: true, services: ['Hitna pomoć', 'Kirurgija', 'Interna medicina'] },
  { id: 'v9', name: 'Vet ambulanta Mačak', address: 'Fiumara 13', city: 'Rijeka', phone: '051 211 222', hours: 'Pon-Pet 08-19, Sub 09-13', rating: 4.7, reviewCount: 43, emergency: false, services: ['Mačke specijalist', 'Stomatologija', 'Dermatologija'] },
  { id: 'v10', name: 'Veterinarska ambulanta Rex', address: 'Krešimirova 15', city: 'Rijeka', phone: '051 333 444', hours: 'Pon-Sub 08-20', rating: 4.4, reviewCount: 28, emergency: false, services: ['Ortopedija', 'Cijepljenje', 'Laboratorij'] },
  { id: 'v11', name: 'Veterinarska stanica Osijek', address: 'Drinska 12', city: 'Osijek', phone: '031 200 720', hours: 'Non-stop', rating: 4.6, reviewCount: 65, emergency: true, services: ['Hitna pomoć', 'Kirurgija', 'Rendgen'] },
  { id: 'v12', name: 'Vet ambulanta PetVet', address: 'Europska avenija 8', city: 'Osijek', phone: '031 284 333', hours: 'Pon-Pet 08-18, Sub 09-13', rating: 4.5, reviewCount: 37, emergency: false, services: ['Preventiva', 'Cijepljenje', 'Ultrazvuk'] },
  { id: 'v13', name: 'Veterinarska ambulanta Zadar', address: 'Put Dikla 4', city: 'Zadar', phone: '023 250 600', hours: 'Pon-Pet 08-20, Sub 09-14', rating: 4.4, reviewCount: 42, emergency: false, services: ['Interna medicina', 'Stomatologija', 'Laboratorij'] },
  { id: 'v14', name: 'Veterinarska stanica Zadar', address: 'Ante Starčevića 2', city: 'Zadar', phone: '023 315 015', hours: 'Non-stop', rating: 4.7, reviewCount: 53, emergency: true, services: ['Hitna pomoć', 'Kirurgija', 'Kardiologija'] },
  { id: 'v15', name: 'Veterinarska ambulanta Pula', address: 'Vergerova 1', city: 'Pula', phone: '052 500 123', hours: 'Pon-Pet 08-19, Sub 09-13', rating: 4.3, reviewCount: 29, emergency: false, services: ['Preventiva', 'Cijepljenje', 'Dermatologija'] },
  { id: 'v16', name: 'Veterinarska stanica Dubrovnik', address: 'Dr. Ante Starčevića 47', city: 'Dubrovnik', phone: '020 411 500', hours: 'Pon-Sub 08-20', rating: 4.5, reviewCount: 34, emergency: true, services: ['Hitna pomoć', 'Kirurgija', 'Interna medicina'] },
  { id: 'v17', name: 'Vet Centar Varaždin', address: 'Ulica Ivana Kukuljevića 10', city: 'Varaždin', phone: '042 302 555', hours: 'Pon-Pet 08-18, Sub 09-13', rating: 4.6, reviewCount: 41, emergency: false, services: ['Ortopedija', 'Cijepljenje', 'Ultrazvuk'] },
  { id: 'v18', name: 'Veterinarska ambulanta Karlovac', address: 'Rakovac 2', city: 'Karlovac', phone: '047 611 222', hours: 'Pon-Pet 08-19, Sub 09-14', rating: 4.4, reviewCount: 26, emergency: false, services: ['Preventiva', 'Stomatologija', 'Laboratorij'] },
];

export function VeterinariContent() {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const filteredClinics = useMemo(() => {
    return VET_CLINICS.filter((clinic) => {
      if (selectedCity !== 'all' && clinic.city !== selectedCity) return false;
      if (emergencyOnly && !clinic.emergency) return false;
      return true;
    });
  }, [selectedCity, emergencyOnly]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/30 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 mb-6">
            <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Veterinarski imenik</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Veterinarske{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              ordinacije
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pronađite pouzdane veterinarske ordinacije u vašem gradu. Pregled klinika s ocjenama, radnim vremenom i kontakt podacima.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="container mx-auto px-4 -mt-8">
        <div className="bg-card rounded-2xl shadow-md border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v ?? 'all')}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Odaberite grad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi gradovi</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Samo hitna služba</span>
          </label>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 py-10">
        <p className="text-sm text-muted-foreground mb-6">
          Pronađeno <span className="font-semibold text-foreground">{filteredClinics.length}</span>{' '}
          {filteredClinics.length === 1 ? 'ordinacija' : 'ordinacija'}
        </p>

        {filteredClinics.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">Nema rezultata za odabrane filtere.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <Card key={clinic.id} className="border-0 shadow-sm rounded-2xl card-hover">
                <CardContent className="p-6">
                  {/* Name & Emergency Badge */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h3 className="font-bold text-lg leading-tight">{clinic.name}</h3>
                    {clinic.emergency && (
                      <Badge variant="destructive" className="shrink-0 flex items-center gap-1">
                        <Siren className="h-3 w-3" />
                        Hitna služba
                      </Badge>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{clinic.address}, {clinic.city}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">
                      {clinic.phone}
                    </a>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{clinic.hours}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{clinic.rating}</span>
                    <span className="text-muted-foreground">({clinic.reviewCount} recenzija)</span>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
