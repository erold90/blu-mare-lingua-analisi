import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      // Non tracciare visite nell'area riservata
      if (window.location.pathname.includes('/area-riservata')) {
        return;
      }
      try {
        const visitData = {
          page: window.location.pathname,
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent
        };

        console.log('🔍 Tracking visit:', visitData);

        const { data, error } = await supabase.functions.invoke('track-visit', {
          body: visitData
        });

        if (error) {
          console.error('Error tracking visit:', error);
        } else {
          console.log('✅ Visit tracked successfully:', data);
        }
      } catch (err) {
        console.error('Error in visit tracking:', err);
      }
    };

    // Track visit on mount
    trackVisit();

    // Track page changes (for SPA navigation)
    const handleLocationChange = () => {
      trackVisit();
    };

    // Listen for navigation changes
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
};

export default useVisitTracker;