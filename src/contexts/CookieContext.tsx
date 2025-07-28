import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CookieContextType {
  cookiesAccepted: boolean;
  setCookiesAccepted: (accepted: boolean) => void;
  analyticsEnabled: boolean;
  setAnalyticsEnabled: (enabled: boolean) => void;
  marketingEnabled: boolean;
  setMarketingEnabled: (enabled: boolean) => void;
}

// Legacy exports for backwards compatibility
export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  necessary?: boolean; // Add necessary for compatibility
}

export const useCookieConsent = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return {
    ...context,
    preferences: {
      analytics: context.analyticsEnabled,
      marketing: context.marketingEnabled,
    },
    updatePreferences: (prefs: CookiePreferences) => {
      context.setAnalyticsEnabled(prefs.analytics);
      context.setMarketingEnabled(prefs.marketing);
    },
    // Additional methods for compatibility
    isTrackingAllowed: context.analyticsEnabled,
    showBanner: !context.cookiesAccepted,
    acceptAll: () => {
      context.setCookiesAccepted(true);
      context.setAnalyticsEnabled(true);
      context.setMarketingEnabled(true);
    },
    acceptNecessaryOnly: () => {
      context.setCookiesAccepted(true);
      context.setAnalyticsEnabled(false);
      context.setMarketingEnabled(false);
    },
    openCustomization: () => {}, // Placeholder
    showCustomization: false,
    closeCustomization: () => {},
    saveCustomPreferences: (prefs: any) => {
      context.setAnalyticsEnabled(prefs.analytics || false);
      context.setMarketingEnabled(prefs.marketing || false);
      context.setCookiesAccepted(true);
    },
  };
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const useCookies = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookies must be used within a CookieProvider');
  }
  return context;
};

interface CookieProviderProps {
  children: ReactNode;
}

export const CookieProvider: React.FC<CookieProviderProps> = ({ children }) => {
  const [cookiesAccepted, setCookiesAccepted] = useState(() => {
    return localStorage.getItem('cookies-accepted') === 'true';
  });

  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
    return localStorage.getItem('analytics-enabled') !== 'false';
  });

  const [marketingEnabled, setMarketingEnabled] = useState(() => {
    return localStorage.getItem('marketing-enabled') !== 'false';
  });

  const handleSetCookiesAccepted = (accepted: boolean) => {
    setCookiesAccepted(accepted);
    localStorage.setItem('cookies-accepted', accepted.toString());
  };

  const handleSetAnalyticsEnabled = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    localStorage.setItem('analytics-enabled', enabled.toString());
  };

  const handleSetMarketingEnabled = (enabled: boolean) => {
    setMarketingEnabled(enabled);
    localStorage.setItem('marketing-enabled', enabled.toString());
  };

  return (
    <CookieContext.Provider
      value={{
        cookiesAccepted,
        setCookiesAccepted: handleSetCookiesAccepted,
        analyticsEnabled,
        setAnalyticsEnabled: handleSetAnalyticsEnabled,
        marketingEnabled,
        setMarketingEnabled: handleSetMarketingEnabled,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};