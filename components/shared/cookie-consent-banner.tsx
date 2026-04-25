"use client";

import { useState } from "react";
import { Cookie, ChevronDown, ChevronUp, Shield, BarChart3, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/contexts/cookie-consent-context";

export function CookieConsentBanner() {
  const { showBanner, acceptAll, acceptNecessaryOnly, acceptSelected, isLoaded } = useCookieConsent();
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });

  if (!isLoaded || !showBanner) return null;

  const handleAcceptSelected = () => {
    acceptSelected(preferences);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      {showBanner && (
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Cookie className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Kolačići</h3>
                    <p className="text-sm text-white/80">Vaša privatnost je važna</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label={isExpanded ? "Smanji" : "Proširi"}
                >
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Koristimo neophodne kolačiće za rad stranice. Analitiku i marketing uključujemo samo uz vaš pristanak.
                </p>

                {/* Expandable Preferences */}
                {isExpanded && (
                    <div className="overflow-hidden">
                      <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                        {/* Necessary - Always On */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Shield className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">Neophodni</h4>
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                                Uvijek uključeno
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Ovi kolačići su neophodni za funkcioniranje stranice i ne mogu se isključiti. 
                              Uključuju autentikaciju i sigurnosne funkcije.
                            </p>
                          </div>
                        </div>

                        {/* Analytics */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">Analitika</h4>
                              <Switch
                                checked={preferences.analytics}
                                onCheckedChange={(checked) =>
                                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                                }
                              />
                            </div>
                            <p className="text-sm text-gray-600">
                              Pomažu nam razumjeti kako posjetitelji koriste našu stranicu. 
                              Koristimo Plausible Analytics koji poštuje privatnost.
                            </p>
                          </div>
                        </div>

                        {/* Marketing */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Megaphone className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">Marketing</h4>
                              <Switch
                                checked={preferences.marketing}
                                onCheckedChange={(checked) =>
                                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                                }
                              />
                            </div>
                            <p className="text-sm text-gray-600">
                              Koriste se za prikaz relevantnih oglasa i praćenje učinkovitosti marketinških kampanja.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={acceptAll}
                    className="flex-1 bg-warm-orange hover:bg-warm-orange/90 text-white"
                  >
                    Prihvati sve
                  </Button>
                  {isExpanded ? (
                    <Button
                      onClick={handleAcceptSelected}
                      variant="outline"
                      className="flex-1 border-warm-orange text-warm-orange hover:bg-warm-orange/5"
                    >
                      Spremi preference
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsExpanded(true)}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Prilagodi
                    </Button>
                  )}
                  <Button
                    onClick={acceptNecessaryOnly}
                    variant="ghost"
                    className="flex-1 text-gray-600 hover:text-gray-900"
                  >
                    Samo neophodni
                  </Button>
                </div>

                {/* Privacy Link */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  Više informacija u našoj{" "}
                  <a href="/privatnost" className="text-warm-orange hover:underline font-medium">
                    Politici privatnosti
                  </a>
                </p>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}

// Compact button for footer/settings
export function CookieSettingsButton({ className }: { className?: string }) {
  const { openBanner } = useCookieConsent();

  return (
    <button
      onClick={openBanner}
      className={`inline-flex items-center gap-2 text-sm text-gray-600 hover:text-warm-orange transition-colors ${className}`}
    >
      <Cookie className="h-4 w-4" />
      Postavke kolačića
    </button>
  );
}
