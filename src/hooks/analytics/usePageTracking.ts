
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdvancedTracking } from './useAdvancedTracking';

// Unified page tracking hook that prevents duplicate tracking
export function usePageTracking() {
  const location = useLocation();
  const { trackInteraction, isTrackingEnabled } = useAdvancedTracking();
  const hasTrackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isTrackingEnabled) return;

    const currentPath = location.pathname + location.search;
    
    // Prevent duplicate tracking for the same path
    if (hasTrackedRef.current.has(currentPath)) {
      return;
    }

    hasTrackedRef.current.add(currentPath);

    // Track page visit
    trackInteraction({
      interaction_type: 'page_visit',
      additional_data: {
        path: currentPath,
        title: document.title
      }
    });

    // Clean up old entries to prevent memory leaks
    if (hasTrackedRef.current.size > 50) {
      const entries = Array.from(hasTrackedRef.current);
      hasTrackedRef.current = new Set(entries.slice(-25));
    }

  }, [location, trackInteraction, isTrackingEnabled]);
}
