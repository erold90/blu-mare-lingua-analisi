
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences | null;
  showBanner: boolean;
  showCustomization: boolean;
  acceptAll: () => void;
  acceptNecessaryOnly: () => void;
  saveCustomPreferences: (prefs: CookiePreferences) => void;
  openCustomization: () => void;
  closeCustomization: () => void;
  isTrackingAllowed: (type: 'analytics' | 'marketing') => boolean;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = 'villamareblu_cookie_consent';
const CONSENT_EXPIRY_MONTHS = 6;

export const CookieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        const consentDate = new Date(parsed.timestamp);
        const now = new Date();
        const diffMonths = (now.getFullYear() - consentDate.getFullYear()) * 12 + 
                          (now.getMonth() - consentDate.getMonth());
        
        if (diffMonths < CONSENT_EXPIRY_MONTHS) {
          setPreferences(parsed.preferences);
          console.log('✅ Cookie consent loaded from storage:', parsed.preferences);
        } else {
          // Consenso scaduto, richiedi nuovo consenso
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          setShowBanner(true);
          console.log('⏰ Cookie consent expired, showing banner');
        }
      } catch (error) {
        console.warn('⚠️ Error parsing cookie consent:', error);
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        setShowBanner(true);
      }
    } else {
      // Nessun consenso salvato, mostra banner
      setShowBanner(true);
      console.log('🍪 No cookie consent found, showing banner');
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      preferences: prefs,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setPreferences(prefs);
    setShowBanner(false);
    setShowCustomization(false);
    
    console.log('💾 Cookie preferences saved:', prefs);
    
    // Ricarica la pagina per applicare le nuove impostazioni
    window.location.reload();
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true
    });
  };

  const acceptNecessaryOnly = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false
    });
  };

  const saveCustomPreferences = (prefs: CookiePreferences) => {
    // I cookie necessari sono sempre obbligatori
    saveConsent({
      ...prefs,
      necessary: true
    });
  };

  const openCustomization = () => {
    setShowCustomization(true);
  };

  const closeCustomization = () => {
    setShowCustomization(false);
  };

  const isTrackingAllowed = (type: 'analytics' | 'marketing'): boolean => {
    if (!preferences) return false;
    return preferences[type] === true;
  };

  return (
    <CookieContext.Provider value={{
      preferences,
      showBanner,
      showCustomization,
      acceptAll,
      acceptNecessaryOnly,
      saveCustomPreferences,
      openCustomization,
      closeCustomization,
      isTrackingAllowed
    }}>
      {children}
    </CookieContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
};
