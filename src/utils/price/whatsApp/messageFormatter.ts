
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "../types";

/**
 * Formats the guest information section of the WhatsApp message
 */
export const formatGuestSection = (formValues: FormValues): string => {
  let section = `👥 *OSPITI*\n`;
  section += `• Adulti: ${formValues.adults}\n`;
  section += `• Bambini: ${formValues.children || 0}\n`;
  
  // Add child details if any
  if (formValues.children && formValues.children > 0 && formValues.childrenDetails && formValues.childrenDetails.length > 0) {
    section += `\n📋 *Dettagli bambini:*\n`;
    formValues.childrenDetails.forEach((child, index) => {
      section += `• Bambino ${index + 1}: `;
      const details = [];
      if (child.isUnder12) details.push("Sotto i 12 anni");
      if (child.sleepsWithParents) details.push("Dorme con i genitori");
      if (child.sleepsInCrib) details.push("Necessita di culla");
      section += details.length > 0 ? details.join(", ") : "Standard";
      section += "\n";
    });
  }
  
  section += `• Totale ospiti: ${(formValues.adults || 0) + (formValues.children || 0)}\n\n`;
  
  // Group details if it's a group booking
  if (formValues.isGroupBooking && formValues.familyGroups && formValues.familyGroups.length > 0) {
    section += `👨‍👩‍👧‍👦 *Dettagli gruppo:*\n`;
    section += `• Tipo: ${formValues.groupType === 'families' ? 'Famiglie' : 'Coppie'}\n`;
    
    formValues.familyGroups.forEach((group, index) => {
      section += `• Gruppo ${index + 1}: ${group.adults} adulti, ${group.children || 0} bambini\n`;
    });
    section += "\n";
  }
  
  return section;
};

/**
 * Formats the apartments section of the WhatsApp message
 */
export const formatApartmentsSection = (
  selectedApartments: Apartment[], 
  formValues: FormValues, 
  priceInfo: PriceCalculation
): string => {
  let section = `🏠 *APPARTAMENTI SELEZIONATI*\n`;
  
  selectedApartments.forEach(apartment => {
    // Mostra il prezzo originale se c'è uno sconto di occupazione
    if (priceInfo.occupancyDiscount && priceInfo.occupancyDiscount.discountAmount > 0) {
      const originalApartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
      // Calcola il prezzo originale proporzionalmente
      const originalTotal = priceInfo.occupancyDiscount.originalBasePrice;
      const discountedTotal = priceInfo.basePrice;
      const originalPrice = Math.round((originalApartmentPrice / discountedTotal) * originalTotal);
      
      section += `• ${apartment.name}: ~~${originalPrice}€~~ → *${originalApartmentPrice}€*\n`;
      section += `  (Capacità: ${apartment.capacity} posti)\n`;
    } else {
      const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
      section += `• ${apartment.name}: *${apartmentPrice}€*\n`;
      section += `  (Capacità: ${apartment.capacity} posti)\n`;
    }
    
    // Persons assignment if available
    if (formValues.personsPerApartment && formValues.personsPerApartment[apartment.id]) {
      section += `  👤 Persone assegnate: ${formValues.personsPerApartment[apartment.id]}\n`;
    }
    
    // Pets if any
    if (formValues.petsInApartment && formValues.petsInApartment[apartment.id]) {
      section += `  🐕 Con animali domestici\n`;
    }
  });
  
  return section + `\n`;
};

/**
 * Formats the services section of the WhatsApp message
 */
export const formatServicesSection = (formValues: FormValues, selectedApartments: Apartment[]): string => {
  let section = `🛎️ *SERVIZI RICHIESTI*\n`;
  section += `• Biancheria: ${formValues.needsLinen ? "✅ Richiesta" : "❌ Non richiesta"}\n`;
  
  if (formValues.hasPets) {
    let apartmentsWithPets = 0;
    if (selectedApartments.length === 1) {
      apartmentsWithPets = 1;
    } else if (formValues.petsInApartment) {
      apartmentsWithPets = Object.values(formValues.petsInApartment).filter(Boolean).length;
    }
    
    section += `• Animali domestici: ✅ SI (${apartmentsWithPets} ${apartmentsWithPets === 1 ? 'appartamento' : 'appartamenti'})\n`;
    
    if (formValues.petSize) {
      const sizeText = formValues.petSize === "small" ? "Piccola" : 
                      formValues.petSize === "medium" ? "Media" : "Grande";
      section += `  🐾 Taglia: ${sizeText}\n`;
    }
  } else {
    section += `• Animali domestici: ❌ Nessuno\n`;
  }
  
  // Cribs if needed
  const totalCribs = formValues.childrenDetails?.filter(child => child.sleepsInCrib)?.length || 0;
  if (totalCribs > 0) {
    section += `• Culle: 🛏️ ${totalCribs} richieste (gratuite)\n`;
  }
  
  return section + `\n`;
};

/**
 * Formats the payment section of the WhatsApp message
 */
export const formatPaymentSection = (deposit: number, balance: number): string => {
  let section = `💳 *MODALITÀ DI PAGAMENTO*\n`;
  section += `• Alla prenotazione (30%): *${deposit}€*\n`;
  section += `• All'arrivo (saldo): *${balance}€*\n`;
  section += `• Cauzione (restituibile): *200€*\n\n`;
  
  return section;
};
