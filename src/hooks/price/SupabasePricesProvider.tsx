import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";
import { refreshPricesCache } from "@/utils/price/weeklyPrice";
import { WeeklyPrice, SeasonalPricing, PricesContextType } from './types';

const SupabasePricesContext = createContext<PricesContextType | undefined>(undefined);

export const SupabasePricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<WeeklyPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Loading prices from Supabase...");
      const currentYear = new Date().getFullYear();
      const data = await supabaseService.prices.getByYear(currentYear);
      
      if (!data || data.length === 0) {
        console.log("No prices found in database");
        setPrices([]);
        return;
      }
      
      const transformedPrices: WeeklyPrice[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: price.week_start,
        price: Number(price.price)
      }));
      
      setPrices(transformedPrices);
      console.log(`Loaded ${transformedPrices.length} prices from Supabase`);
      
      // Update localStorage cache with fresh data
      const seasonalData: SeasonalPricing[] = [{
        year: currentYear,
        prices: transformedPrices
      }];
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
      console.log("Updated localStorage cache with fresh prices");
      
    } catch (error) {
      console.error('Failed to load prices:', error);
      toast.error('Errore nel caricamento dei prezzi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePrice = useCallback(async (apartmentId: string, weekStart: Date, price: number) => {
    try {
      console.log(`Updating price for ${apartmentId} on ${weekStart.toISOString().split('T')[0]}: €${price}`);
      
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const currentYear = weekStart.getFullYear();
      
      await supabaseService.prices.upsert({
        apartment_id: apartmentId,
        year: currentYear,
        week_start: weekStartStr,
        price: price
      });
      
      // Update local state
      setPrices(prev => {
        const existing = prev.findIndex(p => p.apartmentId === apartmentId && p.weekStart === weekStartStr);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { apartmentId, weekStart: weekStartStr, price };
          return updated;
        } else {
          return [...prev, { apartmentId, weekStart: weekStartStr, price }];
        }
      });
      
      // Force refresh the prices cache to keep everything in sync
      await refreshPricesCache();
      
      toast.success("Prezzo aggiornato con successo");
      console.log("Price updated and cache refreshed");
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Errore nell'aggiornamento del prezzo");
    }
  }, []);

  const getPriceForWeek = useCallback((apartmentId: string, weekStart: Date): number => {
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStartStr);
    return price ? price.price : 0;
  }, [prices]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  return (
    <SupabasePricesContext.Provider value={{
      prices,
      isLoading,
      updatePrice,
      getPriceForWeek,
      loadPrices
    }}>
      {children}
    </SupabasePricesContext.Provider>
  );
};

export const useSupabasePricesContext = () => {
  const context = useContext(SupabasePricesContext);
  if (context === undefined) {
    throw new Error('useSupabasePricesContext must be used within a SupabasePricesProvider');
  }
  return context;
};
