
// Types related to pricing functionality
import { Apartment } from "@/data/apartments";

export interface WeeklyPrice {
  apartmentId: string;
  weekStart: string; // ISO date string of the week start (always Saturday)
  weekEnd: string;   // ISO date string of the week end (always Friday)
  price: number;
}

export interface SeasonalPricing {
  year: number;
  prices: WeeklyPrice[];
}

export interface PricesContextType {
  seasonalPricing: SeasonalPricing[];
  weeklyPrices: WeeklyPrice[];
  updateWeeklyPrice: (apartmentId: string, weekStart: string, price: number) => void;
  getPriceForDate: (apartmentId: string, date: Date) => number;
  generateWeeksForSeason: (year: number, startMonth: number, endMonth: number) => { start: Date, end: Date }[];
  getCurrentSeason: () => SeasonalPricing;
  __DEBUG_reset?: () => void; // Added debug reset function as optional
}
