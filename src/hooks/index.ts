
// Export del nuovo hook unificato per i prezzi
export { useUnifiedPrices } from './useUnifiedPrices';
export type { PriceData, UnifiedPricesContextType } from './useUnifiedPrices';

// Export dei vecchi hook per compatibilità (da rimuovere gradualmente)
export { useSupabasePrices } from './useSupabasePrices';
export { useCompactPrices } from './prices/useCompactPrices';

// Export dei nuovi hook analytics specializzati
export { useAnalytics } from './analytics/useAnalytics';
export { useAdvancedAnalytics } from './analytics/useAdvancedAnalytics';
export { useTracking } from './analytics/useTracking';
export { usePageTracking } from './analytics/usePageTracking';
export { useAdvancedTracking } from './analytics/useAdvancedTracking';

// Export types
export type { QuoteLog, SiteVisit } from './analytics/useAnalytics';
export type { AnalyticsFilters } from './analytics/useAdvancedAnalytics';
