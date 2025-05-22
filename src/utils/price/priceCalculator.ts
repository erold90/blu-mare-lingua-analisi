
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateBasePrice } from "./basePrice";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateNights } from "./dateUtils";
import { getPriceForWeek } from "./weeklyPrice";
import { calculateMultiApartmentPricing } from "./multiApartmentPricing";

// Memorization cache to avoid recalculating prices for the same inputs
const priceCalculationCache = new Map<string, PriceCalculation>();

/**
 * Generate a cache key for the price calculation
 */
const generateCacheKey = (formValues: FormValues, apartments: Apartment[]): string => {
  // Include only the values that affect the price calculation
  const cacheKeyParts = [
    formValues.checkIn?.toISOString(),
    formValues.checkOut?.toISOString(),
    formValues.selectedApartments?.join(',') || formValues.selectedApartment,
    formValues.adults,
    formValues.children,
    formValues.hasPets ? '1' : '0',
    formValues.linenOption || 'none',
    // Include any other values that affect the price
    JSON.stringify(formValues.personsPerApartment || {}),
    JSON.stringify(formValues.petsInApartment || {})
  ];
  
  return cacheKeyParts.join('|');
};

/**
 * Calculates total prices for each apartment and overall price
 * Uses caching to improve performance for repeated calculations
 */
export function calculateTotalPrice(formValues: FormValues, apartments: Apartment[]): PriceCalculation {
  console.log("Starting price calculation...");
  
  // Check for valid inputs
  const selectedApartmentIds = formValues.selectedApartments || 
    (formValues.selectedApartment ? [formValues.selectedApartment] : []);
    
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    return emptyPriceCalculation;
  }
  
  // Generate a cache key based on inputs
  const cacheKey = generateCacheKey(formValues, selectedApartments);
  
  // Check if we have a cached result
  if (priceCalculationCache.has(cacheKey)) {
    console.log("Using cached price calculation");
    return priceCalculationCache.get(cacheKey)!;
  }
  
  // Calculate the number of nights
  const nights = calculateNights(formValues.checkIn, formValues.checkOut);
  console.log(`Stay duration: ${nights} nights`);
  
  // Track individual apartment prices
  const apartmentPrices: Record<string, number> = {};
  let basePrice = 0;
  
  // Calculate number of complete weeks (rounding up)
  const numberOfWeeks = Math.ceil(nights / 7);
  console.log(`Number of complete weeks: ${numberOfWeeks}`);
  
  // For each selected apartment
  selectedApartments.forEach(apartment => {
    let totalApartmentPrice = 0;
    
    // Optimize: precalculate date values for each week
    const weekStartDates = Array(numberOfWeeks).fill(0).map((_, week) => {
      const weekStartDate = new Date(formValues.checkIn);
      weekStartDate.setDate(weekStartDate.getDate() + (week * 7));
      return weekStartDate;
    });
    
    // For each week of stay, get the corresponding price
    for (let week = 0; week < numberOfWeeks; week++) {
      const weekStartDate = weekStartDates[week];
      
      // Get the price for this week
      const weeklyPrice = getPriceForWeek(apartment.id, weekStartDate);
      console.log(`Week ${week+1} price for ${apartment.id}: ${weeklyPrice}€ (starting on ${weekStartDate.toISOString().split('T')[0]})`);
      
      if (weeklyPrice > 0) {
        totalApartmentPrice += weeklyPrice;
      } else {
        // Use the apartment's default price if no specific price is set
        const defaultPrice = apartment.price || 0;
        console.log(`No specific price found for week ${week+1}, using default price: ${defaultPrice}€`);
        totalApartmentPrice += defaultPrice;
      }
    }
    
    // Save the apartment's total price
    apartmentPrices[apartment.id] = totalApartmentPrice;
    basePrice += totalApartmentPrice;
    
    console.log(`Total price for apartment ${apartment.id} (${numberOfWeeks} weeks): ${totalApartmentPrice}€`);
  });
  
  console.log(`Total base price for all apartments: ${basePrice}€`);
  
  // Calculate extras (linen, pets), cleaning fee and tourist tax
  // IMPORTANT: cleaningFee and touristTax are calculated for display only
  const { extrasCost, cleaningFee, touristTax } = calculateExtras(formValues, selectedApartments, nights);
  console.log(`Extras: ${extrasCost}€, Cleaning: ${cleaningFee}€, Tax: ${touristTax}€`);
  
  // Calculate subtotal (ONLY base price + extras, NOT cleaning fee or tourist tax)
  const subtotal = basePrice + extrasCost;
  console.log(`Subtotal: ${subtotal}€`);
  
  // Calculate total before discount
  const totalBeforeDiscount = subtotal;
  console.log(`Total before discount: ${totalBeforeDiscount}€`);

  // Handle pricing logic based on number of apartments
  let result: PriceCalculation;
  
  if (selectedApartments.length > 1) {
    // For multiple apartments, calculate individual discounts
    const {
      totalAfterDiscount,
      discount,
      discountedApartmentPrices,
      deposit
    } = calculateMultiApartmentPricing(
      formValues,
      selectedApartments,
      apartmentPrices,
      basePrice,
      totalBeforeDiscount
    );
    
    // Create result object
    result = {
      basePrice,
      extras: extrasCost,
      cleaningFee,
      touristTax,
      touristTaxPerPerson: 2.0,
      totalBeforeDiscount,
      totalAfterDiscount,
      discount,
      savings: discount,
      deposit,
      nights,
      totalPrice: totalAfterDiscount,
      subtotal,
      apartmentPrices: discountedApartmentPrices
    };
  } else {
    // For single apartment, use the standard discount calculation
    const { totalAfterDiscount, discount, savings, deposit } = calculateDiscount(totalBeforeDiscount, touristTax);
    
    console.log(`Single apartment - After discount: ${totalAfterDiscount}€, Savings: ${savings}€`);
    
    // Create result object for a single apartment
    result = {
      basePrice,
      extras: extrasCost,
      cleaningFee,
      touristTax,
      touristTaxPerPerson: 2.0,
      totalBeforeDiscount,
      totalAfterDiscount,
      discount,
      savings,
      deposit,
      nights,
      totalPrice: totalAfterDiscount,
      subtotal,
      apartmentPrices
    };
  }
  
  // Cache the result for future calculations
  priceCalculationCache.set(cacheKey, result);
  
  // Limit cache size to prevent memory leaks
  if (priceCalculationCache.size > 100) {
    const oldestKey = priceCalculationCache.keys().next().value;
    priceCalculationCache.delete(oldestKey);
  }
  
  return result;
}

/**
 * Clear price calculation cache
 * Call this when apartment prices are updated
 */
export function clearPriceCalculationCache(): void {
  priceCalculationCache.clear();
  console.log("Price calculation cache cleared");
}
