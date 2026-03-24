import type { MetadataRoute } from 'next';

const BASE_URL = 'https://sapica.vercel.app';

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
  ];

  return staticPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
