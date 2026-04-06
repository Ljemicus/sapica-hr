import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Dog } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Moja legla — Uzgajivač | PetPark',
  description: 'Upravljajte svojim leglima i dostupnošću štenca.',
};

export default async function BreederLittersPage() {
  noStore();
  
  const user = await getAuthUser();
  if (!user) redirect('/prijava?returnTo=/dashboard/breeder/legla');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/breeder">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Natrag
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moja legla</h1>
              <p className="text-sm text-gray-500">Upravljajte dostupnošću štenca</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Aktivna legla</h2>
          <Link href="/dashboard/breeder/leglo/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj novo leglo
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Dog className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Još nemate legla</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Dodajte svoje prvo leglo da biste ga prikazali potencijalnim kupcima.
            </p>
            <Link href="/dashboard/breeder/leglo/novo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Dodaj prvo leglo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
