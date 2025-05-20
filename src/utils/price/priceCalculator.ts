
// Main price calculation logic
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateBasePrice } from "./basePrice";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateNights } from "./dateUtils";

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
    savings,
    deposit,
    nights,
    totalPrice: totalAfterDiscount,
    subtotal
  };
}
