
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnifiedAnalytics } from './useUnifiedAnalytics';
import { testSupabaseConnection } from './operations/siteOperations';

// Configurazione ottimizzata per il tracking
const TRACKING_CONFIG = {
  DELAY_MS: 300, // Ridotto per tracking più reattivo
  CONNECTION_TEST_INTERVAL: 60000, // Test connessione ogni minuto
  MAX_TRACKED_PAGES: 50 // Limite pagine trackate in sessione
};

export function useSimpleTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useUnifiedAnalytics();
  const hasTrackedRef = useRef(new Set<string>());
  const isTrackingRef = useRef(false);
  const lastConnectionTestRef = useRef(0);
  const connectionStatusRef = useRef(true);

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
    
    // Evita duplicati nella stessa sessione (con limite)
    if (hasTrackedRef.current.has(currentPath)) {
      console.log('📝 Page already tracked in this session:', currentPath);
      return;
    }
    
    // Controllo limite pagine trackate
    if (hasTrackedRef.current.size >= TRACKING_CONFIG.MAX_TRACKED_PAGES) {
      console.log('📝 Max tracked pages reached, clearing oldest entries');
      const entries = Array.from(hasTrackedRef.current);
      hasTrackedRef.current.clear();
      // Mantieni solo le ultime 25 pagine
      entries.slice(-25).forEach(page => hasTrackedRef.current.add(page));
    }
    
    isTrackingRef.current = true;
    
    try {
      // Test connessione ottimizzato (solo se necessario)
      const now = Date.now();
      if (now - lastConnectionTestRef.current > TRACKING_CONFIG.CONNECTION_TEST_INTERVAL) {
        console.log('🔗 Testing connection...');
        
        try {
          const connectionOk = await Promise.race([
            testSupabaseConnection(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Connection test timeout')), 1500)
            )
          ]);
          
          connectionStatusRef.current = connectionOk as boolean;
          lastConnectionTestRef.current = now;
          
          if (!connectionOk) {
            console.warn('⚠️ Connection issues detected');
          }
        } catch (error) {
          console.warn('⚠️ Connection test failed:', error);
          connectionStatusRef.current = false;
          lastConnectionTestRef.current = now;
        }
      }
      
      // Procedi con il tracking anche se la connessione sembra problematica
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

  // Cleanup periodico della cache di tracking
  const cleanupTrackingCache = useCallback(() => {
    const cacheSize = hasTrackedRef.current.size;
    if (cacheSize > TRACKING_CONFIG.MAX_TRACKED_PAGES * 0.8) {
      console.log(`🧹 Cleaning tracking cache (${cacheSize} entries)`);
      const entries = Array.from(hasTrackedRef.current);
      hasTrackedRef.current.clear();
      entries.slice(-Math.floor(TRACKING_CONFIG.MAX_TRACKED_PAGES * 0.5)).forEach(page => 
        hasTrackedRef.current.add(page)
      );
    }
  }, []);

  useEffect(() => {
    // Delay ottimizzato per il tracking
    const timer = setTimeout(() => {
      trackCurrentPage();
      cleanupTrackingCache();
    }, TRACKING_CONFIG.DELAY_MS);
    
    return () => clearTimeout(timer);
  }, [trackCurrentPage, cleanupTrackingCache]);

  // Debug: log delle visite già tracciate (solo in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && hasTrackedRef.current.size > 0) {
      console.log('📊 Pages tracked in this session:', Array.from(hasTrackedRef.current));
    }
  }, [location.pathname]);

  // Funzioni di utilità per debugging
  const getTrackingStats = useCallback(() => {
    return {
      trackedPages: hasTrackedRef.current.size,
      isTracking: isTrackingRef.current,
      connectionStatus: connectionStatusRef.current,
      lastConnectionTest: lastConnectionTestRef.current,
      config: TRACKING_CONFIG
    };
  }, []);

  const forceConnectionTest = useCallback(async () => {
    lastConnectionTestRef.current = 0; // Force test on next track attempt
    return await testSupabaseConnection();
  }, []);

  const clearTrackingCache = useCallback(() => {
    const size = hasTrackedRef.current.size;
    hasTrackedRef.current.clear();
    console.log(`🧹 Cleared ${size} tracked pages from cache`);
    return size;
  }, []);

  return {
    // Funzioni base
    trackSiteVisit,
    trackCurrentPage,
    
    // Funzioni ottimizzate
    getTrackingStats,
    forceConnectionTest,
    clearTrackingCache,
    
    // Stato
    getTrackedPages: () => Array.from(hasTrackedRef.current),
    isTracking: () => isTrackingRef.current,
    connectionStatus: () => connectionStatusRef.current
  };
}
