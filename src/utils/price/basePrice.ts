
// Calculate base price for apartments
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { isHighSeason } from "./dateUtils";
import { getSeasonalPrices, getWeeklyPrice } from "./seasonalPricing";

export function calculateBasePrice(
  formValues: FormValues, 
  selectedApartments: Apartment[],
  nights: number
): number {
  let basePrice = 0;
  const checkIn = formValues.checkIn;
  
  if (!checkIn) return 0;
  
  // Check if we should use weekly pricing
  const useWeeklyPrice = isHighSeason(checkIn);
  const year = checkIn.getFullYear();
  const seasonalPrices = getSeasonalPrices(year);
  
  selectedApartments.forEach(apartment => {
    if (useWeeklyPrice) {
      // Get the weekly price based on season
      basePrice += getWeeklyPrice(apartment, checkIn, seasonalPrices);
    } else {
      // Regular nightly pricing
      basePrice += (apartment.price * nights);
    }
  });
  
  return basePrice;
}
