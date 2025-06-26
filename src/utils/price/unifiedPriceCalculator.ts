
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateMultiApartmentPricing } from "./multiApartmentPricing";
import { calculateNights } from "./dateUtils";
import { supabaseService } from "@/services/supabaseService";
import { 
  calculateOccupancyDiscount, 
  formatOccupancyDiscountDescription 
} from "./occupancyDiscount";

// Enhanced cache with longer validity for better performance
const priceCache = new Map<string, { price: number; timestamp: number; validated: boolean }>();
const CACHE_DURATION = 10 * 60 * 1000; // Increased to 10 minutes

/**
 * Convert string or Date to Date object
 */
const toDateSafe = (date: Date | string | undefined): Date | null => {
  if (!date) return null;
  if (typeof date === 'string') return new Date(date);
  return date;
};

/**
 * Enhanced price retrieval with improved caching
 */
async function getPriceForWeek(apartmentId: string, weekStart: Date): Promise<number> {
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const cacheKey = `${apartmentId}-${weekStartStr}`;
  
  // Check cache with extended validity
  const cached = priceCache.get(cacheKey);
  if (cached && cached.validated && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.price;
  }
  
  try {
    const year = weekStart.getFullYear();
    const prices = await supabaseService.prices.getByYear(year);
    
    const price = prices.find(
      (p: any) => p.apartment_id === apartmentId && p.week_start === weekStartStr
    );
    
    const priceValue = price ? Number(price.price) : 0;
    
    // Cache with validation
    priceCache.set(cacheKey, { 
      price: priceValue, 
      timestamp: Date.now(), 
      validated: true 
    });
    
    return priceValue;
  } catch (error) {
    console.error("❌ Error getting price for week:", error);
    
    // Use fallback cache if available
    if (cached) {
      return cached.price;
    }
    
    return 0;
  }
}

/**
 * Optimized sync version with better fallback
 */
function getPriceForWeekSync(apartmentId: string, weekStart: Date): number {
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const cacheKey = `${apartmentId}-${weekStartStr}`;
  
  const cached = priceCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.price;
  }
  
  return 0;
}

/**
 * Optimized week calculation
 */
