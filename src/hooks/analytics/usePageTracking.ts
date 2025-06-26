
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

// Configurazione tracking
const TRACKING_CONFIG = {
  DELAY_MS: 500, // Ritardo prima del tracking
  DUPLICATE_WINDOW: 60000, // 1 minuto per evitare duplicati
  MAX_PAGE_LENGTH: 500
};

export function usePageTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useAnalytics();
  const lastTrackedRef = useRef<Map<string, number>>(new Map());
  const isTrackingRef = useRef(false);

  const isValidPage = useCallback((page: string): boolean => {
    if (!page || typeof page !== 'string') return false;
    if (page.length > TRACKING_CONFIG.MAX_PAGE_LENGTH) return false;
    
    // Skip admin e pagine private
    if (page.includes('/area-riservata') || 
        page.includes('/admin') ||
        page.includes('/login')) return false;
    
    return true;
  }, []);

  const trackCurrentPage = useCallback(async () => {
    const currentPath = location.pathname + location.search;
    
    if (!isValidPage(currentPath)) {
      console.log('🚫 Skipping invalid page:', currentPath);
      return;
    }
    
    // Evita tracking concorrente
    if (isTrackingRef.current) {
      console.log('⏳ Tracking already in progress');
      return;
    }
    
    // Controllo duplicati
    const now = Date.now();
    const lastTracked = lastTrackedRef.current.get(currentPath);
    if (lastTracked && (now - lastTracked) < TRACKING_CONFIG.DUPLICATE_WINDOW) {
      console.log('🔄 Page recently tracked, skipping:', currentPath);
      return;
    }
    
    isTrackingRef.current = true;
    
    try {
      await trackSiteVisit(currentPath);
      lastTrackedRef.current.set(currentPath, now);
      console.log('✅ Page tracked:', currentPath);
    } catch (error) {
      console.error('❌ Failed to track page:', currentPath, error);
    } finally {
      isTrackingRef.current = false;
    }
  }, [location, trackSiteVisit, isValidPage]);

  // Cleanup periodico della cache
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const expireTime = now - (TRACKING_CONFIG.DUPLICATE_WINDOW * 2);
    
    for (const [path, timestamp] of lastTrackedRef.current.entries()) {
      if (timestamp < expireTime) {
        lastTrackedRef.current.delete(path);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      trackCurrentPage();
    }, TRACKING_CONFIG.DELAY_MS);
    
    return () => clearTimeout(timer);
  }, [trackCurrentPage]);

  // Cleanup periodico ogni 5 minuti
  useEffect(() => {
    const interval = setInterval(cleanupCache, 300000);
    return () => clearInterval(interval);
  }, [cleanupCache]);

  return {
    trackCurrentPage,
    isTracking: () => isTrackingRef.current,
    getTrackedPages: () => Array.from(lastTrackedRef.current.keys()),
    clearCache: () => lastTrackedRef.current.clear()
  };
}
