
import { useState, useEffect } from "react";
import { WeeklyPrice, SeasonalPricing } from "./types";

/**
 * Custom hook to manage the state for the prices provider
 */
export const useProviderState = () => {
  console.log("Initializing useProviderState");
  
  // Load seasonal pricing from localStorage
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>(() => {
    console.log("useProviderState: Loading seasonal pricing from localStorage");
    const savedPricing = localStorage.getItem("seasonalPricing");
    
    if (savedPricing) {
      try {
        const parsedPricing = JSON.parse(savedPricing);
        console.log(`useProviderState: Loaded ${parsedPricing.length} seasons from localStorage`);
        
        // Debug - log the first few prices
        if (parsedPricing.length > 0 && parsedPricing[0].prices && parsedPricing[0].prices.length > 0) {
          const firstFewPrices = parsedPricing[0].prices.slice(0, 5).map((p: WeeklyPrice) => 
            `${p.apartmentId}: ${p.price}€ (${new Date(p.weekStart).toLocaleDateString()})`
          );
          console.log("Sample prices:", firstFewPrices);
        }
        
        return parsedPricing;
      } catch (error) {
        console.error("Failed to parse saved seasonal pricing:", error);
        return [];
      }
    }
    
    console.log("useProviderState: No seasonal pricing found in localStorage");
    return [];
  });
  
  // Initialize weekly prices from 2025 season
  const [weeklyPrices, setWeeklyPrices] = useState<WeeklyPrice[]>(() => {
    console.log("Initializing weekly prices");
    const savedPricing = localStorage.getItem("seasonalPricing");
    
    if (savedPricing) {
      try {
        const allPricing = JSON.parse(savedPricing);
        const year2025 = allPricing.find((season: SeasonalPricing) => season.year === 2025);
        
        if (year2025 && year2025.prices && year2025.prices.length > 0) {
          console.log(`Found ${year2025.prices.length} prices for 2025 in localStorage`);
          
          // Debug - log a few prices for verification
          const apt1Prices = year2025.prices.filter((p: WeeklyPrice) => p.apartmentId === "apt-1");
          console.log(`Prices for apt-1 in 2025: ${apt1Prices.length}`);
          
          if (apt1Prices.length > 0) {
            console.log("First 3 prices:", apt1Prices.slice(0, 3).map((p: WeeklyPrice) => 
              `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`
            ));
          }
          
          return year2025.prices;
        }
      } catch (error) {
        console.error("Failed to parse saved 2025 pricing:", error);
      }
    }
    
    console.log("No prices found for 2025, returning empty array");
    return [];
  });

  // Update weekly prices when seasonalPricing changes
  useEffect(() => {
    const year2025 = seasonalPricing.find(season => season.year === 2025);
    if (year2025 && year2025.prices) {
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
