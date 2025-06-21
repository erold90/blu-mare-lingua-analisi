
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityLog } from '@/hooks/activity/useActivityLog';

export const usePageVisitTracker = () => {
  const location = useLocation();
  const { addSiteVisit } = useActivityLog();

  useEffect(() => {
    // Skip tracking for admin area and API routes
    if (location.pathname.includes("/area-riservata") || 
        location.pathname.includes("/api/") ||
        location.pathname.includes("/admin/")) {
      console.log("Skipping tracking for protected/admin area:", location.pathname);
      return;
    }

    console.log("Page visit detected:", location.pathname);
    addSiteVisit(location.pathname);
  }, [location.pathname, addSiteVisit]);
};
