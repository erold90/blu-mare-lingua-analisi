
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateBasePrice } from "./basePrice";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateNights } from "./dateUtils";
import { getPriceForWeek } from "./weeklyPrice";
import { calculateMultiApartmentPricing } from "./multiApartmentPricing";

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

  // Handle pricing logic based on number of apartments
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
    
    // Return the calculation result with the corrected total
    return {
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
      totalPrice: totalAfterDiscount, // Make sure totalPrice matches totalAfterDiscount
      subtotal,
      apartmentPrices: discountedApartmentPrices // Use discounted prices per apartment
    };
  } else {
    // For single apartment, use the standard discount calculation
    const { totalAfterDiscount, discount, savings, deposit } = calculateDiscount(totalBeforeDiscount, touristTax);
    
    console.log(`Single apartment - After discount: ${totalAfterDiscount}€, Savings: ${savings}€`);
    
    // Return the calculation result for a single apartment
    return {
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
}
