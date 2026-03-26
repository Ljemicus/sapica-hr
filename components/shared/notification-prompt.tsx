'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { mockRequestPermission, mockSubscribe } from '@/lib/notifications';
import { toast } from 'sonner';

export function NotificationPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    const dismissed = localStorage.getItem('sapica-notif-dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleEnable = async () => {
    try {
      const permission = await mockRequestPermission();
      if (permission === 'granted') {
        await mockSubscribe();
        toast.success('Obavijesti su uključene! Primit ćete obavijesti o novim porukama.');
        localStorage.setItem('sapica-notif-dismissed', 'true');
      } else {
        toast.info('Obavijesti su onemogućene u pregledniku.');
      }
    } catch {
      toast.error('Greška pri uključivanju obavijesti.');
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('sapica-notif-dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">Uključite obavijesti</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Primajte obavijesti o novim porukama i ažuriranjima o vašem ljubimcu.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleEnable}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8"
              >
                Uključi
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-8 text-gray-500"
              >
                Ne sada
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
