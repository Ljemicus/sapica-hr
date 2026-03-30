import type { MetadataRoute } from 'next';
import { getSitters } from '@/lib/db/sitters';
import { getGroomers } from '@/lib/db/groomers';
import { getTrainers } from '@/lib/db/trainers';
import { getProducts } from '@/lib/db/products';
import { getArticles } from '@/lib/db/blog';
import { getTopics } from '@/lib/db/forum';
import { getLostPets } from '@/lib/db/lost-pets';
import { MOCK_BREEDERS } from '@/lib/mock-breeders';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '',
    '/pretraga',
    '/prijava',
    '/registracija',
    '/kontakt',
    '/njega',
    '/dresura',
    '/zajednica',
    '/forum',
    '/izgubljeni',
    '/privatnost',
    '/uvjeti',
    '/shop',
    '/grooming',
    '/o-nama',
    '/postani-sitter',
    '/hitno',
    '/faq',
    '/veterinari',
    '/omiljeni',
    '/udomljavanje',
    '/dog-friendly',
    '/uzgajivacnice',
    '/blog',
    '/cuvanje-pasa-zagreb',
    '/cuvanje-pasa-split',
    '/cuvanje-pasa-rijeka',
    '/grooming-zagreb',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
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
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const groomerEntries: MetadataRoute.Sitemap = groomers.map((g) => ({
    url: `${BASE_URL}/groomer/${g.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const trainerEntries: MetadataRoute.Sitemap = trainers.map((t) => ({
    url: `${BASE_URL}/trener/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const forumEntries: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${BASE_URL}/forum/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  const lostPetEntries: MetadataRoute.Sitemap = lostPets.map((p) => ({
    url: `${BASE_URL}/izgubljeni/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  const breederEntries: MetadataRoute.Sitemap = MOCK_BREEDERS.map((b) => ({
    url: `${BASE_URL}/uzgajivacnice/${b.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
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
    ...breederEntries,
  ];
}
