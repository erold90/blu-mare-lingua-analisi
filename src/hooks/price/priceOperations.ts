
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
 * Setup and initialize 2025 pricing data with predefined seasonal prices
 */
export const initializeYearPricing = (
  seasonalPricing: SeasonalPricing[], 
  setSeasonalPricing: Dispatch<SetStateAction<SeasonalPricing[]>>
) => {
  const has2025Season = seasonalPricing.some(season => season.year === 2025);
  
  if (!has2025Season) {
    // Create predefined pricing data for 2025 season based on the provided table
    const prices2025: WeeklyPrice[] = [];
    
    // Define price tiers for each apartment and period
    const pricingData = [
      // June
      { start: "2025-06-07", end: "2025-06-13", prices: { "apt-1": 400, "apt-2": 500, "apt-3": 350, "apt-4": 375 } },
      { start: "2025-06-14", end: "2025-06-20", prices: { "apt-1": 400, "apt-2": 500, "apt-3": 350, "apt-4": 375 } },
      { start: "2025-06-21", end: "2025-06-27", prices: { "apt-1": 400, "apt-2": 500, "apt-3": 350, "apt-4": 375 } },
      { start: "2025-06-28", end: "2025-07-04", prices: { "apt-1": 400, "apt-2": 500, "apt-3": 350, "apt-4": 375 } },
      
      // July
      { start: "2025-07-05", end: "2025-07-11", prices: { "apt-1": 475, "apt-2": 575, "apt-3": 425, "apt-4": 450 } },
      { start: "2025-07-12", end: "2025-07-18", prices: { "apt-1": 475, "apt-2": 575, "apt-3": 425, "apt-4": 450 } },
      { start: "2025-07-19", end: "2025-07-25", prices: { "apt-1": 475, "apt-2": 575, "apt-3": 425, "apt-4": 450 } },
      { start: "2025-07-26", end: "2025-08-01", prices: { "apt-1": 750, "apt-2": 850, "apt-3": 665, "apt-4": 700 } },
      
      // August
      { start: "2025-08-02", end: "2025-08-08", prices: { "apt-1": 750, "apt-2": 850, "apt-3": 665, "apt-4": 700 } },
      { start: "2025-08-09", end: "2025-08-15", prices: { "apt-1": 1150, "apt-2": 1250, "apt-3": 1075, "apt-4": 1100 } },
      { start: "2025-08-16", end: "2025-08-22", prices: { "apt-1": 1150, "apt-2": 1250, "apt-3": 1075, "apt-4": 1100 } },
      { start: "2025-08-23", end: "2025-08-29", prices: { "apt-1": 750, "apt-2": 850, "apt-3": 675, "apt-4": 700 } },
      { start: "2025-08-30", end: "2025-09-05", prices: { "apt-1": 750, "apt-2": 850, "apt-3": 675, "apt-4": 700 } },
      
      // September
      { start: "2025-09-06", end: "2025-09-12", prices: { "apt-1": 500, "apt-2": 600, "apt-3": 425, "apt-4": 450 } },
      { start: "2025-09-13", end: "2025-09-19", prices: { "apt-1": 500, "apt-2": 600, "apt-3": 425, "apt-4": 450 } },
      { start: "2025-09-20", end: "2025-09-26", prices: { "apt-1": 500, "apt-2": 600, "apt-3": 425, "apt-4": 450 } },
    ];

    // Create price entries for each apartment and time period
    pricingData.forEach(period => {
      // For each apartment ID
      Object.entries(period.prices).forEach(([aptId, price]) => {
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);
        
        prices2025.push({
          apartmentId: aptId,
          weekStart: startDate.toISOString(),
          weekEnd: endDate.toISOString(),
          price: price
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
    
    // Save to localStorage immediately
    const updatedPricing = [...seasonalPricing, { year: 2025, prices: prices2025 }];
    localStorage.setItem("seasonalPricing", JSON.stringify(updatedPricing));
    console.log("2025 seasonal prices initialized with custom values");
  }
};
