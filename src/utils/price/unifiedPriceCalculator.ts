
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { emptyPriceCalculation, PriceCalculation } from "./types";
import { calculateExtras } from "./extrasCalculator";
import { calculateDiscount } from "./discountCalculator";
import { calculateMultiApartmentPricing } from "./multiApartmentPricing";
import { calculateNights } from "./dateUtils";
import { supabaseService } from "@/services/supabaseService";

// Cache migliorata per i prezzi con timeout e validazione
const priceCache = new Map<string, { price: number; timestamp: number; validated: boolean }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minuti

/**
 * Ottiene il prezzo per una settimana specifica con validazione Supabase
 */
async function getPriceForWeek(apartmentId: string, weekStart: Date): Promise<number> {
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const cacheKey = `${apartmentId}-${weekStartStr}`;
  
  // Controlla la cache con timeout
  const cached = priceCache.get(cacheKey);
  if (cached && cached.validated && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`📋 Using cached price for ${apartmentId} on ${weekStartStr}: ${cached.price}€`);
    return cached.price;
  }
  
  try {
    const year = weekStart.getFullYear();
    const prices = await supabaseService.prices.getByYear(year);
    
    const price = prices.find(
      (p: any) => p.apartment_id === apartmentId && p.week_start === weekStartStr
    );
    
    const priceValue = price ? Number(price.price) : 0;
    
    // Salva in cache con validazione
    priceCache.set(cacheKey, { 
      price: priceValue, 
      timestamp: Date.now(), 
      validated: true 
    });
    
    console.log(`💰 Loaded price for ${apartmentId} on ${weekStartStr}: ${priceValue}€`);
    return priceValue;
  } catch (error) {
    console.error("❌ Error getting price for week:", error);
    
    // In caso di errore, prova a usare cache non validata
    if (cached) {
      console.log(`⚠️ Using fallback cached price for ${apartmentId}: ${cached.price}€`);
      return cached.price;
    }
    
    return 0;
  }
}

/**
 * Versione sincrona migliorata che controlla sempre la validità
 */
function getPriceForWeekSync(apartmentId: string, weekStart: Date): number {
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const cacheKey = `${apartmentId}-${weekStartStr}`;
  
  const cached = priceCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.price;
  }
  
  console.warn(`❌ No valid cached price found for ${apartmentId} on ${weekStartStr}`);
  return 0;
}

/**
 * Calcola il numero corretto di settimane per un soggiorno
 */
function calculateWeeksForStay(checkIn: Date, checkOut: Date, nights: number): Date[] {
  const weeks: Date[] = [];
  
  // Inizia dalla settimana del check-in
  let currentWeekStart = new Date(checkIn);
  
  // Trova il lunedì della settimana del check-in
  const dayOfWeek = currentWeekStart.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Domenica = 6 giorni indietro
  currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);
  
  console.log(`📅 Check-in: ${checkIn.toDateString()}`);
  console.log(`📅 Check-out: ${checkOut.toDateString()}`);
  console.log(`📅 Nights: ${nights}`);
  console.log(`📅 First week starts: ${currentWeekStart.toDateString()}`);
  
  // Aggiungi settimane fino a coprire tutto il soggiorno
  while (currentWeekStart < checkOut) {
    weeks.push(new Date(currentWeekStart));
    console.log(`📅 Adding week: ${currentWeekStart.toDateString()}`);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  console.log(`📊 Total weeks needed: ${weeks.length}`);
  return weeks;
}

/**
 * Pre-carica TUTTI i prezzi necessari per il calcolo
 */
