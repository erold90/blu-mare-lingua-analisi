
import { format } from 'date-fns';
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";
import { WeeklyPrice } from './types';
import { get2025PriceData } from './priceUtils';

export const initializePricesFor2025 = async (): Promise<WeeklyPrice[]> => {
  console.log("Initializing prices for 2025 with correct data from table");
  
  const priceData = get2025PriceData();
  const pricesToInsert = [];
  
  for (const period of priceData) {
    for (const [apartmentId, price] of Object.entries(period.prices)) {
      pricesToInsert.push({
        apartment_id: apartmentId,
        year: 2025,
        week_start: period.date,
        price: price
      });
    }
  }

  try {
    await supabaseService.prices.updateBatch(pricesToInsert);
    console.log(`Initialized ${pricesToInsert.length} prices for 2025`);
    toast.success("Prezzi 2025 inizializzati con successo");
    
    return pricesToInsert.map(p => ({
      apartmentId: p.apartment_id,
      weekStart: p.week_start,
      price: p.price
    }));
  } catch (error) {
    console.error("Error initializing 2025 prices:", error);
    toast.error("Errore nell'inizializzazione dei prezzi 2025");
    return [];
  }
};

export const updatePriceInDatabase = async (
  apartmentId: string, 
  weekStart: string, 
  price: number, 
  year: number
): Promise<void> => {
  try {
    const priceData = {
      apartment_id: apartmentId,
      year: year,
      week_start: weekStart,
      price: price
    };
    
    await supabaseService.prices.upsert(priceData);
    console.log(`Updated price for ${apartmentId} on ${weekStart}: €${price}`);
  } catch (error) {
    console.error("Error updating price:", error);
    toast.error("Errore nell'aggiornare il prezzo");
    throw error;
  }
};

export const loadPricesFromDatabase = async (year: number): Promise<WeeklyPrice[]> => {
  try {
    const data = await supabaseService.prices.getByYear(year);
    
    return data.map(price => ({
      apartmentId: price.apartment_id,
      weekStart: price.week_start,
      price: Number(price.price)
    }));
  } catch (error) {
    console.error(`Failed to load prices for year ${year}:`, error);
    throw error;
  }
};

// Export functions that were missing
export const updateWeeklyPrice = updatePriceInDatabase;

export const resetAllPrices = async (year: number = 2025): Promise<void> => {
  try {
    // Delete existing prices for the year
    await supabaseService.prices.deleteByYear(year);
    toast.success(`Prezzi ${year} resettati`);
  } catch (error) {
    console.error("Error resetting prices:", error);
    toast.error("Errore nel reset dei prezzi");
  }
};

export const forceInitializePrices = async (): Promise<WeeklyPrice[]> => {
  console.log("Force initializing prices for 2025");
  
  // First reset existing prices
  await resetAllPrices(2025);
  
  // Then initialize new prices
  return await initializePricesFor2025();
};
