import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "./priceCalculator";
import { format } from "date-fns";

/**
 * Creates a WhatsApp message with quote details
 */
export const createWhatsAppMessage = (formValues: FormValues, apartments: Apartment[]): string | null => {
  // Check if we have necessary data
  if (!formValues.checkIn || !formValues.checkOut || !formValues.selectedApartment) {
    return null;
  }
  
  try {
    // Calculate prices
    const priceInfo = calculateTotalPrice(formValues, apartments);
    
    // Get selected apartments
    const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
    const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    if (selectedApartments.length === 0) {
      return null;
    }
    
    // Format dates
    const formattedCheckIn = format(formValues.checkIn, "dd/MM/yyyy");
    const formattedCheckOut = format(formValues.checkOut, "dd/MM/yyyy");
    
    // Create message - Utilizziamo un'emoticon che funziona meglio
    let message = `*Richiesta Preventivo* 📋\n\n`;
    
    // Stay details
    message += `*Date soggiorno:*\n`;
    message += `Check-in: ${formattedCheckIn}\n`;
    message += `Check-out: ${formattedCheckOut}\n`;
    message += `Durata: ${priceInfo.nights} notti\n\n`;
    
    // Guest details
    message += `*Ospiti:*\n`;
    message += `Adulti: ${formValues.adults}\n`;
    message += `Bambini: ${formValues.children || 0}\n`;
    
    // Add child details if any
    if (formValues.children && formValues.children > 0 && formValues.childrenDetails && formValues.childrenDetails.length > 0) {
      message += `\n*Dettagli bambini:*\n`;
      formValues.childrenDetails.forEach((child, index) => {
        message += `Bambino ${index + 1}: `;
        if (child.isUnder12) message += "Sotto i 12 anni, ";
        if (child.sleepsWithParents) message += "Dorme con i genitori, ";
        if (child.sleepsInCrib) message += "Necessita di culla";
        message += "\n";
      });
    }
    
    message += `Totale ospiti: ${(formValues.adults || 0) + (formValues.children || 0)}\n\n`;
    
    // Group details if it's a group booking
    if (formValues.isGroupBooking && formValues.familyGroups && formValues.familyGroups.length > 0) {
      message += `*Dettagli gruppo:*\n`;
      message += `Tipo gruppo: ${formValues.groupType === 'families' ? 'Famiglie' : 'Coppie'}\n`;
      
      formValues.familyGroups.forEach((group, index) => {
        message += `Gruppo ${index + 1}: ${group.adults} adulti, ${group.children || 0} bambini\n`;
        
        // Dettagli bambini del gruppo
        if (group.children && group.children > 0 && group.childrenDetails && group.childrenDetails.length > 0) {
          group.childrenDetails.forEach((child, childIndex) => {
            message += `  - Bambino ${childIndex + 1}: `;
            if (child.isUnder12) message += "Sotto i 12 anni, ";
            if (child.sleepsWithParents) message += "Dorme con i genitori, ";
            if (child.sleepsInCrib) message += "Necessita di culla";
            message += "\n";
          });
        }
      });
      message += "\n";
    }
    
    // Apartments
    message += `*Appartamenti:*\n`;
    selectedApartments.forEach(apartment => {
      const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
      message += `- ${apartment.name}: ${apartmentPrice}€\n`;
      
      // Se ci sono persone assegnate a questo appartamento, includiamo il dettaglio
      if (formValues.personsPerApartment && formValues.personsPerApartment[apartment.id]) {
        message += `  Persone: ${formValues.personsPerApartment[apartment.id]}\n`;
      }
      
      // Se ci sono animali in questo appartamento, lo indichiamo
      if (formValues.petsInApartment && formValues.petsInApartment[apartment.id]) {
        message += `  Con animali domestici\n`;
      }
    });
    message += `\n`;
    
    // Services - CORRECTED
    message += `*Servizi richiesti:*\n`;
    message += `Biancheria: ${formValues.needsLinen ? "Richiesta (15€ a persona)" : "Non richiesta"}\n`;
    
    if (formValues.hasPets) {
      // Count apartments with pets correctly
      let apartmentsWithPets = 0;
      if (selectedApartments.length === 1) {
        apartmentsWithPets = 1;
      } else if (formValues.petsInApartment) {
        apartmentsWithPets = Object.values(formValues.petsInApartment).filter(Boolean).length;
      }
      
      message += `Animali domestici: Sì (${apartmentsWithPets} ${apartmentsWithPets === 1 ? 'appartamento' : 'appartamenti'})\n`;
      
      if (formValues.petSize) {
        message += `Taglia animale: ${
          formValues.petSize === "small" ? "Piccola" :
          formValues.petSize === "medium" ? "Media" : "Grande"
        }\n`;
      }
    }
    
    // Verifico se ci sono bambini che richiedono culle
    const totalCribs = formValues.childrenDetails?.filter(child => child.sleepsInCrib)?.length || 0;
    if (totalCribs > 0) {
      message += `Culle richieste: ${totalCribs}\n`;
    }
    
    if (formValues.additionalServices && formValues.additionalServices.length > 0) {
      message += `Servizi aggiuntivi: ${formValues.additionalServices.join(", ")}\n`;
    }
    message += `\n`;
    
    // Cost summary - IMPROVED
    message += `*Riepilogo costi:*\n`;
    message += `Costo appartamenti: ${priceInfo.basePrice}€\n`;
    
    // Dettaglio servizi extra se presenti
    if (priceInfo.extras > 0) {
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
      
      message += `Servizi extra: ${priceInfo.extras}€`;
      if (extraDetails.length > 0) {
        message += ` (${extraDetails.join(", ")})`;
      }
      message += `\n`;
    }
    
    message += `Pulizia finale: Inclusa\n`;
    message += `Subtotale: ${priceInfo.totalBeforeDiscount}€\n`;
    
    if (priceInfo.discount > 0) {
      message += `Sconto: -${priceInfo.discount}€\n`;
    }
    
    message += `Tassa di soggiorno: Inclusa\n\n`;
    
    message += `*Totale finale: ${priceInfo.totalAfterDiscount}€*\n`;
    message += `Caparra (30%): ${priceInfo.deposit}€\n`;
    message += `Saldo all'arrivo: ${priceInfo.totalAfterDiscount - priceInfo.deposit}€\n`;
    
    // Additional notes
    if (formValues.notes) {
      message += `\n*Note:*\n${formValues.notes}\n`;
    }
    
    return message;
  } catch (error) {
    console.error("Error creating WhatsApp message:", error);
    return null;
  }
};
