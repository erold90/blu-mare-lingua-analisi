
// Re-export from the new modular structure
export { useSupabasePricesContext as useSupabasePrices } from './price/SupabasePricesProvider';
export { SupabasePricesProvider } from './price/SupabasePricesProvider';
export type { WeeklyPrice, SeasonalPricing, PricesContextType } from './price/types';
