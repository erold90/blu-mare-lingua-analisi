
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "./types";

/**
 * Calculate individual apartment prices with discount
 * Each apartment is discounted separately before summing up
 */
export const calculateMultiApartmentPricing = (
  formValues: FormValues,
  selectedApartments: Apartment[],
  apartmentPrices: Record<string, number>,
  basePrice: number,
  totalBeforeDiscount: number
): {
  totalAfterDiscount: number;
  discount: number;
  discountedApartmentPrices: Record<string, number>;
  deposit: number;
} => {
  // Calculate discounted price for each apartment individually
  let sumOfDiscountedApartmentPrices = 0;
  const discountedApartmentPrices: Record<string, number> = {};

  selectedApartments.forEach(apartment => {
    const baseApartmentPrice = apartmentPrices[apartment.id] || 0;
    
    // Get per-apartment extras (this is a simplified version; may need to be refined)
    const hasPets = formValues.petsInApartment?.[apartment.id] || formValues.hasPets;
    const petCost = hasPets ? 50 : 0;
    
    // Count people for this apartment
    const peopleCount = formValues.personsPerApartment?.[apartment.id] || 
                       ((formValues.adults || 0) + (formValues.children || 0));
                       
    // Calculate linen cost for this apartment
    const linenCost = formValues.linenOption === "extra" ? peopleCount * 15 : 0;
    
    // Calculate apartment subtotal with extras
    const apartmentSubtotal = baseApartmentPrice + linenCost + petCost;
    
    // Round down to nearest 50€ for this apartment
    const discountedPrice = Math.floor(apartmentSubtotal / 50) * 50;
    
    // Save the discounted price
    discountedApartmentPrices[apartment.id] = discountedPrice;
    sumOfDiscountedApartmentPrices += discountedPrice;
    
    console.log(`Apartment ${apartment.id} subtotal: ${apartmentSubtotal}€, discounted: ${discountedPrice}€`);
  });
  
  // The final price is the sum of individually discounted apartment prices
  const totalAfterDiscount = sumOfDiscountedApartmentPrices;
  const discount = totalBeforeDiscount - totalAfterDiscount;
  
  console.log(`Sum of discounted apartment prices: ${sumOfDiscountedApartmentPrices}€`);
  console.log(`Total discount: ${discount}€`);
  
  // Calculate deposit based on total after discount (rounded to nearest 100€)
  const deposit = Math.min(
    Math.round(totalAfterDiscount * 0.3 / 100) * 100,
    Math.round(totalAfterDiscount * 0.35 / 100) * 100
  );

  return {
    totalAfterDiscount,
    discount,
    discountedApartmentPrices,
    deposit
  };
};
