
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateBasePrice } from "./basePrice";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateNights } from "./dateUtils";

// Get the storage key for prices
const STORAGE_KEY = "apartmentPrices";

// Helper to get price for a week
const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
  try {
    // Get prices from storage
    const savedPrices = localStorage.getItem(STORAGE_KEY);
    if (!savedPrices) return 0;
    
    // Parse stored prices
    const allPrices = JSON.parse(savedPrices);
    const year = weekStart.getFullYear();
    
    // Get prices for the year
    const yearPrices = allPrices[year];
    if (!yearPrices) return 0;
    
    // Format the date for comparison (YYYY-MM-DD)
    const searchDate = new Date(weekStart);
    searchDate.setHours(0, 0, 0, 0);
    const searchDateStr = searchDate.toISOString().split('T')[0];
    
    // Find matching price
    const price = yearPrices.find((p: any) => {
      const priceDateStr = new Date(p.weekStart).toISOString().split('T')[0];
      return p.apartmentId === apartmentId && priceDateStr === searchDateStr;
    });
    
    return price ? price.price : 0;
  } catch (error) {
    console.error("Error getting price for date:", error);
    return 0;
  }
};

// Calculate total price with all components
export function calculateTotalPrice(formValues: FormValues, apartments: Apartment[]): PriceCalculation {
  console.log("Starting price calculation...");
  
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    return emptyPriceCalculation;
  }
  
  // Calculate the number of nights
  const nights = calculateNights(formValues.checkIn, formValues.checkOut);
  
  // Calculate base price based on our saved weekly prices
  let basePrice = 0;
  
  // For each apartment, get the weekly price for the check-in date
  selectedApartments.forEach(apartment => {
    const weekPrice = getPriceForWeek(apartment.id, new Date(formValues.checkIn));
    basePrice += weekPrice;
  });
  
  // If no weekly price was found, fall back to the standard calculation
  if (basePrice === 0) {
    basePrice = calculateBasePrice(formValues, selectedApartments, nights);
  }
  
  // Calculate extras (cleaning fee, linen, pets, tourist tax)
  const { extrasCost, cleaningFee, touristTax } = calculateExtras(formValues, selectedApartments, nights);
  
  // Calculate subtotal (before tourist tax)
  const subtotal = basePrice + extrasCost + cleaningFee;
  
  // Calculate total before discount (including tourist tax)
  const totalBeforeDiscount = subtotal + touristTax;
  
  // Calculate discount and final price
  const { totalAfterDiscount, discount, savings, deposit } = calculateDiscount(totalBeforeDiscount, touristTax);
  
  return {
    basePrice,
    extras: extrasCost,
    cleaningFee,
    touristTax,
    totalBeforeDiscount,
    totalAfterDiscount,
    discount,
    savings: discount,
    deposit,
    nights,
    totalPrice: totalAfterDiscount,
    subtotal
  };
}
