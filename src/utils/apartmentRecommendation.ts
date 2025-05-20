import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";

// Check if an apartment is suitable for a booking
export function isApartmentSuitable(apartment: Apartment, formValues: FormValues): boolean {
  // Don't consider booked apartments as suitable
  if (apartment.booked === true) {
    return false;
  }

  // Calculate effective guest count considering children sleeping with parents or in cribs
  const { adults, children, childrenDetails } = formValues;
  
  // Count children who sleep with parents or in cribs
  const sleepingWithParents = (childrenDetails || []).filter(child => child.sleepsWithParents).length;
  const sleepingInCribs = (childrenDetails || []).filter(child => child.sleepsInCrib).length;
  
  // Calculate actual beds needed (adults + children - children not needing beds)
  const effectiveGuestCount = adults + children - sleepingWithParents - sleepingInCribs;
  
  // We always show all apartments regardless of capacity
  // But the ones that meet capacity requirements will be considered "suitable"
  if (apartment.capacity >= effectiveGuestCount) {
    return true;
  }
  
  // Additional logic for availability could be added here
  
  return false;
}

// Calculate how well an apartment fits the group's needs
function calculateApartmentFitScore(apartment: Apartment, formValues: FormValues): number {
  const { adults, children, isGroupBooking, childrenDetails } = formValues;
  
  let score = 0;
  
  // Calculate effective guest count considering children sleeping with parents or in cribs
  const sleepingWithParents = (childrenDetails || []).filter(child => child.sleepsWithParents).length;
  const sleepingInCribs = (childrenDetails || []).filter(child => child.sleepsInCrib).length;
  const effectiveGuestCount = adults + children - sleepingWithParents - sleepingInCribs;
  const totalGuests = adults + children;
  
  // Base score: Capacity efficiency (don't want too many empty beds)
  const capacityDifference = apartment.capacity - effectiveGuestCount;
  score += capacityDifference <= 2 ? 10 : 5; // Prefer apartments that are not too big for the group
  
  // Calculate ideal bedrooms based on effective guest count
  const adultsNeededRooms = Math.ceil(adults / 2);
  const childrenNeededRooms = Math.ceil((children - sleepingWithParents - sleepingInCribs) / 2);
  const idealBedrooms = adultsNeededRooms + (childrenNeededRooms > 0 ? childrenNeededRooms : 0);
  
  // Prefer apartments with the right number of bedrooms
  const bedroomDifference = Math.abs((apartment.bedrooms || 1) - idealBedrooms);
  score += bedroomDifference === 0 ? 10 : (bedroomDifference === 1 ? 5 : 0);
  
  // Children handling
  if (children > 0) {
    // Check if there are enough beds for the effective guest count
    const hasEnoughBeds = (apartment.beds || 0) >= effectiveGuestCount;
    score += hasEnoughBeds ? 8 : 0;
    
    // Bonus for apartments that can accommodate children sleeping with parents or in cribs
    if (sleepingWithParents > 0 || sleepingInCribs > 0) {
      score += 5;
    }
  }
  
  // Group booking consideration
  if (isGroupBooking) {
    // Prefer apartments with more bedrooms for groups
    score += (apartment.bedrooms || 1) >= 2 ? 8 : 0;
  }
  
  // Prefer apartments on ground floor for families with small children
  if (children > 0 && childrenDetails && childrenDetails.some(child => child.isUnder12)) {
    score += apartment.floor === "terra" ? 7 : 0;
  }
  
  return score;
}

// Get the recommended apartment ID based on the form values
export function getRecommendedApartment(apartments: Apartment[], formValues: FormValues): string | null {
  if (apartments.length === 0) return null;
  
  // Score each apartment
  const scoredApartments = apartments.map(apartment => ({
    id: apartment.id,
    score: calculateApartmentFitScore(apartment, formValues)
  }));
  
  // Sort by score (descending)
  scoredApartments.sort((a, b) => b.score - a.score);
  
  // Return the ID of the apartment with the highest score
  return scoredApartments[0]?.id || null;
}

// Helper function to calculate the effective guest count
export function getEffectiveGuestCount(formValues: FormValues): {
  totalGuests: number;
  effectiveGuestCount: number;
  sleepingWithParents: number;
  sleepingInCribs: number;
} {
  const { adults, children, childrenDetails } = formValues;
  const totalGuests = adults + children;
  const sleepingWithParents = (childrenDetails || []).filter(child => child.sleepsWithParents).length;
  const sleepingInCribs = (childrenDetails || []).filter(child => child.sleepsInCrib).length;
  const effectiveGuestCount = adults + children - sleepingWithParents - sleepingInCribs;
  
  return { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs };
}
