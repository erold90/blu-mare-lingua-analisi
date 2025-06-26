
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface ExtrasResult {
  extrasCost: number;
  cleaningFee: number;
  touristTax: number;
  linenCost: number;
  petsCost: number;
}

/**
 * FIXED: Calculate extras costs with improved accuracy and validation
 */
export const calculateExtras = (
  formValues: FormValues, 
  selectedApartments: Apartment[],
  nights: number
): ExtrasResult => {
  console.log("🧮 Calculating extras with improved validation...");
  
  // Calculate linen costs
  const linenCost = calculateLinenCost(formValues);
  
  // Calculate pet costs
  const petsCost = calculatePetsCost(formValues, selectedApartments);
  
  // Calculate cleaning fee (fixed at 50€ per apartment) - FOR DISPLAY ONLY
  const cleaningFee = calculateCleaningFee(selectedApartments);
  
  // Calculate tourist tax - FOR DISPLAY ONLY - FIXED calculation
  const touristTax = calculateTouristTax(formValues, nights);
  
  // Total extras - ONLY linen and pets affect the actual price
  const extrasCost = linenCost + petsCost;
  
  console.log(`✅ Extras calculated:
    - Linen: ${linenCost}€
    - Pets: ${petsCost}€  
    - Total extras (affecting price): ${extrasCost}€
    - Cleaning fee (display only): ${cleaningFee}€
    - Tourist tax (display only): ${touristTax}€`);
  
  return {
    extrasCost,
    cleaningFee,
    touristTax,
    linenCost,
    petsCost
  };
};

/**
 * FIXED: Calculate the cost of linen service - improved validation
 */
export function calculateLinenCost(formValues: FormValues): number {
  if (!formValues.needsLinen) {
    return 0;
  }
  
  console.log("🛏️ Calculating linen cost...");
  
  const pricePerPerson = 15; // 15€ per persona per tutto il soggiorno
  
  // Calculate total guests
  const adults = formValues.adults || 0;
  const children = formValues.children || 0;
  const totalGuests = adults + children;
  
  // Calculate guests who don't need separate linen
  const childrenDetails = formValues.childrenDetails || [];
  const childrenWithParents = childrenDetails.filter(child => child.sleepsWithParents).length;
  const childrenInCribs = childrenDetails.filter(child => child.sleepsInCrib).length;
  
  // Guests who need separate linen = total - those who don't need it
  const guestsNeedingLinen = Math.max(0, totalGuests - childrenWithParents - childrenInCribs);
  
  const totalCost = guestsNeedingLinen * pricePerPerson;
  
  console.log(`🛏️ Linen calculation:
    - Adults: ${adults}
    - Children: ${children}
    - Total guests: ${totalGuests}
    - Children with parents: ${childrenWithParents}
    - Children in cribs: ${childrenInCribs}
    - Guests needing linen: ${guestsNeedingLinen}
    - Price per person: ${pricePerPerson}€
    - Total cost: ${totalCost}€`);
  
  return totalCost;
}

/**
 * Calculate the cost for pets - per apartment
 */
export function calculatePetsCost(formValues: FormValues, selectedApartments?: Apartment[]): number {
  if (!formValues.hasPets) {
    return 0;
  }
  
  let petsCost = 0;
  
  if (!selectedApartments || selectedApartments.length <= 1) {
    // Single apartment - fixed price of 50€
    petsCost = 50;
  } else if (formValues.petsInApartment) {
    // Multiple apartments - 50€ for each apartment with pets
    const apartmentsWithPets = Object.entries(formValues.petsInApartment)
      .filter(([_, hasPet]) => hasPet)
      .length;
    
    petsCost = apartmentsWithPets * 50;
    console.log(`🐕 Pets cost: ${apartmentsWithPets} apartments with pets × 50€ = ${petsCost}€`);
  } else {
    // Default if not specified - assume one apartment
    petsCost = 50;
  }
  
  return petsCost;
}

/**
 * Calculate cleaning fee - per apartment
 */
export function calculateCleaningFee(selectedApartments: Apartment[]): number {
  return selectedApartments.reduce((total, apartment) => {
    const apartmentCleaningFee = apartment.cleaningFee || 50;
    return total + apartmentCleaningFee;
  }, 0);
}

/**
 * FIXED: Calculate tourist tax with improved accuracy and validation
 * 1€ per adult per night, children under 12 exempt
 */
export function calculateTouristTax(formValues: FormValues, nights: number): number {
  console.log("🏛️ Calculating tourist tax with improved validation...");
  
  if (!nights || nights <= 0) {
    console.log("⚠️ Invalid nights for tourist tax calculation");
    return 0;
  }
  
  const adults = formValues.adults || 0;
  const childrenDetails = formValues.childrenDetails || [];
  
  // FIXED: Count children who are 12 years old or older (those who are NOT under 12)
  const childrenOver12 = childrenDetails.filter(child => {
    const isUnder12 = child.isUnder12 === true; // Explicit check
    console.log(`👶 Child analysis: isUnder12=${child.isUnder12}, taxable=${!isUnder12}`);
    return !isUnder12; // Children who are NOT under 12 are taxable
  }).length;
  
  const childrenUnder12 = childrenDetails.filter(child => child.isUnder12 === true).length;
  
  // Total people subject to tourist tax (adults + children 12+)
  const taxableGuests = adults + childrenOver12;
  
  // Calculate tax: 1€ per taxable person per night
  const totalTax = taxableGuests * nights * 1;
  
  console.log(`🏛️ Tourist tax calculation:
    - Adults: ${adults}
    - Children under 12 (exempt): ${childrenUnder12}
    - Children over 12 (taxable): ${childrenOver12}
    - Total taxable guests: ${taxableGuests}
    - Nights: ${nights}
    - Rate: 1€ per person per night
    - Total tax: ${totalTax}€`);
  
  // Validation
  if (totalTax < 0) {
    console.warn("⚠️ Negative tourist tax calculated, returning 0");
    return 0;
  }
  
  return totalTax;
}
