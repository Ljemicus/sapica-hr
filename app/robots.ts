import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/admin/', '/poruke/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr'}/sitemap.xml`,
  };
}
