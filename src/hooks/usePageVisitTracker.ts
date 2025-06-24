import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This hook is now deprecated in favor of usePageTracking from unified analytics
// Keeping only for backward compatibility but it no longer does any tracking
export const usePageVisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Tracking is now handled by usePageTracking in AnalyticsProvider
    console.log("Page visit (legacy tracker - deprecated):", location.pathname);
  }, [location.pathname]);
};
