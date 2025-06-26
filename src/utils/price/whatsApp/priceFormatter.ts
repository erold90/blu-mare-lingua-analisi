
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "../types";

/**
 * Formats the price breakdown section of the WhatsApp message
 */
export const formatPriceSection = (
  selectedApartments: Apartment[], 
  priceInfo: PriceCalculation,
  nights: number,
  weeks: number
): string => {
  const { basePrice, extras } = priceInfo;
  const pricePerNight = nights > 0 ? Math.round(basePrice / nights) : 0;
  const pricePerWeek = weeks > 0 ? Math.round(basePrice / weeks) : 0;
  
  let section = `*Dettaglio prezzi:*\n`;
  
  // Mostra prima il prezzo originale se c'è uno sconto di occupazione
  if (priceInfo.occupancyDiscount && priceInfo.occupancyDiscount.discountAmount > 0) {
    const originalPrice = priceInfo.occupancyDiscount.originalBasePrice;
    const originalPricePerNight = nights > 0 ? Math.round(originalPrice / nights) : 0;
    const originalPricePerWeek = weeks > 0 ? Math.round(originalPrice / weeks) : 0;
    
    section += `Prezzo listino originale: *${originalPrice}€*\n`;
    section += `• Prezzo per notte: ~${originalPricePerNight}€\n`;
    section += `• Prezzo per settimana: ~${originalPricePerWeek}€\n`;
    section += `• ${nights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'}): ${originalPrice}€\n\n`;
    
    // Mostra lo sconto di occupazione
    section += `*${priceInfo.occupancyDiscount.description}*\n`;
    section += `Sconto applicato: -*${priceInfo.occupancyDiscount.discountAmount}€*\n\n`;
    
    // Prezzo finale dopo sconto occupazione
    section += `Prezzo finale: *${basePrice}€*\n`;
    section += `• Prezzo per notte: ~${pricePerNight}€\n`;
    section += `• Prezzo per settimana: ~${pricePerWeek}€\n\n`;
  } else {
    // Nessuno sconto di occupazione, mostra prezzo normale
    if (selectedApartments.length > 1) {
      section += `Prezzo base appartamenti: *${basePrice}€*\n`;
      
      // Show individual apartment prices
      selectedApartments.forEach(apartment => {
        const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
        section += `• ${apartment.name}: ${apartmentPrice}€\n`;
      });
    } else {
      section += `Prezzo base appartamento: *${basePrice}€*\n`;
    }
    
    section += `• Prezzo per notte: ~${pricePerNight}€\n`;
    section += `• Prezzo per settimana: ~${pricePerWeek}€\n`;
    section += `• ${nights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'}): ${basePrice}€\n\n`;
  }
  
  return section;
};

/**
 * Formats the extras section of the WhatsApp message
 */
export const formatExtrasSection = (
  formValues: FormValues, 
  selectedApartments: Apartment[], 
  priceInfo: PriceCalculation
): string => {
  if (priceInfo.extras <= 0) return '';
  
  const extraDetails = [];
  
  if (formValues.needsLinen) {
    const totalPeople = (formValues.adults || 0) + (formValues.children || 0);
    const linenCost = totalPeople * 15;
    extraDetails.push(`Biancheria ${linenCost}€`);
  }
  
  if (formValues.hasPets) {
    let apartmentsWithPets = 0;
    if (selectedApartments.length === 1) {
      apartmentsWithPets = 1;
    } else if (formValues.petsInApartment) {
      apartmentsWithPets = Object.values(formValues.petsInApartment).filter(Boolean).length;
    }
    const animalsCost = apartmentsWithPets * 50;
    extraDetails.push(`Animali ${animalsCost}€`);
  }
  
  let section = `Servizi extra: ${priceInfo.extras}€`;
  if (extraDetails.length > 0) {
    section += ` (${extraDetails.join(", ")})`;
  }
  section += `\n`;
  
  return section;
};

/**
 * Formats the included services section of the WhatsApp message
 */
export const formatIncludedServicesSection = (
  cleaningFee: number, 
  touristTax: number, 
  totalCribs: number
): string => {
  let section = `*Servizi inclusi nel prezzo:*\n`;
  section += `• Pulizia finale: (inclusa) +${cleaningFee}€\n`;
  section += `• Tassa di soggiorno: (inclusa) +${touristTax}€\n`;
  if (totalCribs > 0) {
    section += `• Culle per bambini (${totalCribs}): Gratuite\n`;
  }
  section += `\n`;
  
  return section;
};
