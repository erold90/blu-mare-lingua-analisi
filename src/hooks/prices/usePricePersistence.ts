
import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";
import { PriceData } from './types';
import { getSeasonWeeks } from './weekUtils';

/**
 * Hook for managing price persistence to/from Supabase and localStorage
 */
export const usePricePersistence = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize default prices for a year
   * @param year The year to initialize prices for
   * @returns Array of initialized prices
   */
  const initializeDefaultPrices = async (year: number = 2025): Promise<PriceData[]> => {
    console.log(`🔄 Starting default prices initialization for ${year}...`);
    
    const apartmentIds = ['appartamento-1', 'appartamento-2', 'appartamento-3', 'appartamento-4'];
    const weeks = getSeasonWeeks(year);
    const defaultPrices = [];
    
    console.log(`📅 Creating prices for ${apartmentIds.length} apartments and ${weeks.length} weeks`);
    
    for (const week of weeks) {
      for (const apartmentId of apartmentIds) {
        // Example prices based on the week
        let basePrice = 400;
        const weekDate = new Date(week.start);
        const month = weekDate.getMonth();
        
        // July and August are more expensive
        if (month === 6 || month === 7) {
          basePrice = 800;
        }
        // June and September are medium price
        else if (month === 5 || month === 8) {
          basePrice = 600;
        }
        
        defaultPrices.push({
          apartment_id: apartmentId,
          year,
          week_start: week.startStr,
          price: basePrice
        });
      }
    }
    
    console.log(`💾 Attempting to save ${defaultPrices.length} default prices to database`);
    console.log("First few prices:", defaultPrices.slice(0, 3));
    
    try {
      const result = await supabaseService.prices.updateBatch(defaultPrices);
      console.log(`✅ Successfully initialized prices: ${result?.length || defaultPrices.length}`);
      
      // Transform prices for state and localStorage
      const transformedPrices = defaultPrices.map(p => ({
        apartmentId: p.apartment_id,
        weekStart: p.week_start,
        price: p.price
      }));
      
      // Save to localStorage for redundancy
      saveToLocalStorage(year, transformedPrices);
      
      toast.success(`Prezzi inizializzati: ${transformedPrices.length} entries`);
      return transformedPrices;
    } catch (error) {
      console.error("❌ Error initializing default prices:", error);
      
      // Create a fallback set of prices to show in the UI
      const fallbackPrices = defaultPrices.map(p => ({
        apartmentId: p.apartment_id,
        weekStart: p.week_start,
        price: p.price
      }));
      
      // Store fallback in localStorage
      saveToLocalStorage(year, fallbackPrices);
      
      toast.error("Errore nel database - prezzi salvati localmente");
      return fallbackPrices;
    }
  };

  /**
   * Save prices to localStorage
   * @param year The year to save prices for
   * @param prices Prices to save
   */
  const saveToLocalStorage = (year: number, prices: PriceData[]) => {
    try {
      const savedPrices = localStorage.getItem("seasonalPricing");
      let allPrices = [];
      
      if (savedPrices) {
        allPrices = JSON.parse(savedPrices);
        const yearIndex = allPrices.findIndex((y: any) => y.year === year);
        
        if (yearIndex >= 0) {
          allPrices[yearIndex].prices = prices;
        } else {
          allPrices.push({ year, prices });
        }
      } else {
        allPrices = [{ year, prices }];
      }
      
      localStorage.setItem("seasonalPricing", JSON.stringify(allPrices));
      console.log(`💾 Updated localStorage with ${prices.length} prices for year ${year}`);
    } catch (error) {
      console.error("Failed to save prices to localStorage:", error);
    }
  };

  /**
   * Load prices from localStorage
   * @param year The year to load prices for
   */
  const loadFromLocalStorage = (year: number): PriceData[] => {
    try {
      const savedPrices = localStorage.getItem("seasonalPricing");
      if (savedPrices) {
        const parsed = JSON.parse(savedPrices);
        const yearData = parsed.find((y: any) => y.year === year);
        if (yearData && yearData.prices) {
          console.log(`🔄 Loading ${yearData.prices.length} prices from localStorage for year ${year}`);
          return yearData.prices;
        }
      }
      return [];
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return [];
    }
  };

  /**
   * Load prices from database or initialize defaults
   * @param year The year to load prices for
   * @returns Array of price data
   */
  const loadPrices = async (year: number = 2025): Promise<PriceData[]> => {
    try {
      setIsLoading(true);
      console.log(`🔍 Loading prices from database for year ${year}...`);
      
      // First, try to load from Supabase
      let data;
      try {
        data = await supabaseService.prices.getByYear(year);
        console.log("Data from database:", data);
      } catch (dbError) {
        console.error("❌ Database error:", dbError);
        data = [];
      }
      
      // If no data in Supabase, initialize defaults
      if (!data || data.length === 0) {
        console.log("📭 No prices found, initializing default prices...");
        return await initializeDefaultPrices(year);
      }
      
      const transformedPrices: PriceData[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: price.week_start,
        price: Number(price.price)
      }));
      
      console.log(`✅ Successfully transformed ${transformedPrices.length} existing prices`);
      
      // Also save to localStorage for compatibility
      saveToLocalStorage(year, transformedPrices);
      
      return transformedPrices;
    } catch (error) {
      console.error('❌ Error loading prices:', error);
      
      // Try loading from localStorage as fallback
      const localPrices = loadFromLocalStorage(year);
      if (localPrices.length > 0) {
        toast.info("Prezzi caricati dal backup locale");
        return localPrices;
      }
      
      // If even localStorage fails, initialize new defaults
      console.log("🔄 Nothing found anywhere, initializing default prices...");
      return await initializeDefaultPrices(year);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a single price
   * @param apartmentId The apartment ID
   * @param weekStart The week start date
   * @param newPrice The new price
   * @param year The year
   */
  const updatePrice = async (
    apartmentId: string, 
    weekStart: string, 
    newPrice: number, 
    year: number = 2025
  ): Promise<boolean> => {
    try {
      console.log(`💰 Updating price for ${apartmentId} on ${weekStart} to ${newPrice}`);
      
      try {
        // Try to update in Supabase
        await supabaseService.prices.upsert({
          apartment_id: apartmentId,
          year,
          week_start: weekStart,
          price: newPrice
        });
      } catch (dbError) {
        console.warn("Failed to update price in database:", dbError);
        toast.error("Errore nel database - prezzo salvato localmente");
      }
      
      // Update localStorage regardless of DB success
      const localPrices = loadFromLocalStorage(year);
      const updatedPrices = [...localPrices];
      
      const existingIndex = updatedPrices.findIndex(
        p => p.apartmentId === apartmentId && p.weekStart === weekStart
      );
      
      if (existingIndex >= 0) {
        updatedPrices[existingIndex].price = newPrice;
        console.log("✅ Updated existing price in localStorage");
      } else {
        updatedPrices.push({ apartmentId, weekStart, price: newPrice });
        console.log("✅ Added new price to localStorage");
      }
      
      saveToLocalStorage(year, updatedPrices);
      
      toast.success("Prezzo aggiornato");
      return true;
    } catch (error) {
      console.error("❌ Error updating price:", error);
      toast.error("Errore nell'aggiornamento del prezzo");
      return false;
    }
  };

  return {
    isLoading,
    loadPrices,
    updatePrice,
    initializeDefaultPrices,
  };
};
