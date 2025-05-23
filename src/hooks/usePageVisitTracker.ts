
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityLog } from './useActivityLog';

export const usePageVisitTracker = () => {
  const location = useLocation();
  const { addSiteVisit } = useActivityLog();

  useEffect(() => {
    // Track page visit when location changes
    addSiteVisit(location.pathname);
  }, [location.pathname, addSiteVisit]);
};
