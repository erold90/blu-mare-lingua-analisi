
import { useState, useEffect, useCallback } from 'react';
import { PriceData } from './types';
import { usePricePersistence } from './usePricePersistence';
import { getSeasonWeeks } from './weekUtils';
import { findPrice } from './priceUtils';

export const useCompactPrices = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [editingCell, setEditingCell] = useState<{ apartmentId: string; weekStart: string } | null>(null);
  const { isLoading, loadPrices, updatePrice } = usePricePersistence();

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
  }, [updatePrice]);

  // Load prices on mount
  const loadPricesData = useCallback(async () => {
    console.log("🚀 useCompactPrices: mounting, starting price loading...");
    try {
      const loadedPrices = await loadPrices();
      console.log("✅ Prices loaded successfully:", loadedPrices.length);
      setPrices(loadedPrices);
    } catch (error) {
      console.error("❌ Error in loadPricesData:", error);
      // Set some default prices to prevent infinite loading
      setPrices([]);
    }
  }, [loadPrices]);

  // Initialize on mount
  useEffect(() => {
    loadPricesData();
  }, [loadPricesData]);

  return {
    prices,
    isLoading,
    getSeasonWeeks,
    getPrice,
    updatePrice: handleUpdatePrice,
    editingCell,
    setEditingCell,
    reloadPrices: loadPricesData
  };
};
