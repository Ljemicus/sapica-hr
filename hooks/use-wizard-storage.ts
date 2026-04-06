// Hook za localStorage autosave u Obrt Wizardu

'use client';

import { useState, useEffect, useCallback } from 'react';
import { WizardFormData, WizardStep } from '@/types/obrt-wizard';

const STORAGE_KEY = 'petpark_obrt_wizard';

interface StoredWizardData {
  currentStep: WizardStep;
  data: WizardFormData;
  timestamp: number;
}

export function useWizardStorage() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Učitaj podatke iz localStorage
  const loadStoredData = useCallback((): StoredWizardData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const parsed: StoredWizardData = JSON.parse(stored);
      
      // Provjeri jesu li podaci stariji od 7 dana
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > oneWeek) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error loading wizard data:', error);
      return null;
    }
  }, []);

  // Spremi podatke u localStorage
  const saveData = useCallback((step: WizardStep, data: WizardFormData) => {
    if (typeof window === 'undefined') return;
    
    try {
      const toStore: StoredWizardData = {
        currentStep: step,
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Error saving wizard data:', error);
    }
  }, []);

  // Obriši podatke
  const clearData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing wizard data:', error);
    }
  }, []);

  // Hydration effect
  useEffect(() => {
    // Use timeout to avoid synchronous setState during render
    setTimeout(() => setIsHydrated(true), 0);
  }, []);

  return {
    isHydrated,
    loadStoredData,
    saveData,
    clearData,
  };
}
