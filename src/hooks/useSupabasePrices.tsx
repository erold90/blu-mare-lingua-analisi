
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { startOfWeek, addWeeks, format } from 'date-fns';
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";

export interface WeeklyPrice {
  apartmentId: string;
  weekStart: string;
  weekEnd?: string;
  price: number;
}

export interface SeasonalPricing {
  year: number;
  prices: WeeklyPrice[];
}

export interface PricesContextType {
  prices: WeeklyPrice[];
  isLoading: boolean;
  updatePrice: (apartmentId: string, weekStart: string, price: number) => void;
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  getWeeksForYear: (year: number) => { start: Date; end: Date }[];
  availableYears: number[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  resetPrices: () => void;
}

const PricesContext = createContext<PricesContextType | undefined>(undefined);

export const SupabasePricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<WeeklyPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const availableYears = [2023, 2024, 2025, 2026, 2027];

  const loadPricesForYear = useCallback(async (year: number) => {
    setIsLoading(true);
    try {
      const data = await supabaseService.prices.getByYear(year);
      
      const transformedPrices: WeeklyPrice[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: price.week_start,
        price: Number(price.price)
      }));
      
      setPrices(transformedPrices);
      console.log(`Loaded ${transformedPrices.length} prices for year ${year}`);
    } catch (error) {
      console.error(`Failed to load prices for year ${year}:`, error);
      toast.error(`Errore nel caricamento dei prezzi per l'anno ${year}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePrice = useCallback(async (apartmentId: string, weekStart: string, price: number) => {
    try {
      const priceData = {
        apartment_id: apartmentId,
        year: selectedYear,
        week_start: weekStart,
        price: price
      };
      
      await supabaseService.prices.upsert(priceData);
      
      // Update local state
      setPrices(prev => {
        const existing = prev.findIndex(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { apartmentId, weekStart, price };
          return updated;
        } else {
          return [...prev, { apartmentId, weekStart, price }];
        }
      });
      
      console.log(`Updated price for ${apartmentId} on ${weekStart}: €${price}`);
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Errore nell'aggiornare il prezzo");
    }
  }, [selectedYear]);

  const getPriceForWeek = useCallback((apartmentId: string, weekStart: Date): number => {
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStartStr);
    return price ? price.price : 0;
  }, [prices]);

  const getWeeksForYear = useCallback((year: number): { start: Date; end: Date }[] => {
    const weeks: { start: Date; end: Date }[] = [];
    const startOfYear = new Date(year, 0, 1);
    let currentWeek = startOfWeek(startOfYear, { weekStartsOn: 1 });
    
    while (currentWeek.getFullYear() <= year) {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: new Date(currentWeek),
        end: weekEnd
      });
      
      currentWeek = addWeeks(currentWeek, 1);
      
      if (currentWeek.getFullYear() > year && weeks.length >= 52) {
        break;
      }
    }
    
    return weeks;
  }, []);

  const resetPrices = useCallback(() => {
    setPrices([]);
    toast.info("Prezzi resettati");
  }, []);

  useEffect(() => {
    loadPricesForYear(selectedYear);
  }, [selectedYear, loadPricesForYear]);

  return (
    <PricesContext.Provider value={{
      prices,
      isLoading,
      updatePrice,
      getPriceForWeek,
      getWeeksForYear,
      availableYears,
      selectedYear,
      setSelectedYear,
      resetPrices
    }}>
      {children}
    </PricesContext.Provider>
  );
};

export const useSupabasePrices = () => {
  const context = useContext(PricesContext);
  if (context === undefined) {
    throw new Error('useSupabasePrices must be used within a SupabasePricesProvider');
  }
  return context;
};
