'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/lib/push-client';
import { toast } from 'sonner';

interface PushNotificationToggleProps {
  className?: string;
  variant?: 'default' | 'compact' | 'menu';
}

export function PushNotificationToggle({ 
  className = '',
  variant = 'default' 
}: PushNotificationToggleProps) {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);

  // Show prompt after a delay if not subscribed
  useEffect(() => {
    if (isSupported && permission === 'default' && !isSubscribed && !isLoading) {
      const timer = setTimeout(() => setShowEnablePrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isSubscribed, isLoading]);

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast.success('Push obavijesti isključene');
      } else {
        toast.error('Greška pri isključivanju obavijesti');
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast.success('Push obavijesti uključene!');
        setShowEnablePrompt(false);
      } else if (permission === 'denied') {
        toast.error('Obavijesti su blokirane u postavkama preglednika');
      } else {
        toast.error('Greška pri uključivanju obavijesti');
      }
    }
  };

  // Compact variant for menus
  if (variant === 'menu') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <>
            <Bell className="w-4 h-4 text-orange-500" />
            <span>Push obavijesti uključene</span>
          </>
        ) : (
          <>
            <BellOff className="w-4 h-4 text-gray-400" />
            <span>Uključi push obavijesti</span>
          </>
        )}
      </button>
    );
  }

  // Compact variant (icon only)
  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors ${
          isSubscribed 
            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${className}`}
        title={isSubscribed ? 'Push obavijesti uključene' : 'Uključi push obavijesti'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
      </button>
    );
  }

  // Default variant with prompt
  return (
    <div className={className}>
      {showEnablePrompt && !isSubscribed && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 mb-2">
            Želite li primati obavijesti o novim porukama i rezervacijama?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Učitavanje...' : 'Uključi obavijesti'}
            </button>
            <button
              onClick={() => setShowEnablePrompt(false)}
              className="px-3 py-1.5 text-orange-700 text-sm hover:underline"
            >
              Ne sada
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isSubscribed
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSubscribed ? (
          <>
            <Bell className="w-5 h-5" />
            <span>Push obavijesti uključene</span>
          </>
        ) : (
          <>
            <BellOff className="w-5 h-5" />
            <span>Uključi push obavijesti</span>
          </>
        )}
      </button>

      {permission === 'denied' && (
        <p className="mt-2 text-sm text-red-600">
          Obavijesti su blokirane u postavkama preglednika. 
          Omogućite ih u postavkama da biste primali obavijesti.
        </p>
      )}
    </div>
  );
}
