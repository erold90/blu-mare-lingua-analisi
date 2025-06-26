
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";

export interface OccupancyDiscountInfo {
  occupancyPercentage: number;
  discountPercentage: number;
  discountAmount: number;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
}

/**
 * Calcola la percentuale di occupazione basata su ospiti e capacità appartamenti
 */
export function calculateOccupancyPercentage(
  guestCount: number, 
  totalCapacity: number
): number {
  if (totalCapacity === 0) return 0;
  return Math.min((guestCount / totalCapacity) * 100, 100);
}

/**
 * Determina la percentuale di sconto basata sull'occupazione
 */
export function getOccupancyDiscountPercentage(occupancyPercentage: number): number {
  if (occupancyPercentage >= 100) return 0;      // Nessuno sconto per occupazione 100%
  if (occupancyPercentage >= 75) return 12.5;   // 10-15% → media 12.5%
  if (occupancyPercentage >= 50) return 27.5;   // 25-30% → media 27.5%
  if (occupancyPercentage >= 25) return 37.5;   // 35-40% → media 37.5%
  return 40; // Sconto massimo per occupazione molto bassa
}

/**
 * Calcola lo sconto di occupazione per il prezzo base
 */
export function calculateOccupancyDiscount(
  formValues: FormValues,
  selectedApartments: Apartment[],
  basePrice: number
): OccupancyDiscountInfo {
  // Calcola il numero totale di ospiti
  const totalGuests = (formValues.adults || 0) + (formValues.children || 0);
  
  // Calcola la capacità totale degli appartamenti selezionati
  const totalCapacity = selectedApartments.reduce((sum, apt) => sum + (apt.capacity || 0), 0);
  
  // Calcola percentuale di occupazione
  const occupancyPercentage = calculateOccupancyPercentage(totalGuests, totalCapacity);
  
  // Determina lo sconto
  const discountPercentage = getOccupancyDiscountPercentage(occupancyPercentage);
  
  // Calcola gli importi
  const discountAmount = Math.round(basePrice * (discountPercentage / 100));
  const discountedPrice = basePrice - discountAmount;
  
  console.log(`🎯 Occupancy Discount Calculation:
    - Guests: ${totalGuests}
    - Total Capacity: ${totalCapacity}
    - Occupancy: ${occupancyPercentage.toFixed(1)}%
    - Discount: ${discountPercentage}%
    - Original: ${basePrice}€
    - Discount Amount: ${discountAmount}€
    - Final: ${discountedPrice}€
  `);
  
  return {
    occupancyPercentage,
    discountPercentage,
    discountAmount,
    originalPrice: basePrice,
    discountedPrice,
    savings: discountAmount
  };
}

/**
 * Formatta la descrizione dello sconto per l'UI
 */
export function formatOccupancyDiscountDescription(info: OccupancyDiscountInfo): string {
  if (info.discountPercentage === 0) {
    return "Occupazione ottimale - prezzo pieno";
  }
  
  return `Sconto occupazione ${info.occupancyPercentage.toFixed(0)}% (${info.discountPercentage}% di sconto)`;
}
