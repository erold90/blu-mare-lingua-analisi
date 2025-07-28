import { useContext } from 'react';
import { useSupabasePricesContext } from './SupabasePricesProvider';

// Simplified interface pointing to Supabase
export interface PricesContextType {
  prices: any[];
  isLoading: boolean;
  updatePrice: (apartmentId: string, weekStart: string, price: number) => Promise<boolean>;
  getPriceForWeek: (apartmentId: string, weekStart: string) => number;
  loadPricesForYear: (year: number) => Promise<any[]>;
  refreshPrices: () => Promise<void>;
}

export const usePrices = (): PricesContextType => {
  // Redirect to the unified Supabase system
  const context = useSupabasePricesContext();
  
  // Adapter for compatibility
  return {
    prices: context.prices || [],
    isLoading: context.isLoading || false,
    updatePrice: async (apartmentId: string, weekStart: string, price: number) => {
      try {
        await context.updatePrice(apartmentId, new Date(weekStart), price);
        return true;
      } catch {
        return false;
      }
    },
    getPriceForWeek: (apartmentId: string, weekStart: string) => {
      return context.getPriceForWeek ? context.getPriceForWeek(apartmentId, new Date(weekStart)) : 0;
    },
    loadPricesForYear: async (year: number) => context.prices || [],
    refreshPrices: async () => Promise.resolve()
  };
};