import type { Metadata } from 'next';
import { GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTrainers } from '@/lib/mock-data';
import { TrainingContent } from './training-content';

export const metadata: Metadata = {
  title: 'Dresura — treneri pasa',
  description: 'Pronađite certificirane trenere pasa za dresuru, agility, korekciju ponašanja i rad sa štencima.',
};

interface DresuraPageProps {
  searchParams: Promise<{ city?: string; type?: string }>;
}

export default async function DresuraPage({ searchParams }: DresuraPageProps) {
  const params = await searchParams;
  const trainers = getTrainers({ city: params.city, type: params.type });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-green-50">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 text-sm px-5 py-2 animate-fade-in-up">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              Dresura i trening
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
              Profesionalna{' '}
              <span className="text-gradient">dresura pasa</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed">
              Od osnove poslušnosti do agility-ja — pronađite certificirane trenere
              koji koriste pozitivan pristup dresuri.
            </p>
          </div>
        </div>
      </section>

      <TrainingContent trainers={trainers} initialParams={params} />
    </div>
  );
}
