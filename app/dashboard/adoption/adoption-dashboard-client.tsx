'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';
import { toast } from 'sonner';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import type { AdoptionListing, AdoptionListingStatus } from '@/lib/types';
import {
  ADOPTION_STATUS_LABELS,
  ADOPTION_STATUS_COLORS,
  ADOPTION_SPECIES_EMOJI,
  ADOPTION_SPECIES_LABELS,
} from '@/lib/types';

interface AdoptionDashboardClientProps {
  initialListings: AdoptionListing[];
}

export function AdoptionDashboardClient({ initialListings }: AdoptionDashboardClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState<AdoptionListing[]>(initialListings);
  const [activeTab, setActiveTab] = useState('all');

  const handleStatusChange = async (id: string, newStatus: AdoptionListingStatus) => {
    const res = await fetch(`/api/adoption-listings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Status promijenjen u "${ADOPTION_STATUS_LABELS[newStatus]}"`);
      setListings((prev) => prev.map((listing) => (
        listing.id === id
          ? {
              ...listing,
              status: newStatus,
              published_at: newStatus === 'active' && !listing.published_at ? new Date().toISOString() : listing.published_at,
            }
          : listing
      )));
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      toast.error(data?.error?.message ?? 'Greška pri promjeni statusa');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Jeste li sigurni da želite obrisati oglas "${name}"?`)) return;
    const res = await fetch(`/api/adoption-listings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Oglas obrisan');
      setListings((prev) => prev.filter((listing) => listing.id !== id));
      router.refresh();
    } else {
      toast.error('Samo skice se mogu obrisati');
    }
  };

  const statusActions = (listing: AdoptionListing) => {
    const actions: { label: string; status: AdoptionListingStatus; variant?: 'default' | 'outline' | 'destructive' }[] = [];
    switch (listing.status) {
      case 'draft':
        actions.push({ label: 'Objavi', status: 'active', variant: 'default' });
        break;
      case 'active':
        actions.push({ label: 'Pauziraj', status: 'paused', variant: 'outline' });
        actions.push({ label: 'Označi udomljeno', status: 'adopted', variant: 'default' });
        break;
      case 'paused':
        actions.push({ label: 'Aktiviraj', status: 'active', variant: 'default' });
        actions.push({ label: 'Označi udomljeno', status: 'adopted', variant: 'default' });
        break;
      case 'expired':
        actions.push({ label: 'Ponovno aktiviraj', status: 'active', variant: 'default' });
        break;
    }
    return actions;
  };

  const filterByTab = (tab: string) => {
    if (tab === 'all') return listings;
    return listings.filter((listing) => listing.status === tab);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href="/dashboard/vlasnik" className="text-sm text-muted-foreground hover:underline">
            &larr; Nadzorna ploča
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Oglasi za udomljavanje</h1>
        </div>
        <Link href="/dashboard/adoption/new" className={buttonVariants({ variant: 'default' }) + ' bg-teal-600 hover:bg-teal-700'}>
          + Novi oglas
        </Link>
      </div>

      <div className="rounded-2xl border bg-gradient-to-r from-teal-50 to-emerald-50 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Brzi pregled oglasa</p>
            <p className="text-sm text-muted-foreground">Objavite, pauzirajte ili uredite oglase bez traženja po više ekrana.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{listings.length} ukupno</span>
            <span>•</span>
            <span>{listings.filter((l) => l.status === 'active').length} aktivnih</span>
            <span>•</span>
            <span>{listings.filter((l) => l.status === 'draft').length} skica</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Svi</TabsTrigger>
          <TabsTrigger value="draft">Skice</TabsTrigger>
          <TabsTrigger value="active">Aktivni</TabsTrigger>
          <TabsTrigger value="paused">Pauzirani</TabsTrigger>
          <TabsTrigger value="adopted">Udomljeni</TabsTrigger>
        </TabsList>

        {['all', 'draft', 'active', 'paused', 'adopted'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filterByTab(tab).length === 0 ? (
              <EmptyState
                icon={HeartHandshake}
                title={tab === 'all' ? 'Nemate oglasa' : `Nema oglasa u kategoriji "${ADOPTION_STATUS_LABELS[tab as AdoptionListingStatus]}"`}
                description={tab === 'all' ? 'Kreirajte prvi oglas za udomljavanje kako biste pomogli ljubimcu pronaći novi dom.' : 'Trenutno nema oglasa u ovoj kategoriji.'}
                action={tab === 'all' ? (
                  <Link href="/dashboard/adoption/new" className={buttonVariants({ variant: 'default' }) + ' bg-teal-600 hover:bg-teal-700'}>
                    + Novi oglas
                  </Link>
                ) : undefined}
              />
            ) : (
              <div className="space-y-4">
                {filterByTab(tab).map((listing) => (
                  <Card key={listing.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{ADOPTION_SPECIES_EMOJI[listing.species]}</span>
                          <h3 className="truncate font-semibold">{listing.name}</h3>
                          <Badge className={ADOPTION_STATUS_COLORS[listing.status]}>
                            {ADOPTION_STATUS_LABELS[listing.status]}
                          </Badge>
                          {listing.is_urgent && <Badge variant="destructive">Hitno</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {ADOPTION_SPECIES_LABELS[listing.species]}
                          {listing.breed ? ` · ${listing.breed}` : ''}
                          {' · '}
                          {listing.city}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-1">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/adoption/${listing.id}/edit`)}>
                          Uredi
                        </Button>
                        {statusActions(listing).map((action) => (
                          <Button
                            key={action.status}
                            variant={action.variant}
                            size="sm"
                            onClick={() => handleStatusChange(listing.id, action.status)}
                          >
                            {action.label}
                          </Button>
                        ))}
                        {listing.status === 'draft' && (
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(listing.id, listing.name)}>
                            Obriši
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
