
import { format, differenceInDays } from "date-fns";

// Get weekly price for a specific apartment and date
export const getWeeklyPriceForDate = (
  apartmentId: string, 
  date: Date, 
  prices: any[]
): number => {
  if (!prices || prices.length === 0) {
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
  
  return price ? price.price : 0;
};

// Calculate number of nights between two dates
export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  return differenceInDays(checkOut, checkIn);
};

// Format date to string
export const formatDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy");
};

// Check if a date is in high season (June-September)
export const isHighSeason = (date: Date): boolean => {
  const month = date.getMonth();
  // June (5) to September (8)
  return month >= 5 && month <= 8;
};
