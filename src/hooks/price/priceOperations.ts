
import { Dispatch, SetStateAction } from "react";
import { WeeklyPrice, SeasonalPricing } from "./types";

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
  console.log(`Updating price for ${apartmentId} on ${weekStart} to ${price}€`);
  
  const currentYear = new Date(weekStart).getFullYear();
  
  // Create a copy of the current pricing to work with
  let updatedPricing = [...seasonalPricing];
  
  // Find or create the year pricing
  let yearIndex = updatedPricing.findIndex(season => season.year === currentYear);
  
  if (yearIndex === -1) {
    // Year not found, create new year entry
    console.log(`Creating new pricing for year ${currentYear}`);
    const newYearPricing = {
      year: currentYear,
      prices: []
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
    console.log(`Updated existing price: ${apartmentId}, ${weekStart}, ${price}€`);
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
    console.log(`Added new price: ${apartmentId}, ${weekStart}, ${price}€`);
  }
  
  // Save to state
  setSeasonalPricing(updatedPricing);
  
  // Save to localStorage immediately
  localStorage.setItem("seasonalPricing", JSON.stringify(updatedPricing));
  
  // Also update weekly prices if they're for the current year
  const currentYearPrices = updatedPricing[yearIndex].prices;
  setWeeklyPrices(currentYearPrices);
  
  console.log(`Weekly prices updated, now has ${currentYearPrices.length} entries`);
};

/**
 * Reset all price data (debug only)
 */
export const resetAllPrices = () => {
  console.log("Resetting all prices data");
  localStorage.removeItem("seasonalPricing");
};

/**
 * Force initialization of prices with predefined values
 */
export const forceInitializePrices = (
  setSeasonalPricing: Dispatch<SetStateAction<SeasonalPricing[]>>
) => {
  console.log("Forcing price initialization with predefined values");
  localStorage.removeItem("seasonalPricing");
  
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
  
  console.log(`Created ${prices2025.length} custom prices for 2025`);
  
  // Update state with new prices
  const initialPricing = [{ year: 2025, prices: prices2025 }];
  setSeasonalPricing(initialPricing);
  
  // Save to localStorage immediately
  localStorage.setItem("seasonalPricing", JSON.stringify(initialPricing));
  console.log("2025 seasonal prices saved to localStorage");
  
  return prices2025;
};

/**
 * Initialize year pricing - no longer used directly, keep for compatibility
 */
export const initializeYearPricing = (
  seasonalPricing: SeasonalPricing[], 
  setSeasonalPricing: Dispatch<SetStateAction<SeasonalPricing[]>>
) => {
  // This function is replaced by forceInitializePrices
  return forceInitializePrices(setSeasonalPricing);
};
