
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
  
  // Calculate number of complete weeks (rounding up)
  const numberOfWeeks = Math.ceil(nights / 7);
  console.log(`Number of complete weeks: ${numberOfWeeks}`);
  
  // For each selected apartment
  selectedApartments.forEach(apartment => {
    let totalApartmentPrice = 0;
    
    // For each week of stay, get the corresponding price
    for (let week = 0; week < numberOfWeeks; week++) {
      // Calculate the start date for this week
      const weekStartDate = new Date(formValues.checkIn);
      weekStartDate.setDate(weekStartDate.getDate() + (week * 7));
      
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
  
  // Calculate total before discount (ONLY base price + extras, NOT cleaning fee or tourist tax)
  const totalBeforeDiscount = subtotal;
  console.log(`Total before discount: ${totalBeforeDiscount}€`);
  
  // Calculate discount and final price (based on subtotal only, not including cleaning fee or tourist tax)
  const { totalAfterDiscount, discount, savings, deposit } = calculateDiscount(totalBeforeDiscount, touristTax);
  console.log(`After discount: ${totalAfterDiscount}€, Savings: ${savings}€`);
  
  // Define tourist tax per person (default: 2.0 euros)
  const touristTaxPerPerson = 2.0;
  
  return {
    basePrice,
    extras: extrasCost,
    cleaningFee,
    touristTax,
    touristTaxPerPerson,
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
