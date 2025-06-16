
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface ExtrasResult {
  extrasCost: number;
  cleaningFee: number;
  touristTax: number;
  linenCost: number; // Aggiunto per chiarezza
  petsCost: number;  // Aggiunto per chiarezza
}

/**
 * Calculate extras costs (linen, pets, cleaning fee, tourist tax)
 * Returns costs for display purposes and the actual extras cost that affects pricing
 */
export const calculateExtras = (
  formValues: FormValues, 
  selectedApartments: Apartment[],
  nights: number
): ExtrasResult => {
  // Calculate linen costs
  const linenCost = calculateLinenCost(formValues);
  
  // Calculate pet costs
  const petsCost = calculatePetsCost(formValues);
  
  // Calculate cleaning fee (fixed at 50€ per apartment) - FOR DISPLAY ONLY
  const cleaningFee = calculateCleaningFee(selectedApartments);
  
  // Calculate tourist tax - FOR DISPLAY ONLY
  const touristTax = calculateTouristTax(formValues, nights);
  
  // Total extras - ONLY linen and pets affect the actual price
  const extrasCost = linenCost + petsCost;
  
  return {
    extrasCost,
    cleaningFee,
    touristTax,
    linenCost,
    petsCost
  };
};

/**
 * Calculate the cost of linen service based on guests
 */
export function calculateLinenCost(formValues: FormValues): number {
  // Skip if not requesting linen service
  if (!formValues.needsLinen) {
    return 0;
  }
  
  let totalLinenCost = 0;
  const pricePerPerson = 15; // 15€ per persona per tutto il soggiorno
  
  if (formValues.selectedApartments?.length === 1 || !formValues.personsPerApartment) {
    // If there's just one apartment or persons per apartment is not specified
    const adults = formValues.adults || 0;
    const childrenDetails = formValues.childrenDetails || [];
    
    // Count only children who don't sleep with parents and don't sleep in cribs
    const independentChildren = childrenDetails.filter(child => 
      !child.sleepsWithParents && !child.sleepsInCrib
    ).length;
    
    // Total people needing linen service (those who occupy a bed)
    const totalPeople = adults + independentChildren;
    
    totalLinenCost = totalPeople * pricePerPerson;
  } else {
    // With multiple apartments, calculate based on people per apartment
    Object.values(formValues.personsPerApartment).forEach(personCount => {
      totalLinenCost += personCount * pricePerPerson;
    });
  }
  
  return totalLinenCost;
}

/**
 * Calculate the cost for pets
 */
export function calculatePetsCost(formValues: FormValues): number {
  if (!formValues.hasPets) {
    return 0;
  }
  
  let petsCost = 0;
  
  if (!formValues.selectedApartments || formValues.selectedApartments.length <= 1) {
    // Fixed price of 50€ for a single apartment
    petsCost = 50;
  } else if (formValues.petsInApartment) {
    // 50€ for each apartment with pets
    const apartmentsWithPets = Object.entries(formValues.petsInApartment)
      .filter(([_, hasPet]) => hasPet)
      .length;
    
    petsCost = apartmentsWithPets * 50;
  } else {
    // Default if not specified which apartment has pets
    petsCost = 50;
  }
  
  return petsCost;
}

/**
 * Calculate cleaning fee
 */
export function calculateCleaningFee(selectedApartments: Apartment[]): number {
  return selectedApartments.reduce((total, apartment) => {
    // Use a default cleaning fee of 50€ per apartment if not specified
    const apartmentCleaningFee = apartment.cleaningFee || 50;
    return total + apartmentCleaningFee;
  }, 0);
}

/**
 * Calculate tourist tax (1€ per adult per night, children under 12 exempt)
 */
export function calculateTouristTax(formValues: FormValues, nights: number): number {
  // Get effective guest count
  const guestCountInfo = getEffectiveGuestCount(formValues);
  
  // Count only adults and children aged 12 or over for tourist tax
  const adultEquivalents = guestCountInfo.totalGuests - guestCountInfo.sleepingInCribs - guestCountInfo.sleepingWithParents;
  
  // Calculate tax: 1€ per person per night
  return adultEquivalents * nights * 1;
}
