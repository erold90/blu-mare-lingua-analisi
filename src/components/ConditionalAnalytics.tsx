
import React, { useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieContext';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const ConditionalAnalytics: React.FC = () => {
  const { isTrackingAllowed, preferences } = useCookieConsent();

  useEffect(() => {
    console.log('🍪 ConditionalAnalytics check - preferences:', preferences);
    console.log('🍪 Analytics tracking allowed:', isTrackingAllowed('analytics'));
    
    // Se non abbiamo ancora le preferenze, blocca solo servizi esterni
    if (!preferences) {
      console.log('🍪 No cookie preferences yet, blocking external tracking only');
      return;
    }

    // Google Analytics - solo se consentito esplicitamente
    if (isTrackingAllowed('analytics')) {
      console.log('✅ Analytics tracking enabled');
      
      // Inizializza Google Analytics solo se consentito
      if (typeof window.gtag === 'undefined') {
        // Carica lo script di Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-1009072951';
        document.head.appendChild(script);

        // Inizializza gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        
        window.gtag('js', new Date());
        window.gtag('config', 'AW-1009072951', {
          anonymize_ip: true, // Conformità GDPR
          cookie_flags: 'max-age=7200;secure;samesite=none'
        });

        console.log('📊 Google Analytics initialized');
      }
    } else {
      console.log('🚫 Analytics tracking blocked by user preference');
      
      // Disabilita Google Analytics se era già caricato
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', 'AW-1009072951', {
          send_page_view: false
        });
      }
    }

    // Altri servizi di tracking possono essere aggiunti qui
    if (isTrackingAllowed('marketing')) {
      console.log('✅ Marketing tracking enabled');
      // Inizializza servizi di marketing/advertising
    } else {
      console.log('🚫 Marketing tracking blocked by user preference');
    }

  }, [preferences, isTrackingAllowed]);

  return null; // Questo componente non renderizza nulla
};
