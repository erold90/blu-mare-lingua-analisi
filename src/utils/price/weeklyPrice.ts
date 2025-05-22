
import { Apartment } from "@/data/apartments";
import { WeeklyPrice } from "./types";

/**
 * Gets the weekly price for an apartment on a specific date
 * using the configured prices in the admin area
 * @param apartmentId - ID of the apartment
 * @param weekStart - Start date of the week
 * @returns The price for the week or 0 if not found
 */
export const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
  try {
    // Get prices from storage
    const savedPrices = localStorage.getItem("seasonalPricing");
    if (!savedPrices) {
      console.log("No seasonal pricing data found in storage");
      return 0;
    }
    
    // Parse stored prices
    const allPrices = JSON.parse(savedPrices);
    const year = weekStart.getFullYear();
    
    // Get prices for the year
    const yearData = allPrices.find((season: any) => season.year === year);
    if (!yearData) {
      console.log(`No pricing data found for year ${year}`);
      return 0;
    }
    
    // Format the date for comparison (YYYY-MM-DD)
    const searchDate = new Date(weekStart);
    searchDate.setHours(0, 0, 0, 0);
    const searchDateStr = searchDate.toISOString().split('T')[0];
    
    console.log(`Looking for price: apartmentId=${apartmentId}, date=${searchDateStr}, year=${year}`);
    
    // Optimize search: filter only prices for this apartment first
    const apartmentPrices = yearData.prices.filter(
      (p: WeeklyPrice) => p.apartmentId === apartmentId
    );
    
    if (apartmentPrices.length === 0) {
      console.log(`No prices configured for apartment ${apartmentId} in year ${year}`);
      return 0;
    }
    
    // Find matching price by finding the closest weekly start date
    // that is not after our search date
    let bestMatch = null;
    let bestMatchDiff = Infinity;
    
    // Calculate time in milliseconds once to improve performance
    const searchTime = searchDate.getTime();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    for (const p of apartmentPrices) {
      const priceDate = new Date(p.weekStart);
      priceDate.setHours(0, 0, 0, 0);
      
      // Check if this price date is before or equal to our search date
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
