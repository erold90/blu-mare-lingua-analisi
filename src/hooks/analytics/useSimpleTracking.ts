
import { useEffect } from 'react';
import { useAnalytics } from './useAnalytics';

export function useSimpleTracking() {
  const { trackSiteVisit } = useAnalytics();
  
  useEffect(() => {
    const currentPath = window.location.pathname;
    trackSiteVisit(currentPath);
  }, [trackSiteVisit]);
  
  return { trackSiteVisit };
}
