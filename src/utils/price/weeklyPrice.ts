
import { Apartment } from "@/data/apartments";

/**
 * Gets the weekly price for an apartment on a specific date
 * using the configured prices in the admin area
 */
export const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
  try {
    // Get prices from storage
    const savedPrices = localStorage.getItem("seasonalPricing");
    if (!savedPrices) return 0;
    
    // Parse stored prices
    const allPrices = JSON.parse(savedPrices);
    const year = weekStart.getFullYear();
    
    // Get prices for the year
    const yearData = allPrices.find((season: any) => season.year === year);
    if (!yearData) return 0;
    
    // Format the date for comparison (YYYY-MM-DD)
    const searchDate = new Date(weekStart);
    searchDate.setHours(0, 0, 0, 0);
    const searchDateStr = searchDate.toISOString().split('T')[0];
    
    console.log(`Looking for price: apartmentId=${apartmentId}, date=${searchDateStr}, year=${year}`);
    
    // Find matching price by finding the closest weekly start date
    // that is not after our search date
    let bestMatch = null;
    let bestMatchDiff = Infinity;
    
    for (const p of yearData.prices) {
      if (p.apartmentId === apartmentId) {
        const priceDate = new Date(p.weekStart);
        priceDate.setHours(0, 0, 0, 0);
        
        // Check if this price date is before or equal to our search date
        const diff = searchDate.getTime() - priceDate.getTime();
        if (diff >= 0 && diff < bestMatchDiff && diff < 7 * 24 * 60 * 60 * 1000) {
          bestMatch = p;
          bestMatchDiff = diff;
        }
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
