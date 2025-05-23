
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addWeeks } from 'date-fns';
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";

export interface WeeklyPrice {
  apartmentId: string;
  weekStart: string;
  price: number;
}

export interface PriceManagementContextType {
  prices: WeeklyPrice[];
  isLoading: boolean;
  updatePrice: (apartmentId: string, weekStart: string, price: number) => Promise<void>;
  getPriceForWeek: (apartmentId: string, weekStart: string) => number;
  getSeasonWeeks: () => { start: Date; end: Date; startStr: string }[];
  initializePrices: () => Promise<void>;
}

const PriceManagementContext = createContext<PriceManagementContextType | undefined>(undefined);

export const PriceManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<WeeklyPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Predefined 2025 season prices based on your table
  const defaultPrices = {
    "2025-06-02": { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 },
    "2025-06-09": { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 },
    "2025-06-16": { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 },
    "2025-06-23": { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 },
    "2025-06-30": { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 },
    "2025-07-07": { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 },
    "2025-07-14": { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 },
    "2025-07-21": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 },
    "2025-07-28": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 },
    "2025-08-04": { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 },
    "2025-08-11": { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 },
    "2025-08-18": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 },
    "2025-08-25": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 },
    "2025-09-01": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
    "2025-09-08": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
    "2025-09-15": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
    "2025-09-22": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
    "2025-09-29": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
  };

  const getSeasonWeeks = useCallback(() => {
    const weeks = [];
    const seasonStart = new Date(2025, 5, 2); // 2 June 2025
    let currentWeek = seasonStart;
    
    // Generate weeks from June 2 to September 29
    while (currentWeek <= new Date(2025, 8, 29)) {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: new Date(currentWeek),
        end: weekEnd,
        startStr: format(currentWeek, 'yyyy-MM-dd')
      });
      
      currentWeek = addWeeks(currentWeek, 1);
    }
    
    return weeks;
  }, []);

  const loadPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Loading prices from database...");
      const data = await supabaseService.prices.getByYear(2025);
      
      if (data.length === 0) {
        console.log("No prices found, initializing...");
        await initializePrices();
        return;
      }
      
      const transformedPrices: WeeklyPrice[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: price.week_start,
        price: Number(price.price)
      }));
      
      setPrices(transformedPrices);
      console.log(`Loaded ${transformedPrices.length} prices from database`);
      
      // Also save to localStorage for quick access
      const seasonalData = [{
        year: 2025,
        prices: transformedPrices
      }];
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
      
    } catch (error) {
      console.error('Failed to load prices:', error);
      toast.error('Errore nel caricamento dei prezzi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializePrices = useCallback(async () => {
    console.log("Initializing 2025 season prices");
    setIsLoading(true);
    
    const pricesToInsert = [];
    
    for (const [weekStart, apartmentPrices] of Object.entries(defaultPrices)) {
      for (const [apartmentId, price] of Object.entries(apartmentPrices)) {
        pricesToInsert.push({
          apartment_id: apartmentId,
          year: 2025,
          week_start: weekStart,
          price: price
        });
      }
    }

    try {
      console.log("Inserting prices into database...");
      await supabaseService.prices.updateBatch(pricesToInsert);
      
      const transformedPrices: WeeklyPrice[] = pricesToInsert.map(p => ({
        apartmentId: p.apartment_id,
        weekStart: p.week_start,
        price: p.price
      }));
      
      setPrices(transformedPrices);
      
      // Save to localStorage
      const seasonalData = [{
        year: 2025,
        prices: transformedPrices
      }];
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
      
      toast.success("Prezzi stagione 2025 inizializzati");
      console.log(`Successfully initialized ${pricesToInsert.length} prices`);
    } catch (error) {
      console.error("Error initializing prices:", error);
      toast.error("Errore nell'inizializzazione dei prezzi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePrice = useCallback(async (apartmentId: string, weekStart: string, price: number) => {
    try {
      await supabaseService.prices.upsert({
        apartment_id: apartmentId,
        year: 2025,
        week_start: weekStart,
        price: price
      });
      
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
      
      // Update localStorage
      const savedPrices = localStorage.getItem("seasonalPricing");
      if (savedPrices) {
        const allPrices = JSON.parse(savedPrices);
        const yearData = allPrices.find((season: any) => season.year === 2025);
        if (yearData) {
          const existingIndex = yearData.prices.findIndex(
            (p: WeeklyPrice) => p.apartmentId === apartmentId && p.weekStart === weekStart
          );
          if (existingIndex >= 0) {
            yearData.prices[existingIndex].price = price;
          } else {
            yearData.prices.push({ apartmentId, weekStart, price });
          }
          localStorage.setItem("seasonalPricing", JSON.stringify(allPrices));
        }
      }
      
      toast.success("Prezzo aggiornato");
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Errore nell'aggiornamento del prezzo");
    }
  }, []);

  const getPriceForWeek = useCallback((apartmentId: string, weekStart: string): number => {
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
    return price ? price.price : 0;
  }, [prices]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  return (
    <PriceManagementContext.Provider value={{
      prices,
      isLoading,
      updatePrice,
      getPriceForWeek,
      getSeasonWeeks,
      initializePrices
    }}>
      {children}
    </PriceManagementContext.Provider>
  );
};

export const usePriceManagement = () => {
  const context = useContext(PriceManagementContext);
  if (context === undefined) {
    throw new Error('usePriceManagement must be used within a PriceManagementProvider');
  }
  return context;
};
