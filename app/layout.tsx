import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Šapica — Pronađite čuvara za svog ljubimca',
    template: '%s | Šapica',
  },
  description: 'Šapica je hrvatski marketplace za čuvanje kućnih ljubimaca. Pronađite pouzdane sittere u vašem gradu ili zaradite čuvajući ljubimce.',
  keywords: ['pet sitting', 'čuvanje ljubimaca', 'šetanje pasa', 'Hrvatska', 'Zagreb', 'Rijeka', 'Split', 'Osijek'],
  openGraph: {
    title: 'Šapica — Pronađite čuvara za svog ljubimca',
    description: 'Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu.',
    type: 'website',
    locale: 'hr_HR',
    siteName: 'Šapica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Šapica — Pronađite čuvara za svog ljubimca',
    description: 'Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu.',
  },
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
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
