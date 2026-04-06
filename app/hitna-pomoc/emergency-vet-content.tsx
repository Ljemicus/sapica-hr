'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, Clock, Navigation, Search, HeartPulse, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n/context';

interface EmergencyVetClinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  is_24h: boolean;
  services: string[];
  coordinates?: { lat: number; lng: number };
  distance?: number | null;
}

interface EmergencyVetContentProps {
  userCity?: string;
}

export function EmergencyVetContent({ userCity }: EmergencyVetContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [clinics, setClinics] = useState<EmergencyVetClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState(userCity || '');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch clinics
  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async (city?: string) => {
    try {
      setLoading(true);
      const url = city 
        ? `/api/emergency-vets?city=${encodeURIComponent(city)}`
        : '/api/emergency-vets';
      const res = await fetch(url);
      const data = await res.json();
      setClinics(data.clinics || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyClinics = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/emergency-vets/nearby?lat=${lat}&lng=${lng}&radius=50`);
      const data = await res.json();
      setClinics(data.clinics || []);
    } catch (error) {
      console.error('Error fetching nearby clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchClinics(searchCity);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(isEn ? 'Geolocation is not supported' : 'Geolokacija nije podržana');
      return;
    }
    
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchNearbyClinics(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(isEn ? 'Could not get your location' : 'Nije moguće dohvatiti lokaciju');
        setLocationLoading(false);
      }
    );
  };

  // Group clinics by city
  const groupedClinics = useMemo(() => {
    const groups: Record<string, EmergencyVetClinic[]> = {};
    clinics.forEach((clinic) => {
      if (!groups[clinic.city]) {
        groups[clinic.city] = [];
      }
      groups[clinic.city].push(clinic);
    });
    return groups;
  }, [clinics]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const handleNavigate = (address: string, city: string) => {
    const query = encodeURIComponent(`${address}, ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const cities = Object.keys(groupedClinics).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-teal-50/20">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 organizations-hero-gradient dot-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="section-kicker mb-4">
            <HeartPulse className="h-4 w-4" />
            {isEn ? 'Emergency Service' : 'Hitna služba'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-[var(--font-heading)] text-slate-900">
            {isEn ? 'Emergency Veterinary Care' : 'Hitna veterinarska pomoć'}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            {isEn 
              ? 'Find 24/7 emergency veterinary stations and on-call clinics across Croatia. Quick access to life-saving care for your pet.'
              : 'Pronađite veterinarske stanice s hitnom službom i dežurne ambulante širom Hrvatske. Brzi pristup životno važnoj skrbi za vašeg ljubimca.'}
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={isEn ? 'Search by city...' : 'Pretraži po gradu...'}
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 text-white shadow-lg shadow-orange-200"
            >
              {isEn ? 'Search' : 'Traži'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleLocateMe}
              disabled={locationLoading}
              className="border-orange-200 hover:bg-orange-50"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {locationLoading 
                ? (isEn ? 'Locating...' : 'Lociranje...')
                : (isEn ? 'Near me' : 'U blizini')
              }
            </Button>
          </div>
        </div>
      </section>

      {/* Emergency Alert */}
      <section className="container mx-auto px-4 -mt-4 mb-8">
        <Card className="community-section-card border-l-4 border-l-red-500 shadow-eve">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-xl shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-slate-900">
                  {isEn ? 'Life-threatening emergency?' : 'Životno ugrožavajuća hitnost?'}
                </h3>
                <p className="text-slate-600 mb-4">
                  {isEn 
                    ? 'If your pet is unconscious, bleeding heavily, having seizures, or having trouble breathing — call immediately and go directly to the nearest 24/7 station.'
                    : 'Ako je vaš ljubimac onesviješten, jako krvareći, ima napade ili poteškoća s disanjem — nazovite odmah i idite direktno do najbliže 0-24 stanice.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {clinics.filter(c => c.is_24h).slice(0, 2).map((clinic) => (
                    <Button 
                      key={clinic.id}
                      size="sm" 
                      className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-200"
                      onClick={() => handleCall(clinic.phone)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {clinic.city}: {clinic.phone}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Tips */}
      <section className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="community-section-card bg-gradient-to-br from-warm-orange/10 to-warm-coral/5 border-warm-orange/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-warm-orange to-warm-coral p-2.5 rounded-xl shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {isEn ? 'First: Call ahead' : 'Prvo: Nazovite unaprijed'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEn 
                      ? 'Describe symptoms clearly. They will prepare and guide you.'
                      : 'Jasno opišite simptome. Pripremit će se i uputiti vas.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="community-section-card bg-gradient-to-br from-warm-teal/10 to-warm-coral/5 border-warm-teal/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-warm-teal to-teal-500 p-2.5 rounded-xl shrink-0">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {isEn ? 'Then: Navigate safely' : 'Zatim: Vozite sigurno'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isEn 
                      ? 'Use Google Maps for directions. Drive carefully but quickly.'
                      : 'Koristite Google Maps za upute. Vozite oprezno ali brzo.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Clinics List */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <p className="mt-4 text-slate-500">
              {isEn ? 'Loading emergency clinics...' : 'Učitavanje hitnih stanica...'}
            </p>
          </div>
        ) : clinics.length === 0 ? (
          <Card className="community-section-card text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HeartPulse className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {isEn ? 'No clinics found' : 'Nema pronađenih stanica'}
              </h3>
              <p className="text-slate-500 mb-4">
                {isEn 
                  ? 'Try searching for a different city or use "Near me" to find closest clinics.'
                  : 'Pokušajte pretražiti drugi grad ili koristite "U blizini" za najbliže stanice.'}
              </p>
              <Button onClick={() => { setSearchCity(''); fetchClinics(); }}>
                {isEn ? 'Show all' : 'Prikaži sve'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {cities.map((city) => (
              <div key={city}>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  {city}
                  <Badge variant="secondary" className="ml-2 bg-slate-100">
                    {groupedClinics[city].length}
                  </Badge>
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groupedClinics[city].map((clinic) => (
                    <Card 
                      key={clinic.id}
                      className={`community-section-card transition-all hover:shadow-eve ${
                        clinic.is_24h 
                          ? 'border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/30 to-white' 
                          : ''
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-bold text-lg text-slate-900">{clinic.name}</h3>
                          {clinic.is_24h && (
                            <Badge className="bg-gradient-to-r from-red-600 to-red-500 text-white border-0 shadow-md shadow-red-200 flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3" />
                              0-24
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                          <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                          <span>{clinic.address}</span>
                        </div>

                        {clinic.distance !== null && clinic.distance !== undefined && (
                          <div className="text-sm text-orange-600 font-medium mb-3">
                            {isEn ? 'Distance:' : 'Udaljenost:'} {clinic.distance} km
                          </div>
                        )}

                        {clinic.services && clinic.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {clinic.services.slice(0, 4).map((service) => (
                              <Badge 
                                key={service} 
                                variant="outline" 
                                className="text-xs bg-warm-orange/10 text-slate-700 border-warm-orange/20"
                              >
                                {service}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 text-white shadow-md shadow-orange-200"
                            onClick={() => handleCall(clinic.phone)}
                          >
                            <Phone className="h-4 w-4 mr-1.5" />
                            {clinic.phone}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleNavigate(clinic.address, clinic.city)}
                            className="border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                          >
                            <Navigation className="h-4 w-4 mr-1.5" />
                            {isEn ? 'Navigate' : 'Navigacija'}
                          </Button>

                          {clinic.website && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(clinic.website, '_blank')}
                              className="text-slate-500 hover:text-slate-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
