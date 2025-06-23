
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";
import { format } from 'date-fns';

export interface PriceData {
  apartmentId: string;
  weekStart: string; // YYYY-MM-DD format
  price: number;
}

export interface UnifiedPricesContextType {
  prices: PriceData[];
  isLoading: boolean;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  availableYears: number[];
  updatePrice: (apartmentId: string, weekStart: string, price: number, year?: number) => Promise<boolean>;
  getPriceForWeek: (apartmentId: string, weekStart: string | Date) => number;
  initializeDefaultPrices: (year?: number) => Promise<PriceData[]>;
  loadPricesForYear: (year: number) => Promise<PriceData[]>;
  refreshPrices: () => Promise<void>;
}

const APARTMENT_IDS = ['appartamento-1', 'appartamento-2', 'appartamento-3', 'appartamento-4'];

// Prezzi corretti per il 2025 basati sulla tabella dell'utente
const DEFAULT_2025_PRICES = {
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
  "2025-09-29": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 }
};

/**
 * Converte una data in formato stringa YYYY-MM-DD
 */
const formatDateString = (date: string | Date): string => {
  if (typeof date === 'string') {
    return date.split('T')[0]; // Rimuove il tempo se presente
  }
  return format(date, 'yyyy-MM-dd');
};

/**
 * Hook unificato per la gestione dei prezzi
 * Sostituisce tutti gli altri hook dei prezzi per eliminare incongruenze
 */
export const useUnifiedPrices = (): UnifiedPricesContextType => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(2025);
  const availableYears = [2025, 2026, 2027, 2028, 2029, 2030];

  /**
   * Carica i prezzi dal database per un anno specifico
   */
  const loadPricesForYear = useCallback(async (year: number): Promise<PriceData[]> => {
    try {
      console.log(`Loading prices for year ${year}...`);
      const data = await supabaseService.prices.getByYear(year);
      
      if (!data || data.length === 0) {
        console.log(`No prices found for year ${year}`);
        return [];
      }
      
      const transformedPrices: PriceData[] = data.map(price => ({
        apartmentId: price.apartment_id,
        weekStart: formatDateString(price.week_start),
        price: Number(price.price)
      }));
      
      console.log(`Loaded ${transformedPrices.length} prices for year ${year}`);
      return transformedPrices;
    } catch (error) {
      console.error(`Error loading prices for year ${year}:`, error);
      return [];
    }
  }, []);

  /**
   * Inizializza i prezzi di default per un anno
   */
  const initializeDefaultPrices = useCallback(async (year: number = 2025): Promise<PriceData[]> => {
    console.log(`Initializing default prices for year ${year}...`);
    
    const pricesToInsert = [];
    
    if (year === 2025) {
      // Usa i prezzi corretti per il 2025
      for (const [weekStart, apartmentPrices] of Object.entries(DEFAULT_2025_PRICES)) {
        for (const [apartmentId, price] of Object.entries(apartmentPrices)) {
          pricesToInsert.push({
            apartment_id: apartmentId,
            year,
            week_start: weekStart,
            price: price
          });
        }
      }
    } else {
      // Per gli altri anni, genera settimane vuote (prezzo 0)
      const seasonWeeks = generateSeasonWeeks(year);
      for (const week of seasonWeeks) {
        for (const apartmentId of APARTMENT_IDS) {
          pricesToInsert.push({
            apartment_id: apartmentId,
            year,
            week_start: week,
            price: 0
          });
        }
      }
    }

    try {
      await supabaseService.prices.updateBatch(pricesToInsert);
      
      const transformedPrices: PriceData[] = pricesToInsert.map(p => ({
        apartmentId: p.apartment_id,
        weekStart: p.week_start,
        price: p.price
      }));
      
      toast.success(`Prezzi inizializzati per l'anno ${year}`);
      return transformedPrices;
    } catch (error) {
      console.error(`Error initializing prices for year ${year}:`, error);
      toast.error(`Errore nell'inizializzazione dei prezzi per l'anno ${year}`);
      return [];
    }
  }, []);

  /**
   * Aggiorna un prezzo specifico
   */
  const updatePrice = useCallback(async (
    apartmentId: string, 
    weekStart: string | Date, 
    price: number, 
    year?: number
  ): Promise<boolean> => {
    try {
      const weekStartStr = formatDateString(weekStart);
      const targetYear = year || currentYear;
      
      console.log(`Updating price: ${apartmentId}, ${weekStartStr}, ${price}, year ${targetYear}`);
      
      await supabaseService.prices.upsert({
        apartment_id: apartmentId,
        year: targetYear,
        week_start: weekStartStr,
        price: price
      });
      
      // Aggiorna lo stato locale solo se è per l'anno corrente
      if (targetYear === currentYear) {
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
      }
      
      toast.success("Prezzo aggiornato con successo");
      return true;
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Errore nell'aggiornamento del prezzo");
      return false;
    }
  }, [currentYear]);

  /**
   * Ottiene il prezzo per una settimana specifica
   */
  const getPriceForWeek = useCallback((apartmentId: string, weekStart: string | Date): number => {
    const weekStartStr = formatDateString(weekStart);
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStartStr);
    return price ? price.price : 0;
  }, [prices]);

  /**
   * Ricarica i prezzi per l'anno corrente
   */
  const refreshPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedPrices = await loadPricesForYear(currentYear);
      
      if (loadedPrices.length === 0 && currentYear === 2025) {
        // Se non ci sono prezzi per il 2025, inizializza con i valori di default
        const initializedPrices = await initializeDefaultPrices(currentYear);
        setPrices(initializedPrices);
      } else {
        setPrices(loadedPrices);
      }
    } catch (error) {
      console.error("Error refreshing prices:", error);
      toast.error("Errore nel caricamento dei prezzi");
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, loadPricesForYear, initializeDefaultPrices]);

  // Carica i prezzi quando cambia l'anno
  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  return {
    prices,
    isLoading,
    currentYear,
    setCurrentYear,
    availableYears,
    updatePrice,
    getPriceForWeek,
    initializeDefaultPrices,
    loadPricesForYear,
    refreshPrices
  };
};

/**
 * Genera le settimane della stagione per un anno
 */
function generateSeasonWeeks(year: number): string[] {
  const weeks = [];
  const seasonStart = new Date(year, 5, 2); // 2 giugno
  let currentWeek = seasonStart;
  
  while (currentWeek <= new Date(year, 8, 29)) { // 29 settembre
    weeks.push(format(currentWeek, 'yyyy-MM-dd'));
    currentWeek = new Date(currentWeek);
    currentWeek.setDate(currentWeek.getDate() + 7);
  }
  
  return weeks;
}
