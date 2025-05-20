
import { Dispatch, SetStateAction } from "react";
import { WeeklyPrice, SeasonalPricing } from "./types";
import { generateDefaultPricesForYear, getCurrentOrCreateSeason } from "./priceUtils";

/**
 * Updates a specific weekly price for an apartment
 */
export const updateWeeklyPrice = (
  apartmentId: string, 
  weekStart: string, 
  price: number, 
  seasonalPricing: SeasonalPricing[], 
  setSeasonalPricing: Dispatch<SetStateAction<SeasonalPricing[]>>,
  setWeeklyPrices: Dispatch<SetStateAction<WeeklyPrice[]>>
) => {
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

/**
 * Setup and initialize 2025 pricing data if it doesn't exist
 */
export const initializeYearPricing = (
  seasonalPricing: SeasonalPricing[], 
  setSeasonalPricing: Dispatch<SetStateAction<SeasonalPricing[]>>
) => {
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
};
