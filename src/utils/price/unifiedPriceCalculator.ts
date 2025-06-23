
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateMultiApartmentPricing } from "./multiApartmentPricing";
import { calculateNights } from "./dateUtils";
import { supabaseService } from "@/services/supabaseService";

// Cache per i prezzi
const priceCache = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

/**
 * Ottiene il prezzo per una settimana specifica con cache
 */
async function getPriceForWeek(apartmentId: string, weekStart: Date): Promise<number> {
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const cacheKey = `${apartmentId}-${weekStartStr}`;
  
  // Controlla la cache
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)!;
  }
  
  try {
    const year = weekStart.getFullYear();
    const prices = await supabaseService.prices.getByYear(year);
    
    const price = prices.find(
      (p: any) => p.apartment_id === apartmentId && p.week_start === weekStartStr
    );
    
    const priceValue = price ? Number(price.price) : 0;
    
    // Salva in cache con scadenza
    priceCache.set(cacheKey, priceValue);
    setTimeout(() => priceCache.delete(cacheKey), CACHE_DURATION);
    
    return priceValue;
  } catch (error) {
    console.error("Error getting price for week:", error);
    return 0;
  }
}

/**
 * Versione sincrona che usa solo la cache
 */
function getPriceForWeekSync(apartmentId: string, weekStart: Date): number {
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const cacheKey = `${apartmentId}-${weekStartStr}`;
  
  return priceCache.get(cacheKey) || 0;
}

/**
 * Pre-carica i prezzi nella cache per le date specifiche
 */
async function preloadPrices(apartmentIds: string[], checkIn: Date, checkOut: Date): Promise<void> {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const numberOfWeeks = Math.ceil(nights / 7);
  
  const promises = [];
  
  for (const apartmentId of apartmentIds) {
    for (let week = 0; week < numberOfWeeks; week++) {
      const weekStartDate = new Date(checkIn);
      weekStartDate.setDate(weekStartDate.getDate() + (week * 7));
      promises.push(getPriceForWeek(apartmentId, weekStartDate));
    }
  }
  
  await Promise.all(promises);
}

/**
 * Calcola il prezzo totale usando il sistema unificato
 */
export async function calculateTotalPriceUnified(
  formValues: FormValues, 
  apartments: Apartment[]
): Promise<PriceCalculation> {
  console.log("Starting unified price calculation...");
  
  const selectedApartmentIds = formValues.selectedApartments || 
    (formValues.selectedApartment ? [formValues.selectedApartment] : []);
    
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    return emptyPriceCalculation;
  }
  
  // Pre-carica i prezzi nella cache
  await preloadPrices(selectedApartmentIds, formValues.checkIn, formValues.checkOut);
  
  const nights = calculateNights(formValues.checkIn, formValues.checkOut);
  console.log(`Stay duration: ${nights} nights`);
  
  const apartmentPrices: Record<string, number> = {};
  let basePrice = 0;
  
  const numberOfWeeks = Math.ceil(nights / 7);
  console.log(`Number of complete weeks: ${numberOfWeeks}`);
  
  // Calcola il prezzo per ogni appartamento
  for (const apartment of selectedApartments) {
    let totalApartmentPrice = 0;
    
    for (let week = 0; week < numberOfWeeks; week++) {
      const weekStartDate = new Date(formValues.checkIn);
      weekStartDate.setDate(weekStartDate.getDate() + (week * 7));
      
      const weeklyPrice = getPriceForWeekSync(apartment.id, weekStartDate);
      console.log(`Week ${week+1} price for ${apartment.id}: ${weeklyPrice}€`);
      
      if (weeklyPrice > 0) {
        totalApartmentPrice += weeklyPrice;
      } else {
        const defaultPrice = apartment.price || 0;
        console.log(`Using default price: ${defaultPrice}€`);
        totalApartmentPrice += defaultPrice;
      }
    }
    
    apartmentPrices[apartment.id] = totalApartmentPrice;
    basePrice += totalApartmentPrice;
  }
  
  console.log(`Total base price: ${basePrice}€`);
  
  // Calcola gli extra
  const { extrasCost, cleaningFee, touristTax } = calculateExtras(formValues, selectedApartments, nights);
  
  const subtotal = basePrice + extrasCost;
  const totalBeforeDiscount = subtotal;
  
  let result: PriceCalculation;
  
  if (selectedApartments.length > 1) {
    const {
      totalAfterDiscount,
      discount,
      discountedApartmentPrices,
      deposit
    } = calculateMultiApartmentPricing(
      formValues,
      selectedApartments,
      apartmentPrices,
      basePrice,
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
      savings: discount,
      deposit,
      nights,
      totalPrice: totalAfterDiscount,
      subtotal,
      apartmentPrices: discountedApartmentPrices
    };
  } else {
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
      savings,
      deposit,
      nights,
      totalPrice: totalAfterDiscount,
      subtotal,
      apartmentPrices
    };
  }
  
  return result;
}

/**
 * Pulisce la cache dei prezzi
 */
export function clearUnifiedPriceCache(): void {
  priceCache.clear();
  console.log("Unified price cache cleared");
}
