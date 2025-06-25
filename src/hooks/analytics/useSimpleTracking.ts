
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnifiedAnalytics } from './useUnifiedAnalytics';

export function useSimpleTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useUnifiedAnalytics();

  const trackCurrentPage = useCallback(() => {
    const currentPath = location.pathname + location.search;
    trackSiteVisit(currentPath);
  }, [location, trackSiteVisit]);

  useEffect(() => {
    // Only track if not in admin area
    if (!location.pathname.includes('/area-riservata')) {
      trackCurrentPage();
    }
  }, [location, trackCurrentPage]);

  return {
    trackSiteVisit,
    trackCurrentPage
  };
}
