import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '404 — Stranica nije pronađena',
  robots: { index: false, follow: false },
};

export default function Hard404Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-4">🐾</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-500 mb-6 max-w-md">
        Ova stranica ne postoji ili je premještena. Možda se izgubila kao mačka na krovu?
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
      >
        Vrati me na početnu
      </Link>
    </div>
  );
}
