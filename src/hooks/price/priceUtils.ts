
import { isWithinInterval } from "date-fns";
import { WeeklyPrice, SeasonalPricing } from "./types";
import { apartments } from "@/data/apartments";

// Helper to generate weeks for a given season
export const generateWeeksForSeason = (year: number, startMonth: number, endMonth: number) => {
  // Create array to hold all weeks
  const weeks: { start: Date, end: Date }[] = [];
  
  // Start from first Saturday of June
  let currentDate = new Date(year, startMonth - 1, 1); // June 1st (months are 0-indexed)
  while (currentDate.getDay() !== 6) { // 6 is Saturday
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }
  
  console.log(`Primo sabato di ${startMonth}/${year}: ${currentDate.toLocaleDateString()}`);
  
  // Generate weeks until the end of September
  while (currentDate.getMonth() < endMonth) {
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Friday)
    
    weeks.push({
      start: new Date(currentDate),
      end: weekEnd
    });
    
    // Debug logging
    if (weeks.length <= 3 || weeks.length >= 15) {
      console.log(`Week ${weeks.length}: ${currentDate.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);
    }
    
    // Move to next Saturday
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  console.log(`Generato ${weeks.length} settimane per la stagione ${year}`);
  return weeks;
};

// Generate default prices for a year
export function generateDefaultPricesForYear(year: number): WeeklyPrice[] {
  const weeks = generateWeeksForSeason(year, 6, 9); // June (6) to September (8)
  const allPrices: WeeklyPrice[] = [];
  
  apartments.forEach(apartment => {
    weeks.forEach(week => {
      allPrices.push({
        apartmentId: apartment.id,
        weekStart: week.start.toISOString(),
        weekEnd: week.end.toISOString(),
        price: 0 // Default to 0 price
      });
    });
  });
  
  return allPrices;
}

// Get price for a specific date and apartment
export const getPriceForDate = (apartmentId: string, date: Date, seasonalPricing: SeasonalPricing[]): number => {
  // Find the apartment to get default price
  const apartment = apartments.find(apt => apt.id === apartmentId);
  if (!apartment) return 0;
  
  const year = date.getFullYear();
  
  // Find the season for this year
  const season = seasonalPricing.find(s => s.year === year);
  if (!season) return 0; // Return default price if no seasonal pricing
  
  // Find the week containing this date
  const weekPrice = season.prices.find(price => {
    if (price.apartmentId !== apartmentId) return false;
    
    const weekStart = new Date(price.weekStart);
    const weekEnd = new Date(price.weekEnd);
    
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  });
  
  // Return weekly price if found, otherwise default price
  return weekPrice ? weekPrice.price : 0;
};

// Get or create season for current year
export const getCurrentOrCreateSeason = (
  seasonalPricing: SeasonalPricing[], 
  setSeasonalPricing: React.Dispatch<React.SetStateAction<SeasonalPricing[]>>,
  setWeeklyPrices: React.Dispatch<React.SetStateAction<WeeklyPrice[]>>
): SeasonalPricing => {
  const currentYear = 2025; // forziamo a 2025
  const currentSeason = seasonalPricing.find(season => season.year === currentYear);
  
  if (!currentSeason) {
    // Create a new season for the current year
    const newSeason = {
      year: currentYear,
      prices: generateDefaultPricesForYear(currentYear)
    };
    
    console.log(`Creata nuova stagione per il ${currentYear} con ${newSeason.prices.length} prezzi`);
    
    // Update seasonal pricing
    const updatedPricing = [...seasonalPricing, newSeason];
    setSeasonalPricing(updatedPricing);
    setWeeklyPrices(newSeason.prices);
    
    // Save to localStorage
    localStorage.setItem("seasonalPricing", JSON.stringify(updatedPricing));
    
    return newSeason;
  }
  
  return currentSeason;
};
