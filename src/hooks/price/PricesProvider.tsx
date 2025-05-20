
import React, { createContext, useState, useEffect } from "react";
import { WeeklyPrice, SeasonalPricing, PricesContextType } from "./types";
import { generateDefaultPricesForYear, generateWeeksForSeason, getPriceForDate, getCurrentOrCreateSeason } from "./priceUtils";

// Create the context
export const PricesContext = createContext<PricesContextType | undefined>(undefined);

export const PricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    const currentYear = new Date().getFullYear();
    const currentSeason = seasonalPricing.find(season => season.year === currentYear);
    return currentSeason ? currentSeason.prices : generateDefaultPricesForYear(currentYear);
  });
  
  // Save pricing to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("seasonalPricing", JSON.stringify(seasonalPricing));
  }, [seasonalPricing]);
  
  // Update a specific weekly price
  const updateWeeklyPrice = (apartmentId: string, weekStart: string, price: number) => {
    const currentYear = new Date(weekStart).getFullYear();
    
    setSeasonalPricing(prevPricing => {
      // Find the current year's pricing or create it
      const yearIndex = prevPricing.findIndex(season => season.year === currentYear);
      
      if (yearIndex === -1) {
        // Year not found, create new year entry
        const newYearPricing = {
          year: currentYear,
          prices: generateDefaultPricesForYear(currentYear)
        };
        
        // Update the specific price
        const priceIndex = newYearPricing.prices.findIndex(
          p => p.apartmentId === apartmentId && p.weekStart === weekStart
        );
        
        if (priceIndex !== -1) {
          newYearPricing.prices[priceIndex].price = price;
        }
        
        return [...prevPricing, newYearPricing];
      } else {
        // Year found, update the specific price
        const updatedPricing = [...prevPricing];
        const priceIndex = updatedPricing[yearIndex].prices.findIndex(
          p => p.apartmentId === apartmentId && p.weekStart === weekStart
        );
        
        if (priceIndex !== -1) {
          updatedPricing[yearIndex].prices[priceIndex].price = price;
        }
        
        return updatedPricing;
      }
    });
    
    // Also update weekly prices if they're for the current year
    if (new Date(weekStart).getFullYear() === new Date().getFullYear()) {
      setWeeklyPrices(prevPrices => {
        const updatedPrices = [...prevPrices];
        const priceIndex = updatedPrices.findIndex(
          p => p.apartmentId === apartmentId && p.weekStart === weekStart
        );
        
        if (priceIndex !== -1) {
          updatedPrices[priceIndex].price = price;
        }
        
        return updatedPrices;
      });
    }
  };
  
  // Get the current season or create it if it doesn't exist
  const getCurrentSeason = (): SeasonalPricing => {
    return getCurrentOrCreateSeason(seasonalPricing, setSeasonalPricing, setWeeklyPrices);
  };

  // Make sure we have a 2025 season
  useEffect(() => {
    const has2025Season = seasonalPricing.some(season => season.year === 2025);
    
    if (!has2025Season) {
      // Add 2025 season with default prices
      setSeasonalPricing(prevPricing => [
        ...prevPricing,
        {
          year: 2025,
          prices: generateDefaultPricesForYear(2025)
        }
      ]);
    }
  }, []);
  
  // Create the context value object
  const contextValue: PricesContextType = {
    seasonalPricing,
    weeklyPrices,
    updateWeeklyPrice,
    getPriceForDate: (apartmentId: string, date: Date) => getPriceForDate(apartmentId, date, seasonalPricing),
    generateWeeksForSeason,
    getCurrentSeason
  };
  
  return (
    <PricesContext.Provider value={contextValue}>
      {children}
    </PricesContext.Provider>
  );
};
