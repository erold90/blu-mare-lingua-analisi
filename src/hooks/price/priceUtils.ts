
import { WeeklyPrice } from "./types";
import { format } from "date-fns";

// Get weekly price for a specific apartment and date
export const getWeeklyPriceForDate = (
  apartmentId: string, 
  date: Date, 
  prices: WeeklyPrice[]
): number => {
  console.log(`Looking up price for apartment ${apartmentId} on ${format(date, 'yyyy-MM-dd')}`);
  
  if (!prices || prices.length === 0) {
    console.log("No prices available");
    return 0;
  }
  
  // Format the date for comparison (YYYY-MM-DD)
  const searchDate = new Date(date);
  searchDate.setHours(0, 0, 0, 0);
  const searchDateStr = searchDate.toISOString().split('T')[0];
  
  // Find matching price
  const price = prices.find((p) => {
    const priceDate = new Date(p.weekStart);
    priceDate.setHours(0, 0, 0, 0);
    const priceDateStr = priceDate.toISOString().split('T')[0];
    
    return p.apartmentId === apartmentId && priceDateStr === searchDateStr;
  });
  
  if (price) {
    console.log(`Found price for ${apartmentId} on ${searchDateStr}: ${price.price}€`);
    return price.price;
  } else {
    console.log(`No price found for ${apartmentId} on ${searchDateStr}`);
    return 0;
  }
};

// Calculate weeks between dates
export const getWeeksForYear = (year: number): { start: Date; end: Date }[] => {
  const weeks: { start: Date; end: Date }[] = [];
  
  // Start from first Saturday of June
  const firstDay = new Date(year, 5, 1); // June 1st
  const dayOfWeek = firstDay.getDay();
  const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
  
  const firstSaturday = new Date(firstDay);
  firstSaturday.setDate(firstSaturday.getDate() + daysUntilSaturday);
  
  // End at last week of September
  const lastDay = new Date(year, 9, 0); // Last day of September
  
  let currentWeekStart = new Date(firstSaturday);
  
  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // End date is 6 days after start
    
    weeks.push({
      start: new Date(currentWeekStart),
      end: new Date(weekEnd)
    });
    
    // Move to next week
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return weeks;
};

// Format date to Italian style
export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

// Calculate number of nights between two dates
export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if a date falls within high season (June-September)
export const isHighSeason = (date: Date): boolean => {
  const month = date.getMonth();
  return month >= 5 && month <= 8; // June (5) to September (8)
};

