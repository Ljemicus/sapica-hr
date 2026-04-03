import type { MetadataRoute } from 'next';
import { getSitters } from '@/lib/db/sitters';
import { getGroomers } from '@/lib/db/groomers';
import { getTrainers } from '@/lib/db/trainers';
import { getArticles } from '@/lib/db/blog';
import { getTopics } from '@/lib/db/forum';
import { getLostPets } from '@/lib/db/lost-pets';
import { getActiveAdoptionListings } from '@/lib/db/adoption-listings';
import { shouldIndexSitter, shouldIndexGroomer, shouldIndexTrainer, shouldIndexLostPet, shouldIndexAdoptionCard } from '@/lib/seo/indexability';
import { appLogger } from '@/lib/logger';

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
  { route: '/veterinari', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/udomljavanje', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/dog-friendly', changeFrequency: 'weekly', priority: 0.6 },
  { route: '/uzgajivacnice', changeFrequency: 'monthly', priority: 0.4 },
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
  }));

  // Fetch all dynamic data in parallel
  const [sitters, groomers, trainers, articles, topics, lostPets, adoptionListings] = await Promise.all([
    getSitters().catch(() => []),
    getGroomers().catch(() => []),
    getTrainers().catch(() => []),
    getArticles().catch(() => []),
    getTopics().catch(() => []),
    getLostPets().catch(() => []),
    getActiveAdoptionListings().catch(() => []),
  ]);

  const sitterEntries: MetadataRoute.Sitemap = sitters
    .filter(shouldIndexSitter)
    .map((s) => ({
      url: `${BASE_URL}/sitter/${s.user_id}`,
      lastModified: toLastModified((s as { updated_at?: string; created_at?: string }).updated_at ?? (s as { created_at?: string }).created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Only include indexable (non-thin) profiles in the sitemap.
  const groomerEntries: MetadataRoute.Sitemap = groomers
    .filter(shouldIndexGroomer)
    .map((g) => ({
      url: `${BASE_URL}/groomer/${g.id}`,
      lastModified: toLastModified((g as { updated_at?: string; created_at?: string }).updated_at ?? (g as { created_at?: string }).created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const trainerEntries: MetadataRoute.Sitemap = trainers
    .filter(shouldIndexTrainer)
    .map((t) => ({
      url: `${BASE_URL}/trener/${t.id}`,
      lastModified: toLastModified((t as { updated_at?: string; created_at?: string }).updated_at ?? (t as { created_at?: string }).created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const blogEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/zajednica/${a.slug}`,
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
    }));

  const adoptionEntries: MetadataRoute.Sitemap = adoptionListings
    .filter(shouldIndexAdoptionCard)
    .map((a) => ({
    url: `${BASE_URL}/udomljavanje/${a.id}`,
    lastModified: toLastModified((a as { updated_at?: string; created_at?: string }).updated_at ?? (a as { created_at?: string }).created_at),
    changeFrequency: 'weekly' as const,
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
  });

  return all;
}
