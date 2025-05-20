
// Calculate costs for extra services
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";

// Calculate the cost of linen service based on guests
export function calculateLinenCost(formValues: FormValues): number {
  // Skip if not using extra linen service
  if (formValues.linenOption !== "extra") {
    return 0;
  }
  
  let totalLinenCost = 0;
  
  if (formValues.selectedApartments?.length === 1 || !formValues.personsPerApartment) {
    // If there's just one apartment or persons per apartment is not specified
    const adults = formValues.adults || 0;
    const childrenDetails = formValues.childrenDetails || [];
    
    // Count only children who don't sleep with parents and don't sleep in cribs
    const independentChildren = childrenDetails.filter(child => 
      !child.sleepsWithParents && !child.sleepsInCrib
    ).length;
    
    // Total people needing linen service
    const totalPeople = adults + independentChildren;
    
    totalLinenCost = totalPeople * 15; // 15€ per person
  } else {
    // With multiple apartments, calculate based on people per apartment
    Object.values(formValues.personsPerApartment).forEach(personCount => {
      totalLinenCost += personCount * 15;
    });
  }
  
  return totalLinenCost;
}

// Calculate the cost for pets
export function calculatePetsCost(formValues: FormValues): number {
  if (!formValues.hasPets) {
    return 0;
  }
  
  let petsCost = 0;
  
  if (formValues.selectedApartments?.length === 1) {
    // Fixed price of 50€ for a single apartment
    petsCost = 50;
  } else if (formValues.selectedApartments && formValues.selectedApartments.length > 1 && formValues.petsInApartment) {
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

// Calculate cleaning fee
export function calculateCleaningFee(selectedApartments: Apartment[]): number {
  return selectedApartments.reduce((total, apartment) => {
    // Use a default cleaning fee of 50€ per apartment if not specified
    const apartmentCleaningFee = apartment.cleaningFee || 50;
    return total + apartmentCleaningFee;
  }, 0);
}

// Calculate tourist tax (1€ per adult per night, children under 12 exempt)
export function calculateTouristTax(formValues: FormValues, nights: number): number {
  const adults = formValues.adults || 0;
  const childrenDetails = formValues.childrenDetails || [];
  
  // Count only children aged 12 or over for tourist tax
  const childrenOver12 = childrenDetails.filter(child => !child.isUnder12).length;
  
  // Total people paying tax
  const peoplePayingTax = adults + childrenOver12;
  
  // Calculate tax: 1€ per person per night
  return peoplePayingTax * nights * 1;
}
