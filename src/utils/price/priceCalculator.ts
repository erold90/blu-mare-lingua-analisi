
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
  console.log("Starting price calculation...");
  
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  console.log(`Selected apartments: ${selectedApartments.map(apt => apt.name).join(', ')}`);
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    console.log("Missing required data for price calculation");
    return emptyPriceCalculation;
  }
  
  // Calculate the number of nights
  const nights = calculateNights(formValues.checkIn, formValues.checkOut);
  console.log(`Nights: ${nights}`);
  
  // Calculate the base price for all apartments
  const basePrice = calculateBasePrice(formValues, selectedApartments, nights);
  console.log(`Base price: ${basePrice}€`);
  
  // Calculate extras (cleaning fee, linen, pets, tourist tax)
  const { extrasCost, cleaningFee, touristTax } = calculateExtras(formValues, selectedApartments, nights);
  console.log(`Extras cost: ${extrasCost}€, Cleaning fee: ${cleaningFee}€, Tourist tax: ${touristTax}€`);
  
  // Calculate subtotal (before tourist tax)
  const subtotal = basePrice + extrasCost + cleaningFee;
  console.log(`Subtotal (base + extras + cleaning): ${subtotal}€`);
  
  // Calculate total before discount (including tourist tax)
  const totalBeforeDiscount = subtotal + touristTax;
  console.log(`Total before discount (subtotal + tourist tax): ${totalBeforeDiscount}€`);
  
  // Calculate discount and final price
  const { totalAfterDiscount, discount, savings, deposit } = calculateDiscount(totalBeforeDiscount, touristTax);
  console.log(`Total after discount: ${totalAfterDiscount}€`);
  
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
