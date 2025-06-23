
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Questo hook è ora deprecato in favore di useAdvancedTracking
// Manteniamo solo per compatibilità ma non fa più tracking
export const usePageVisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Il tracking è ora gestito da useAdvancedTracking in AnalyticsProvider
    console.log("Page visit (legacy tracker):", location.pathname);
  }, [location.pathname]);
};
