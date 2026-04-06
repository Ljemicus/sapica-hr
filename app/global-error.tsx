'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { appLogger } from '@/lib/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture error in Sentry with critical level
    const eventId = Sentry.captureException(error, {
      level: 'fatal',
      contexts: {
        global_error_boundary: {
          digest: error.digest,
          isGlobal: true,
        },
      },
    });

    appLogger.error('app.global_error', 'Global error boundary triggered', {
      message: error.message,
      digest: error.digest,
      sentryEventId: eventId,
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
          <div className="text-6xl mb-4">😿</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kritična greška</h1>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Došlo je do kritične greške u aplikaciji. Molimo osvježite stranicu.
          </p>
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
          >
            Osvježi stranicu
          </button>
        </div>
      </body>
    </html>
  );
}
