
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
  const petsCost = calculatePetsCost(formValues, selectedApartments);
  
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
 * Calculate the cost of linen service based on total guests
 * CORRECTED: Calculate based on total guests (adults + children) as requested
 */
export function calculateLinenCost(formValues: FormValues): number {
  // Skip if not requesting linen service
  if (!formValues.needsLinen) {
    return 0;
  }
  
  console.log("🔍 Calculating linen cost for form values:", formValues);
  
  const pricePerPerson = 15; // 15€ per persona per tutto il soggiorno
  
  // Calculate based on total guests (adults + children)
  const adults = formValues.adults || 0;
  const children = formValues.children || 0;
  const totalGuests = adults + children;
  
  console.log("🔍 Linen calculation:", {
    adults,
    children,
    totalGuests,
    pricePerPerson,
    totalCost: totalGuests * pricePerPerson
  });
  
  return totalGuests * pricePerPerson;
}

/**
 * Calculate the cost for pets - CORRECTED to count per apartment
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
    console.log(`Calculating pets cost: ${apartmentsWithPets} apartments with pets × 50€ = ${petsCost}€`);
  } else {
    // Default if not specified which apartment has pets - assume one apartment
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
 * CORRECTED: Now properly calculates total taxable guests regardless of apartment distribution
 */
export function calculateTouristTax(formValues: FormValues, nights: number): number {
  console.log("🏛️ Calculating tourist tax...");
  console.log("📊 Form values:", {
    adults: formValues.adults,
    children: formValues.children,
    childrenDetails: formValues.childrenDetails,
    nights
  });
  
  const adults = formValues.adults || 0;
  const childrenDetails = formValues.childrenDetails || [];
  
  // Count children who are 12 years old or older (those who are NOT under 12)
  const childrenOver12 = childrenDetails.filter(child => {
    const isUnder12 = child.isUnder12 || false;
    console.log(`👶 Child isUnder12: ${isUnder12}, taxable: ${!isUnder12}`);
    return !isUnder12; // Children who are NOT under 12 are taxable
  }).length;
  
  // Total people subject to tourist tax (adults + children 12+)
  const taxableGuests = adults + childrenOver12;
  
  console.log(`🏛️ Tourist tax calculation:
    - Adults: ${adults}
    - Children over 12: ${childrenOver12}
    - Total taxable guests: ${taxableGuests}
    - Nights: ${nights}
    - Rate: 1€ per person per night
    - Total tax: ${taxableGuests * nights * 1}€`);
  
  // Calculate tax: 1€ per taxable person per night
  // This is the TOTAL tax for all guests, not per apartment
  const totalTax = taxableGuests * nights * 1;
  
  return totalTax;
}
