import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/admin/',
        '/poruke/',
        '/prijava',
        '/registracija',
        '/omiljeni',
        '/checkout/',
        '/onboarding/',
        '/nova-lozinka',
        '/zaboravljena-lozinka',
        '/azuriranja/',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr'}/sitemap.xml`,
  };
}
