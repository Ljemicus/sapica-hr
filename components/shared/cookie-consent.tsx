'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('petpark-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('petpark-cookie-consent', JSON.stringify({ essential: true, analytics: true, date: new Date().toISOString() }));
    setShow(false);
  };

  const saveSettings = () => {
    localStorage.setItem('petpark-cookie-consent', JSON.stringify({ essential: true, analytics, date: new Date().toISOString() }));
    setShow(false);
    setShowSettings(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 md:p-6">
          {!showSettings ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Cookie className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Koristimo kolačiće</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Koristimo tehničke kolačiće za funkcioniranje stranice i analitičke za poboljšanje korisničkog iskustva.{' '}
                    <Link href="/privatnost" className="text-orange-500 hover:underline">Saznajte više</Link>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex-1 sm:flex-initial text-xs h-9"
                >
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Postavke
                </Button>
                <Button
                  size="sm"
                  onClick={accept}
                  className="flex-1 sm:flex-initial bg-orange-500 hover:bg-orange-600 text-xs h-9"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Prihvaćam
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-4">Postavke kolačića</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Neophodni kolačići</p>
                    <p className="text-xs text-gray-500">Potrebni za rad stranice (autentikacija, sesija)</p>
                  </div>
                  <div
                    role="switch"
                    aria-checked="true"
                    aria-label="Neophodni kolačići su uvijek uključeni"
                    className="h-5 w-9 bg-orange-500 rounded-full flex items-center justify-end px-0.5"
                  >
                    <div className="h-4 w-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analitički kolačići</p>
                    <p className="text-xs text-gray-500">Pomažu nam razumjeti kako koristite stranicu (Plausible)</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analytics}
                    aria-label="Uključi ili isključi analitičke kolačiće"
                    onClick={() => setAnalytics(!analytics)}
                    className={`h-5 w-9 rounded-full flex items-center px-0.5 transition-colors ${analytics ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                    <div className="h-4 w-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)} className="text-xs h-9">
                  Natrag
                </Button>
                <Button size="sm" onClick={saveSettings} className="bg-orange-500 hover:bg-orange-600 text-xs h-9">
                  Spremi postavke
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
