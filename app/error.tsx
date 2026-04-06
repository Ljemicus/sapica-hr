'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { appLogger } from '@/lib/logger';
import { trackEvent } from '@/lib/analytics';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture error in Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        error_boundary: {
          digest: error.digest,
          path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
      },
    });

    appLogger.error('app.error', 'Unhandled app error boundary triggered', {
      message: error.message,
      digest: error.digest,
      sentryEventId: eventId,
    });
    
    trackEvent('Error Boundary', {
      message: error.message?.slice(0, 150) ?? 'unknown',
      digest: error.digest ?? null,
      path: window.location.pathname,
    });
  }, [error]);

  return (
    <div role="alert" aria-live="assertive" className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-6xl mb-4">😿</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nešto je pošlo po krivu</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        Došlo je do neočekivane greške. Pokušajte ponovo ili se vratite na početnu stranicu.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
        >
          Pokušaj ponovo
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
        >
          Početna
        </Link>
      </div>
    </div>
  );
}
