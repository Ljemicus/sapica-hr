import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/db/blog';
import { getTopics } from '@/lib/db/forum';
import { getLostPets } from '@/lib/db/lost-pets';
import { shouldIndexSitter, shouldIndexGroomer, shouldIndexTrainer, shouldIndexLostPet, shouldIndexAdoptionCard } from '@/lib/seo/indexability';
import { appLogger } from '@/lib/logger';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildLanguageAlternates } from '@/lib/i18n/routing';
import { getProviderTrainers } from '@/lib/db/provider-trainers';
import { getProviderGroomers } from '@/lib/db/provider-groomers';
import { getProviderSitterById } from '@/lib/db/provider-sitters';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
const DEFAULT_LAST_MODIFIED = new Date('2026-04-01T00:00:00.000Z');

function toLastModified(value: unknown, fallback: Date = DEFAULT_LAST_MODIFIED): Date {
  if (typeof value === 'string' || value instanceof Date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

const LOCALIZED_STATIC_ROUTES = new Set([
  '/cuvanje-pasa-zagreb',
  '/cuvanje-pasa-split',
  '/cuvanje-pasa-rijeka',
  '/grooming-zagreb',
  '/veterinari',
  '/njega',
  '/dresura',
  '/dog-friendly',
  '/izgubljeni',
  '/udomljavanje',
  '/uzgajivacnice',
  '/pretraga',
  '/forum',
  '/faq',
  '/verifikacija',
]);

const STATIC_PAGES: Array<{ route: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { route: '', changeFrequency: 'daily', priority: 1 },
  { route: '/pretraga', changeFrequency: 'daily', priority: 0.9 },
  { route: '/kontakt', changeFrequency: 'monthly', priority: 0.6 },
  { route: '/njega', changeFrequency: 'weekly', priority: 0.8 },
  { route: '/dresura', changeFrequency: 'weekly', priority: 0.8 },
  { route: '/zajednica', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/forum', changeFrequency: 'daily', priority: 0.7 },
  { route: '/izgubljeni', changeFrequency: 'daily', priority: 0.8 },
  { route: '/privatnost', changeFrequency: 'yearly', priority: 0.2 },
  { route: '/uvjeti', changeFrequency: 'yearly', priority: 0.2 },
  { route: '/o-nama', changeFrequency: 'monthly', priority: 0.5 },
  { route: '/postani-sitter/oglas', changeFrequency: 'monthly', priority: 0.6 },
  { route: '/hitno', changeFrequency: 'weekly', priority: 0.6 },
  { route: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { route: '/verifikacija', changeFrequency: 'monthly', priority: 0.5 },
  { route: '/veterinari', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/udomljavanje', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/dog-friendly', changeFrequency: 'weekly', priority: 0.6 },
  { route: '/uzgajivacnice', changeFrequency: 'monthly', priority: 0.4 },
  { route: '/udruge', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/apelacije', changeFrequency: 'daily', priority: 0.7 },
  // /blog and /grooming are 301-redirected to /zajednica and /njega — excluded from sitemap
  { route: '/cuvanje-pasa-zagreb', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/cuvanje-pasa-split', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/cuvanje-pasa-rijeka', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/grooming-zagreb', changeFrequency: 'weekly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ route, changeFrequency, priority }) => ({
    url: `${BASE_URL}${route}`,
    lastModified: DEFAULT_LAST_MODIFIED,
    changeFrequency,
    priority,
    alternates: LOCALIZED_STATIC_ROUTES.has(route)
      ? { languages: buildLanguageAlternates(route) }
      : undefined,
  }));

  const admin = createAdminClient();
  const [providersResult, trainers, groomers, adoptionResult, articles, topics, lostPets, rescueOrgsResult, rescueAppealsResult] = await Promise.all([
    admin.from('providers').select('id, provider_kind').eq('public_status', 'listed').in('provider_kind', ['sitter', 'groomer', 'trainer']),
    getProviderTrainers().catch(() => []),
    getProviderGroomers().catch(() => []),
    admin.from('adoption_listings').select('id, status, name, species, breed, age_months, gender, size, city, images, is_urgent, published_at').eq('status', 'active').order('published_at', { ascending: false, nullsFirst: false }),
    getArticles().catch(() => []),
    getTopics().catch(() => []),
    getLostPets().catch(() => []),
    admin.from('rescue_organizations').select('id, slug, status, updated_at, created_at').eq('status', 'active'),
    admin.from('rescue_appeals').select('id, slug, status, updated_at, created_at').eq('status', 'active'),
  ]);

  const adoptionListings = (adoptionResult.data || []) as Array<Record<string, unknown>>;

  const providerRows = ((providersResult.data || []) as Array<{ id: string; provider_kind: string }>);
  const sitterProviderIds = providerRows.filter((provider) => provider.provider_kind === 'sitter').map((provider) => provider.id);
  const sitterProfiles = (await Promise.all(sitterProviderIds.map((id) => getProviderSitterById(id).catch(() => null)))).filter(Boolean);

  const sitterEntries: MetadataRoute.Sitemap = sitterProfiles
    .filter((s) => shouldIndexSitter(s as never))
    .map((s) => ({
      url: `${BASE_URL}/sitter/${String(s!.user_id)}`,
      lastModified: toLastModified((s as { created_at?: string }).created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const groomerEntries: MetadataRoute.Sitemap = groomers
    .filter((g) => shouldIndexGroomer(g as never))
    .map((g) => ({
      url: `${BASE_URL}/groomer/${String(g.id)}`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const trainerEntries: MetadataRoute.Sitemap = trainers
    .filter((t) => shouldIndexTrainer(t as never))
    .map((t) => ({
      url: `${BASE_URL}/trener/${String(t.id)}`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const blogEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: toLastModified((a as { updated_at?: string; date?: string; created_at?: string }).updated_at ?? (a as { date?: string }).date ?? (a as { created_at?: string }).created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const forumEntries: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${BASE_URL}/forum/${t.id}`,
    lastModified: toLastModified((t as { last_reply_at?: string; created_at?: string; updated_at?: string }).last_reply_at ?? (t as { updated_at?: string }).updated_at ?? (t as { created_at?: string }).created_at),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  // "Found" pets and thin reports are excluded from the sitemap.
  const lostPetEntries: MetadataRoute.Sitemap = lostPets
    .filter(shouldIndexLostPet)
    .map((p) => ({
      url: `${BASE_URL}/izgubljeni/${p.id}`,
      lastModified: toLastModified((p as { updated_at?: string; date_lost?: string; created_at?: string }).updated_at ?? (p as { date_lost?: string }).date_lost ?? (p as { created_at?: string }).created_at),
      changeFrequency: 'daily' as const,
      priority: 0.6,
      alternates: { languages: buildLanguageAlternates(`/izgubljeni/${p.id}`) },
    }));

  const adoptionEntries: MetadataRoute.Sitemap = adoptionListings
    .filter((a) => shouldIndexAdoptionCard(a as never))
    .map((a) => ({
    url: `${BASE_URL}/udomljavanje/${String(a.id)}`,
    lastModified: toLastModified((a as { updated_at?: string; created_at?: string }).updated_at ?? (a as { created_at?: string }).created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
    alternates: { languages: buildLanguageAlternates(`/udomljavanje/${String(a.id)}`) },
  }));

  const rescueOrganizations = (rescueOrgsResult.data || []) as Array<{ id: string; slug: string; status: string; updated_at?: string; created_at?: string }>;
  const rescueAppeals = (rescueAppealsResult.data || []) as Array<{ id: string; slug: string; status: string; updated_at?: string; created_at?: string }>;

  const rescueOrgEntries: MetadataRoute.Sitemap = rescueOrganizations.map((org) => ({
    url: `${BASE_URL}/udruge/${org.slug}`,
    lastModified: toLastModified(org.updated_at ?? org.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const rescueAppealEntries: MetadataRoute.Sitemap = rescueAppeals.map((appeal) => ({
    url: `${BASE_URL}/apelacije/${appeal.slug}`,
    lastModified: toLastModified(appeal.updated_at ?? appeal.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  const all = [
    ...staticEntries,
    ...sitterEntries,
    ...groomerEntries,
    ...trainerEntries,
    ...blogEntries,
    ...forumEntries,
    ...lostPetEntries,
    ...adoptionEntries,
    ...rescueOrgEntries,
    ...rescueAppealEntries,
  ];

  appLogger.info('sitemap.generate', 'Sitemap generated', {
    total: all.length,
    static: staticEntries.length,
    sitters: sitterEntries.length,
    groomers: groomerEntries.length,
    trainers: trainerEntries.length,
    articles: blogEntries.length,
    forum: forumEntries.length,
    lostPets: lostPetEntries.length,
    adoption: adoptionEntries.length,
    rescueOrgs: rescueOrgEntries.length,
    rescueAppeals: rescueAppealEntries.length,
  });

  return all;
}
