import { useState } from "react";
import { WeeklyPrice, SeasonalPricing } from "./types";
import { generateDefaultPricesForYear, generateWeeksForSeason } from "./priceUtils";

/**
 * Custom hook to manage the state for the prices provider
 */
export const useProviderState = () => {
  // Initial state with seasonal pricing for the current year
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>(() => {
    const savedPricing = localStorage.getItem("seasonalPricing");
    if (savedPricing) {
      try {
        return JSON.parse(savedPricing);
      } catch (error) {
        console.error("Failed to parse saved seasonal pricing:", error);
        return [];
      }
    }
    
    const currentYear = new Date().getFullYear();
    // Initialize with default pricing if nothing is saved
    return [{
      year: currentYear,
      prices: generateDefaultPricesForYear(currentYear)
    }];
  });
  
  // Current year's weekly prices
  const [weeklyPrices, setWeeklyPrices] = useState<WeeklyPrice[]>(() => {
    // First check if we have 2025 prices saved
    const savedPricing = localStorage.getItem("seasonalPricing");
    if (savedPricing) {
      try {
        const allPricing = JSON.parse(savedPricing);
        const year2025 = allPricing.find((season: SeasonalPricing) => season.year === 2025);
        if (year2025) {
          return year2025.prices;
        }
      } catch (error) {
        console.error("Failed to parse saved 2025 pricing:", error);
      }
    }
    
    // Otherwise use current year pricing
    const currentYear = new Date().getFullYear();
    const currentSeason = seasonalPricing.find(season => season.year === currentYear);
    return currentSeason ? currentSeason.prices : generateDefaultPricesForYear(currentYear);
  });

  return {
    seasonalPricing,
    setSeasonalPricing,
    weeklyPrices,
    setWeeklyPrices
  };
};
