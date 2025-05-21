
import { Apartment } from "@/data/apartments";

export interface WeeklyPrice {
  apartmentId: string;
  weekStart: string; // ISO date string
  weekEnd?: string; // ISO date string (optional for backward compatibility)
  price: number;
}

export interface SeasonalPricing {
  year: number;
  prices: WeeklyPrice[];
}

export interface PricesContextType {
  prices: WeeklyPrice[];
  isLoading: boolean;
  updatePrice: (apartmentId: string, weekStart: string, price: number) => void;
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  getWeeksForYear: (year: number) => { start: Date; end: Date }[];
  availableYears: number[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  resetPrices: () => void;
}

// Define shared types for pricing calculations
export interface PriceCalculation {
  basePrice: number;
  extras: number;
  cleaningFee: number;
  touristTax: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
  nights: number;
  totalPrice: number;
  subtotal: number;
  apartmentPrices?: Record<string, number>; // Individual apartment prices
}

// Create default empty price calculation object
export const emptyPriceCalculation: PriceCalculation = {
  basePrice: 0, 
  extras: 0,
  cleaningFee: 0,
  touristTax: 0, 
  totalBeforeDiscount: 0, 
  totalAfterDiscount: 0,
  discount: 0,
  savings: 0, 
  deposit: 0, 
  nights: 0,
  totalPrice: 0,
  subtotal: 0,
  apartmentPrices: {}
};
