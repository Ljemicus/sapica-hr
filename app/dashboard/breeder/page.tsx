import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Heart, 
  Dog, 
  MessageCircle, 
  Award, 
  TrendingUp, 
  Calendar,
  Plus,
  Settings,
  ArrowRight,
  Check
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Uzgajivač | PetPark',
  description: 'Upravljajte svojom uzgajivačnicom, leglima i upitima.',
};

// Mock stats - would come from API in production
const MOCK_STATS = {
  totalViews: 234,
  totalInquiries: 12,
  activeListings: 2,
  responseRate: 95,
  avgResponseTime: '< 2h',
};

// Mock recent inquiries
const MOCK_INQUIRIES = [
  {
    id: '1',
    from: 'Ana Horvat',
    breed: 'Labrador',
    message: 'Zanima me dostupnost žutog labradora...',
    date: 'Prije 2 sata',
    status: 'new',
  },
  {
    id: '2',
    from: 'Marko Kovač',
    breed: 'Zlatni retriver',
    message: 'Imate li još štenca dostupnih?',
    date: 'Jučer',
    status: 'replied',
  },
];

export default async function BreederDashboardPage() {
  noStore();
  
  const user = await getAuthUser();
  if (!user) redirect('/prijava?returnTo=/dashboard/breeder');

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Uzgajivačnica</h1>
              <p className="text-sm text-gray-500 mt-1">
                Upravljajte svojim profilom, leglima i upitima
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/uzgajivacnice">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Pogledaj profil
                </Button>
              </Link>
              <Link href="/dashboard/breeder/leglo/novo">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj leglo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={TrendingUp}
            label="Pregleda profila"
            value={MOCK_STATS.totalViews.toString()}
            trend="+12%"
          />
          <StatCard
            icon={MessageCircle}
            label="Upita"
            value={MOCK_STATS.totalInquiries.toString()}
            trend="3 nova"
          />
          <StatCard
            icon={Dog}
            label="Aktivnih legla"
            value={MOCK_STATS.activeListings.toString()}
          />
          <StatCard
            icon={Award}
            label="Stopa odgovora"
            value={`${MOCK_STATS.responseRate}%`}
            subValue={MOCK_STATS.avgResponseTime}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brze akcije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <QuickActionButton
                    icon={Plus}
                    label="Dodaj leglo"
                    href="/dashboard/breeder/leglo/novo"
                  />
                  <QuickActionButton
                    icon={Dog}
                    label="Moja legla"
                    href="/dashboard/breeder/legla"
                  />
                  <QuickActionButton
                    icon={MessageCircle}
                    label="Upiti"
                    href="/dashboard/breeder/upiti"
                  />
                  <QuickActionButton
                    icon={Settings}
                    label="Postavke"
                    href="/dashboard/postavke"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Inquiries */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Nedavni upiti</CardTitle>
                  <CardDescription>Poruke od potencijalnih kupaca</CardDescription>
                </div>
                <Link href="/dashboard/breeder/upiti">
                  <Button variant="ghost" size="sm">Pogledaj sve</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {MOCK_INQUIRIES.length > 0 ? (
                  <div className="space-y-4">
                    {MOCK_INQUIRIES.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className="flex items-start gap-4 p-4 rounded-xl border hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{inquiry.from}</p>
                            {inquiry.status === 'new' && (
                              <Badge variant="secondary" className="bg-red-100 text-red-700">
                                Novo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{inquiry.breed}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {inquiry.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{inquiry.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Još nemate upita</p>
                    <p className="text-sm">Vaš profil će biti vidljiv nakon verifikacije</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status profila</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Na čekanju verifikacije</span>
                </div>
                <div className="text-sm text-gray-500">
                  Vaš profil pregledava naš tim. Obično traje 1-2 radna dana.
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Kompletnost profila</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-teal-500 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-teal-500" />
                  Savjeti za uspjeh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>Dodajte što više fotografija vašeg objekta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>Odgovarajte na upite u roku 24 sata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>Ažurirajte dostupnost legla redovito</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>Zatražite recenzije od zadovoljnih kupaca</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sljedeći koraci</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 border border-teal-100">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Dodajte sljedeće leglo</p>
                      <p className="text-xs text-gray-500">Najavite nadolazeće leglo</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                    <Award className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Verifikacija profila</p>
                      <p className="text-xs text-gray-500">U tijeku...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  subValue?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-teal-600" />
          </div>
          {trend && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-teal-600" />
      </div>
      <span className="text-sm font-medium text-center">{label}</span>
    </Link>
  );
}


