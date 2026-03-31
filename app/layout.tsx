import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Nunito } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { BottomNav } from '@/components/shared/bottom-nav';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { LanguageProvider } from '@/lib/i18n';
import { WebsiteJsonLd, SiteNavigationJsonLd } from '@/components/seo/json-ld';
import { DeferredUI } from '@/components/shared/deferred-ui';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-heading',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://petpark.hr'),
  title: {
    default: 'PetPark — Sve za ljubimce na jednom mjestu',
    template: '%s | PetPark',
  },
  description: 'PetPark je hrvatska super-aplikacija za ljubimce. Čuvanje, grooming, školovanje pasa, veterinari, shop, udomljavanje, dog-friendly lokacije i još više — sve na jednom mjestu.',
  keywords: [
    'pet sitting', 'čuvanje ljubimaca', 'šetanje pasa', 'grooming', 'školovanje pasa',
    'čuvar za pse', 'čuvar za mačke', 'pet sitter Hrvatska', 'veterinar', 'pet shop',
    'udomljavanje pasa', 'dog-friendly', 'izgubljeni ljubimci',
    'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Pula', 'Zadar',
  ],
  authors: [{ name: 'PetPark' }],
  creator: 'PetPark',
  publisher: 'PetPark',
  formatDetection: { telephone: true, email: true },
  openGraph: {
    title: 'PetPark — Sve za ljubimce na jednom mjestu',
    description: 'Čuvanje, grooming, školovanje, veterinari, shop, udomljavanje i zajednica ljubitelja životinja — sve u jednoj aplikaciji.',
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
    description: 'Čuvanje, grooming, školovanje, veterinari, shop, udomljavanje i zajednica ljubitelja životinja — sve u jednoj aplikaciji.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://petpark.hr',
    languages: {
      'hr': 'https://petpark.hr',
    },
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className={`${inter.variable} ${nunito.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
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
        <WebsiteJsonLd />
        <SiteNavigationJsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <LanguageProvider>
          <CartProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg">Preskoči na sadržaj</a>
          <Navbar />
          <main id="main-content" className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <DeferredUI />
          </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
