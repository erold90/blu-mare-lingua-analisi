import { useState, useEffect } from "react";
import { WeeklyPrice, SeasonalPricing } from "./types";
import { generateDefaultPricesForYear } from "./priceUtils";

/**
 * Custom hook to manage the state for the prices provider
 */
export const useProviderState = () => {
  // Initial state with seasonal pricing for the current year
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>(() => {
    console.log("useProviderState: Loading seasonal pricing from localStorage");
    const savedPricing = localStorage.getItem("seasonalPricing");
    if (savedPricing) {
      try {
        const parsedPricing = JSON.parse(savedPricing);
        console.log(`useProviderState: Loaded ${parsedPricing.length} seasons from localStorage`);
        return parsedPricing;
      } catch (error) {
        console.error("Failed to parse saved seasonal pricing:", error);
        return [];
      }
    }
    
    console.log("useProviderState: No seasonal pricing found, initializing with default");
    const currentYear = new Date().getFullYear();
    // Initialize with default pricing if nothing is saved
    return [{
      year: currentYear,
      prices: generateDefaultPricesForYear(currentYear)
    }];
  });
  
  // Current year's weekly prices
  const [weeklyPrices, setWeeklyPrices] = useState<WeeklyPrice[]>(() => {
    const savedPricing = localStorage.getItem("seasonalPricing");
    if (savedPricing) {
      try {
        const allPricing = JSON.parse(savedPricing);
        const year2025 = allPricing.find((season: SeasonalPricing) => season.year === 2025);
        if (year2025) {
          console.log(`Trovati ${year2025.prices.length} prezzi per il 2025 in localStorage`);
          return year2025.prices;
        }
      } catch (error) {
        console.error("Failed to parse saved 2025 pricing:", error);
      }
    }
    
    // Otherwise use current year pricing
    const currentYear = new Date().getFullYear();
    const currentSeason = seasonalPricing.find(season => season.year === currentYear);
    return currentSeason ? currentSeason.prices : [];
  });

  // Aggiorniamo i prezzi settimanali quando cambia seasonalPricing
  useEffect(() => {
    const year2025 = seasonalPricing.find(season => season.year === 2025);
    if (year2025) {
      console.log(`useProviderState: Updating weekly prices with ${year2025.prices.length} prices from 2025`);
      setWeeklyPrices(year2025.prices);
    }
  }, [seasonalPricing]);

  return {
    seasonalPricing,
    setSeasonalPricing,
    weeklyPrices,
    setWeeklyPrices
  };
};