function getWeeksForStay(checkIn: Date, checkOut: Date): Date[] {
  const weeks: Date[] = [];
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  // Find Monday of check-in week
  let currentWeek = new Date(checkIn);
  const dayOfWeek = currentWeek.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  currentWeek.setDate(currentWeek.getDate() - daysToMonday);
  
  // Add weeks until stay is covered
  while (currentWeek < checkOut) {
    weeks.push(new Date(currentWeek));
    currentWeek.setDate(currentWeek.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Batch preload prices with improved performance
 */
async function preloadPrices(apartmentIds: string[], checkIn: Date, checkOut: Date): Promise<boolean> {
  const weeks = getWeeksForStay(checkIn, checkOut);
  
  try {
    // Create all promises but don't wait for all to complete
    const promises = apartmentIds.flatMap(apartmentId =>
      weeks.map(weekStart => getPriceForWeek(apartmentId, weekStart))
    );
    
    // Use Promise.allSettled for better error handling
    const results = await Promise.allSettled(promises);
    const successfulLoads = results.filter(result => 
      result.status === 'fulfilled' && result.value > 0
    ).length;
    
    console.log(`✅ Successfully preloaded ${successfulLoads}/${promises.length} price entries`);
    return successfulLoads > 0;
  } catch (error) {
    console.error("❌ Error preloading prices:", error);
    return false;
  }
}

/**
 * Main calculation function with occupancy discount integration
 */
export async function calculateTotalPriceUnified(
  formValues: FormValues, 
  apartments: Apartment[],
  externalGetPriceForWeek?: (apartmentId: string, weekStart: Date | string) => number
): Promise<PriceCalculation> {
  console.log("🔍 Starting optimized price calculation with occupancy discount...");
  
  // Early validation
  if (!formValues || !apartments || apartments.length === 0) {
    return emptyPriceCalculation;
  }
  
  const selectedApartmentIds = formValues.selectedApartments || 
    (formValues.selectedApartment ? [formValues.selectedApartment] : []);
    
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    return emptyPriceCalculation;
  }
  
  // Convert dates to Date objects
  const checkInDate = toDateSafe(formValues.checkIn);
  const checkOutDate = toDateSafe(formValues.checkOut);
  
  if (!checkInDate || !checkOutDate || checkInDate >= checkOutDate) {
    return emptyPriceCalculation;
  }
  
  try {
    const nights = calculateNights(checkInDate, checkOutDate);
    
    if (nights <= 0) {
      return emptyPriceCalculation;
    }
    
    // Optimized price loading
    if (!externalGetPriceForWeek) {
      // Don't wait for full preload, start with cached data
      preloadPrices(selectedApartmentIds, checkInDate, checkOutDate);
    }
    
    // Calculate original base price (same logic as before)
    const apartmentPrices: Record<string, number> = {};
    let originalBasePrice = 0;
    
    for (const apartment of selectedApartments) {
      let totalApartmentPrice = 0;
      const weeks = getWeeksForStay(checkInDate, checkOutDate);
      
      for (let i = 0; i < weeks.length; i++) {
        const weekStart = weeks[i];
        let weeklyPrice = 0;
        
        if (externalGetPriceForWeek) {
          weeklyPrice = externalGetPriceForWeek(apartment.id, weekStart);
        } else {
          weeklyPrice = getPriceForWeekSync(apartment.id, weekStart);
        }
        
        if (weeklyPrice === 0) {
          const defaultPrice = apartment.price || 500;
          weeklyPrice = defaultPrice;
        }
        
        totalApartmentPrice += weeklyPrice;
      }
      
      const totalWeekDays = weeks.length * 7;
      if (nights < totalWeekDays) {
        const proportion = nights / totalWeekDays;
        totalApartmentPrice = Math.round(totalApartmentPrice * proportion);
      }
      
      apartmentPrices[apartment.id] = totalApartmentPrice;
      originalBasePrice += totalApartmentPrice;
    }
    
    // Calcola lo sconto di occupazione
    const occupancyInfo = calculateOccupancyDiscount(
      formValues, 
      selectedApartments, 
      originalBasePrice
    );
    
    // Il prezzo base finale è quello già scontato per occupazione
    const basePrice = occupancyInfo.discountedPrice;
    
    // Calculate extras and discounts on the discounted base price
    const { extrasCost, cleaningFee, touristTax } = calculateExtras(formValues, selectedApartments, nights);
    const subtotal = basePrice + extrasCost;
    const totalBeforeDiscount = subtotal;
    
    let result: PriceCalculation;
    
    if (selectedApartments.length > 1) {
      // Per appartamenti multipli, applica la logica esistente sul prezzo già scontato
      const {
        totalAfterDiscount,
        discount,
        discountedApartmentPrices,
        deposit
      } = calculateMultiApartmentPricing(
        formValues,
        selectedApartments,
        apartmentPrices, // Usa i prezzi originali per il calcolo proporzionale
        basePrice, // Ma il base price già scontato
        totalBeforeDiscount
      );
      
      result = {
        basePrice,
        extras: extrasCost,
        cleaningFee,
        touristTax,
        touristTaxPerPerson: 2.0,
        totalBeforeDiscount,
        totalAfterDiscount,
        discount,
        savings: discount + occupancyInfo.savings, // Somma tutti i risparmi
        deposit,
        nights,
        totalPrice: totalAfterDiscount,
        subtotal,
        apartmentPrices: discountedApartmentPrices,
        occupancyDiscount: {
          occupancyPercentage: occupancyInfo.occupancyPercentage,
          discountPercentage: occupancyInfo.discountPercentage,
          discountAmount: occupancyInfo.discountAmount,
          originalBasePrice: occupancyInfo.originalPrice,
          description: formatOccupancyDiscountDescription(occupancyInfo)
        }
      };
    } else {
      // Per singolo appartamento
      const { totalAfterDiscount, discount, savings, deposit } = calculateDiscount(totalBeforeDiscount, touristTax);
      
      result = {
        basePrice,
        extras: extrasCost,
        cleaningFee,
        touristTax,
        touristTaxPerPerson: 2.0,
        totalBeforeDiscount,
        totalAfterDiscount,
        discount,
        savings: savings + occupancyInfo.savings, // Somma tutti i risparmi
        deposit,
        nights,
        totalPrice: totalAfterDiscount,
        subtotal,
        apartmentPrices,
        occupancyDiscount: {
          occupancyPercentage: occupancyInfo.occupancyPercentage,
          discountPercentage: occupancyInfo.discountPercentage,
          discountAmount: occupancyInfo.discountAmount,
          originalBasePrice: occupancyInfo.originalPrice,
          description: formatOccupancyDiscountDescription(occupancyInfo)
        }
      };
    }
    
    return result;
    
  } catch (error) {
    console.error("❌ Error in unified price calculation:", error);
    return emptyPriceCalculation;
  }
}

/**
 * Pulisce la cache dei prezzi
 */
export function clearUnifiedPriceCache(): void {
  priceCache.clear();
  console.log("🧹 Unified price cache cleared");
}

/**
 * Forza il refresh della cache per un appartamento specifico
 */
export async function refreshApartmentPrices(apartmentId: string, year: number): Promise<void> {
  try {
    console.log(`🔄 Refreshing prices for apartment ${apartmentId}, year ${year}`);
    
    // Rimuovi dalla cache tutti i prezzi per questo appartamento
    for (const [key] of priceCache) {
      if (key.startsWith(`${apartmentId}-${year}`)) {
        priceCache.delete(key);
      }
    }
    
    // Ricarica i prezzi da Supabase
    const prices = await supabaseService.prices.getByYear(year);
    const apartmentPrices = prices.filter((p: any) => p.apartment_id === apartmentId);
    
    // Aggiorna la cache
    apartmentPrices.forEach((price: any) => {
      const cacheKey = `${apartmentId}-${price.week_start}`;
      priceCache.set(cacheKey, {
        price: Number(price.price),
        timestamp: Date.now(),
        validated: true
      });
    });
    
    console.log(`✅ Refreshed ${apartmentPrices.length} prices for ${apartmentId}`);
  } catch (error) {
    console.error(`❌ Error refreshing prices for ${apartmentId}:`, error);
  }
}
