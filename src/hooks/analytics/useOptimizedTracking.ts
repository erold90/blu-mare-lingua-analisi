
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsCore } from './useAnalyticsCore';

const TRACKING_CONFIG = {
  DELAY_MS: 500,
  DUPLICATE_WINDOW: 60000, // 1 minuto
  MAX_PAGE_LENGTH: 500
};

export function useOptimizedTracking() {
  const location = useLocation();
  const { trackSiteVisit } = useAnalyticsCore();
  const lastTrackedRef = useRef<Map<string, number>>(new Map());
  const isTrackingRef = useRef(false);

  const isValidPage = useCallback((page: string): boolean => {
    if (!page || typeof page !== 'string') return false;
    if (page.length > TRACKING_CONFIG.MAX_PAGE_LENGTH) return false;
    
    // Skip solo pagine di login (manteniamo tracking delle pagine admin per analytics interni)
    if (page.includes('/login')) {
      return false;
    }
    
    return true;
  }, []);

  const normalizeUrl = useCallback((url: string): string => {
    // Rimuovi parametri Lovable
    if (url.includes('?') && url.includes('lovable')) {
      url = url.split('?')[0];
    }
    
    // Normalizza trailing slash
    if (url.endsWith('/') && url.length > 1) {
      url = url.slice(0, -1);
    }
    
    return url;
  }, []);

  const trackCurrentPage = useCallback(async () => {
    const rawPath = location.pathname + location.search;
    const normalizedPath = normalizeUrl(rawPath);
    
    if (!isValidPage(normalizedPath)) {
      console.log('🚫 Skipping invalid page:', normalizedPath);
      return;
    }
    
    // Evita tracking concorrente
    if (isTrackingRef.current) {
      console.log('⏳ Tracking already in progress');
      return;
    }
    
    // Controllo duplicati
    const now = Date.now();
    const lastTracked = lastTrackedRef.current.get(normalizedPath);
    if (lastTracked && (now - lastTracked) < TRACKING_CONFIG.DUPLICATE_WINDOW) {
      console.log('🔄 Page recently tracked, skipping:', normalizedPath);
      return;
    }
    
    isTrackingRef.current = true;
    
    try {
      await trackSiteVisit(normalizedPath);
      lastTrackedRef.current.set(normalizedPath, now);
      console.log('✅ Page tracked:', normalizedPath);
    } catch (error) {
      console.error('❌ Failed to track page:', normalizedPath, error);
    } finally {
      isTrackingRef.current = false;
    }
  }, [location, trackSiteVisit, isValidPage, normalizeUrl]);

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
