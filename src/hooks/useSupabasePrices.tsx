
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
  const [selectedYear, setSelectedYear] = useState(2025);
  
  const availableYears = [2025, 2026, 2027];

  const loadPricesForYear = useCallback(async (year: number) => {
    setIsLoading(true);
    try {
      const data = await supabaseService.prices.getByYear(year);
      
      const transformedPrices: WeeklyPrice[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: price.week_start,
        price: Number(price.price)
      }));
      
      // Se non ci sono prezzi per il 2025, inizializzali con i dati forniti
      if (year === 2025 && transformedPrices.length === 0) {
        await initializePricesFor2025();
        // Ricarica i prezzi dopo l'inizializzazione
        const newData = await supabaseService.prices.getByYear(year);
        const newTransformedPrices: WeeklyPrice[] = newData.map(price => ({
          apartmentId: price.apartment_id,
          weekStart: price.week_start,
          price: Number(price.price)
        }));
        setPrices(newTransformedPrices);
      } else {
        setPrices(transformedPrices);
      }
      
      console.log(`Loaded ${transformedPrices.length} prices for year ${year}`);
    } catch (error) {
      console.error(`Failed to load prices for year ${year}:`, error);
      toast.error(`Errore nel caricamento dei prezzi per l'anno ${year}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializePricesFor2025 = useCallback(async () => {
    console.log("Initializing prices for 2025 with provided data");
    
    // Definisce i prezzi della tabella fornita dall'utente, compresi i mesi di gennaio
    const priceData = [
      // Dicembre 2024 - Gennaio 2025
      { date: "2024-12-30", prices: { "appartamento-1": 0, "appartamento-2": 0, "appartamento-3": 0, "appartamento-4": 0 } },
      
      // Gennaio 2025
      { date: "2025-01-06", prices: { "appartamento-1": 0, "appartamento-2": 0, "appartamento-3": 0, "appartamento-4": 0 } },
      { date: "2025-01-13", prices: { "appartamento-1": 0, "appartamento-2": 0, "appartamento-3": 0, "appartamento-4": 0 } },
      { date: "2025-01-20", prices: { "appartamento-1": 0, "appartamento-2": 0, "appartamento-3": 0, "appartamento-4": 0 } },
      { date: "2025-01-27", prices: { "appartamento-1": 0, "appartamento-2": 0, "appartamento-3": 0, "appartamento-4": 0 } },
      
      // Giugno
      { date: "2025-06-07", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
      { date: "2025-06-14", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
      { date: "2025-06-21", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
      { date: "2025-06-28", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
      
      // Luglio
      { date: "2025-07-05", prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
      { date: "2025-07-12", prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
      { date: "2025-07-19", prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
      { date: "2025-07-26", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 } },
      
      // Agosto
      { date: "2025-08-02", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 } },
      { date: "2025-08-09", prices: { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 } },
      { date: "2025-08-16", prices: { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 } },
      { date: "2025-08-23", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 } },
      { date: "2025-08-30", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 } },
      
      // Settembre
      { date: "2025-09-06", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
      { date: "2025-09-13", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
      { date: "2025-09-20", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
    ];

    const pricesToInsert = [];
    
    for (const period of priceData) {
      for (const [apartmentId, price] of Object.entries(period.prices)) {
        pricesToInsert.push({
          apartment_id: apartmentId,
          year: period.date.startsWith("2024") ? 2024 : 2025,
          week_start: period.date,
          price: price
        });
      }
    }

    try {
      await supabaseService.prices.updateBatch(pricesToInsert);
      console.log(`Initialized ${pricesToInsert.length} prices for 2025`);
      toast.success("Prezzi 2025 inizializzati con successo");
    } catch (error) {
      console.error("Error initializing 2025 prices:", error);
      toast.error("Errore nell'inizializzazione dei prezzi 2025");
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
