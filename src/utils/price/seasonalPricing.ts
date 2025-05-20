
// Logic for handling seasonal pricing
import { Apartment } from "@/data/apartments";

interface SeasonalPrice {
  apartmentId: string;
  weekStart: string;
  weekEnd: string;
  price: number;
}

interface YearPricing {
  year: number;
  prices: SeasonalPrice[];
}

// Get seasonal prices from localStorage for a specific year
export function getSeasonalPrices(year: number): SeasonalPrice[] {
  try {
    const savedPricing = localStorage.getItem("seasonalPricing");
    if (savedPricing) {
      const allPricing = JSON.parse(savedPricing);
      const yearPricing = allPricing.find((season: YearPricing) => season.year === year);
      if (yearPricing) {
        return yearPricing.prices;
      }
    }
  } catch (error) {
    console.error("Failed to parse seasonal pricing:", error);
  }
  return [];
}

// Get the weekly price for an apartment based on season
export function getWeeklyPrice(apartment: Apartment, checkInDate: Date, seasonalPrices: SeasonalPrice[]): number {
  // Default weekly price (use apartment's base price * 7)
  let weeklyPrice = apartment.price * 7;
  
  // Format check-in date to compare with seasonal prices
  const checkInStr = checkInDate.toISOString().split('T')[0];
  console.log(`Looking for seasonal price for ${apartment.id} on date ${checkInStr}`);
  
  // Look for a matching seasonal price
  const seasonalPrice = seasonalPrices.find(p => {
    // Compare apartment ID first
    if (p.apartmentId !== apartment.id) return false;
    
    // Then check if the check-in date falls within the week range
    const weekStartDate = new Date(p.weekStart);
    const weekEndDate = new Date(p.weekEnd);
    const checkIn = new Date(checkInDate);
    
    // Remove time component for accurate date comparison
    weekStartDate.setHours(0, 0, 0, 0);
    weekEndDate.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    
    const isInRange = checkIn >= weekStartDate && checkIn <= weekEndDate;
    console.log(`Week ${p.weekStart} to ${p.weekEnd}: ${isInRange ? 'MATCH' : 'no match'}`);
    return isInRange;
  });
  
  if (seasonalPrice) {
    // Use the seasonal price if found
    weeklyPrice = seasonalPrice.price;
    console.log(`Found seasonal price for ${apartment.id}: ${weeklyPrice}€`);
  } else {
    console.log(`No seasonal price found for ${apartment.id}, using default: ${weeklyPrice}€`);
  }
  
  return weeklyPrice;
}
