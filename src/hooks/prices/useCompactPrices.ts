
import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceData } from './types';
import { usePricePersistence } from './usePricePersistence';
import { getSeasonWeeks } from './weekUtils';
import { findPrice, generateYearPrices } from './priceUtils';
import { toast } from "sonner";
import { clearPriceCalculationCache } from "@/utils/price/priceCalculator";

export const useCompactPrices = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(2025);
  const [editingCell, setEditingCell] = useState<{ apartmentId: string; weekStart: string } | null>(null);
  const { isLoading, loadPrices, updatePrice, initializeDefaultPrices, initializeAllYears } = usePricePersistence();
  const mountedRef = useRef(false);
  const loadingRef = useRef(false);

  // Get price for apartment and week
  const getPrice = useCallback((apartmentId: string, weekStart: string): number => {
    return findPrice(prices, apartmentId, weekStart);
  }, [prices]);

  // Update price and refresh state with database synchronization
  const handleUpdatePrice = useCallback(async (apartmentId: string, weekStart: string, newPrice: number) => {
    const success = await updatePrice(apartmentId, weekStart, newPrice, currentYear);
    if (success) {
      setPrices(prev => {
        const existing = prev.findIndex(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { apartmentId, weekStart, price: newPrice };
          return updated;
        } else {
          return [...prev, { apartmentId, weekStart, price: newPrice }];
        }
      });
      
      // Clear price calculation cache when prices change
      clearPriceCalculationCache();
    }
    return success;
  }, [updatePrice, currentYear]);

  // Copy prices from one year to another
  const copyPricesFromYear = useCallback(async (
    sourceYear: number,
    targetYear: number,
    percentIncrease: number = 0,
    rounding: 'up' | 'down' | 'none' = 'none',
    roundToNearest: number = 5,
    apartmentId?: string
  ) => {
    try {
      console.log(`📋 Copying prices from ${sourceYear} to ${targetYear}`);
      
      // Load source year prices
      const sourcePrices = await loadPrices(sourceYear);
      
      if (sourcePrices.length === 0) {
        toast.error(`Non ci sono prezzi disponibili per l'anno ${sourceYear}`);
        return false;
      }
      
      // Filter by apartment ID if provided
      const filteredSourcePrices = apartmentId 
        ? sourcePrices.filter(p => p.apartmentId === apartmentId)
        : sourcePrices;
      
      if (filteredSourcePrices.length === 0) {
        toast.error(`Non ci sono prezzi disponibili per l'appartamento selezionato nell'anno ${sourceYear}`);
        return false;
      }
      
      // Generate new prices for target year
      const newPrices = generateYearPrices(
        filteredSourcePrices,
        sourceYear,
        targetYear,
        percentIncrease,
        rounding,
        roundToNearest
      );
      
      // Save the new prices to database
      for (const price of newPrices) {
        await updatePrice(price.apartmentId, price.weekStart, price.price, targetYear);
      }
      
      // If we're currently viewing the target year, reload the prices
      if (targetYear === currentYear) {
        await loadPricesData(targetYear);
      }
      
      // Clear price calculation cache when prices change
      clearPriceCalculationCache();
      
      toast.success(`Prezzi copiati con successo dall'anno ${sourceYear} all'anno ${targetYear}`);
      return true;
    } catch (error) {
      console.error("Error copying prices:", error);
      toast.error("Errore durante la copia dei prezzi");
      return false;
    }
  }, [loadPrices, updatePrice, currentYear]);

  // Load prices for specific year
  const loadPricesData = useCallback(async (year: number = 2025) => {
    if (loadingRef.current) {
      console.log(`🔄 Already loading prices for year ${year}, skipping...`);
      return [];
    }
    
    loadingRef.current = true;
    console.log(`🚀 useCompactPrices: loading prices for year ${year}...`);
    
    try {
      const loadedPrices = await loadPrices(year);
      console.log(`✅ Loaded ${loadedPrices.length} prices for year ${year}`);
      
      // Update current year and prices
      setCurrentYear(year);
      setPrices(loadedPrices);
      
      return loadedPrices;
    } catch (error) {
      console.error(`❌ Error loading prices for year ${year}:`, error);
      toast.error(`Errore nel caricamento dei prezzi per l'anno ${year}`);
      return [];
    } finally {
      loadingRef.current = false;
    }
  }, [loadPrices]);

  // Force reload/initialize prices for current year
  const forceInitializeDefaultPrices = useCallback(async (year: number = 2025) => {
    try {
      console.log(`🔄 Force initializing default prices for year ${year}...`);
      const newPrices = await initializeDefaultPrices(year);
      
      // If we're currently viewing this year, update the state
      if (year === currentYear) {
        setPrices(newPrices);
      }
      
      // Clear price calculation cache when prices change
      clearPriceCalculationCache();
      
      return newPrices;
    } catch (error) {
      console.error(`❌ Error initializing default prices for year ${year}:`, error);
      toast.error(`Errore nell'inizializzazione dei prezzi per l'anno ${year}`);
      return [];
    }
  }, [initializeDefaultPrices, currentYear]);

  // Initialize all years 2025-2030
  const initializeAllYearsPrices = useCallback(async () => {
    try {
      await initializeAllYears();
      // Reload current year prices after initialization
      await loadPricesData(currentYear);
    } catch (error) {
      console.error("Error initializing all years:", error);
      toast.error("Errore nell'inizializzazione di tutti gli anni");
    }
  }, [initializeAllYears, currentYear, loadPricesData]);

  // Initialize on mount (only once)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log(`🚀 useCompactPrices: mounting, starting price loading for year ${currentYear}...`);
      loadPricesData(currentYear);
    }
  }, []);

  return {
    prices,
    isLoading,
    currentYear,
    getSeasonWeeks,
    getPrice,
    updatePrice: handleUpdatePrice,
    copyPricesFromYear,
    initializeDefaultPrices: forceInitializeDefaultPrices,
    initializeAllYears: initializeAllYearsPrices,
    editingCell,
    setEditingCell,
    reloadPrices: () => {
      if (!loadingRef.current) {
        loadPricesData(currentYear);
      }
    },
    loadPricesForYear: loadPricesData
  };
};
