
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface ExtrasResult {
  extrasCost: number;
  cleaningFee: number;
  touristTax: number;
}

// Calculate extras costs (linen, pets, cleaning fee, tourist tax)
export const calculateExtras = (
  formValues: FormValues, 
  selectedApartments: Apartment[],
  nights: number
): ExtrasResult => {
  // Get effective guest count - adjust the destructuring to match the actual return type
  const guestCountInfo = getEffectiveGuestCount(formValues);
  const totalGuests = guestCountInfo.totalGuests;
  
  // Calculate linen costs
  let linenCost = 0;
  if (formValues.linenOption === "extra") {
    linenCost = totalGuests * 15; // 15€ per person for extra linen
  } else if (formValues.linenOption === "deluxe") {
    linenCost = totalGuests * 25; // 25€ per person for deluxe linen
  }
  
  // Calculate pet costs
  let petsCost = formValues.hasPets ? 50 : 0; // 50€ flat fee for pets
  
  // Calculate cleaning fee (fixed at 50€ per apartment)
  const cleaningFee = selectedApartments.length * 50;
  
  // Calculate tourist tax (2€ per adult per night)
  // Since we don't have direct access to adults count from getEffectiveGuestCount,
  // let's get it from formValues instead
  const adults = formValues.adults || 0;
  const touristTax = adults * 2 * nights;
  
  // Total extras
  const extrasCost = linenCost + petsCost;
  
  return {
    extrasCost,
    cleaningFee,
    touristTax
  };
};
