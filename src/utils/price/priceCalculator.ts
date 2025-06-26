
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateBasePrice } from "./basePrice";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateNights } from "./dateUtils";
import { getPriceForWeekSync } from "./weeklyPrice";
import { calculateMultiApartmentPricing } from "./multiApartmentPricing";
import { 
  calculateOccupancyDiscount, 
  formatOccupancyDiscountDescription 
} from "./occupancyDiscount";
import { toDateSafe, toISOStringSafe } from "./dateConverter";

// Cache per evitare ricalcoli
const priceCalculationCache = new Map<string, PriceCalculation>();

/**
 * Genera chiave cache per il calcolo del prezzo
 */
const generateCacheKey = (formValues: FormValues, apartments: Apartment[]): string => {
  const cacheKeyParts = [
    toISOStringSafe(formValues.checkIn),
    toISOStringSafe(formValues.checkOut),
    formValues.selectedApartments?.join(',') || formValues.selectedApartment,
    formValues.adults,
    formValues.children,
    formValues.hasPets ? '1' : '0',
    formValues.needsLinen ? '1' : '0',
    JSON.stringify(formValues.personsPerApartment || {}),
    JSON.stringify(formValues.petsInApartment || {})
  ];
  
  return cacheKeyParts.join('|');
};

/**
 * Calcola i prezzi totali per ogni appartamento con sconto occupazione
 */
export function calculateTotalPrice(formValues: FormValues, apartments: Apartment[]): PriceCalculation {
  console.log("🧮 Starting price calculation...");
  
  // Validazione input
  const selectedApartmentIds = formValues.selectedApartments || 
    (formValues.selectedApartment ? [formValues.selectedApartment] : []);
    
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    console.log("❌ Invalid input - returning empty calculation");
    return emptyPriceCalculation;
  }
  
  // Conversione date sicura
  const checkInDate = toDateSafe(formValues.checkIn);
  const checkOutDate = toDateSafe(formValues.checkOut);
  
  if (!checkInDate || !checkOutDate) {
    console.log("❌ Invalid dates - returning empty calculation");
    return emptyPriceCalculation;
  }
  
  // Cache check
  const cacheKey = generateCacheKey(formValues, selectedApartments);
  if (priceCalculationCache.has(cacheKey)) {
    console.log("✅ Using cached price calculation");
    return priceCalculationCache.get(cacheKey)!;
  }
  
  // Calcolo notti
  const nights = calculateNights(checkInDate, checkOutDate);
  console.log(`📅 Stay duration: ${nights} nights`);
  
  // Tracciamento prezzi appartamenti
  const apartmentPrices: Record<string, number> = {};
  let originalBasePrice = 0;
  
  // Calcolo settimane
  const numberOfWeeks = Math.ceil(nights / 7);
  console.log(`📊 Number of weeks: ${numberOfWeeks}`);
  
  // Calcolo prezzo per ogni appartamento
  selectedApartments.forEach(apartment => {
    let totalApartmentPrice = 0;
    
    // Pre-calcolo date settimane per performance
    const weekStartDates = Array(numberOfWeeks).fill(0).map((_, week) => {
      const weekStartDate = new Date(checkInDate);
      weekStartDate.setDate(weekStartDate.getDate() + (week * 7));
      return weekStartDate;
    });
    
    // Calcolo prezzo per ogni settimana
    for (let week = 0; week < numberOfWeeks; week++) {
      const weekStartDate = weekStartDates[week];
      const weeklyPrice = getPriceForWeekSync(apartment.id, weekStartDate);
      
      console.log(`💰 Week ${week+1} price for ${apartment.id}: ${weeklyPrice}€`);
      
      if (weeklyPrice > 0) {
        totalApartmentPrice += weeklyPrice;
      } else {
        const defaultPrice = apartment.price || 0;
        console.log(`⚠️ Using default price: ${defaultPrice}€`);
        totalApartmentPrice += defaultPrice;
      }
    }
    
    apartmentPrices[apartment.id] = totalApartmentPrice;
    originalBasePrice += totalApartmentPrice;
    
    console.log(`🏠 Total price for ${apartment.id}: ${totalApartmentPrice}€`);
  });
  
  console.log(`💵 Total original base price: ${originalBasePrice}€`);
  
  // Calcolo sconto occupazione
  const occupancyInfo = calculateOccupancyDiscount(
    formValues, 
    selectedApartments, 
    originalBasePrice
  );
  
  const basePrice = occupancyInfo.discountedPrice;
  console.log(`🎯 Base price after occupancy discount: ${basePrice}€`);
  
  // Calcolo extra
  const { extrasCost, cleaningFee, touristTax } = calculateExtras(formValues, selectedApartments, nights);
  console.log(`🧹 Extras: ${extrasCost}€, Cleaning: ${cleaningFee}€, Tax: ${touristTax}€`);
  
  const subtotal = basePrice + extrasCost;
  const totalBeforeDiscount = subtotal;
  
  let result: PriceCalculation;
  
  if (selectedApartments.length > 1) {
    // Logica multi-appartamento
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
      savings: discount + occupancyInfo.savings,
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
    // Logica singolo appartamento
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
      savings: savings + occupancyInfo.savings,
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
  
  // Cache del risultato
  priceCalculationCache.set(cacheKey, result);
  
  // Limite cache per prevenire memory leak
  if (priceCalculationCache.size > 100) {
    const oldestKey = priceCalculationCache.keys().next().value;
    priceCalculationCache.delete(oldestKey);
  }
  
  console.log("✅ Price calculation completed");
  return result;
}

/**
 * Pulisce cache calcoli prezzo
 */
export function clearPriceCalculationCache(): void {
  priceCalculationCache.clear();
  console.log("🧹 Price calculation cache cleared");
}
