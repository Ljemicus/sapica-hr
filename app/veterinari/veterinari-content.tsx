'use client';

import { useMemo, useState } from 'react';
import { MapPin, Phone, Search, PawPrint, Siren, Mail, Globe, ShieldCheck, Building2, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Veterinarian } from '@/lib/db/veterinarians';

interface VeterinariContentProps {
  veterinarians: Veterinarian[];
}

export function VeterinariContent({ veterinarians }: VeterinariContentProps) {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [stationOnly, setStationOnly] = useState(false);

  const cities = useMemo(
    () => Array.from(new Set(veterinarians.map((item) => item.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'hr')),
    [veterinarians],
  );

  const filteredClinics = useMemo(() => {
    return veterinarians.filter((clinic) => {
      if (selectedCity !== 'all' && clinic.city !== selectedCity) return false;
      if (stationOnly && clinic.type !== 'veterinarska_stanica') return false;
      return true;
    });
  }, [selectedCity, stationOnly, veterinarians]);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/30 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 mb-6">
            <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Službeni veterinarski imenik</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Veterinarske{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              stanice i ambulante
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Službeni registar veterinarskih stanica i ambulanti u Hrvatskoj s adresama i kontakt podacima.
          </p>
        </div>
      </section>

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
                {cities.map((city) => (
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
              checked={stationOnly}
              onChange={(e) => setStationOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">Samo veterinarske stanice</span>
          </label>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <p className="text-sm text-muted-foreground">
            Pronađeno <span className="font-semibold text-foreground">{filteredClinics.length}</span> unosa iz službenog registra.
          </p>
          <Badge variant="secondary" className="w-fit bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Službeni izvor
          </Badge>
        </div>

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
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{clinic.name}</h3>
                      {clinic.organization_name && clinic.organization_name !== clinic.name && (
                        <p className="text-sm text-muted-foreground mt-1">{clinic.organization_name}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                      {clinic.type === 'veterinarska_stanica' ? (
                        <>
                          <Building2 className="h-3 w-3" />
                          Stanica
                        </>
                      ) : (
                        <>
                          <Siren className="h-3 w-3" />
                          Ambulanta
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{clinic.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    {clinic.phone ? (
                      <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">
                        {clinic.phone}
                      </a>
                    ) : (
                      <span>Kontakt nije naveden</span>
                    )}
                  </div>

                  {clinic.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a href={`mailto:${clinic.email}`} className="hover:text-foreground transition-colors break-all">
                        {clinic.email}
                      </a>
                    </div>
                  )}

                  {clinic.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Globe className="h-4 w-4 shrink-0" />
                      <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors break-all">
                        {clinic.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {clinic.city}
                    </Badge>
                    {clinic.county && (
                      <Badge variant="secondary" className="text-xs">
                        {clinic.county}
                      </Badge>
                    )}
                    {clinic.verified && (
                      <Badge className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                        Službeno verificirano
                      </Badge>
                    )}
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
