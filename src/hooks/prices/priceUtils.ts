
import { PriceData, PriceLevel, PriceStats } from './types';

/**
 * Get the price level based on the price amount
 * @param price The price to evaluate
 * @returns Object with level information
 */
export const getPriceLevel = (price: number): PriceLevel => {
  if (price >= 1000) return { level: 'peak', color: 'bg-red-500', label: 'Peak' };
  if (price >= 700) return { level: 'high', color: 'bg-orange-500', label: 'High' };
  if (price >= 450) return { level: 'medium', color: 'bg-yellow-500', label: 'Medium' };
  return { level: 'low', color: 'bg-green-500', label: 'Low' };
};

/**
 * Calculate statistics from price data
 * @param prices Array of price data
 * @returns Price statistics
 */
export const calculatePriceStats = (prices: PriceData[]): PriceStats => {
  const totalPrices = prices.length;
  const avgPrice = totalPrices > 0 
    ? Math.round(prices.reduce((sum, p) => sum + p.price, 0) / totalPrices) 
    : 0;
  const maxPrice = totalPrices > 0 ? Math.max(...prices.map(p => p.price)) : 0;
  const minPrice = totalPrices > 0 ? Math.min(...prices.map(p => p.price)) : 0;
  
  return { totalPrices, avgPrice, maxPrice, minPrice };
};

/**
 * Find price for a specific apartment and week
 * @param prices Array of all price data
 * @param apartmentId The apartment ID to find price for
 * @param weekStart The week start date to find price for
 * @returns The price or 0 if not found
 */
export const findPrice = (
  prices: PriceData[], 
  apartmentId: string, 
  weekStart: string
): number => {
  const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
  const result = price ? price.price : 0;
  
  if (result === 0 && prices.length > 0) {
    console.log(`⚠️ No price found for apartment ${apartmentId}, week ${weekStart}. Available prices:`, prices.length);
  }
  
  return result;
};
