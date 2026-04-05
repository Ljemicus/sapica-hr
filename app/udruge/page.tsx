import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HeartHandshake, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getActiveRescueAppeals, getRescueOrganizations } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Rescue udruge i organizacije | PetPark',
  description: 'Pregled aktivnih rescue organizacija na PetParku spojen na stvarne podatke iz baze.',
};

export default async function RescueOrganizationsPage() {
  const [organizations, activeAppeals] = await Promise.all([
    getRescueOrganizations('active'),
    getActiveRescueAppeals(),
  ]);

  const appealCountByOrg = new Map<string, number>();
  for (const appeal of activeAppeals) {
    appealCountByOrg.set(appeal.organization_id, (appealCountByOrg.get(appeal.organization_id) ?? 0) + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-cyan-50/40">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">Rescue directory</Badge>
            <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)] md:text-4xl">
              Aktivne organizacije koje su prošle onboarding i mogu objavljivati apelacije
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Directory više nije mock vitrina — prikazuje samo rescue organizacije koje su aktivne u sustavu. Donacije još nisu dio javnog flowa, ali identitet, opis i live apelacije jesu.
            </p>
          </div>

          <div className="rounded-2xl border bg-white/90 p-4 shadow-sm lg:max-w-sm">
            <p className="text-sm font-semibold">Što je javno već sad</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>• listing aktivnih organizacija</li>
              <li>• profil pojedine organizacije</li>
              <li>• live apelacije vezane uz tu organizaciju</li>
            </ul>
          </div>
        </div>

        {organizations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Trenutno nema aktivnih rescue organizacija za javni prikaz.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {organizations.map((organization) => {
              const appealCount = appealCountByOrg.get(organization.id) ?? 0;

              return (
                <Card key={organization.id} className="h-full border-0 shadow-sm">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold font-[var(--font-heading)]">{organization.display_name}</h2>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          {organization.city ?? 'Lokacija uskoro'}
                        </p>
                      </div>
                      <Badge variant="outline">{appealCount} live apelacija</Badge>
                    </div>

                    <p className="mb-4 text-sm leading-6 text-muted-foreground">{organization.description ?? 'Organizacija još nije popunila javni opis.'}</p>

                    <div className="mb-6 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Kontakt</p>
                      <p className="mt-1">{organization.email ?? 'Email uskoro'}{organization.phone ? ` · ${organization.phone}` : ''}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <Link href={`/udruge/${organization.slug}`}>
                        <Button>Profil organizacije</Button>
                      </Link>
                      <Link href={`/apelacije`} className="text-sm font-medium text-emerald-700 hover:underline">
                        Sve apelacije
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-8 border-0 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                Rescue dashboard i javni directory sada dijele isti data model
              </p>
              <p className="text-sm text-muted-foreground">
                Owner uređuje organizaciju u dashboardu, a javni sloj objavljuje samo active podatke iz iste baze.
              </p>
            </div>
            <Link href="/dashboard/rescue">
              <Button variant="outline" className="gap-2">
                Otvori dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
