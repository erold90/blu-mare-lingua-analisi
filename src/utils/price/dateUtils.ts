
// Helper functions for date formatting and calculations
import { format } from "date-fns";

// Format date to the Italian format DD/MM/YYYY
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Calculate the number of nights between two dates
export function calculateNights(checkIn: Date, checkOut: Date): number {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

// Check if a date is in high season (June-September)
export function isHighSeason(date: Date): boolean {
  const month = date.getMonth(); // 0-indexed, 5 = June, 8 = September
  return month >= 5 && month <= 8;
}

// Check if a date is a Saturday
export function isSaturday(date: Date): boolean {
  return date.getDay() === 6; // 6 is Saturday
}
