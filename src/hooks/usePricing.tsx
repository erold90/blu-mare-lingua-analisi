import { useState, useEffect } from 'react';
import { pricingService, WeeklyPrice, DateBlock, SeasonConfig } from '@/services/supabase/pricingService';
import { toast } from 'sonner';

export const usePricing = () => {
  const [weeklyPrices, setWeeklyPrices] = useState<WeeklyPrice[]>([]);
  const [dateBlocks, setDateBlocks] = useState<DateBlock[]>([]);
  const [seasonConfigs, setSeasonConfigs] = useState<SeasonConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyPrices = async (year?: number, apartmentId?: string) => {
    try {
      setLoading(true);
      const data = await pricingService.getWeeklyPrices(year, apartmentId);
      setWeeklyPrices(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Errore nel caricamento dei prezzi');
    } finally {
      setLoading(false);
    }
  };

  const fetchDateBlocks = async () => {
    try {
      const data = await pricingService.getDateBlocks();
      setDateBlocks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Errore nel caricamento dei blocchi date');
    }
  };

  const fetchSeasonConfigs = async () => {
    try {
      const data = await pricingService.getSeasonConfigs();
      setSeasonConfigs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Errore nel caricamento configurazioni stagionali');
    }
  };

  const updateWeeklyPrice = async (id: string, updates: Partial<WeeklyPrice>) => {
    try {
      await pricingService.updateWeeklyPrice(id, updates);
      
      // Invalida cache del pricing service per forzare aggiornamento
      const { PricingService } = await import('@/services/supabase/dynamicPricingService');
      PricingService.invalidateCache();
      
      await fetchWeeklyPrices();
      toast.success('Prezzo aggiornato con successo');
      return { success: true, error: null };
    } catch (err: any) {
      toast.error('Errore nell\'aggiornamento del prezzo');
      return { success: false, error: err.message };
    }
  };

  const generatePricesForYear = async (targetYear: number, copyFromYear?: number) => {
    try {
      setLoading(true);
      const weeksCreated = await pricingService.generateWeeklyPricesForYear(targetYear, copyFromYear);
      
      // Invalida cache del pricing service
      const { PricingService } = await import('@/services/supabase/dynamicPricingService');
      PricingService.invalidateCache();
      
      await fetchWeeklyPrices(targetYear);
      toast.success(`Prezzi generati per ${targetYear}: ${weeksCreated} settimane create`);
      return { success: true, error: null, weeksCreated };
    } catch (err: any) {
      toast.error('Errore nella generazione prezzi');
      return { success: false, error: err.message, weeksCreated: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createDateBlock = async (block: Omit<DateBlock, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await pricingService.createDateBlock(block);
      await fetchDateBlocks();
      toast.success('Blocco date creato con successo');
      return { success: true, error: null };
    } catch (err: any) {
      toast.error('Errore nella creazione del blocco');
      return { success: false, error: err.message };
    }
  };

  const updateDateBlock = async (id: string, updates: Partial<DateBlock>) => {
    try {
      await pricingService.updateDateBlock(id, updates);
      await fetchDateBlocks();
      toast.success('Blocco aggiornato con successo');
      return { success: true, error: null };
    } catch (err: any) {
      toast.error('Errore nell\'aggiornamento del blocco');
      return { success: false, error: err.message };
    }
  };

  const deleteeDateBlock = async (id: string) => {
    try {
      await pricingService.deleteeDateBlock(id);
      await fetchDateBlocks();
      toast.success('Blocco eliminato con successo');
      return { success: true, error: null };
    } catch (err: any) {
      toast.error('Errore nell\'eliminazione del blocco');
      return { success: false, error: err.message };
    }
  };

  const updateSeasonConfig = async (id: string, updates: Partial<SeasonConfig>) => {
    try {
      await pricingService.updateSeasonConfig(id, updates);
      await fetchSeasonConfigs();
      toast.success('Configurazione stagionale aggiornata');
      return { success: true, error: null };
    } catch (err: any) {
      toast.error('Errore nell\'aggiornamento configurazione');
      return { success: false, error: err.message };
    }
  };

  const createSeasonConfig = async (config: Omit<SeasonConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await pricingService.createSeasonConfig(config);
      await fetchSeasonConfigs();
      toast.success('Configurazione stagionale creata');
      return { success: true, error: null };
    } catch (err: any) {
      toast.error('Errore nella creazione configurazione');
      return { success: false, error: err.message };
    }
  };

  // Utility functions for availability checking
  const checkAvailabilityForDateRange = async (apartmentId: string, startDate: Date, endDate: Date): Promise<boolean> => {
    try {
      // Check if dates are in season
      const startInSeason = await pricingService.isDateInSeason(startDate);
      const endInSeason = await pricingService.isDateInSeason(endDate);
      
      if (!startInSeason || !endInSeason) {
        return false; // Outside season
      }

      // Check for date blocks
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const isBlocked = await pricingService.isDateBlocked(apartmentId, currentDate);
        if (isBlocked) {
          return false; // Date is blocked
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return true; // Available
    } catch (err) {
      console.error('Error checking availability:', err);
      return false;
    }
  };

  const calculatePriceForStay = async (apartmentId: string, startDate: Date, endDate: Date): Promise<number> => {
    try {
      const priceData = await pricingService.getPriceForDateRange(apartmentId, startDate, endDate);
      
      if (!priceData || priceData.length === 0) {
        return 0; // No pricing data found
      }

      let totalPrice = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate < endDate) {
        // Find the weekly price that covers this date
        const weekPrice = priceData.find(price => {
          const weekStart = new Date(price.week_start);
          const weekEnd = new Date(price.week_end);
          return currentDate >= weekStart && currentDate <= weekEnd;
        });

        if (weekPrice) {
          totalPrice += weekPrice.price;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return totalPrice;
    } catch (err) {
      console.error('Error calculating price:', err);
      return 0;
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    fetchWeeklyPrices(currentYear);
    fetchDateBlocks();
    fetchSeasonConfigs();
  }, []);

  return {
    weeklyPrices,
    dateBlocks,
    seasonConfigs,
    loading,
    error,
    fetchWeeklyPrices,
    fetchDateBlocks,
    fetchSeasonConfigs,
    updateWeeklyPrice,
    generatePricesForYear,
    createDateBlock,
    updateDateBlock,
    deleteeDateBlock,
    updateSeasonConfig,
    createSeasonConfig,
    checkAvailabilityForDateRange,
    calculatePriceForStay
  };
};