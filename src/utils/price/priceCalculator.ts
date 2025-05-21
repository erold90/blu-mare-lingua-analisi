
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateBasePrice } from "./basePrice";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateNights, getWeeklyPriceForDate } from "./dateUtils";
import { usePrices } from "@/hooks/usePrices";

/**
 * Gets the weekly price for an apartment on a specific date
 * using the configured prices in the admin area
 */
const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
  try {
    // Get prices from storage
    const savedPrices = localStorage.getItem("seasonalPricing");
    if (!savedPrices) return 0;
    
    // Parse stored prices
    const allPrices = JSON.parse(savedPrices);
    const year = weekStart.getFullYear();
    
    // Get prices for the year
    const yearData = allPrices.find((season: any) => season.year === year);
    if (!yearData) return 0;
    
    // Format the date for comparison (YYYY-MM-DD)
    const searchDate = new Date(weekStart);
    searchDate.setHours(0, 0, 0, 0);
    const searchDateStr = searchDate.toISOString().split('T')[0];
    
    console.log(`Looking for price: apartmentId=${apartmentId}, date=${searchDateStr}, year=${year}`);
    
    // Find matching price by finding the closest weekly start date
    // We need to loop through all prices and find the one with the closest start date
    // that is not after our search date
    let bestMatch = null;
    let bestMatchDiff = Infinity;
    
    for (const p of yearData.prices) {
      if (p.apartmentId === apartmentId) {
        const priceDate = new Date(p.weekStart);
        priceDate.setHours(0, 0, 0, 0);
        
        // Check if this price date is before or equal to our search date
        const diff = searchDate.getTime() - priceDate.getTime();
        if (diff >= 0 && diff < bestMatchDiff && diff < 7 * 24 * 60 * 60 * 1000) {
          bestMatch = p;
          bestMatchDiff = diff;
        }
      }
    }
    
    if (bestMatch) {
      console.log(`Found best match price for ${apartmentId}: ${bestMatch.price}€`);
      return bestMatch.price;
    }
    
    console.log(`No price found for ${apartmentId} on ${searchDateStr}`);
    return 0;
  } catch (error) {
    console.error("Error getting price for date:", error);
    return 0;
  }
};

/**
 * Calculates total prices for each apartment and overall price
 */
export function calculateTotalPrice(formValues: FormValues, apartments: Apartment[]): PriceCalculation {
  console.log("Starting price calculation...");
  
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    return emptyPriceCalculation;
  }
  
  // Calculate the number of nights
  const nights = calculateNights(formValues.checkIn, formValues.checkOut);
  console.log(`Stay duration: ${nights} nights`);
  
  // Track individual apartment prices
  const apartmentPrices: Record<string, number> = {};
  let basePrice = 0;
  
  // For each apartment, get the weekly price for the check-in date
  selectedApartments.forEach(apartment => {
    // Try to get the weekly price from the pricing system
    let weekPrice = 0;
    
    if (formValues.checkIn) {
      weekPrice = getPriceForWeek(apartment.id, new Date(formValues.checkIn));
      console.log(`Found weekly price for ${apartment.id}: ${weekPrice}€`);
    }
    
    if (weekPrice > 0) {
      apartmentPrices[apartment.id] = weekPrice;
      basePrice += weekPrice;
    } else {
      // Fallback to base price from apartment data if weekly price not found
      apartmentPrices[apartment.id] = apartment.price || 0;
      basePrice += apartment.price || 0;
      console.log(`Using fallback price for ${apartment.id}: ${apartment.price}€`);
    }
  });
  
  console.log(`Total base price: ${basePrice}€`);
  
  // Calculate extras (cleaning fee, linen, pets, tourist tax)
  const { extrasCost, cleaningFee, touristTax } = calculateExtras(formValues, selectedApartments, nights);
  console.log(`Extras: ${extrasCost}€, Cleaning: ${cleaningFee}€, Tax: ${touristTax}€`);
  
  // Calculate subtotal (before tourist tax)
  const subtotal = basePrice + extrasCost + cleaningFee;
  console.log(`Subtotal: ${subtotal}€`);
  
  // Calculate total before discount (including tourist tax)
  const totalBeforeDiscount = subtotal + touristTax;
  console.log(`Total before discount: ${totalBeforeDiscount}€`);
  
  // Calculate discount and final price
  const { totalAfterDiscount, discount, savings, deposit } = calculateDiscount(totalBeforeDiscount, touristTax);
  console.log(`After discount: ${totalAfterDiscount}€, Savings: ${savings}€`);
  
  return {
    basePrice,
    extras: extrasCost,
    cleaningFee,
    touristTax,
    totalBeforeDiscount,
    totalAfterDiscount,
    discount,
    savings,
    deposit,
    nights,
    totalPrice: totalAfterDiscount,
    subtotal,
    apartmentPrices // Add individual apartment prices
  };
}
