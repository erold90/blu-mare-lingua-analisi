
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
    
    // Se non abbiamo ancora le preferenze, blocca solo servizi esterni
    if (!preferences) {
      return;
    }

    // Google Analytics - solo se consentito esplicitamente
    if (preferences?.analytics) {
      
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

      }
    } else {
      
      // Disabilita Google Analytics se era già caricato
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', 'AW-1009072951', {
          send_page_view: false
        });
      }
    }

    // Altri servizi di tracking possono essere aggiunti qui
    if (preferences?.marketing) {
      // Inizializza servizi di marketing/advertising
    } else {
    }

  }, [preferences, isTrackingAllowed]);

  return null; // Questo componente non renderizza nulla
};
