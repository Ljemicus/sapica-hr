import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge, Card } from '@/components/shared/petpark/design-foundation';

export const metadata: Metadata = {
  title: 'Service Listings moderacija | PetPark Admin',
  robots: { index: false, follow: false },
};

type AdminServiceListingRow = {
  id: string;
  slug: string;
  title: string;
  display_category: string | null;
  city: string | null;
  status: string | null;
  moderation_status: string | null;
  created_at: string;
  providers?: { display_name: string | null; city: string | null } | { display_name: string | null; city: string | null }[] | null;
};

function providerName(row: AdminServiceListingRow) {
  const provider = Array.isArray(row.providers) ? row.providers[0] : row.providers;
  return provider?.display_name || 'Nepoznat pružatelj';
}

function providerCity(row: AdminServiceListingRow) {
  const provider = Array.isArray(row.providers) ? row.providers[0] : row.providers;
  return row.city || provider?.city || '—';
}

async function getServiceListingsForAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('service_listings')
    .select('id, slug, title, display_category, city, status, moderation_status, created_at, providers(display_name, city)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data as unknown as AdminServiceListingRow[];
}

function StatusPill({ status, moderation }: { status: string | null; moderation: string | null }) {
  return (
    <span className="inline-flex rounded-full border border-[color:var(--pp-color-warm-border)] bg-white/80 px-3 py-1 text-xs font-black text-[color:var(--pp-color-forest-text)]">
      {status || '—'} / {moderation || '—'}
    </span>
  );
}

export default async function AdminServiceListingsPage() {
  const guard = await requireAdmin();
  if (!guard.ok) notFound();

  const rows = await getServiceListingsForAdmin();
  const pending = rows.filter((row) => row.moderation_status === 'pending');
  const approved = rows.filter((row) => row.moderation_status === 'approved');
  const rejected = rows.filter((row) => row.moderation_status === 'rejected');
  const inactive = rows.filter((row) => row.status === 'archived' || row.status === 'paused');

  return (
    <main className="min-h-screen bg-[color:var(--pp-color-cream-background)] px-5 py-10 text-[color:var(--pp-color-forest-text)] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card radius="28" className="p-6 lg:p-8">
          <Badge variant="orange">Admin only</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">Service Listings moderacija</h1>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
            Skrivena admin stranica za pregled nacrta i moderacijskih stanja. Akcije idu kroz admin-only API; provider ne može sam odobriti javnu objavu.
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card radius="20" className="p-5"><p className="text-3xl font-black">{pending.length}</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">Pending</p></Card>
          <Card radius="20" className="p-5"><p className="text-3xl font-black">{approved.length}</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">Approved</p></Card>
          <Card radius="20" className="p-5"><p className="text-3xl font-black">{rejected.length}</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">Rejected</p></Card>
          <Card radius="20" className="p-5"><p className="text-3xl font-black">{inactive.length}</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">Paused/archived</p></Card>
        </div>

        <Card radius="28" className="overflow-hidden p-0">
          <div className="divide-y divide-[color:var(--pp-color-warm-border)]">
            {rows.map((row) => (
              <article key={row.id} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.6fr_auto] lg:items-center">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black">{row.title}</h2>
                  <p className="mt-1 truncate text-xs font-bold text-[color:var(--pp-color-muted-text)]">{row.slug}</p>
                </div>
                <div>
                  <p className="text-sm font-black">{providerName(row)}</p>
                  <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">{providerCity(row)} • {row.display_category || 'Usluga'}</p>
                </div>
                <StatusPill status={row.status} moderation={row.moderation_status} />
                <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">{new Date(row.created_at).toLocaleString('hr-HR')}</p>
              </article>
            ))}
            {rows.length === 0 ? <p className="p-6 text-sm font-bold text-[color:var(--pp-color-muted-text)]">Nema service listing redova.</p> : null}
          </div>
        </Card>
      </div>
    </main>
  );
}
