
import { useCallback } from 'react';
import { useAnalyticsCore } from './useAnalyticsCore';

export function useSimpleTracking() {
  const { trackSiteVisit } = useAnalyticsCore();

  const trackCurrentPage = useCallback(async (customPath?: string) => {
    try {
      const path = customPath || window.location.pathname;
      await trackSiteVisit(path);
    } catch (error) {
      console.error('❌ Simple tracking failed:', error);
    }
  }, [trackSiteVisit]);

  return {
    trackSiteVisit,
    trackCurrentPage
  };
}
