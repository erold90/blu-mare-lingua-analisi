
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";

/**
 * Calculate the base price of the stay based on apartment values
 * This is a fallback function used when we don't have weekly prices
 */
export const calculateBasePrice = (
  formValues: FormValues, 
  selectedApartments: Apartment[],
  nights: number
): number => {
  let totalBasePrice = 0;
  
  selectedApartments.forEach(apartment => {
    // Calculate per-apartment price
    const apartmentBasePrice = apartment.price * nights;
    totalBasePrice += apartmentBasePrice;
    
    console.log(`Base price for ${apartment.name}: ${apartmentBasePrice}€ (${apartment.price}€ × ${nights} nights)`);
  });
  
  console.log(`Total base price for all apartments: ${totalBasePrice}€`);
  return totalBasePrice;
};
