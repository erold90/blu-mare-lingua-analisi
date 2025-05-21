
import { addDays, startOfWeek, differenceInDays, format } from "date-fns";
import { it } from "date-fns/locale";

// Calculate the number of nights between two dates
export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  return differenceInDays(checkOut, checkIn);
};

// Format a date to a string (dd/mm/yyyy)
export const formatDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy", { locale: it });
};

// Get weeks for a specific year (always Saturday to Saturday)
export const getWeeksForYear = (year: number): { start: Date; end: Date }[] => {
  const weeks: { start: Date; end: Date }[] = [];
  
  // Start from the first Saturday of the year
  let currentDate = new Date(year, 0, 1); // Jan 1st
  
  // Find the first Saturday
  while (currentDate.getDay() !== 6) { // 6 = Saturday
    currentDate = addDays(currentDate, 1);
  }
  
  // Generate weeks until the end of the year
  while (currentDate.getFullYear() === year) {
    const weekStart = new Date(currentDate);
    const weekEnd = addDays(currentDate, 6); // End on Friday
    
    weeks.push({
      start: weekStart,
      end: weekEnd
    });
    
    // Next Saturday
    currentDate = addDays(currentDate, 7);
  }
  
  return weeks;
};

// Get the weekly price for a specific date
export const getWeeklyPriceForDate = (
  apartmentId: string,
  date: Date,
  storedPrices: any[]
): number => {
  try {
    // Get the year of the date
    const year = date.getFullYear();
    
    // Find the weekly prices for this year
    const yearPricing = storedPrices.find((pricing) => pricing.year === year);
    if (!yearPricing) return 0;
    
    // Get the week start date (Saturday) for the given date
    let weekStart = startOfWeek(date, { weekStartsOn: 6 });
    
    // Format the date for comparison (YYYY-MM-DD)
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    // Find the price for this apartment and week start date
    const price = yearPricing.prices.find(
      (p: any) => p.apartmentId === apartmentId && p.weekStart.split('T')[0] === weekStartStr
    );
    
    return price ? price.price : 0;
  } catch (error) {
    console.error("Error getting weekly price for date:", error);
    return 0;
  }
};
