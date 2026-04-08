'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Search, PawPrint, Siren, Mail, Globe, ShieldCheck, Building2, Clock3, ShieldAlert, MessageSquare, ChevronRight, Map, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getVeterinarianEmergencyLabel, getVeterinarianPrimaryPhone, type Veterinarian } from '@/lib/db/veterinarian-helpers';
import { StarRating } from '@/components/shared/star-rating';
import { useLanguage } from '@/lib/i18n/context';
import { LazyVeterinariMap } from './lazy-veterinari-map';

interface VeterinariContentProps {
  veterinarians: Veterinarian[];
}

function getEmergencyBadgeClass(mode: Veterinarian['emergency_mode']) {
  switch (mode) {
    case 'open_24h':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'on_call':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'emergency_contact':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'emergency_intake':
      return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

type ViewMode = 'list' | 'map';

export function VeterinariContent({ veterinarians }: VeterinariContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [stationOnly, setStationOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const cities = useMemo(
    () => Array.from(new Set(veterinarians.map((item) => item.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'hr')),
    [veterinarians],
  );

  const filteredClinics = useMemo(() => {
    return veterinarians
      .filter((clinic) => {
        if (selectedCity !== 'all' && clinic.city !== selectedCity) return false;
        if (stationOnly && clinic.type !== 'veterinarska_stanica') return false;
        return true;
      })
      .sort((a, b) => {
        if (a.emergency_verified !== b.emergency_verified) return a.emergency_verified ? -1 : 1;
        return a.name.localeCompare(b.name, 'hr');
      });
  }, [selectedCity, stationOnly, veterinarians]);

  const emergencyCount = useMemo(
    () => veterinarians.filter((clinic) => clinic.emergency_verified && clinic.emergency_mode).length,
    [veterinarians],
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="organizations-hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="section-kicker mb-6">
            {isEn ? 'Official veterinary directory' : 'Službeni veterinarski imenik'}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-[var(--font-heading)] text-white">
            {isEn ? 'Veterinary stations and clinics' : 'Veterinarske stanice i ambulante'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {isEn
              ? 'Official registry of veterinary stations and clinics in Croatia, with clearly marked verified emergency contacts where confirmed.'
              : 'Službeni registar veterinarskih stanice i ambulanti u Hrvatskoj, uz posebno označene verificirane hitne kontakte gdje su potvrđeni.'}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-8">
        <div className="bg-card rounded-2xl shadow-md border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v ?? 'all')}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={isEn ? 'Choose city' : 'Odaberite grad'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isEn ? 'All cities' : 'Svi gradovi'}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stationOnly}
                onChange={(e) => setStationOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">{isEn ? 'Veterinary stations only' : 'Samo veterinarske stanice'}</span>
            </label>

            <div className="flex border rounded-lg overflow-hidden">
              <Button
                type="button"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none border-r px-3 py-1.5 h-auto"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                <span className="text-sm">{isEn ? 'List' : 'Lista'}</span>
              </Button>
              <Button
                type="button"
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none px-3 py-1.5 h-auto"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-2" />
                <span className="text-sm">{isEn ? 'Map' : 'Karta'}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <p className="text-sm text-muted-foreground">
            {isEn ? 'Found ' : 'Pronađeno '}<span className="font-semibold text-foreground">{filteredClinics.length}</span>{isEn ? ' entries from the official registry and verified emergency additions.' : ' unosa iz službenog registra i verificiranih hitnih dopuna.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="w-fit bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {isEn ? 'Official source' : 'Službeni izvor'}
            </Badge>
            <Badge variant="secondary" className="w-fit bg-red-50 text-red-700 border border-red-200">
              <ShieldAlert className="h-3.5 w-3.5 mr-1" />
              {emergencyCount} {isEn ? 'verified emergency labels' : 'verificiranih hitnih oznaka'}
            </Badge>
          </div>
        </div>

        {filteredClinics.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">{isEn ? 'No results for the selected filters.' : 'Nema rezultata za odabrane filtere.'}</p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="mt-6">
            <LazyVeterinariMap 
              veterinarians={filteredClinics} 
              selectedCity={selectedCity}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => {
              const displayPhone = getVeterinarianPrimaryPhone(clinic);
              const emergencyLabel = getVeterinarianEmergencyLabel(clinic.emergency_mode);

              return (
                <Card key={clinic.id} className="border-0 shadow-sm rounded-2xl card-hover">
                  <Link href={`/veterinari/${clinic.slug}`} className="block">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{clinic.name}</h3>
                          {clinic.organization_name && clinic.organization_name !== clinic.name && (
                            <p className="text-sm text-muted-foreground mt-1">{clinic.organization_name}</p>
                          )}
                          {/* Rating */}
                          {(clinic.rating_avg && clinic.rating_avg > 0) ? (
                            <div className="flex items-center gap-2 mt-2">
                              <StarRating rating={clinic.rating_avg} size="sm" />
                              <span className="text-sm font-medium">{clinic.rating_avg.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">
                                ({clinic.review_count || 0})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="text-sm">{isEn ? 'No reviews yet' : 'Još nema recenzija'}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                            {clinic.type === 'veterinarska_stanica' ? (
                              <>
                                <Building2 className="h-3 w-3" />
                                {isEn ? 'Station' : 'Stanica'}
                              </>
                            ) : (
                              <>
                                <Siren className="h-3 w-3" />
                                {isEn ? 'Clinic' : 'Ambulanta'}
                              </>
                            )}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>

                      {clinic.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{clinic.address}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        {displayPhone ? (
                          <a href={`tel:${displayPhone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">
                            {displayPhone}
                          </a>
                        ) : (
                          <span>{isEn ? 'No contact listed' : 'Kontakt nije naveden'}</span>
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
                            {isEn ? 'Officially verified' : 'Službeno verificirano'}
                          </Badge>
                        )}
                        {clinic.emergency_verified && emergencyLabel && (
                          <Badge className={`text-xs border ${getEmergencyBadgeClass(clinic.emergency_mode)}`}>
                            <Clock3 className="h-3 w-3 mr-1" />
                            {emergencyLabel}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}