
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
  return useSupabasePricesContext();
};
