
import { format, parseISO, isSameWeek } from "date-fns";
import { WeeklyPrice, SeasonalPricing } from "./types";

/**
 * Returns a list of weeks for a specific year
 * Each week is represented by start and end dates
 */
export const getWeeksForYear = (year: number): { start: Date; end: Date }[] => {
  const weeks: { start: Date; end: Date }[] = [];
  
  // Start from first Saturday of June
  let currentDate = new Date(year, 5, 1); // June 1st
  
  // Find first Saturday (6 = Saturday)
  while (currentDate.getDay() !== 6) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Generate weeks until end of September
  while (currentDate < new Date(year, 9, 1)) { // Until October 1st
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Friday)
    
    weeks.push({
      start: weekStart,
      end: weekEnd
    });
    
    // Move to next Saturday
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
};

/**
 * Format a week range for display
 */
export const formatWeekRange = (start: Date, end: Date): string => {
  // Return a formatted date range string
  return `${format(start, "d")} - ${format(end, "d MMM yyyy")}`;
};

/**
 * Get price for a specific apartment and week
 */
export const getPriceForApartmentWeek = (
  apartmentId: string,
  weekStart: Date,
  prices: WeeklyPrice[]
): number => {
  // Find the price for this specific apartment and week
  const price = prices.find(p => {
    // Convert ISO string to Date for comparison
    const priceStartDate = parseISO(p.weekStart);
    
    // Only compare week start date (not time)
    return (
      p.apartmentId === apartmentId &&
      isSameWeek(priceStartDate, weekStart)
    );
  });
  
  // Return found price or default
  return price ? price.price : 0;
};

/**
 * Load pricing data from storage
 */
export const loadPricesFromStorage = (): SeasonalPricing[] => {
  try {
    const storedPrices = localStorage.getItem("seasonalPricing");
    return storedPrices ? JSON.parse(storedPrices) : [];
  } catch (error) {
    console.error("Error loading prices from storage:", error);
    return [];
  }
};

/**
 * Save pricing data to storage
 */
export const savePricesToStorage = (pricing: SeasonalPricing[]): void => {
  try {
    localStorage.setItem("seasonalPricing", JSON.stringify(pricing));
  } catch (error) {
    console.error("Error saving prices to storage:", error);
  }
};

/**
 * Debug function to log information about the pricing state
 */
export const debugPricingState = (
  year: number, 
  prices: WeeklyPrice[],
  seasonalPricing: SeasonalPricing[]
) => {
  console.log(`Debug pricing state for year ${year}`);
  console.log(`Weekly prices: ${prices.length} items`);
  
  // Seasonal pricing stats
  console.log(`Seasonal pricing has ${seasonalPricing.length} years of data`);
  seasonalPricing.forEach(season => {
    console.log(`Season ${season.year}: ${season.prices.length} prices`);
  });
  
  // Sample prices for each year
  seasonalPricing.forEach(season => {
    if (season.prices.length > 0) {
      const sample = season.prices[0];
      console.log(`Sample price for ${season.year}: ${sample.apartmentId}, ${new Date(sample.weekStart).toLocaleDateString()}, ${sample.price}€`);
      
      // Check if weekEnd exists
      if (sample.weekEnd) {
        console.log(`  with weekEnd: ${new Date(sample.weekEnd).toLocaleDateString()}`);
      }
    }
  });
};
