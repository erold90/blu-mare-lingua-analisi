
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
    
    return weeks;
  }, []);

  // Carica i prezzi dal database
  const loadPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Loading prices from database...");
      
      const data = await supabaseService.prices.getByYear(2025);
      console.log("Raw price data from database:", data);
      
      if (!data || data.length === 0) {
        console.log("No prices found in database");
        setPrices([]);
        return;
      }
      
      const transformedPrices: PriceData[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: price.week_start,
        price: Number(price.price)
      }));
      
      console.log("Transformed prices:", transformedPrices);
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
      
    } catch (error) {
      console.error('Errore nel caricamento prezzi:', error);
      toast.error('Errore nel caricamento dei prezzi');
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ottieni prezzo per appartamento e settimana
  const getPrice = useCallback((apartmentId: string, weekStart: string): number => {
    console.log(`Getting price for apartment ${apartmentId}, week ${weekStart}`);
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
    const result = price ? price.price : 0;
    console.log(`Found price: ${result}`);
    return result;
  }, [prices]);

  // Aggiorna prezzo
  const updatePrice = useCallback(async (apartmentId: string, weekStart: string, newPrice: number) => {
    try {
      console.log(`Updating price for ${apartmentId} on ${weekStart} to ${newPrice}`);
      
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
          return updated;
        } else {
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
      console.error("Errore aggiornamento prezzo:", error);
      toast.error("Errore nell'aggiornamento del prezzo");
    }
  }, []);

  // Inizializza al mount
  useEffect(() => {
    console.log("useCompactPrices: mounting, loading prices...");
    loadPrices();
  }, [loadPrices]);

  // Debug: log quando i prezzi cambiano
  useEffect(() => {
    console.log("Prices state updated:", prices.length, "prices loaded");
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
