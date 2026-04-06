'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Printer, Phone, AlertTriangle, Dog, Cat, HelpCircle, Heart, Weight, Calendar, Cpu, PawPrint, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { PetCardData } from '@/lib/db';

interface PetCardContentProps {
  petId: string;
  pet: PetCardData | null;
}

const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈', other: '🐰' };
const speciesLabel: Record<string, string> = { dog: 'Pas', cat: 'Mačka', other: 'Ostalo' };
const speciesGradient: Record<string, string> = {
  dog: 'from-warm-orange to-amber-400',
  cat: 'from-purple-500 to-pink-400',
  other: 'from-warm-teal to-cyan-400',
};
const speciesBg: Record<string, string> = {
  dog: 'bg-orange-50 border-orange-100',
  cat: 'bg-purple-50 border-purple-100',
  other: 'bg-teal-50 border-teal-100',
};
const SpeciesIcon: Record<string, React.ElementType> = { dog: Dog, cat: Cat, other: HelpCircle };

export function PetCardContent({ petId, pet }: PetCardContentProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link kopiran!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Nije moguće kopirati link');
    }
  };

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground mb-2">Ljubimac nije pronađen.</p>
          <Link href="/" className="text-warm-orange hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Povratak na početnu
          </Link>
        </div>
      </div>
    );
  }

  const Icon = SpeciesIcon[pet.species] || HelpCircle;
  const gradient = speciesGradient[pet.species] || speciesGradient.other;
  const bgTheme = speciesBg[pet.species] || speciesBg.other;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-teal-50/20">
      {/* Header */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-xl">
          <div className="flex items-center justify-between">
            <Link href={`/ljubimac/${petId}/karton`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-warm-orange transition-colors">
              <ArrowLeft className="h-4 w-4" /> 
              <span>Zdravstveni karton</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-warm-orange">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-muted-foreground hover:text-warm-orange">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-xl print:max-w-none print:p-0">
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden animate-fade-in-up print:shadow-none">
          <CardContent className="p-0">
            {/* Hero with gradient */}
            <div className={`bg-gradient-to-br ${gradient} p-8 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              
              {/* PetPark branding */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-white/80">
                <PawPrint className="h-4 w-4" />
                <span className="text-sm font-bold">PetPark</span>
              </div>

              <div className="relative flex items-center gap-5">
                <div className="h-24 w-24 rounded-3xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-2xl text-5xl border border-white/30">
                  {speciesEmoji[pet.species]}
                </div>
                <div className="text-white">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-1">{pet.name}</h1>
                  <p className="text-white/90 font-medium text-lg">{speciesLabel[pet.species]} · {pet.breed}</p>
                  {pet.microchip && (
                    <p className="text-white/70 text-sm mt-1 font-mono">Chip: {pet.microchip.slice(-8)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Icon, label: 'Vrsta', value: speciesLabel[pet.species], gradient: 'from-warm-orange to-amber-400' },
                  { icon: Calendar, label: 'Dob', value: pet.age ? `${pet.age} god.` : 'N/A', gradient: 'from-blue-500 to-cyan-400' },
                  { icon: Weight, label: 'Težina', value: pet.weight ? `${pet.weight} kg` : 'N/A', gradient: 'from-green-500 to-emerald-400' },
                  { icon: Cpu, label: 'Mikročip', value: pet.microchip ? pet.microchip.slice(-6) : 'N/A', gradient: 'from-purple-500 to-pink-400' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                    <div className={`h-10 w-10 mx-auto rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg mb-3`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Full Microchip */}
              {pet.microchip && (
                <div className={`p-4 rounded-2xl ${bgTheme} border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Broj mikročipa</p>
                      <p className="font-mono font-bold text-lg tracking-wider">{pet.microchip}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white/50 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Hitni kontakti
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white border-orange-100">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Vlasnik</p>
                      <p className="font-semibold">{pet.ownerName}</p>
                      {pet.ownerPhone && (
                        <a 
                          href={`tel:${pet.ownerPhone}`} 
                          className="inline-flex items-center gap-2 text-sm text-warm-orange hover:text-warm-orange/80 font-medium"
                        >
                          <div className="h-8 w-8 rounded-lg bg-warm-orange/10 flex items-center justify-center">
                            <Phone className="h-4 w-4" />
                          </div>
                          {pet.ownerPhone}
                        </a>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-white border-teal-100">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Veterinar</p>
                      <p className="font-semibold">{pet.vetName || 'Nije postavljen'}</p>
                      {pet.vetPhone && (
                        <a 
                          href={`tel:${pet.vetPhone}`} 
                          className="inline-flex items-center gap-2 text-sm text-warm-teal hover:text-warm-teal/80 font-medium"
                        >
                          <div className="h-8 w-8 rounded-lg bg-warm-teal/10 flex items-center justify-center">
                            <Phone className="h-4 w-4" />
                          </div>
                          {pet.vetPhone}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Allergies */}
              {pet.allergies.length > 0 && (
                <div>
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-red-500" />
                    Alergije
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pet.allergies.map((a) => (
                      <Badge key={a} className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 hover:from-red-100 hover:to-red-200 px-3 py-1.5 text-sm font-medium">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Needs */}
              {pet.specialNeeds && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Posebne napomene</p>
                      <p className="text-sm text-amber-800 leading-relaxed">{pet.specialNeeds}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer branding */}
              <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-warm-orange" />
                  <span>PetPark.hr</span>
                </div>
                <span className="text-xs">Generirano {new Date().toLocaleDateString('hr-HR')}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 print:hidden">
                <Button 
                  onClick={handleShare} 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-warm-orange/20 hover:bg-warm-orange/5 hover:text-warm-orange hover:border-warm-orange/40"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {copied ? 'Kopirano!' : 'Podijeli'}
                </Button>
                <Button 
                  onClick={() => window.print()} 
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-warm-orange to-warm-coral hover:opacity-90 text-white shadow-lg shadow-warm-orange/20"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Isprintaj
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, footer, .print\:hidden { display: none !important; }
          body { font-size: 12px; background: white !important; }
          .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm { box-shadow: none !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
          .rounded-3xl, .rounded-2xl, .rounded-xl { border-radius: 0.5rem !important; }
        }
      `}</style>
    </div>
  );
}
