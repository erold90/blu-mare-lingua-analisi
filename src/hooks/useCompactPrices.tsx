import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";

export interface PriceData {
  apartmentId: string;
  weekStart: string;
  price: number;
}

export interface WeekInfo {
  start: Date;
  end: Date;
  startStr: string;
  label: string;
}

export const useCompactPrices = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ apartmentId: string; weekStart: string } | null>(null);

  // Generate the season weeks for 2025
  const getSeasonWeeks = useCallback((): WeekInfo[] => {
    const weeks: WeekInfo[] = [];
    const seasonStart = new Date(2025, 5, 2); // 2 giugno 2025
    let currentWeek = new Date(seasonStart);
    
    while (currentWeek <= new Date(2025, 8, 29)) { // fino al 29 settembre
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: new Date(currentWeek),
        end: weekEnd,
        startStr: format(currentWeek, 'yyyy-MM-dd'),
        label: format(currentWeek, 'dd/MM')
      });
      
      currentWeek.setDate(currentWeek.getDate() + 7);
    }
    
    console.log("Generated season weeks:", weeks.length, "weeks");
    return weeks;
  }, []);

  // Initialize default prices for 2025
  const initializeDefaultPrices = useCallback(async () => {
    console.log("🔄 Starting default prices initialization for 2025...");
    
    const apartmentIds = ['appartamento-1', 'appartamento-2', 'appartamento-3', 'appartamento-4'];
    const weeks = getSeasonWeeks();
    const defaultPrices = [];
    
    console.log("📅 Creating prices for", apartmentIds.length, "apartments and", weeks.length, "weeks");
    
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
          year: 2025,
          week_start: week.startStr,
          price: basePrice
        });
      }
    }
    
    console.log("💾 Attempting to save", defaultPrices.length, "default prices to database");
    console.log("First few prices:", defaultPrices.slice(0, 3));
    
    try {
      const result = await supabaseService.prices.updateBatch(defaultPrices);
      console.log("✅ Successfully initialized prices:", result?.length || defaultPrices.length);
      
      // Always save to localStorage as a backup
      const transformedPrices = defaultPrices.map(p => ({
        apartmentId: p.apartment_id,
        weekStart: p.week_start,
        price: p.price
      }));
      
      // Set the state with transformed prices
      setPrices(transformedPrices);
      
      // Save to localStorage for redundancy
      const seasonalData = [{
        year: 2025,
        prices: transformedPrices
      }];
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
      
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
      
      // Set the local state with fallback prices
      setPrices(fallbackPrices);
      
      // Store fallback in localStorage
      const seasonalData = [{
        year: 2025,
        prices: fallbackPrices
      }];
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
      
      toast.error("Errore nel database - prezzi salvati localmente");
      return fallbackPrices;
    }
  }, [getSeasonWeeks]);

  // Load prices from database or initialize defaults
  const loadPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Loading prices from database for year 2025...");
      
      // First, try to load from Supabase
      let data;
      try {
        data = await supabaseService.prices.getByYear(2025);
      } catch (dbError) {
        console.error("❌ Database error:", dbError);
        data = [];
      }
      
      console.log("📊 Raw price data from database:", {
        count: data?.length || 0,
        sampleData: data?.slice(0, 2) || []
      });
      
      // If no data in Supabase, initialize defaults
      if (!data || data.length === 0) {
        console.log("📭 No prices found, initializing default prices...");
        const initializedPrices = await initializeDefaultPrices();
        return; // initializeDefaultPrices already sets the prices state
      }
      
      const transformedPrices: PriceData[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: price.week_start,
        price: Number(price.price)
      }));
      
      console.log("✅ Successfully transformed existing prices:", {
        count: transformedPrices.length,
        sample: transformedPrices.slice(0, 2)
      });
      setPrices(transformedPrices);
      
      // Also save to localStorage for compatibility
      const seasonalData = [{
        year: 2025,
        prices: transformedPrices
      }];
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
      console.log("💾 Updated localStorage with existing prices");
      
    } catch (error) {
      console.error('❌ Error loading prices:', error);
      
      // Try loading from localStorage as fallback
      try {
        const localPrices = localStorage.getItem("seasonalPricing");
        if (localPrices) {
          const parsed = JSON.parse(localPrices);
          const year2025 = parsed.find((y: any) => y.year === 2025);
          if (year2025 && year2025.prices) {
            console.log("🔄 Loading prices from localStorage instead:", year2025.prices.length);
            setPrices(year2025.prices);
            toast.info("Prezzi caricati dal backup locale");
            return;
          }
        }
      } catch (localErr) {
        console.error("Failed to load from localStorage:", localErr);
      }
      
      // If even localStorage fails, initialize new defaults
      console.log("🔄 Nothing found anywhere, initializing default prices...");
      await initializeDefaultPrices();
      
    } finally {
      setIsLoading(false);
      console.log("🏁 Price loading process completed");
    }
  }, [initializeDefaultPrices]);

  // Get price for apartment and week
  const getPrice = useCallback((apartmentId: string, weekStart: string): number => {
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
    const result = price ? price.price : 0;
    
    if (result === 0 && prices.length > 0) {
      console.log(`⚠️ No price found for apartment ${apartmentId}, week ${weekStart}. Available prices:`, prices.length);
    }
    
    return result;
  }, [prices]);

  // Update price
  const updatePrice = useCallback(async (apartmentId: string, weekStart: string, newPrice: number) => {
    try {
      console.log(`💰 Updating price for ${apartmentId} on ${weekStart} to ${newPrice}`);
      
      try {
        // Try to update in Supabase
        await supabaseService.prices.upsert({
          apartment_id: apartmentId,
          year: 2025,
          week_start: weekStart,
          price: newPrice
        });
      } catch (dbError) {
        console.warn("Failed to update price in database:", dbError);
        toast.error("Errore nel database - prezzo salvato localmente");
      }
      
      // Always update local state
      setPrices(prev => {
        const existing = prev.findIndex(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { apartmentId, weekStart, price: newPrice };
          console.log("✅ Updated existing price in state");
          return updated;
        } else {
          console.log("✅ Added new price to state");
          return [...prev, { apartmentId, weekStart, price: newPrice }];
        }
      });
      
      // Update localStorage regardless of DB success
      const savedPrices = localStorage.getItem("seasonalPricing");
      if (savedPrices) {
        const allPrices = JSON.parse(savedPrices);
        const yearData = allPrices.find((season: any) => season.year === 2025);
        if (yearData) {
          const existingIndex = yearData.prices.findIndex(
            (p: any) => p.apartmentId === apartmentId && p.weekStart === weekStart
          );
          if (existingIndex >= 0) {
            yearData.prices[existingIndex].price = newPrice;
          } else {
            yearData.prices.push({ apartmentId, weekStart, price: newPrice });
          }
          localStorage.setItem("seasonalPricing", JSON.stringify(allPrices));
          console.log("💾 Updated localStorage with new price");
        }
      }
      
      toast.success("Prezzo aggiornato");
    } catch (error) {
      console.error("❌ Error updating price:", error);
      toast.error("Errore nell'aggiornamento del prezzo");
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    console.log("🚀 useCompactPrices: mounting, starting price loading...");
    loadPrices();
  }, [loadPrices]);

  // Debug: log when prices change
  useEffect(() => {
    console.log("📈 Prices state updated:", {
      count: prices.length,
      sample: prices.slice(0, 3)
    });
  }, [prices]);

  return {
    prices,
    isLoading,
    getSeasonWeeks,
    getPrice,
    updatePrice,
    editingCell,
    setEditingCell,
    reloadPrices: loadPrices
  };
};
