
// Export del nuovo hook unificato per i prezzi
export { useUnifiedPrices } from './useUnifiedPrices';
export type { PriceData, UnifiedPricesContextType } from './useUnifiedPrices';

// Export dei vecchi hook per compatibilità (da rimuovere gradualmente)
export { useSupabasePrices } from './useSupabasePrices';
export { useCompactPrices } from './prices/useCompactPrices';

// Export dei nuovi hook analytics specializzati
export { useAnalytics } from './analytics/useAnalytics';
export { useTracking } from './analytics/useTracking';
export { usePageTracking } from './analytics/usePageTracking';
export { useSimpleTracking } from './analytics/useSimpleTracking';
export { useUnifiedAnalytics } from './analytics/useUnifiedAnalytics';

// Export types
export type { QuoteLog, SiteVisit } from './analytics/useUnifiedAnalytics';
