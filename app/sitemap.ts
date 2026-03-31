import type { MetadataRoute } from 'next';
import { getSitters } from '@/lib/db/sitters';
import { getGroomers } from '@/lib/db/groomers';
import { getTrainers } from '@/lib/db/trainers';
import { getProducts } from '@/lib/db/products';
import { getArticles } from '@/lib/db/blog';
import { getTopics } from '@/lib/db/forum';
import { getLostPets } from '@/lib/db/lost-pets';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
const BUILD_DATE = new Date();

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
  { route: '/shop', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/o-nama', changeFrequency: 'monthly', priority: 0.5 },
  { route: '/postani-sitter', changeFrequency: 'monthly', priority: 0.6 },
  { route: '/hitno', changeFrequency: 'weekly', priority: 0.6 },
  { route: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { route: '/veterinari', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/udomljavanje', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/dog-friendly', changeFrequency: 'weekly', priority: 0.6 },
  { route: '/uzgajivacnice', changeFrequency: 'monthly', priority: 0.4 },
  { route: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  { route: '/cuvanje-pasa-zagreb', changeFrequency: 'monthly', priority: 0.6 },
  { route: '/cuvanje-pasa-split', changeFrequency: 'monthly', priority: 0.6 },
  { route: '/cuvanje-pasa-rijeka', changeFrequency: 'monthly', priority: 0.6 },
  { route: '/grooming-zagreb', changeFrequency: 'monthly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ route, changeFrequency, priority }) => ({
    url: `${BASE_URL}${route}`,
    lastModified: BUILD_DATE,
    changeFrequency,
    priority,
  }));

  // Fetch all dynamic data in parallel
  const [sitters, groomers, trainers, products, articles, topics, lostPets] = await Promise.all([
    getSitters().catch(() => []),
    getGroomers().catch(() => []),
    getTrainers().catch(() => []),
    getProducts().catch(() => []),
    getArticles().catch(() => []),
    getTopics().catch(() => []),
    getLostPets().catch(() => []),
  ]);

  const sitterEntries: MetadataRoute.Sitemap = sitters.map((s) => ({
    url: `${BASE_URL}/sitter/${s.user_id}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const groomerEntries: MetadataRoute.Sitemap = groomers.map((g) => ({
    url: `${BASE_URL}/groomer/${g.id}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const trainerEntries: MetadataRoute.Sitemap = trainers.map((t) => ({
    url: `${BASE_URL}/trener/${t.id}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const forumEntries: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${BASE_URL}/forum/${t.id}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  const lostPetEntries: MetadataRoute.Sitemap = lostPets.map((p) => ({
    url: `${BASE_URL}/izgubljeni/${p.id}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...sitterEntries,
    ...groomerEntries,
    ...trainerEntries,
    ...productEntries,
    ...blogEntries,
    ...forumEntries,
    ...lostPetEntries,
  ];
}
