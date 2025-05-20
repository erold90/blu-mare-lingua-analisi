
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";

// Check if an apartment is suitable for a booking
export function isApartmentSuitable(apartment: Apartment, formValues: FormValues): boolean {
  // Calculate effective guest count considering children sleeping with parents
  const { adults, children, childrenDetails } = formValues;
  
  // Count children who sleep with parents
  const sleepingWithParents = (childrenDetails || []).filter(child => child.sleepsWithParents).length;
  
  // Calculate actual beds needed (adults + children - children sleeping with parents)
  const effectiveGuestCount = adults + children - sleepingWithParents;
  
  // Per gruppi numerosi, non controlliamo la capacità totale perché potrebbero selezionare più appartamenti
  const totalGuests = adults + children;
  
  // Se il totalGuests è maggiore della capacità massima di qualsiasi appartamento singolo
  // (es. > 8), allora mostriamo tutti gli appartamenti disponibili
  if (totalGuests > 8) {
    return true;
  }
  
  // Altrimenti, controlliamo se il singolo appartamento può ospitare il gruppo
  // Utilizziamo effectiveGuestCount invece di totalGuests per considerare i bambini che dormono con i genitori
  if (apartment.capacity < effectiveGuestCount) {
    return false;
  }
  
  // Additional logic for availability could be added here
  // (e.g., checking if the apartment is available for the selected dates)
  
  return true;
}

// Calculate how well an apartment fits the group's needs
function calculateApartmentFitScore(apartment: Apartment, formValues: FormValues): number {
  const { adults, children, isGroupBooking, childrenDetails } = formValues;
  
  let score = 0;
  
  // Calculate effective guest count considering children sleeping with parents
  const sleepingWithParents = (childrenDetails || []).filter(child => child.sleepsWithParents).length;
  const effectiveGuestCount = adults + children - sleepingWithParents;
  const totalGuests = adults + children;
  
  // Base score: Capacity efficiency (don't want too many empty beds)
  const capacityDifference = apartment.capacity - effectiveGuestCount;
  score += capacityDifference <= 2 ? 10 : 5; // Prefer apartments that are not too big for the group
  
  // Calculate ideal bedrooms based on effective guest count
  const adultsNeededRooms = Math.ceil(adults / 2);
  const childrenNeededRooms = Math.ceil((children - sleepingWithParents) / 2);
  const idealBedrooms = adultsNeededRooms + (childrenNeededRooms > 0 ? childrenNeededRooms : 0);
  
  // Prefer apartments with the right number of bedrooms
  const bedroomDifference = Math.abs((apartment.bedrooms || 1) - idealBedrooms);
  score += bedroomDifference === 0 ? 10 : (bedroomDifference === 1 ? 5 : 0);
  
  // Children handling
  if (children > 0) {
    // Check if there are enough beds for the effective guest count
    const hasEnoughBeds = (apartment.beds || 0) >= effectiveGuestCount;
    score += hasEnoughBeds ? 8 : 0;
    
    // Bonus for apartments that can accommodate children sleeping with parents
    if (sleepingWithParents > 0) {
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
} {
  const { adults, children, childrenDetails } = formValues;
  const totalGuests = adults + children;
  const sleepingWithParents = (childrenDetails || []).filter(child => child.sleepsWithParents).length;
  const effectiveGuestCount = adults + children - sleepingWithParents;
  
  return { totalGuests, effectiveGuestCount, sleepingWithParents };
}
