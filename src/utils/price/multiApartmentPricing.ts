
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
    const linenCost = formValues.needsLinen ? peopleCount * 15 : 0;
    
    // Calculate apartment subtotal with extras
    const apartmentSubtotal = baseApartmentPrice;
    
    // Save the discounted price - don't apply rounding here
    discountedApartmentPrices[apartment.id] = apartmentSubtotal;
    sumOfDiscountedApartmentPrices += apartmentSubtotal;
    
    console.log(`Apartment ${apartment.id} subtotal: ${apartmentSubtotal}€`);
  });
  
  // The total of the apartment prices without extras
  const totalApartmentPrices = sumOfDiscountedApartmentPrices;
  
  // Calculate extras separately - don't include them in the apartment prices
  let totalExtras = 0;
  
  // Calculate total pets cost
  if (formValues.hasPets) {
    if (selectedApartments.length === 1) {
      totalExtras += 50; // Single apartment with pets
    } else if (formValues.petsInApartment) {
      // Count apartments with pets
      const apartmentsWithPets = Object.values(formValues.petsInApartment).filter(Boolean).length;
      totalExtras += apartmentsWithPets * 50;
    }
  }
  
  // Calculate total linen cost
  if (formValues.needsLinen) {
    const totalPeople = formValues.adults + (formValues.children || 0);
    totalExtras += totalPeople * 15;
  }
  
  // Round the final total price to the nearest 50€ down
  const totalBeforeRounding = totalApartmentPrices + totalExtras;
  const totalAfterDiscount = Math.floor(totalBeforeRounding / 50) * 50;
  const discount = totalBeforeRounding - totalAfterDiscount;
  
  console.log(`Base apartment prices: ${totalApartmentPrices}€`);
  console.log(`Total extras: ${totalExtras}€`);
  console.log(`Total before rounding: ${totalBeforeRounding}€`);
  console.log(`Total after discount: ${totalAfterDiscount}€`);
  console.log(`Discount: ${discount}€`);
  
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
