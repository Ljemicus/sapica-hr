import JSZip from 'jszip';
import { GDPR_EXPORT_RATE_LIMIT, getGdprAdminClient, requireFreshPasswordAndRateLimit } from '@/lib/gdpr';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ExportSection = {
  name: string;
  data: unknown;
  error?: string;
};

type SupabaseResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

async function collectSection<T>(name: string, fn: () => PromiseLike<SupabaseResult<T>>): Promise<ExportSection> {
  const result = await fn();
  return {
    name,
    data: result.data ?? [],
    ...(result.error ? { error: result.error.message } : {}),
  };
}

export async function POST(request: Request) {
  const guard = await requireFreshPasswordAndRateLimit(request, GDPR_EXPORT_RATE_LIMIT);
  if (!guard.ok) return guard.response;

  const admin = getGdprAdminClient();
  const profileId = guard.user.id;

  const sections = await Promise.all([
    collectSection('profile', () => admin.from('profiles').select('*').eq('id', profileId).maybeSingle()),
    collectSection('profile_roles', () => admin.from('profile_roles').select('*').eq('profile_id', profileId)),
    collectSection('pets', () => admin.from('pets').select('*').eq('owner_profile_id', profileId)),
    collectSection('bookings_as_owner', () => admin.from('bookings').select('*').eq('owner_profile_id', profileId)),
    collectSection('reviews_authored', () => admin.from('reviews').select('*').eq('reviewer_profile_id', profileId)),
    collectSection('messages_sent', () => admin.from('messages').select('*').eq('sender_profile_id', profileId)),
  ]);

  const manifest = {
    generated_at: new Date().toISOString(),
    subject_profile_id: profileId,
    sections: sections.map((section) => ({
      name: section.name,
      error: section.error ?? null,
    })),
  };

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  for (const section of sections) {
    zip.file(`${section.name}.json`, JSON.stringify(section.data, null, 2));
    if (section.error) {
      zip.file(`${section.name}.error.txt`, section.error);
    }
  }

  const archive = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  return new Response(Buffer.from(archive), {
    status: 200,
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="petpark-gdpr-export-${profileId}.zip"`,
      'cache-control': 'no-store',
    },
  });
}
