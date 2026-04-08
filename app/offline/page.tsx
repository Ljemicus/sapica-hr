import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline | PetPark',
  description: 'Izgubili ste internet vezu. Neke stranice su još uvijek dostupne offline.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Offline ste
        </h1>
        <p className="text-gray-600 mb-6">
          Izgubili ste internet vezu. Neke stranice su još uvijek dostupne offline,
          ali za punu funkcionalnost potrebna je internetska veza.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Pokušaj ponovno
          </button>
          <a
            href="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Početna stranica
          </a>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Posljednji put ažurirano: {new Date().toLocaleDateString('hr-HR')}
        </p>
      </div>
    </div>
  );
}
