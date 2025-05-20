
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
  
  console.log(`Calculating base price for ${selectedApartments.length} apartments, high season: ${useWeeklyPrice}`);
  
  selectedApartments.forEach(apartment => {
    if (useWeeklyPrice) {
      // Get the weekly price based on season
      const weeklyPrice = getWeeklyPrice(apartment, checkIn, seasonalPrices);
      basePrice += weeklyPrice;
      console.log(`Weekly price for ${apartment.name}: ${weeklyPrice}€`);
    } else {
      // Regular nightly pricing
      const nightlyTotal = apartment.price * nights;
      basePrice += nightlyTotal;
      console.log(`Nightly price for ${apartment.name}: ${apartment.price}€ x ${nights} nights = ${nightlyTotal}€`);
    }
  });
  
  console.log(`Total base price: ${basePrice}€`);
  return basePrice;
}
