import type { MetadataRoute } from 'next';
import { mockSitterProfiles, mockGroomers, mockTrainers, mockProducts, mockArticles, mockForumTopics } from '@/lib/mock-data';
import { mockAdoptionPets } from '@/lib/mock-adoption-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Sitteri
  const sitterEntries: MetadataRoute.Sitemap = mockSitterProfiles.map((s) => ({
    url: `${BASE_URL}/sitter/${s.user_id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Groomeri
  const groomerEntries: MetadataRoute.Sitemap = mockGroomers.map((g) => ({
    url: `${BASE_URL}/groomer/${g.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Treneri
  const trainerEntries: MetadataRoute.Sitemap = mockTrainers.map((t) => ({
    url: `${BASE_URL}/trener/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Shop proizvodi
  const productEntries: MetadataRoute.Sitemap = mockProducts.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // Blog
  const blogEntries: MetadataRoute.Sitemap = mockArticles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Forum topics
  const forumEntries: MetadataRoute.Sitemap = mockForumTopics.map((t) => ({
    url: `${BASE_URL}/forum/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  // Adoption pets
  const adoptionEntries: MetadataRoute.Sitemap = mockAdoptionPets.map((p) => ({
    url: `${BASE_URL}/udomljavanje/${p.id}`,
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
    ...adoptionEntries,
  ];
}
