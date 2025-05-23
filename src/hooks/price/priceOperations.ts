
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
    const result = await supabaseService.prices.updateBatch(pricesToInsert);
    console.log(`Initialized ${pricesToInsert.length} prices for 2025`);
    toast.success("Prezzi 2025 inizializzati con successo");
    
    const transformedPrices = pricesToInsert.map(p => ({
      apartmentId: p.apartment_id,
      weekStart: p.week_start,
      price: p.price
    }));
    
    return transformedPrices;
  } catch (error) {
    console.error("Error initializing 2025 prices:", error);
    toast.error("Errore nell'inizializzazione dei prezzi 2025");
    
    // Return the transformed prices anyway so UI can display something
    return pricesToInsert.map(p => ({
      apartmentId: p.apartment_id,
      weekStart: p.week_start,
      price: p.price
    }));
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
    
    if (!data || data.length === 0) {
      console.log(`No prices found for year ${year}, will initialize default prices`);
      if (year === 2025) {
        return await initializePricesFor2025();
      }
      return [];
    }
    
    return data.map(price => ({
      apartmentId: price.apartment_id,
      weekStart: price.week_start,
      price: Number(price.price)
    }));
  } catch (error) {
    console.error(`Failed to load prices for year ${year}:`, error);
    
    // Try to load from localstorage as fallback
    try {
      const savedPrices = localStorage.getItem("seasonalPricing");
      if (savedPrices) {
        const allPrices = JSON.parse(savedPrices);
        const yearData = allPrices.find((y: any) => y.year === year);
        if (yearData && yearData.prices && yearData.prices.length > 0) {
          console.log(`Loaded ${yearData.prices.length} prices from localStorage for year ${year}`);
          toast.info("Prezzi caricati dal backup locale");
          return yearData.prices;
        }
      }
    } catch (localStorageError) {
      console.error("Error loading from localStorage:", localStorageError);
    }
    
    // If year is 2025, initialize default prices
    if (year === 2025) {
      console.log("Initializing default 2025 prices as fallback");
      return await initializePricesFor2025();
    }
    
    return [];
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
  try {
    await resetAllPrices(2025);
  } catch (error) {
    console.error("Error resetting prices:", error);
  }
  
  // Then initialize new prices
  return await initializePricesFor2025();
};
