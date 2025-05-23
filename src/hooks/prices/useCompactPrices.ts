
import { useState, useEffect, useCallback } from 'react';
import { PriceData } from './types';
import { usePricePersistence } from './usePricePersistence';
import { getSeasonWeeks } from './weekUtils';
import { findPrice, generateYearPrices } from './priceUtils';
import { toast } from "sonner";

export const useCompactPrices = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [editingCell, setEditingCell] = useState<{ apartmentId: string; weekStart: string } | null>(null);
  const { isLoading, loadPrices, updatePrice, initializeDefaultPrices } = usePricePersistence();

  // Get price for apartment and week
  const getPrice = useCallback((apartmentId: string, weekStart: string): number => {
    return findPrice(prices, apartmentId, weekStart);
  }, [prices]);

  // Update price and refresh state
  const handleUpdatePrice = useCallback(async (apartmentId: string, weekStart: string, newPrice: number) => {
    const success = await updatePrice(apartmentId, weekStart, newPrice);
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
    }
    return success;
  }, [updatePrice]);

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
      // Load source year prices if not already loaded
      const sourcePrices = prices.filter(p => {
        const weekDate = new Date(p.weekStart);
        return weekDate.getFullYear() === sourceYear;
      });
      
      if (sourcePrices.length === 0) {
        // Need to load source year prices
        const loadedSourcePrices = await loadPrices(sourceYear);
        if (loadedSourcePrices.length === 0) {
          toast.error(`Non ci sono prezzi disponibili per l'anno ${sourceYear}`);
          return false;
        }
        
        // Filter by apartment ID if provided
        const filteredSourcePrices = apartmentId 
          ? loadedSourcePrices.filter(p => p.apartmentId === apartmentId)
          : loadedSourcePrices;
        
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
        
        // Save the new prices
        for (const price of newPrices) {
          await updatePrice(price.apartmentId, price.weekStart, price.price, targetYear);
        }
        
        // Reload prices to ensure we have the latest data
        await loadPricesData(targetYear);
        
        toast.success(`Prezzi copiati con successo dall'anno ${sourceYear} all'anno ${targetYear}`);
        return true;
      } else {
        // We already have source prices loaded
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
        
        // Save the new prices
        for (const price of newPrices) {
          await updatePrice(price.apartmentId, price.weekStart, price.price, targetYear);
        }
        
        // Reload prices to ensure we have the latest data
        await loadPricesData(targetYear);
        
        toast.success(`Prezzi copiati con successo dall'anno ${sourceYear} all'anno ${targetYear}`);
        return true;
      }
    } catch (error) {
      console.error("Error copying prices:", error);
      toast.error("Errore durante la copia dei prezzi");
      return false;
    }
  }, [prices, loadPrices, updatePrice]);

  // Load prices for specific year
  const loadPricesData = useCallback(async (year: number = 2025) => {
    console.log(`🚀 useCompactPrices: loading prices for year ${year}...`);
    try {
      const loadedPrices = await loadPrices(year);
      console.log(`✅ Loaded ${loadedPrices.length} prices for year ${year}`);
      
      // Merge with existing prices from other years
      setPrices(prev => {
        // Filter out prices for the year we just loaded
        const otherYearPrices = prev.filter(p => {
          const weekDate = new Date(p.weekStart);
          return weekDate.getFullYear() !== year;
        });
        
        // Add the newly loaded prices
        return [...otherYearPrices, ...loadedPrices];
      });
      
      return loadedPrices;
    } catch (error) {
      console.error(`❌ Error loading prices for year ${year}:`, error);
      toast.error(`Errore nel caricamento dei prezzi per l'anno ${year}`);
      return [];
    }
  }, [loadPrices]);

  // Initialize on mount
  useEffect(() => {
    loadPricesData(2025);
  }, [loadPricesData]);

  return {
    prices,
    isLoading,
    getSeasonWeeks,
    getPrice,
    updatePrice: handleUpdatePrice,
    copyPricesFromYear,
    editingCell,
    setEditingCell,
    reloadPrices: () => loadPricesData(2025)
  };
};