async function preloadPrices(apartmentIds: string[], checkIn: Date, checkOut: Date): Promise<boolean> {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const weeks = calculateWeeksForStay(checkIn, checkOut, nights);
  
  console.log(`📋 Preloading prices for ${apartmentIds.length} apartments, ${weeks.length} weeks`);
  
  try {
    const promises = [];
    
    for (const apartmentId of apartmentIds) {
      for (const weekStart of weeks) {
        promises.push(getPriceForWeek(apartmentId, weekStart));
      }
    }
    
    const results = await Promise.all(promises);
    const loadedPrices = results.filter(price => price > 0).length;
    
    console.log(`✅ Successfully preloaded ${loadedPrices}/${promises.length} price entries`);
    return loadedPrices > 0;
  } catch (error) {
    console.error("❌ Error preloading prices:", error);
    return false;
  }
}

/**
 * Calcola il prezzo totale usando il sistema unificato con validazione completa
 */
export async function calculateTotalPriceUnified(
  formValues: FormValues, 
  apartments: Apartment[]
): Promise<PriceCalculation> {
  console.log("🔍 Starting unified price calculation...");
  
  // Validazione input rigorosa
  if (!formValues || !apartments || apartments.length === 0) {
    console.warn("❌ Invalid input data for price calculation");
    return emptyPriceCalculation;
  }
  
  const selectedApartmentIds = formValues.selectedApartments || 
    (formValues.selectedApartment ? [formValues.selectedApartment] : []);
    
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
    console.warn("❌ Missing required data for price calculation");
    return emptyPriceCalculation;
  }
  
  // Validazione date
  if (formValues.checkIn >= formValues.checkOut) {
    console.warn("❌ Invalid date range for price calculation");
    return emptyPriceCalculation;
  }
  
  try {
    // Pre-carica i prezzi e verifica il successo
    const pricesLoaded = await preloadPrices(selectedApartmentIds, formValues.checkIn, formValues.checkOut);
    
    if (!pricesLoaded) {
      console.warn("⚠️ No prices could be loaded from database");
    }
    
    const nights = calculateNights(formValues.checkIn, formValues.checkOut);
    console.log(`📅 Stay duration: ${nights} nights`);
    
    if (nights <= 0) {
      console.warn("❌ Invalid stay duration");
      return emptyPriceCalculation;
    }
    
    const apartmentPrices: Record<string, number> = {};
    let basePrice = 0;
    
    // Calcola il prezzo per ogni appartamento utilizzando le settimane corrette
    for (const apartment of selectedApartments) {
      let totalApartmentPrice = 0;
      const weeks = calculateWeeksForStay(formValues.checkIn, formValues.checkOut, nights);
      
      console.log(`💰 Calculating price for ${apartment.id} across ${weeks.length} weeks`);
      
      for (let i = 0; i < weeks.length; i++) {
        const weekStart = weeks[i];
        let weeklyPrice = getPriceForWeekSync(apartment.id, weekStart);
        
        if (weeklyPrice === 0) {
          // Fallback al prezzo di default dell'appartamento
          const defaultPrice = apartment.price || 500; // Prezzo di sicurezza
          console.log(`⚠️ Using default price for ${apartment.id}, week ${i+1}: ${defaultPrice}€`);
          weeklyPrice = defaultPrice;
        }
        
        console.log(`💰 Week ${i+1} (${weekStart.toDateString()}) price for ${apartment.id}: ${weeklyPrice}€`);
        totalApartmentPrice += weeklyPrice;
      }
      
      // Proporziona il prezzo in base ai giorni effettivi se necessario
      if (nights < weeks.length * 7) {
        const proportion = nights / (weeks.length * 7);
        totalApartmentPrice = Math.round(totalApartmentPrice * proportion);
        console.log(`⚖️ Proportional adjustment for ${nights} nights: ${totalApartmentPrice}€`);
      }
      
      apartmentPrices[apartment.id] = totalApartmentPrice;
      basePrice += totalApartmentPrice;
    }
    
    console.log(`💰 Total base price: ${basePrice}€`);
    console.log(`📊 Individual apartment prices:`, apartmentPrices);
    
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
    
    console.log("✅ Price calculation completed successfully:", result);
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
