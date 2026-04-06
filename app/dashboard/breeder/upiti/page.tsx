import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Search, Mail, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Upiti — Uzgajivač | PetPark',
  description: 'Pregledajte i upravljajte upitima od potencijalnih kupaca.',
};

// Mock inquiries
const MOCK_INQUIRIES = [
  {
    id: '1',
    from: 'Ana Horvat',
    email: 'ana.horvat@email.hr',
    phone: '+385 91 234 5678',
    breed: 'Labrador',
    message: 'Pozdrav, zanima me dostupnost žutog labradora. Imate li još slobodnih štenca? Također me zanima jesu li roditelji testirani na displaziju? Hvala!',
    date: 'Prije 2 sata',
    status: 'new',
  },
  {
    id: '2',
    from: 'Marko Kovač',
    email: 'marko.kovac@email.hr',
    breed: 'Zlatni retriver',
    message: 'Imate li još štenca dostupnih? Kada bi mogao doći pogledati?',
    date: 'Jučer',
    status: 'replied',
  },
  {
    id: '3',
    from: 'Petra Novak',
    email: 'petra.novak@email.hr',
    breed: 'Francuski buldog',
    message: 'Zanima me cijena i dostupnost ženskog štenca. Jeste li FCI registrirani?',
    date: 'Prije 3 dana',
    status: 'replied',
  },
];

export default async function BreederInquiriesPage() {
  noStore();
  
  const user = await getAuthUser();
  if (!user) redirect('/prijava?returnTo=/dashboard/breeder/upiti');

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
              <h1 className="text-2xl font-bold text-gray-900">Upiti</h1>
              <p className="text-sm text-gray-500">Pregledajte upite od potencijalnih kupaca</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pretraži upite..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Svi</Button>
            <Button variant="outline" size="sm">Novi</Button>
            <Button variant="outline" size="sm">Odgovoreni</Button>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="space-y-4">
          {MOCK_INQUIRIES.map((inquiry) => (
            <Card key={inquiry.id} className={inquiry.status === 'new' ? 'border-teal-300' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-teal-600">
                        {inquiry.from.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{inquiry.from}</h3>
                        {inquiry.status === 'new' && (
                          <Badge className="bg-red-100 text-red-700">Novo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{inquiry.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{inquiry.breed}</Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <MessageCircle className="w-4 h-4 text-gray-400 mb-2" />
                  <p className="text-gray-700">{inquiry.message}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {inquiry.email}
                  </div>
                  {inquiry.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {inquiry.phone}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    Označi kao {inquiry.status === 'new' ? 'odgovoreno' : 'novo'}
                  </Button>
                  <Button size="sm">
                    Odgovori
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
