'use client';

import { useState, useMemo } from 'react';
import { MapPin, Phone, Siren, Clock, ShieldAlert, Navigation, ChevronDown, ChevronUp, ExternalLink, HeartPulse, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVeterinarianEmergencyLabel, getVeterinarianPrimaryPhone, type Veterinarian } from '@/lib/db/veterinarian-helpers';
import { useLanguage } from '@/lib/i18n/context';

interface EmergencyVetContentProps {
  veterinarians: Veterinarian[];
  userCity?: string;
}

export function EmergencyVetContent({ veterinarians, userCity }: EmergencyVetContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Filter only emergency-capable vets
  const emergencyVets = useMemo(() => {
    return veterinarians
      .filter((v) => v.emergency_verified && v.emergency_mode)
      .sort((a, b) => {
        // Prioritize user's city
        if (userCity) {
          const aInCity = a.city.toLowerCase() === userCity.toLowerCase();
          const bInCity = b.city.toLowerCase() === userCity.toLowerCase();
          if (aInCity && !bInCity) return -1;
          if (!aInCity && bInCity) return 1;
        }
        // Then prioritize 24h open
        const a24h = a.emergency_mode === 'open_24h' ? 1 : 0;
        const b24h = b.emergency_mode === 'open_24h' ? 1 : 0;
        if (a24h !== b24h) return b24h - a24h;
        return a.name.localeCompare(b.name, 'hr');
      });
  }, [veterinarians, userCity]);

  const displayedVets = showAll ? emergencyVets : emergencyVets.slice(0, 6);

  const getEmergencyBadge = (mode: Veterinarian['emergency_mode']) => {
    switch (mode) {
      case 'open_24h':
        return { class: 'bg-gradient-to-r from-red-600 to-red-500 text-white border-0 shadow-lg shadow-red-200', icon: Clock, label: isEn ? 'Open 24/7' : '0-24 otvoreno' };
      case 'on_call':
        return { class: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg shadow-orange-200', icon: Siren, label: isEn ? 'On Call' : 'Dežurni' };
      case 'emergency_contact':
        return { class: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-lg shadow-amber-200', icon: Phone, label: isEn ? 'Emergency Contact' : 'Hitni kontakt' };
      case 'emergency_intake':
        return { class: 'bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white border-0 shadow-lg shadow-fuchsia-200', icon: ShieldAlert, label: isEn ? 'Emergency Intake' : 'Hitni prijem' };
      default:
        return { class: 'bg-gray-500 text-white', icon: ShieldAlert, label: '' };
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const handleNavigate = (address: string, city: string) => {
    const query = encodeURIComponent(`${address}, ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (emergencyVets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-orange-50/30">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-orange-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/30">
              <Siren className="h-4 w-4" />
              {isEn ? 'Emergency Service' : 'Hitna služba'}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] text-white">
              {isEn ? 'Emergency Veterinary Care' : 'Hitna veterinarska pomoć'}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              {isEn 
                ? 'Currently no verified emergency veterinarians in our database. Call your nearest veterinary station directly.'
                : 'Trenutno nemamo verificiranih hitnih veterinarskih stanica u bazi. Pozovite najbližu veterinarsku stanicu direktno.'}
            </p>
          </div>
        </section>
        
        <section className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-md mx-auto border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {isEn ? 'General Emergency Number' : 'Opći hitni broj'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isEn ? 'For immediate assistance, contact:' : 'Za hitnu pomoć, kontaktirajte:'}
              </p>
              <Button size="lg" className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-200" onClick={() => handleCall('01 6111 222')}>
                <Phone className="h-4 w-4 mr-2" />
                01 6111 222
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/20 via-white to-orange-50/20">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-orange-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/30">
            <Siren className="h-4 w-4" />
            {isEn ? 'Emergency Service' : 'Hitna služba'}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] text-white">
            {isEn ? 'Emergency Veterinary Care' : 'Hitna veterinarska pomoć'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
            {isEn 
              ? 'Verified 24/7 emergency veterinary stations and on-call clinics. Call immediately for urgent situations.'
              : 'Verificirane veterinarske stanice s hitnom službom i dežurnim ambulantama. Pozovite odmah u hitnim slučajevima.'}
          </p>
          
          {userCity && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
              <MapPin className="h-4 w-4" />
              {isEn ? `Showing near ${userCity}` : `Prikazujem u blizini ${userCity}`}
            </div>
          )}
        </div>
      </section>

      {/* Emergency Alert Banner */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <Card className="bg-gradient-to-r from-red-600 to-red-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl shrink-0">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">
                  {isEn ? 'Life-threatening emergency?' : 'Životno ugrožavajuća hitnost?'}
                </h3>
                <p className="text-white/90 mb-4">
                  {isEn 
                    ? 'If your pet is unconscious, bleeding heavily, or having trouble breathing, call immediately and go directly to the nearest 24/7 station.'
                    : 'Ako je vaš ljubimac onesviješten, jako krvareći ili ima poteškoća s disanjem, nazovite odmah i idite direktno do najbliže 0-24 stanice.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg" 
                    className="bg-white text-red-600 hover:bg-white/90 font-semibold"
                    onClick={() => handleCall(emergencyVets[0]?.phone || '01 6111 222')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {isEn ? 'Call Now' : 'Nazovi odmah'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50/50 border-red-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-xl shrink-0">
                  <Phone className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">
                    {isEn ? 'First: Call the nearest station' : 'Prvo: Nazovite najbližu stanicu'}
                  </h3>
                  <p className="text-sm text-red-700/80 mb-3">
                    {isEn 
                      ? 'Describe the situation clearly. They will guide you on next steps.'
                      : 'Jasno opišite situaciju. Uputit će vas što dalje.'}
                  </p>
                  <p className="text-xs text-red-600/70">
                    {isEn ? 'If no answer, try the next station on the list.' : 'Ako se ne jave, pokušajte sljedeću stanicu s popisa.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border-amber-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-3 rounded-xl shrink-0">
                  <Navigation className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    {isEn ? 'Then: Navigate there' : 'Zatim: Navigirajte do tamo'}
                  </h3>
                  <p className="text-sm text-amber-700/80 mb-3">
                    {isEn 
                      ? 'Use the Navigate button to open Google Maps with directions.'
                      : 'Koristite gumb Navigacija za otvaranje Google Maps s uputama.'}
                  </p>
                  <p className="text-xs text-amber-600/70">
                    {isEn ? 'Drive safely. Call ahead if the condition worsens.' : 'Vozite oprezno. Nazovite unaprijed ako se stanje pogorša.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Emergency Vets List */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {isEn ? 'Emergency Stations' : 'Hitne stanice'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isEn ? 'Verified and available now' : 'Verificirane i dostupne sada'}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-0 px-3 py-1">
            {emergencyVets.length} {isEn ? 'verified' : 'verificiranih'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedVets.map((vet) => {
            const badge = getEmergencyBadge(vet.emergency_mode);
            const phone = getVeterinarianPrimaryPhone(vet);
            const isExpanded = expandedId === vet.id;

            return (
              <Card 
                key={vet.id} 
                className={`border-2 transition-all hover:shadow-lg ${
                  vet.emergency_mode === 'open_24h' 
                    ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-white hover:border-red-300' 
                    : 'border-orange-200 bg-gradient-to-br from-orange-50/30 to-white hover:border-orange-300'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate">{vet.name}</h3>
                      {vet.organization_name && vet.organization_name !== vet.name && (
                        <p className="text-sm text-muted-foreground truncate">{vet.organization_name}</p>
                      )}
                    </div>
                    <Badge className={`${badge.class} shrink-0 flex items-center gap-1.5 px-2.5 py-1`}>
                      <badge.icon className="h-3 w-3" />
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 shrink-0 text-red-500" />
                    <span className="truncate">{vet.address}, {vet.city}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-200"
                      onClick={() => handleCall(phone)}
                    >
                      <Phone className="h-4 w-4 mr-1.5" />
                      {phone}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNavigate(vet.address, vet.city)}
                      className="border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <Navigation className="h-4 w-4 mr-1.5" />
                      {isEn ? 'Navigate' : 'Navigacija'}
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : vet.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          {isEn ? 'Less' : 'Manje'}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          {isEn ? 'More' : 'Više'}
                        </>
                      )}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-dashed space-y-3 text-sm">
                      {vet.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium text-foreground min-w-[60px]">Email:</span>
                          <a href={`mailto:${vet.email}`} className="hover:text-foreground hover:underline">
                            {vet.email}
                          </a>
                        </div>
                      )}
                      {vet.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium text-foreground min-w-[60px]">Web:</span>
                          <a 
                            href={vet.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-foreground flex items-center gap-1 hover:underline"
                          >
                            {vet.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {vet.emergency_source_note && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <span className="font-medium text-foreground min-w-[60px] shrink-0">Info:</span>
                          <span>{vet.emergency_source_note}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-[60px]">Status:</span>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {isEn ? 'Verified emergency contact' : 'Verificirani hitni kontakt'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {emergencyVets.length > 6 && (
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
              className="border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  {isEn ? 'Show less' : 'Prikaži manje'}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  {isEn ? `Show all ${emergencyVets.length} stations` : `Prikaži svih ${emergencyVets.length} stanica`}
                </>
              )}
            </Button>
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 pb-12">
        <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-dashed border-muted-foreground/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-2">
                  {isEn ? 'Important disclaimer' : 'Važna napomena'}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isEn 
                    ? 'This list contains verified emergency contacts, but availability can change. Always call ahead to confirm. For life-threatening emergencies, proceed directly to the nearest station. PetPark is not responsible for service availability or outcomes.'
                    : 'Ovaj popis sadrži verificirane hitne kontakte, ali dostupnost se može promijeniti. Uvijek nazovite unaprijed da potvrdite. Za životno ugrožavajuće hitne slučajeve, odmah idite do najbliže stanice. PetPark nije odgovoran za dostupnost usluga ili ishode.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
