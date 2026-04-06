"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CookieCategory = "necessary" | "analytics" | "marketing";

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

interface CookieConsentContextType {
  consent: CookieConsent | null;
  isLoaded: boolean;
  showBanner: boolean;
  acceptAll: () => void;
  acceptNecessaryOnly: () => void;
  acceptSelected: (selected: Partial<Omit<CookieConsent, "timestamp">>) => void;
  revokeConsent: () => void;
  hasConsent: (category: CookieCategory) => boolean;
  openBanner: () => void;
}

const CONSENT_KEY = "petpark-cookie-consent";

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString(),
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookieConsent;
        setConsent(parsed);
      } else {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
    setIsLoaded(true);
  }, []);

  // Save consent to localStorage
  const saveConsent = useCallback((newConsent: CookieConsent) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
    setShowBanner(false);

    // Dispatch event for other components/scripts
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: newConsent }));
  }, []);

  const acceptAll = useCallback(() => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    saveConsent(newConsent);
  }, [saveConsent]);

  const acceptNecessaryOnly = useCallback(() => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    saveConsent(newConsent);
  }, [saveConsent]);

  const acceptSelected = useCallback(
    (selected: Partial<Omit<CookieConsent, "timestamp">>) => {
      const newConsent: CookieConsent = {
        necessary: true, // Always required
        analytics: selected.analytics ?? false,
        marketing: selected.marketing ?? false,
        timestamp: new Date().toISOString(),
      };
      saveConsent(newConsent);
    },
    [saveConsent]
  );

  const revokeConsent = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CONSENT_KEY);
    setConsent(null);
    setShowBanner(true);
    window.dispatchEvent(new CustomEvent("cookieConsentRevoked"));
  }, []);

  const hasConsent = useCallback(
    (category: CookieCategory): boolean => {
      if (!consent) return category === "necessary";
      return consent[category];
    },
    [consent]
  );

  const openBanner = useCallback(() => {
    setShowBanner(true);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        isLoaded,
        showBanner,
        acceptAll,
        acceptNecessaryOnly,
        acceptSelected,
        revokeConsent,
        hasConsent,
        openBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}

// Hook for checking if analytics can run
export function useAnalyticsConsent() {
  const { hasConsent, isLoaded } = useCookieConsent();
  return {
    canRunAnalytics: isLoaded && hasConsent("analytics"),
    isLoaded,
  };
}

// Hook for checking if marketing scripts can run
export function useMarketingConsent() {
  const { hasConsent, isLoaded } = useCookieConsent();
  return {
    canRunMarketing: isLoaded && hasConsent("marketing"),
    isLoaded,
  };
}
