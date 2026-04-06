import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { Inter, Nunito } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { BottomNav } from '@/components/shared/bottom-nav';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { CookieConsentProvider } from '@/contexts/cookie-consent-context';
import { CookieConsentBanner } from '@/components/shared/cookie-consent-banner';
import { LanguageProvider, DEFAULT_LOCALE, LOCALE_HEADER } from '@/lib/i18n';
import { WebsiteJsonLd, SiteNavigationJsonLd } from '@/components/seo/json-ld';
import { DeferredUI } from '@/components/shared/deferred-ui';
import { ChatWidget } from '@/components/chat/chat-widget';
import { WebVitals } from '@/components/monitoring/web-vitals';
import { SkipToContentLink } from '@/components/shared/skip-to-content-link';
import { buildLocaleAlternates } from '@/lib/seo/locale-metadata';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-heading',
  weight: ['600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://petpark.hr'),
  title: {
    default: 'PetPark — Sve za ljubimce na jednom mjestu',
    template: '%s | PetPark',
  },
  description: 'PetPark je hrvatska super-aplikacija za ljubimce. Čuvanje, grooming, školovanje pasa, veterinari, udomljavanje, dog-friendly lokacije i još više — sve na jednom mjestu.',
  keywords: [
    'pet sitting', 'čuvanje ljubimaca', 'šetanje pasa', 'grooming', 'školovanje pasa',
    'čuvar za pse', 'čuvar za mačke', 'pet sitter Hrvatska', 'veterinar',
    'udomljavanje pasa', 'dog-friendly', 'izgubljeni ljubimci',
    'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Pula', 'Zadar',
  ],
  authors: [{ name: 'PetPark' }],
  creator: 'PetPark',
  publisher: 'PetPark',
  formatDetection: { telephone: true, email: true },
  openGraph: {
    title: 'PetPark — Sve za ljubimce na jednom mjestu',
    description: 'Čuvanje, grooming, školovanje, veterinari, udomljavanje i zajednica ljubitelja životinja — sve u jednoj aplikaciji.',
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
    description: 'Čuvanje, grooming, školovanje, veterinari, udomljavanje i zajednica ljubitelja životinja — sve u jednoj aplikaciji.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: buildLocaleAlternates('/'),
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#f97316',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const routeLocale = headerStore.get(LOCALE_HEADER) ?? DEFAULT_LOCALE;

  return (
    <html lang={routeLocale} className={`${inter.variable} ${nunito.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#f97316" />
        <link rel="preconnect" href="https://hmtlcgjcxhjecsbmmxol.supabase.co" />
        <link rel="dns-prefetch" href="https://hmtlcgjcxhjecsbmmxol.supabase.co" />
        <link rel="dns-prefetch" href="https://plausible.io" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PetPark" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Script
          defer
          data-domain="petpark.hr"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        <WebVitals />
        <WebsiteJsonLd />
        <SiteNavigationJsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <CookieConsentProvider>
          <AuthProvider>
            <CartProvider>
              <LanguageProvider>
                <SkipToContentLink />
                <Navbar />
                <main id="main-content" className="flex-1 pb-16 md:pb-0">{children}</main>
                <Footer />
                <BottomNav />
                <DeferredUI />
                <CookieConsentBanner />
                <ChatWidget />
              </LanguageProvider>
            </CartProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
