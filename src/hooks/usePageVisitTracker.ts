
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityLog } from './useActivityLog';

export const usePageVisitTracker = () => {
  const location = useLocation();
  const { addSiteVisit } = useActivityLog();

  useEffect(() => {
    // Track page visit when location changes
    console.log("Page visit detected:", location.pathname);
    addSiteVisit(location.pathname);
  }, [location.pathname, addSiteVisit]);
};
