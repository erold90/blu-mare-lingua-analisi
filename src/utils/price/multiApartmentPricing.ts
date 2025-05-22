
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "./types";

/**
 * Calculate individual apartment prices with discount
 * Each apartment is discounted separately before summing up
 * @param formValues - Form values from the quote form
 * @param selectedApartments - List of selected apartments
 * @param apartmentPrices - Base prices for each apartment
 * @param basePrice - Total base price
 * @param totalBeforeDiscount - Total price before discount
 * @returns Object with pricing details
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
  // Create a map for tracking calculations
  const discountedApartmentPrices: Record<string, number> = {};
  let sumOfDiscountedApartmentPrices = 0;

  // Process each apartment separately
  selectedApartments.forEach(apartment => {
    const baseApartmentPrice = apartmentPrices[apartment.id] || 0;
    
    // Determine if this apartment has pets
    const hasPets = formValues.petsInApartment?.[apartment.id] || 
                   (formValues.hasPets && selectedApartments.length === 1);
    const petCost = hasPets ? 50 : 0;
    
    // Calculate people count for this apartment
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
  
  console.log(`Sum of discounted apartment prices: ${totalAfterDiscount}€`);
  console.log(`Total discount: ${discount}€`);
  
  // Calculate deposit (30-35% of total, rounded to nearest 100€)
  const deposit = calculateOptimalDeposit(totalAfterDiscount);

  return {
    totalAfterDiscount,
    discount,
    discountedApartmentPrices,
    deposit
  };
};

/**
 * Calculate optimal deposit amount between 30-35% of total, rounded to nearest 100€
 * @param total - Total price after discount
 * @returns Deposit amount
 */
function calculateOptimalDeposit(total: number): number {
  return Math.min(
    Math.round(total * 0.3 / 100) * 100,
    Math.round(total * 0.35 / 100) * 100
  );
}
