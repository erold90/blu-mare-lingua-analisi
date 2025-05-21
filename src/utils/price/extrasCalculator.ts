
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
  // Get effective guest count
  const guestCountInfo = getEffectiveGuestCount(formValues);
  const totalGuests = guestCountInfo.totalGuests;
  
  // Calculate linen costs
  let linenCost = 0;
  if (formValues.linenOption === "extra") {
    linenCost = totalGuests * 15; // 15€ per person for extra linen
  } else if (formValues.linenOption === "deluxe") {
    linenCost = totalGuests * 25; // 25€ per person for deluxe linen
  }
  
  // Calculate pet costs - 50€ per apartment with pets
  let petsCost = 0;
  if (formValues.hasPets) {
    if (formValues.petsInApartment && Object.keys(formValues.petsInApartment).length > 0) {
      // Count apartments that have pets
      const apartmentsWithPets = Object.entries(formValues.petsInApartment)
        .filter(([_, hasPet]) => hasPet)
        .length;
      
      petsCost = apartmentsWithPets > 0 ? apartmentsWithPets * 50 : 50;
    } else {
      // Default to one apartment with pets
      petsCost = 50;
    }
  }
  
  // Calculate cleaning fee (fixed at 50€ per apartment)
  const cleaningFee = selectedApartments.length * 50;
  
  // Calculate tourist tax (1€ per person per night)
  // Exclude children under 12
  const adultEquivalents = totalGuests - guestCountInfo.sleepingInCribs - guestCountInfo.sleepingWithParents;
  const touristTax = adultEquivalents * nights * 1;
  
  // Total extras
  const extrasCost = linenCost + petsCost;
  
  return {
    extrasCost,
    cleaningFee,
    touristTax
  };
};
