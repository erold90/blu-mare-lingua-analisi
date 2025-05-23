
import { PriceData } from "./types";
import { getSeasonWeeks } from "./weekUtils";

/**
 * Find a price in the prices array for a specific apartment and week start
 * @param prices Array of price data
 * @param apartmentId Apartment ID
 * @param weekStart Week start date (string or Date)
 * @returns The price or 0 if not found
 */
export const findPrice = (
  prices: PriceData[], 
  apartmentId: string, 
  weekStart: string | Date
): number => {
  const weekStartStr = typeof weekStart === 'string' 
    ? weekStart 
    : weekStart.toISOString().split('T')[0];
  
  const price = prices.find(p => 
    p.apartmentId === apartmentId && 
    p.weekStart === weekStartStr
  );
  
  return price ? price.price : 0;
};

/**
 * Calculate adjusted price with percentage increase and optional rounding
 * @param originalPrice Original price value
 * @param percentIncrease Percentage to increase by
 * @param rounding Rounding direction ('up', 'down', or 'none')
 * @param roundToNearest Value to round to (e.g., 5 for nearest 5)
 * @returns Adjusted price
 */
export const calculateAdjustedPrice = (
  originalPrice: number,
  percentIncrease: number, 
  rounding: 'up' | 'down' | 'none' = 'none',
  roundToNearest: number = 5
): number => {
  if (originalPrice === 0) return 0;
  
  // Apply percentage increase
  let adjustedPrice = originalPrice * (1 + percentIncrease / 100);
  
  // Apply rounding if needed
  if (rounding !== 'none' && roundToNearest > 0) {
    if (rounding === 'up') {
      adjustedPrice = Math.ceil(adjustedPrice / roundToNearest) * roundToNearest;
    } else if (rounding === 'down') {
      adjustedPrice = Math.floor(adjustedPrice / roundToNearest) * roundToNearest;
    }
  }
  
  return adjustedPrice;
};

/**
 * Generate prices for a new year based on a previous year's data
 * @param sourcePrices Source prices to copy from
 * @param sourceYear Source year
 * @param targetYear Target year to generate prices for
 * @param percentIncrease Percentage to increase prices by
 * @param rounding Rounding direction ('up', 'down', or 'none')
 * @param roundToNearest Value to round to
 * @returns Array of new price data for the target year
 */
export const generateYearPrices = (
  sourcePrices: PriceData[],
  sourceYear: number,
  targetYear: number,
  percentIncrease: number = 0,
  rounding: 'up' | 'down' | 'none' = 'none',
  roundToNearest: number = 5
): PriceData[] => {
  // Get source weeks and filter source prices to ensure they're from the source year
  const sourceWeeks = getSeasonWeeks(sourceYear);
  
  // Generate weeks for the target year
  const targetWeeks = getSeasonWeeks(targetYear);
  
  // Generate the new prices
  const newPrices: PriceData[] = [];
  
  // Get unique apartment IDs from source prices
  const apartmentIds = [...new Set(sourcePrices.map(p => p.apartmentId))];
  
  // For each apartment and week in target year, find corresponding source price and adjust
  for (const apartmentId of apartmentIds) {
    for (let i = 0; i < Math.min(sourceWeeks.length, targetWeeks.length); i++) {
      const sourceWeekStart = sourceWeeks[i].startStr;
      const targetWeekStart = targetWeeks[i].startStr;
      
      // Find the source price for this apartment and week
      const sourcePrice = findPrice(sourcePrices, apartmentId, sourceWeekStart);
      
      // Calculate the adjusted price
      const newPrice = calculateAdjustedPrice(
        sourcePrice,
        percentIncrease,
        rounding,
        roundToNearest
      );
      
      // Add to the new prices array
      newPrices.push({
        apartmentId,
        weekStart: targetWeekStart,
        price: newPrice
      });
    }
  }
  
  return newPrices;
};
