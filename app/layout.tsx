import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Nunito } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { BottomNav } from '@/components/shared/bottom-nav';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { PushNotificationPrompt } from '@/components/shared/push-notification';
import { CookieConsent } from '@/components/shared/cookie-consent';
import { NotificationPrompt } from '@/components/shared/notification-prompt';
import { FloatingChat } from '@/components/shared/floating-chat';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-heading',
  weight: ['400', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://petpark.hr'),
  title: {
    default: 'PetPark — Pronađite čuvara za svog ljubimca',
    template: '%s | PetPark',
  },
  description: 'PetPark je hrvatski marketplace za čuvanje kućnih ljubimaca. Pronađite pouzdane sittere u vašem gradu ili zaradite čuvajući ljubimce. Čuvanje, šetanje, grooming i dresura.',
  keywords: [
    'pet sitting', 'čuvanje ljubimaca', 'šetanje pasa', 'grooming', 'dresura pasa',
    'čuvar za pse', 'čuvar za mačke', 'pet sitter Hrvatska',
    'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Pula', 'Zadar',
  ],
  authors: [{ name: 'PetPark' }],
  creator: 'PetPark',
  publisher: 'PetPark',
  formatDetection: { telephone: true, email: true },
  openGraph: {
    title: 'PetPark — Pronađite čuvara za svog ljubimca',
    description: 'Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu. 500+ sittera, 50+ gradova u Hrvatskoj.',
    type: 'website',
    locale: 'hr_HR',
    url: 'https://petpark.hr',
    siteName: 'PetPark',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PetPark — Pronađite čuvara za svog ljubimca',
    description: 'Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu. 500+ sittera, 50+ gradova u Hrvatskoj.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://petpark.hr' },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'PetPark',
              alternateName: 'PetPark d.o.o.',
              url: 'https://petpark.hr',
              logo: 'https://petpark.hr/opengraph-image',
              description: 'Hrvatski marketplace za čuvanje kućnih ljubimaca. Pronađite pouzdane sittere u vašem gradu.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Zagreb',
                addressCountry: 'HR',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'info@petpark.hr',
                telephone: '+385-1-234-5678',
                contactType: 'customer service',
                availableLanguage: 'Croatian',
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <CartProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg">Preskoči na sadržaj</a>
          <Navbar />
          <main id="main-content" className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <ScrollToTop />
          <PushNotificationPrompt />
          <NotificationPrompt />
          <Toaster position="top-right" richColors />

          <FloatingChat />
          <CookieConsent />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
