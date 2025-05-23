
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

  // Genera le settimane della stagione 2025
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

  // Inizializza prezzi di default per il 2025
  const initializeDefaultPrices = useCallback(async () => {
    console.log("🔄 Starting default prices initialization for 2025...");
    
    const apartmentIds = ['appartamento-1', 'appartamento-2', 'appartamento-3', 'appartamento-4'];
    const weeks = getSeasonWeeks();
    const defaultPrices = [];
    
    console.log("📅 Creating prices for", apartmentIds.length, "apartments and", weeks.length, "weeks");
    
    for (const week of weeks) {
      for (const apartmentId of apartmentIds) {
        // Prezzi di esempio basati sulla settimana
        let basePrice = 400;
        const weekDate = new Date(week.start);
        const month = weekDate.getMonth();
        
        // Luglio e Agosto più cari
        if (month === 6 || month === 7) {
          basePrice = 800;
        }
        // Giugno e Settembre prezzi medi
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
      toast.success(`Prezzi inizializzati: ${defaultPrices.length} entries`);
      return true;
    } catch (error) {
      console.error("❌ Error initializing default prices:", error);
      toast.error("Errore nell'inizializzazione dei prezzi");
      return false;
    }
  }, [getSeasonWeeks]);

  // Carica i prezzi dal database
  const loadPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Loading prices from database for year 2025...");
      
      const data = await supabaseService.prices.getByYear(2025);
      console.log("📊 Raw price data from database:", {
        count: data?.length || 0,
        sampleData: data?.slice(0, 2) || []
      });
      
      if (!data || data.length === 0) {
        console.log("📭 No prices found, initializing default prices...");
        const initSuccess = await initializeDefaultPrices();
        
        if (initSuccess) {
          console.log("🔄 Reloading prices after initialization...");
          const newData = await supabaseService.prices.getByYear(2025);
          console.log("📊 Reloaded data:", {
            count: newData?.length || 0,
            sampleData: newData?.slice(0, 2) || []
          });
          
          if (newData && newData.length > 0) {
            const transformedPrices: PriceData[] = newData.map(price => ({
              apartmentId: price.apartment_id,
              weekStart: price.week_start,
              price: Number(price.price)
            }));
            console.log("✅ Setting transformed prices:", {
              count: transformedPrices.length,
              sample: transformedPrices.slice(0, 2)
            });
            setPrices(transformedPrices);
            
            // Salva anche in localStorage per la compatibilità
            const seasonalData = [{
              year: 2025,
              prices: transformedPrices.map(p => ({
                apartmentId: p.apartmentId,
                weekStart: p.weekStart,
                price: p.price
              }))
            }];
            localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
            console.log("💾 Saved to localStorage");
          } else {
            console.log("❌ Still no data after initialization");
            setPrices([]);
          }
        } else {
          console.log("❌ Initialization failed");
          setPrices([]);
        }
        return;
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
      
      // Salva anche in localStorage per la compatibilità
      const seasonalData = [{
        year: 2025,
        prices: transformedPrices.map(p => ({
          apartmentId: p.apartmentId,
          weekStart: p.weekStart,
          price: p.price
        }))
      }];
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
      console.log("💾 Updated localStorage with existing prices");
      
    } catch (error) {
      console.error('❌ Error loading prices:', error);
      toast.error('Errore nel caricamento dei prezzi');
      setPrices([]);
    } finally {
      setIsLoading(false);
      console.log("🏁 Price loading process completed");
    }
  }, [initializeDefaultPrices]);

  // Ottieni prezzo per appartamento e settimana
  const getPrice = useCallback((apartmentId: string, weekStart: string): number => {
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
    const result = price ? price.price : 0;
    
    if (result === 0) {
      console.log(`⚠️ No price found for apartment ${apartmentId}, week ${weekStart}. Available prices:`, prices.length);
    }
    
    return result;
  }, [prices]);

  // Aggiorna prezzo
  const updatePrice = useCallback(async (apartmentId: string, weekStart: string, newPrice: number) => {
    try {
      console.log(`💰 Updating price for ${apartmentId} on ${weekStart} to ${newPrice}`);
      
      await supabaseService.prices.upsert({
        apartment_id: apartmentId,
        year: 2025,
        week_start: weekStart,
        price: newPrice
      });
      
      // Aggiorna stato locale
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
      
      // Aggiorna localStorage
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
        }
      }
      
      toast.success("Prezzo aggiornato");
    } catch (error) {
      console.error("❌ Error updating price:", error);
      toast.error("Errore nell'aggiornamento del prezzo");
    }
  }, []);

  // Inizializza al mount
  useEffect(() => {
    console.log("🚀 useCompactPrices: mounting, starting price loading...");
    loadPrices();
  }, [loadPrices]);

  // Debug: log quando i prezzi cambiano
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
