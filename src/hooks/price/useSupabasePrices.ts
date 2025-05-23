
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { WeeklyPrice, PricesContextType } from './types';
import { getWeeksForYear } from './priceUtils';
import { initializePricesFor2025, updatePriceInDatabase, loadPricesFromDatabase } from './priceOperations';

export const useSupabasePrices = (): PricesContextType => {
  const [prices, setPrices] = useState<WeeklyPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  
  const availableYears = [2025, 2026, 2027];

  const loadPricesForYear = useCallback(async (year: number) => {
    setIsLoading(true);
    try {
      const transformedPrices = await loadPricesFromDatabase(year);
      
      // Se non ci sono prezzi per il 2025, inizializzali con i dati forniti
      if (year === 2025 && transformedPrices.length === 0) {
        const initializedPrices = await initializePricesFor2025();
        setPrices(initializedPrices);
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

  const loadPrices = useCallback(async () => {
    await loadPricesForYear(selectedYear);
  }, [selectedYear, loadPricesForYear]);

  const updatePrice = useCallback(async (apartmentId: string, weekStart: Date, price: number) => {
    try {
      // Convert Date to string for database storage
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      
      await updatePriceInDatabase(apartmentId, weekStartStr, price, selectedYear);
      
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
      
      toast.success("Prezzo aggiornato");
    } catch (error) {
      // Error already handled in updatePriceInDatabase
    }
  }, [selectedYear]);

  const getPriceForWeek = useCallback((apartmentId: string, weekStart: Date): number => {
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStartStr);
    return price ? price.price : 0;
  }, [prices]);

  const resetPrices = useCallback(async () => {
    setPrices([]);
    toast.info("Prezzi resettati");
  }, []);

  useEffect(() => {
    loadPricesForYear(selectedYear);
  }, [selectedYear, loadPricesForYear]);

  return {
    prices,
    isLoading,
    updatePrice,
    getPriceForWeek,
    getWeeksForYear,
    availableYears,
    selectedYear,
    setSelectedYear,
    resetPrices,
    loadPrices
  };
};
