import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StaticNavbar } from '@/components/shared/static-navbar';
import { StaticFooter } from '@/components/shared/static-footer';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { WebsiteJsonLd, SiteNavigationJsonLd } from '@/components/seo/json-ld';
import { SkipToContentLink } from '@/components/shared/skip-to-content-link';

export const metadata: Metadata = {
  metadataBase: new URL('https://petpark.hr'),
  title: {
    default: 'PetPark — Sve za ljubimce na jednom mjestu',
    template: '%s | PetPark',
  },
  description: 'PetPark je hrvatska platforma za čuvanje ljubimaca. Zagreb, beta — pronađite čuvara, šetača ili boarding bez izmišljenog inventoryja.',
  other: {
    'google': 'notranslate',
  },
  keywords: [
    'pet sitting', 'čuvanje ljubimaca', 'šetanje pasa', 'grooming', 'školovanje pasa',
    'čuvar za pse', 'čuvar za mačke', 'pet sitter Hrvatska', 'izgubljeni ljubimci',
    'Zagreb', 'Split', 'Rijeka',
  ],
  authors: [{ name: 'PetPark' }],
  creator: 'PetPark',
  publisher: 'PetPark',
  formatDetection: { telephone: true, email: true },
  alternates: {
    canonical: 'https://petpark.hr/',
    languages: {
      'hr-HR': 'https://petpark.hr',
    },
  },
  openGraph: {
    title: 'PetPark — Sve za ljubimce na jednom mjestu',
    description: 'Zagreb, beta — čuvanje, šetanje i boarding ljubimaca bez izmišljenog inventoryja.',
    type: 'website',
    locale: 'hr_HR',
    url: 'https://petpark.hr',
    siteName: 'PetPark',
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'PetPark — Sve za ljubimce na jednom mjestu',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PetPark — Sve za ljubimce na jednom mjestu',
    description: 'Zagreb, beta — čuvanje, šetanje i boarding ljubimaca bez izmišljenog inventoryja.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  icons: {
    icon: [{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#f97316',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const routeLocale = DEFAULT_LOCALE;

  return (
    <html lang={routeLocale} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f97316" />
        
        {/* Hreflang tags for SEO */}
        <link rel="alternate" hrefLang="hr" href="https://petpark.hr" />
        <link rel="alternate" hrefLang="x-default" href="https://petpark.hr" />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PetPark" />
        <WebsiteJsonLd />
        <SiteNavigationJsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SkipToContentLink />
        <StaticNavbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <StaticFooter />
      </body>
    </html>
  );
}
