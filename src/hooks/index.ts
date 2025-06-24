
// Export del nuovo hook unificato per i prezzi
export { useUnifiedPrices } from './useUnifiedPrices';
export type { PriceData, UnifiedPricesContextType } from './useUnifiedPrices';

// Export dei vecchi hook per compatibilità (da rimuovere gradualmente)
export { useSupabasePrices } from './useSupabasePrices';
export { useCompactPrices } from './prices/useCompactPrices';

// Export dei nuovi hook analytics unificati
export { useUnifiedAnalytics } from './analytics/useUnifiedAnalytics';
export { usePageTracking } from './analytics/usePageTracking';
export { useAdvancedTracking } from './analytics/useAdvancedTracking';
