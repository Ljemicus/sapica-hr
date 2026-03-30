'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Printer, Phone, AlertTriangle, Dog, Cat, HelpCircle, Heart, Weight, Calendar, Cpu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface PetCardContentProps {
  petId: string;
}

interface PetCardData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  microchip: string;
  ownerName: string;
  ownerPhone: string;
  vetName: string;
  vetPhone: string;
  allergies: string[];
  specialNeeds: string;
}

const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈', other: '🐰' };
const speciesLabel: Record<string, string> = { dog: 'Pas', cat: 'Mačka', other: 'Ostalo' };
const speciesGradient: Record<string, string> = {
  dog: 'from-orange-400 to-amber-300',
  cat: 'from-purple-400 to-pink-300',
  other: 'from-blue-400 to-cyan-300',
};
const SpeciesIcon: Record<string, React.ElementType> = { dog: Dog, cat: Cat, other: HelpCircle };

export function PetCardContent({ petId }: PetCardContentProps) {
  const [copied, setCopied] = useState(false);
  const [pet, setPet] = useState<PetCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPet() {
      try {
        const supabase = createClient();
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*, owner:users!owner_id(name, phone)')
          .eq('id', petId)
          .single();

        if (petError || !petData) {
          setError(true);
          setLoading(false);
          return;
        }

        setPet({
          name: petData.name,
          species: petData.species || 'dog',
          breed: petData.breed || 'Nepoznata pasmina',
          age: petData.age || 0,
          weight: petData.weight || 0,
          microchip: petData.microchip || 'Nije uneseno',
          ownerName: petData.owner?.name || 'Nepoznato',
          ownerPhone: petData.owner?.phone || '',
          vetName: petData.vet_name || 'Nije uneseno',
          vetPhone: petData.vet_phone || '',
          allergies: petData.allergies || [],
          specialNeeds: petData.special_needs || '',
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [petId]);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl text-center">
        <p className="text-muted-foreground">Ljubimac nije pronađen.</p>
        <Link href="/" className="text-orange-500 hover:underline mt-2 inline-block">Povratak</Link>
      </div>
    );
  }

  const Icon = SpeciesIcon[pet.species] || HelpCircle;
  const gradient = speciesGradient[pet.species] || speciesGradient.other;

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl print:max-w-none print:p-0">
      <div className="print:hidden mb-6">
        <Link href={`/ljubimac/${petId}/karton`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange-500 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zdravstveni karton
        </Link>
      </div>

      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden animate-fade-in-up">
        <CardContent className="p-0">
          {/* Header with gradient + branding */}
          <div className={`bg-gradient-to-br ${gradient} p-6 relative`}>
            <div className="absolute inset-0 paw-pattern opacity-10" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg text-4xl">
                  {speciesEmoji[pet.species]}
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-extrabold tracking-tight">{pet.name}</h1>
                  <p className="text-white/80 font-medium">{speciesLabel[pet.species]} · {pet.breed}</p>
                </div>
              </div>
              {/* PetPark branding */}
              <div className="absolute top-0 right-0 text-white/40 text-xs font-bold">
                <span className="text-white/60">Pet</span>Park
              </div>
            </div>
          </div>

          {/* Pet Info Grid */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Icon, label: 'Vrsta', value: speciesLabel[pet.species], color: 'from-orange-500 to-amber-500' },
                { icon: Calendar, label: 'Dob', value: `${pet.age} god.`, color: 'from-blue-500 to-cyan-500' },
                { icon: Weight, label: 'Težina', value: `${pet.weight} kg`, color: 'from-green-500 to-emerald-500' },
                { icon: Cpu, label: 'Mikročip', value: pet.microchip.slice(-6), color: 'from-purple-500 to-pink-500' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <div className={`h-8 w-8 mx-auto rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm mb-2`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Microchip full */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-muted-foreground mb-1">Broj mikročipa</p>
              <p className="font-mono font-semibold tracking-wider">{pet.microchip}</p>
            </div>

            {/* Emergency Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Hitni kontakti
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border bg-white dark:bg-gray-900/50 space-y-1">
                  <p className="text-xs text-muted-foreground">Vlasnik</p>
                  <p className="font-medium text-sm">{pet.ownerName}</p>
                  {pet.ownerPhone && (
                    <a href={`tel:${pet.ownerPhone}`} className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {pet.ownerPhone}
                    </a>
                  )}
                </div>
                <div className="p-4 rounded-xl border bg-white dark:bg-gray-900/50 space-y-1">
                  <p className="text-xs text-muted-foreground">Veterinar</p>
                  <p className="font-medium text-sm">{pet.vetName}</p>
                  {pet.vetPhone && (
                    <a href={`tel:${pet.vetPhone}`} className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {pet.vetPhone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Allergies */}
            {pet.allergies.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Alergije
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pet.allergies.map((a) => (
                    <Badge key={a} className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Special Needs */}
            {pet.specialNeeds && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">⚠️ Posebne napomene</p>
                <p className="text-sm text-amber-800 leading-relaxed">{pet.specialNeeds}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 print:hidden">
              <Button onClick={handleShare} variant="outline" className="flex-1 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                <Share2 className="h-4 w-4 mr-2" />
                {copied ? 'Kopirano!' : 'Podijeli'}
              </Button>
              <Button onClick={() => window.print()} className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover">
                <Printer className="h-4 w-4 mr-2" />
                Isprintaj
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
