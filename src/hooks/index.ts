
// Unified hook exports - cleaned up version
export { useUnifiedPrices } from './useUnifiedPrices';
export type { PriceData, UnifiedPricesContextType } from './useUnifiedPrices';

// Re-export Supabase hooks
export { useSupabasePrices } from './useSupabasePrices';

// Export degli hook analytics semplificati
export { useSimpleTracking } from './analytics/useSimpleTracking';
export { useUnifiedAnalytics } from './analytics/useUnifiedAnalytics';

// Export types
export type { QuoteLog, SiteVisit } from './analytics/useUnifiedAnalytics';
