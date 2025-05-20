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
          p => p.apartmentId === apartmentId && p.weekStart.substring(0, 10) === weekStart.substring(0, 10)
        );
        
        if (priceIndex !== -1) {
          newYearPricing.prices[priceIndex].price = price;
        } else {
          // Add new price entry if not found
          const weekDate = new Date(weekStart);
          const weekEndDate = new Date(weekStart);
          weekEndDate.setDate(weekEndDate.getDate() + 6); // End is 6 days later
          
          newYearPricing.prices.push({
            apartmentId,
            weekStart: weekStart,
            weekEnd: weekEndDate.toISOString(),
            price
          });
        }
        
        return [...prevPricing, newYearPricing];
      } else {
        // Year found, update the specific price
        const updatedPricing = [...prevPricing];
        const priceIndex = updatedPricing[yearIndex].prices.findIndex(
          p => p.apartmentId === apartmentId && p.weekStart.substring(0, 10) === weekStart.substring(0, 10)
        );
        
        if (priceIndex !== -1) {
          updatedPricing[yearIndex].prices[priceIndex].price = price;
        } else {
          // Add new price entry if not found
          const weekDate = new Date(weekStart);
          const weekEndDate = new Date(weekStart);
          weekEndDate.setDate(weekEndDate.getDate() + 6); // End is 6 days later
          
          updatedPricing[yearIndex].prices.push({
            apartmentId,
            weekStart: weekStart,
            weekEnd: weekEndDate.toISOString(),
            price
          });
        }
        
        return updatedPricing;
      }
    });
    
    // Also update weekly prices if they're for the current year
    setWeeklyPrices(prevPrices => {
      const updatedPrices = [...prevPrices];
      const priceIndex = updatedPrices.findIndex(
        p => p.apartmentId === apartmentId && p.weekStart.substring(0, 10) === weekStart.substring(0, 10)
      );
      
      if (priceIndex !== -1) {
        updatedPrices[priceIndex].price = price;
      } else {
        // Add new price entry if not found
        const weekDate = new Date(weekStart);
        const weekEndDate = new Date(weekStart);
        weekEndDate.setDate(weekEndDate.getDate() + 6); // End is 6 days later
        
        updatedPrices.push({
          apartmentId,
          weekStart: weekStart,
          weekEnd: weekEndDate.toISOString(),
          price
        });
      }
      
      return updatedPrices;
    });
    
    // Force save to localStorage immediately
    setTimeout(() => {
      localStorage.setItem("seasonalPricing", JSON.stringify(seasonalPricing));
    }, 100);
  };
  
  // Get the current season or create it if it doesn't exist
  const getCurrentSeason = (): SeasonalPricing => {
    return getCurrentOrCreateSeason(seasonalPricing, setSeasonalPricing, setWeeklyPrices);
  };

  // Make sure we have a 2025 season
  useEffect(() => {
    const has2025Season = seasonalPricing.some(season => season.year === 2025);
    
    if (!has2025Season) {
      // Add 2025 season with default prices set to 120€
      const weeks2025 = generateWeeksForSeason(2025, 6, 9);
      const prices2025: WeeklyPrice[] = [];
      
      // Create prices for all apartments
      const { apartments } = require("@/data/apartments");
      apartments.forEach((apt: any) => {
        weeks2025.forEach(week => {
          prices2025.push({
            apartmentId: apt.id,
            weekStart: week.start.toISOString(),
            weekEnd: week.end.toISOString(),
            price: 120 // Set all 2025 prices to 120€
          });
        });
      });
      
      setSeasonalPricing(prevPricing => [
        ...prevPricing,
        {
          year: 2025,
          prices: prices2025
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
