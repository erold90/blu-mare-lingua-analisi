
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnifiedAnalytics } from './useUnifiedAnalytics';
import { testSupabaseConnection } from './operations/siteOperations';

export function useSimpleTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useUnifiedAnalytics();
  const hasTrackedRef = useRef(new Set<string>());
  const isTrackingRef = useRef(false);

  const trackCurrentPage = useCallback(async () => {
    const currentPath = location.pathname + location.search;
    console.log('🔍 Attempting to track page:', currentPath);
    
    // Verifica che non sia area admin
    if (currentPath.includes('/area-riservata')) {
      console.log('🚫 Skipping admin area tracking');
      return;
    }
    
    // Evita chiamate concorrenti
    if (isTrackingRef.current) {
      console.log('📝 Tracking already in progress, skipping');
      return;
    }
    
    // Evita duplicati nella stessa sessione
    if (hasTrackedRef.current.has(currentPath)) {
      console.log('📝 Page already tracked in this session:', currentPath);
      return;
    }
    
    isTrackingRef.current = true;
    
    try {
      // Test della connessione con timeout più breve
      console.log('🔗 Testing connection before tracking...');
      const connectionOk = await Promise.race([
        testSupabaseConnection(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection test timeout')), 2000)
        )
      ]);
      
      if (!connectionOk) {
        console.warn('⚠️ Supabase connection issues, attempting tracking anyway');
      }
      
      await trackSiteVisit(currentPath);
      hasTrackedRef.current.add(currentPath);
      console.log('✅ Successfully tracked page:', currentPath);
      
    } catch (error) {
      console.error('❌ Failed to track page:', currentPath, error);
      // Non aggiungiamo alla lista dei tracciati se fallisce
    } finally {
      isTrackingRef.current = false;
    }
  }, [location, trackSiteVisit]);

  useEffect(() => {
    // Delay ottimizzato per il tracking
    const timer = setTimeout(trackCurrentPage, 500);
    
    return () => clearTimeout(timer);
  }, [trackCurrentPage]);

  // Debug: log delle visite già tracciate
  useEffect(() => {
    if (hasTrackedRef.current.size > 0) {
      console.log('📊 Pages tracked in this session:', Array.from(hasTrackedRef.current));
    }
  }, [location.pathname]);

  return {
    trackSiteVisit,
    trackCurrentPage,
    testConnection: testSupabaseConnection,
    getTrackedPages: () => Array.from(hasTrackedRef.current)
  };
}
