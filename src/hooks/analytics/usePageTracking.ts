
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSimpleTracking } from './useSimpleTracking';

// Unified page tracking hook that prevents duplicate tracking
export function usePageTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useSimpleTracking();
  const hasTrackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Prevent duplicate tracking for the same path
    if (hasTrackedRef.current.has(currentPath)) {
      return;
    }

    hasTrackedRef.current.add(currentPath);

    // Track page visit
    trackSiteVisit(currentPath);

    // Clean up old entries to prevent memory leaks
    if (hasTrackedRef.current.size > 50) {
      const entries = Array.from(hasTrackedRef.current);
      hasTrackedRef.current = new Set(entries.slice(-25));
    }

  }, [location, trackSiteVisit]);
}
