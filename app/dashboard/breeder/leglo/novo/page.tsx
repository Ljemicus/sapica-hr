import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Novo leglo — Uzgajivač | PetPark',
  description: 'Dodajte novo leglo štenca.',
};

export default async function NewLitterPage() {
  noStore();
  
  const user = await getAuthUser();
  if (!user) redirect('/prijava?returnTo=/dashboard/breeder/leglo/novo');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/breeder/legla">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Natrag
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo leglo</h1>
              <p className="text-sm text-gray-500">Dodajte informacije o novom leglu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Informacije o leglu</CardTitle>
            <CardDescription>
              Unesite detalje o leglu. Ove informacije bit će vidljive potencijalnim kupcima.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Pasmina</Label>
                <Input id="breed" placeholder="npr. Labrador" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Broj štenca</Label>
                <Input id="count" type="number" min={1} placeholder="npr. 5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth-date">Datum rođenja</Label>
                <Input id="birth-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="available-date">Dostupno od</Label>
                <Input id="available-date" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price-from">Cijena od (€)</Label>
                <Input id="price-from" type="number" min={0} placeholder="npr. 800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-to">Cijena do (€)</Label>
                <Input id="price-to" type="number" min={0} placeholder="npr. 1200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                placeholder="Boja, roditelji, zdravstvena stanja, karakteristike..."
                className="min-h-[150px]"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/breeder/legla">
                <Button variant="outline">Odustani</Button>
              </Link>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Spremi leglo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
