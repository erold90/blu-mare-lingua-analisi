
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";

// Check if an apartment is suitable for a booking
export function isApartmentSuitable(apartment: Apartment, formValues: FormValues): boolean {
  // Per gruppi numerosi, non controlliamo la capacità totale perché potrebbero selezionare più appartamenti
  const totalGuests = formValues.adults + formValues.children;
  
  // Se il totalGuests è maggiore della capacità massima di qualsiasi appartamento singolo
  // (es. > 8), allora mostriamo tutti gli appartamenti disponibili
  if (totalGuests > 8) {
    return true;
  }
  
  // Altrimenti, controlliamo se il singolo appartamento può ospitare il gruppo
  if (apartment.capacity < totalGuests) {
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
  const totalGuests = adults + children;
  
  // Base score: Capacity efficiency (don't want too many empty beds)
  const capacityDifference = apartment.capacity - totalGuests;
  score += capacityDifference <= 2 ? 10 : 5; // Prefer apartments that are not too big for the group
  
  // Prefer apartments with the right number of bedrooms
  const idealBedrooms = Math.ceil(adults / 2) + (children > 0 ? 1 : 0);
  const bedroomDifference = Math.abs((apartment.bedrooms || 1) - idealBedrooms);
  score += bedroomDifference === 0 ? 10 : (bedroomDifference === 1 ? 5 : 0);
  
  // Children handling
  if (children > 0) {
    // Check if there are enough beds for children
    const hasEnoughBeds = (apartment.beds || 0) >= totalGuests;
    score += hasEnoughBeds ? 8 : 0;
    
    // Check for children sleeping with parents
    if (childrenDetails) {
      const childrenWithParents = childrenDetails.filter(child => child.sleepsWithParents).length;
      if (childrenWithParents > 0 && (apartment.bedrooms || 1) >= Math.ceil((adults + children - childrenWithParents) / 2)) {
        score += 5;
      }
    }
  }
  
  // Group booking consideration
  if (isGroupBooking) {
    // Prefer apartments with more bedrooms for groups
    score += (apartment.bedrooms || 1) >= 2 ? 8 : 0;
  }
  
  // Prefer apartments on ground floor for families with small children
  if (children > 0 && childrenDetails && childrenDetails.some(child => child.age < 5)) {
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
