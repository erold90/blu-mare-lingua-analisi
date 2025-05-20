import { Dispatch, SetStateAction } from "react";
import { WeeklyPrice, SeasonalPricing } from "./types";
import { generateDefaultPricesForYear, generateWeeksForSeason } from "./priceUtils";

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
  
  // Create a copy of the current pricing to work with
  let updatedPricing = [...seasonalPricing];
  
  // Find or create the year pricing
  let yearIndex = updatedPricing.findIndex(season => season.year === currentYear);
  
  if (yearIndex === -1) {
    // Year not found, create new year entry
    const newYearPricing = {
      year: currentYear,
      prices: generateDefaultPricesForYear(currentYear)
    };
    
    // Add the new year pricing to the updated pricing
    updatedPricing = [...updatedPricing, newYearPricing];
    yearIndex = updatedPricing.length - 1;
  }
  
  // Update the specific price
  const priceIndex = updatedPricing[yearIndex].prices.findIndex(
    p => p.apartmentId === apartmentId && p.weekStart.substring(0, 10) === weekStart.substring(0, 10)
  );
  
  if (priceIndex !== -1) {
    // Price exists, update it
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
  
  // Save to state
  setSeasonalPricing(updatedPricing);
  
  // Save to localStorage immediately
  localStorage.setItem("seasonalPricing", JSON.stringify(updatedPricing));
  
  // Also update weekly prices if they're for the current year
  setWeeklyPrices(prevPrices => {
    const updatedWeeklyPrices = [...prevPrices];
    const weeklyPriceIndex = updatedWeeklyPrices.findIndex(
      p => p.apartmentId === apartmentId && p.weekStart.substring(0, 10) === weekStart.substring(0, 10)
    );
    
    if (weeklyPriceIndex !== -1) {
      updatedWeeklyPrices[weeklyPriceIndex].price = price;
    } else {
      // Add new price entry if not found
      const weekEndDate = new Date(weekStart);
      weekEndDate.setDate(weekEndDate.getDate() + 6); // End is 6 days later
      
      updatedWeeklyPrices.push({
        apartmentId,
        weekStart: weekStart,
        weekEnd: weekEndDate.toISOString(),
        price
      });
    }
    
    return updatedWeeklyPrices;
  });
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
