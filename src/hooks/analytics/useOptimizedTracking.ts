
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useOptimizedAnalytics } from './useOptimizedAnalytics';
import { testSupabaseConnectionOptimized } from './operations/optimizedSiteOperations';
import { isValidPageUrl } from './utils/typeGuards';

// Configurazione ottimizzata per tracking
const OPTIMIZED_TRACKING_CONFIG = {
  DELAY_MS: 200, // Più veloce
  CONNECTION_TEST_INTERVAL: 120000, // Test ogni 2 minuti
  MAX_TRACKED_PAGES: 25, // Ridotto per performance
  DUPLICATE_WINDOW: 300000 // 5 minuti per evitare duplicati
};

export function useOptimizedTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useOptimizedAnalytics();
  const hasTrackedRef = useRef(new Map<string, number>()); // Timestamp dei track
  const isTrackingRef = useRef(false);
  const lastConnectionTestRef = useRef(0);
  const connectionStatusRef = useRef(true);

  const trackCurrentPage = useCallback(async () => {
    const currentPath = location.pathname + location.search;
    console.log('🎯 Attempting optimized tracking:', currentPath);
    
    if (!isValidPageUrl(currentPath)) {
      console.log('🚫 Skipping invalid page for optimized tracking');
      return;
    }
    
    // Evita tracking concorrente
    if (isTrackingRef.current) {
      console.log('⏳ Optimized tracking already in progress');
      return;
    }
    
    // Controllo duplicati con timestamp
    const now = Date.now();
    const lastTracked = hasTrackedRef.current.get(currentPath);
    if (lastTracked && (now - lastTracked) < OPTIMIZED_TRACKING_CONFIG.DUPLICATE_WINDOW) {
      console.log('🔄 Page recently tracked, skipping:', currentPath);
      return;
    }
    
    // Cleanup old entries
    if (hasTrackedRef.current.size >= OPTIMIZED_TRACKING_CONFIG.MAX_TRACKED_PAGES) {
      const entries = Array.from(hasTrackedRef.current.entries())
        .sort(([, a], [, b]) => a - b);
      
      // Rimuovi le 10 più vecchie
      entries.slice(0, 10).forEach(([path]) => hasTrackedRef.current.delete(path));
    }
    
    isTrackingRef.current = true;
    
    try {
      // Test connessione periodico
      if (now - lastConnectionTestRef.current > OPTIMIZED_TRACKING_CONFIG.CONNECTION_TEST_INTERVAL) {
        try {
          const connectionOk = await Promise.race([
            testSupabaseConnectionOptimized(),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Connection test timeout')), 2000)
            )
          ]);
          
          connectionStatusRef.current = connectionOk;
          lastConnectionTestRef.current = now;
          
          if (!connectionOk) {
            console.warn('⚠️ Connection issues detected in optimized tracking');
          }
        } catch (error) {
          console.warn('⚠️ Connection test failed in optimized tracking:', error);
          connectionStatusRef.current = false;
          lastConnectionTestRef.current = now;
        }
      }
      
      // Procedi con tracking ottimizzato
      await trackSiteVisit(currentPath);
      hasTrackedRef.current.set(currentPath, now);
      console.log('✅ Successfully tracked optimized page:', currentPath);
      
    } catch (error) {
      console.error('❌ Failed optimized page tracking:', currentPath, error);
      // Non aggiungere se fallisce
    } finally {
      isTrackingRef.current = false;
    }
  }, [location, trackSiteVisit]);

  // Cleanup automatico periodico
  const cleanupTracking = useCallback(() => {
    const now = Date.now();
    const cleanupThreshold = now - (OPTIMIZED_TRACKING_CONFIG.DUPLICATE_WINDOW * 2);
    
    for (const [path, timestamp] of hasTrackedRef.current.entries()) {
      if (timestamp < cleanupThreshold) {
        hasTrackedRef.current.delete(path);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      trackCurrentPage();
    }, OPTIMIZED_TRACKING_CONFIG.DELAY_MS);
    
    return () => clearTimeout(timer);
  }, [trackCurrentPage]);

  // Cleanup periodico ogni 5 minuti
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupTracking, 300000);
    return () => clearInterval(cleanupInterval);
  }, [cleanupTracking]);

  // Debug info ottimizzata
  const getOptimizedTrackingStats = useCallback(() => {
    return {
      trackedPages: hasTrackedRef.current.size,
      isTracking: isTrackingRef.current,
      connectionStatus: connectionStatusRef.current,
      lastConnectionTest: lastConnectionTestRef.current,
      config: OPTIMIZED_TRACKING_CONFIG
    };
  }, []);

  const clearTrackingCache = useCallback(() => {
    const size = hasTrackedRef.current.size;
    hasTrackedRef.current.clear();
    console.log(`🧹 Cleared ${size} optimized tracked pages`);
    return size;
  }, []);

  return {
    // Funzioni principali
    trackSiteVisit,
    trackCurrentPage,
    
    // Utilities ottimizzate
    getOptimizedTrackingStats,
    clearTrackingCache,
    
    // Stato
    getTrackedPages: () => Array.from(hasTrackedRef.current.keys()),
    isTracking: () => isTrackingRef.current,
    connectionStatus: () => connectionStatusRef.current
  };
}
