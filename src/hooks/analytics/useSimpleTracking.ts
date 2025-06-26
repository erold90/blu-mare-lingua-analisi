
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnifiedAnalytics } from './useUnifiedAnalytics';
import { testSupabaseConnection } from './operations/siteOperations';

export function useSimpleTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useUnifiedAnalytics();
  const hasTrackedRef = useRef(new Set<string>());

  const trackCurrentPage = useCallback(async () => {
    const currentPath = location.pathname + location.search;
    console.log('🔍 Attempting to track page:', currentPath);
    
    // Verifica che non sia area admin
    if (currentPath.includes('/area-riservata')) {
      console.log('🚫 Skipping admin area tracking');
      return;
    }
    
    // Evita duplicati nella stessa sessione
    if (hasTrackedRef.current.has(currentPath)) {
      console.log('📝 Page already tracked in this session:', currentPath);
      return;
    }
    
    // Test della connessione prima del tracking
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      console.warn('⚠️ Supabase connection issues, skipping tracking');
      return;
    }
    
    try {
      await trackSiteVisit(currentPath);
      hasTrackedRef.current.add(currentPath);
      console.log('✅ Successfully tracked page:', currentPath);
    } catch (error) {
      console.error('❌ Failed to track page:', currentPath, error);
    }
  }, [location, trackSiteVisit]);

  useEffect(() => {
    // Delay più lungo per assicurarsi che tutto sia caricato
    const timer = setTimeout(trackCurrentPage, 1000);
    
    return () => clearTimeout(timer);
  }, [trackCurrentPage]);

  // Debug: log delle visite già tracciate
  useEffect(() => {
    console.log('📊 Pages tracked in this session:', Array.from(hasTrackedRef.current));
  }, [location.pathname]);

  return {
    trackSiteVisit,
    trackCurrentPage,
    testConnection: testSupabaseConnection
  };
}
