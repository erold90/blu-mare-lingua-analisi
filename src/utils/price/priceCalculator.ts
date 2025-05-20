
// Main price calculation logic
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateNights, isHighSeason } from "./dateUtils";
import { getSeasonalPrices, getWeeklyPrice } from "./seasonalPricing";
import { calculateLinenCost, calculatePetsCost, calculateCleaningFee, calculateTouristTax } from "./extrasCosts";

// Calculate the base price for all selected apartments
function calculateBasePrice(
  formValues: FormValues, 
  selectedApartments: Apartment[],
  nights: number
): number {
  let basePrice = 0;
  const checkIn = formValues.checkIn;
  
  if (!checkIn) return 0;
  
  // Check if we should use weekly pricing
  const useWeeklyPrice = isHighSeason(checkIn);
  const year = checkIn.getFullYear();
  const seasonalPrices = getSeasonalPrices(year);
  
  selectedApartments.forEach(apartment => {
    if (useWeeklyPrice) {
      // Get the weekly price based on season
      basePrice += getWeeklyPrice(apartment, checkIn, seasonalPrices);
    } else {
      // Regular nightly pricing
      basePrice += (apartment.price * nights);
    }
  });
  
  return basePrice;
}

// Calculate total price with all components
export function calculateTotalPrice(formValues: FormValues, apartments: Apartment[]): PriceCalculation {
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    return emptyPriceCalculation;
  }
  
  // Calculate the number of nights
  const nights = calculateNights(formValues.checkIn, formValues.checkOut);
  
  // Calculate the base price for all apartments
  const basePrice = calculateBasePrice(formValues, selectedApartments, nights);
  
  // Calculate extra costs
  const extrasCost = calculateLinenCost(formValues) + calculatePetsCost(formValues);
  
  // Calculate cleaning fee
  const cleaningFee = calculateCleaningFee(selectedApartments);
  
  // Calculate subtotal (before tourist tax)
  const subtotal = basePrice + extrasCost + cleaningFee;
  
  // Calculate tourist tax
  const touristTax = calculateTouristTax(formValues, nights);
  
  // Calculate total before discount (including tourist tax)
  const totalBeforeDiscount = subtotal + touristTax;
  
  // Round down to the nearest 50€
  const roundedPrice = Math.floor(totalBeforeDiscount / 50) * 50;
  
  // Calculate the discount amount (difference between original total and rounded total)
  const discount = totalBeforeDiscount - roundedPrice;
  
  // The savings should include both the rounding discount and the tourist tax (since it's "included")
  const savings = discount + touristTax;
  
  // Calculate deposit (30%)
  const deposit = Math.ceil(roundedPrice * 0.3);
  
  return {
    basePrice,
    extras: extrasCost,
    cleaningFee,
    touristTax,
    totalBeforeDiscount,
    totalAfterDiscount: roundedPrice,
    discount,
    savings, // Now correctly includes both the rounding discount and tourist tax
    deposit,
    nights,
    totalPrice: roundedPrice,
    subtotal
  };
}
