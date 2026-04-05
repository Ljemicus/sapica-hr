import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, HeartHandshake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveRescueAppeals } from '@/lib/db';
import { APPEAL_STATUS_LABELS, getAppealProgressPct } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Rescue apelacije | PetPark',
  description: 'Javne rescue apelacije spojene na stvarne podatke iz PetPark baze. Checkout još nije uključen.',
};

const urgencyLabels = {
  low: 'Niži prioritet',
  normal: 'Standardno',
  high: 'Visok prioritet',
  critical: 'Kritično',
} as const;

export default async function RescueAppealsPage() {
  const appeals = await getActiveRescueAppeals();

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-orange-50/40">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-0">Appeals</Badge>
            <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)] md:text-4xl">Rescue apelacije koje su stvarno objavljene</h1>
            <p className="max-w-3xl text-muted-foreground md:text-lg">
              Ovdje prikazujemo samo aktivne apelacije iz baze. Nema mock iznosa, nema fake badgeva i nema checkout flowa dok payment lane ne sjedne kako spada.
            </p>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-semibold">Kako radi ovaj listing</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• vidiš samo active apelacije</li>
                <li>• organizacija mora biti aktivna da apelacija bude javna</li>
                <li>• donacije još nisu puštene live</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {appeals.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Trenutno nema javno objavljenih apelacija. Kad rescue organizacije objave active slučajeve, pojavit će se ovdje.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {appeals.map((appeal) => {
              const progress = getAppealProgressPct(appeal);

              return (
                <Card key={appeal.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{APPEAL_STATUS_LABELS[appeal.status]}</Badge>
                      <Badge variant="outline">{urgencyLabels[appeal.urgency]}</Badge>
                      {appeal.species && <Badge variant="outline">{appeal.species}</Badge>}
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold font-[var(--font-heading)]">{appeal.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{appeal.summary}</p>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-semibold">Organizacija</p>
                        <p className="mt-1 text-sm text-muted-foreground">{appeal.organization?.display_name ?? 'Nepoznato'}</p>
                      </div>
                      <div>
                        <p className="inline-flex items-center gap-2 text-sm font-semibold">
                          <CalendarDays className="h-4 w-4 text-rose-600" />
                          Zadnje ažuriranje
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{formatDate(appeal.updated_at)}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-muted/50 p-4">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                        <HeartHandshake className="h-4 w-4 text-rose-600" />
                        Napredak bez checkouta
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {progress}% cilja pokriveno kroz evidentirane uspješne donacije. CTA za uplatu ostaje ugašen dok payment lane ne bude gotov.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Link href={`/apelacije/${appeal.slug}`}>
                        <Button className="gap-2">
                          Otvori detalj apelacije <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      {appeal.organization && (
                        <Link href={`/udruge/${appeal.organization.slug}`} className="text-sm font-medium text-rose-700 hover:underline">
                          Profil organizacije
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}
