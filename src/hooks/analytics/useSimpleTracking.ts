
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnifiedAnalytics } from './useUnifiedAnalytics';

export function useSimpleTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useUnifiedAnalytics();

  const trackCurrentPage = useCallback(() => {
    const currentPath = location.pathname + location.search;
    console.log('🔍 Attempting to track page:', currentPath);
    
    // Verifica che non sia area admin
    if (currentPath.includes('/area-riservata')) {
      console.log('🚫 Skipping admin area tracking');
      return;
    }
    
    trackSiteVisit(currentPath);
  }, [location, trackSiteVisit]);

  useEffect(() => {
    // Delay di 100ms per assicurarsi che la pagina sia completamente caricata
    const timer = setTimeout(trackCurrentPage, 100);
    
    return () => clearTimeout(timer);
  }, [trackCurrentPage]);

  return {
    trackSiteVisit,
    trackCurrentPage
  };
}
