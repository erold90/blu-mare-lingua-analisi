
// Sistema analytics ottimizzato - Nuova versione
export { useOptimizedAnalytics } from './useOptimizedAnalytics';
export { useOptimizedTracking } from './useOptimizedTracking';

// Sistema legacy - Mantenuto per compatibilità
export { useUnifiedAnalytics } from './useUnifiedAnalytics';
export { useSimpleTracking } from './useSimpleTracking';

// Types unificati
export type { QuoteLog, SiteVisit } from './useUnifiedAnalytics';
export type { OptimizedAnalyticsMetrics } from './useOptimizedAnalytics';
