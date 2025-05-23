
import { Apartment } from "@/data/apartments";
import { WeeklyPrice } from "./types";
import { supabaseService } from "@/services/supabaseService";

/**
 * Gets the weekly price for an apartment on a specific date
 * using the prices from the database
 * @param apartmentId - ID of the apartment
 * @param weekStart - Start date of the week
 * @returns The price for the week or 0 if not found
 */
export const getPriceForWeek = async (apartmentId: string, weekStart: Date): Promise<number> => {
  try {
    const year = weekStart.getFullYear();
    
    // Get prices from database for the year
    const prices = await supabaseService.prices.getByYear(year);
    
    if (!prices || prices.length === 0) {
      console.log(`No pricing data found for year ${year}`);
      return 0;
    }
    
    // Format the date for comparison (YYYY-MM-DD)
    const searchDate = new Date(weekStart);
    searchDate.setHours(0, 0, 0, 0);
    const searchDateStr = searchDate.toISOString().split('T')[0];
    
    console.log(`Looking for price: apartmentId=${apartmentId}, date=${searchDateStr}, year=${year}`);
    
    // Find the exact price match
    const priceRecord = prices.find(
      (p: any) => p.apartment_id === apartmentId && p.week_start === searchDateStr
    );
    
    if (priceRecord) {
      console.log(`Found price for ${apartmentId}: €${priceRecord.price}`);
      return Number(priceRecord.price);
    }
    
    console.log(`No price found for ${apartmentId} on ${searchDateStr}`);
    return 0;
  } catch (error) {
    console.error("Error getting price for date:", error);
    return 0;
  }
};

/**
 * Synchronous version that uses local storage as fallback
 * This is used when we need immediate price data without async calls
 */
export const getPriceForWeekSync = (apartmentId: string, weekStart: Date): number => {
  try {
    // Try to get from local storage first
    const savedPrices = localStorage.getItem("seasonalPricing");
    if (!savedPrices) {
      console.log("No seasonal pricing data found in storage");
      return 0;
    }
    
    const allPrices = JSON.parse(savedPrices);
    const year = weekStart.getFullYear();
    
    const yearData = allPrices.find((season: any) => season.year === year);
    if (!yearData) {
      console.log(`No pricing data found for year ${year}`);
      return 0;
    }
    
    const searchDate = new Date(weekStart);
    searchDate.setHours(0, 0, 0, 0);
    const searchDateStr = searchDate.toISOString().split('T')[0];
    
    const apartmentPrices = yearData.prices.filter(
      (p: WeeklyPrice) => p.apartmentId === apartmentId
    );
    
    if (apartmentPrices.length === 0) {
      console.log(`No prices configured for apartment ${apartmentId} in year ${year}`);
      return 0;
    }
    
    let bestMatch = null;
    let bestMatchDiff = Infinity;
    
    const searchTime = searchDate.getTime();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    for (const p of apartmentPrices) {
      const priceDate = new Date(p.weekStart);
      priceDate.setHours(0, 0, 0, 0);
      
      const diff = searchTime - priceDate.getTime();
      if (diff >= 0 && diff < bestMatchDiff && diff < oneWeekMs) {
        bestMatch = p;
        bestMatchDiff = diff;
      }
    }
    
    if (bestMatch) {
      console.log(`Found best match price for ${apartmentId}: ${bestMatch.price}€`);
      return bestMatch.price;
    }
    
    console.log(`No price found for ${apartmentId} on ${searchDateStr}`);
    return 0;
  } catch (error) {
    console.error("Error getting price for date:", error);
    return 0;
  }
};
