
// Export del nuovo hook unificato per i prezzi
export { useUnifiedPrices } from './useUnifiedPrices';
export type { PriceData, UnifiedPricesContextType } from './useUnifiedPrices';

// Export dei vecchi hook per compatibilità (da rimuovere gradualmente)
export { useSupabasePrices } from './useSupabasePrices';
export { useCompactPrices } from './prices/useCompactPrices';

// Export di altri hook
export { useActivityLog } from './activity/useActivityLog';
export { useSiteVisits } from './activity/useSiteVisits';
