import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { PushNotificationPrompt } from '@/components/shared/push-notification';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sapica.vercel.app'),
  title: {
    default: 'Šapica — Pronađite čuvara za svog ljubimca',
    template: '%s | Šapica',
  },
  description: 'Šapica je hrvatski marketplace za čuvanje kućnih ljubimaca. Pronađite pouzdane sittere u vašem gradu ili zaradite čuvajući ljubimce. Čuvanje, šetanje, grooming i dresura.',
  keywords: [
    'pet sitting', 'čuvanje ljubimaca', 'šetanje pasa', 'grooming', 'dresura pasa',
    'čuvar za pse', 'čuvar za mačke', 'pet sitter Hrvatska',
    'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Pula', 'Zadar',
  ],
  authors: [{ name: 'Šapica' }],
  creator: 'Šapica',
  publisher: 'Šapica',
  formatDetection: { telephone: true, email: true },
  openGraph: {
    title: 'Šapica — Pronađite čuvara za svog ljubimca',
    description: 'Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu. 500+ sittera, 50+ gradova u Hrvatskoj.',
    type: 'website',
    locale: 'hr_HR',
    url: 'https://sapica.vercel.app',
    siteName: 'Šapica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Šapica — Pronađite čuvara za svog ljubimca',
    description: 'Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu. 500+ sittera, 50+ gradova u Hrvatskoj.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://sapica.vercel.app' },
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="62" rx="14" ry="16" fill="%23f97316"/><ellipse cx="30" cy="38" rx="8" ry="11" fill="%23f97316"/><ellipse cx="70" cy="38" rx="8" ry="11" fill="%23f97316"/><ellipse cx="20" cy="56" rx="7" ry="10" fill="%23f97316"/><ellipse cx="80" cy="56" rx="7" ry="10" fill="%23f97316"/></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Šapica" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <Script
          defer
          data-domain="sapica.vercel.app"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          <PushNotificationPrompt />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
