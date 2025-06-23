
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "./priceCalculator";
import { format } from "date-fns";
import { it } from 'date-fns/locale';

/**
 * Creates a WhatsApp message with quote details
 * Using only the most basic and universally supported symbols
 */
export const createWhatsAppMessage = (formValues: FormValues, apartments: Apartment[]): string | null => {
  // Check if we have necessary data
  if (!formValues.checkIn || !formValues.checkOut || !formValues.selectedApartment) {
    return null;
  }
  
  try {
    // Calculate prices using the same function as the summary
    const priceInfo = calculateTotalPrice(formValues, apartments);
    
    // Get selected apartments
    const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
    const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    if (selectedApartments.length === 0) {
      return null;
    }
    
    // Format dates with day of the week
    const formattedCheckIn = format(formValues.checkIn, "EEEE d MMMM yyyy", { locale: it });
    const formattedCheckOut = format(formValues.checkOut, "EEEE d MMMM yyyy", { locale: it });
    
    // Calculate duration details
    const nights = priceInfo.nights || 0;
    const weeks = Math.ceil(nights / 7);
    
    // Get EXACT values from price calculation
    const basePrice = priceInfo.basePrice;
    const subtotal = priceInfo.totalBeforeDiscount;
    const discount = priceInfo.discount;
    const totalFinal = priceInfo.totalAfterDiscount;
    const deposit = priceInfo.deposit;
    const balance = totalFinal - deposit;
    const cleaningFee = priceInfo.cleaningFee;
    const touristTax = priceInfo.touristTax;
    
    // Calculate per-night and per-week prices
    const pricePerNight = nights > 0 ? Math.round(basePrice / nights) : 0;
    const pricePerWeek = weeks > 0 ? Math.round(basePrice / weeks) : 0;
    
    // Build WhatsApp message with only the most basic symbols
    let message = `*Richiesta Preventivo Villa MareBlu*\n\n`;
    
    // Stay dates section
    message += `*[CALENDARIO] Date soggiorno:*\n`;
    message += `Check-in: ${formattedCheckIn}\n`;
    message += `Check-out: ${formattedCheckOut}\n`;
    message += `Durata: *${nights} notti* (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'})\n\n`;
    
    // Guest information
    message += `*[PERSONE] Ospiti:*\n`;
    message += `Adulti: ${formValues.adults}\n`;
    message += `Bambini: ${formValues.children || 0}\n`;
    
    // Add child details if any
    if (formValues.children && formValues.children > 0 && formValues.childrenDetails && formValues.childrenDetails.length > 0) {
      message += `\n*Dettagli bambini:*\n`;
      formValues.childrenDetails.forEach((child, index) => {
        message += `• Bambino ${index + 1}: `;
        if (child.isUnder12) message += "Sotto i 12 anni";
        if (child.sleepsWithParents) message += ", Dorme con i genitori";
        if (child.sleepsInCrib) message += ", Necessita di culla";
        message += "\n";
      });
    }
    
    message += `Totale ospiti: ${(formValues.adults || 0) + (formValues.children || 0)}\n\n`;
    
    // Group details if it's a group booking
    if (formValues.isGroupBooking && formValues.familyGroups && formValues.familyGroups.length > 0) {
      message += `*[GRUPPO] Dettagli gruppo:*\n`;
      message += `Tipo: ${formValues.groupType === 'families' ? 'Famiglie' : 'Coppie'}\n`;
      
      formValues.familyGroups.forEach((group, index) => {
        message += `Gruppo ${index + 1}: ${group.adults} adulti, ${group.children || 0} bambini\n`;
      });
      message += "\n";
    }
    
    // Selected apartments with EXACT prices from calculation
    message += `*[CASA] Appartamenti selezionati:*\n`;
    selectedApartments.forEach(apartment => {
      // Use the exact price from calculation
      const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
      message += `• ${apartment.name}: ${apartmentPrice}€\n`;
      
      // Persons assignment if available
      if (formValues.personsPerApartment && formValues.personsPerApartment[apartment.id]) {
        message += `  > Persone assegnate: ${formValues.personsPerApartment[apartment.id]}\n`;
      }
      
      // Pets if any
      if (formValues.petsInApartment && formValues.petsInApartment[apartment.id]) {
        message += `  > Con animali domestici\n`;
      }
    });
    message += `\n`;
    
    // Services requested - using text labels instead of emoji
    message += `*[SERVIZI] Servizi richiesti:*\n`;
    message += `Biancheria: ${formValues.needsLinen ? "SI - Richiesta" : "NO - Non richiesta"}\n`;
    
    if (formValues.hasPets) {
      let apartmentsWithPets = 0;
      if (selectedApartments.length === 1) {
        apartmentsWithPets = 1;
      } else if (formValues.petsInApartment) {
        apartmentsWithPets = Object.values(formValues.petsInApartment).filter(Boolean).length;
      }
      
      message += `Animali domestici: SI (${apartmentsWithPets} ${apartmentsWithPets === 1 ? 'appartamento' : 'appartamenti'})\n`;
      
      if (formValues.petSize) {
        const sizeText = formValues.petSize === "small" ? "Piccola" : 
                        formValues.petSize === "medium" ? "Media" : "Grande";
        message += `Taglia: ${sizeText}\n`;
      }
    } else {
      message += `Animali domestici: NO - Nessuno\n`;
    }
    
    // Cribs if needed
    const totalCribs = formValues.childrenDetails?.filter(child => child.sleepsInCrib)?.length || 0;
    if (totalCribs > 0) {
      message += `Culle richieste: ${totalCribs} (gratuite)\n`;
    }
    
    if (formValues.additionalServices && formValues.additionalServices.length > 0) {
      message += `Servizi aggiuntivi: ${formValues.additionalServices.join(", ")}\n`;
    }
    message += `\n`;
    
    // Price breakdown section - USE EXACT VALUES
    message += `*[EURO] Dettaglio prezzi:*\n`;
    
    // Show individual apartment breakdown if multiple apartments
    if (selectedApartments.length > 1) {
      message += `Prezzo base appartamenti: *${basePrice}€*\n`;
      
      // Show individual apartment prices
      selectedApartments.forEach(apartment => {
        const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
        message += `• ${apartment.name}: ${apartmentPrice}€\n`;
      });
      
      message += `• Prezzo per notte: ~${pricePerNight}€\n`;
      message += `• Prezzo per settimana: ~${pricePerWeek}€\n`;
      message += `• ${nights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'}): ${basePrice}€\n\n`;
    } else {
      message += `Prezzo base appartamento: *${basePrice}€*\n`;
      message += `• Prezzo per notte: ~${pricePerNight}€\n`;
      message += `• Prezzo per settimana: ~${pricePerWeek}€\n`;
      message += `• ${nights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'}): ${basePrice}€\n\n`;
    }
    
    // Extra services if any
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
    
    // Subtotal - USE EXACT VALUE
    message += `Subtotale soggiorno: ${subtotal}€\n\n`;
    
    // Services included in price
    message += `*[CHECK] Servizi inclusi nel prezzo:*\n`;
    message += `• Pulizia finale: (inclusa) +${cleaningFee}€\n`;
    message += `• Tassa di soggiorno: (inclusa) +${touristTax}€\n`;
    if (totalCribs > 0) {
      message += `• Culle per bambini (${totalCribs}): Gratuite\n`;
    }
    message += `\n`;
    
    // Discount if any - SHOW EXACT DISCOUNT VALUE
    if (discount > 0) {
      message += `[SCONTO] *Sconto applicato: -${discount}€*\n\n`;
    }
    
    // Final total - USE EXACT FINAL VALUE
    message += `[TOTALE] *TOTALE FINALE: ${totalFinal}€*\n\n`;
    
    // Payment breakdown - USE EXACT CALCULATED VALUES
    message += `*[PAGAMENTO] Modalità di pagamento:*\n`;
    message += `> Alla prenotazione (30%): *${deposit}€*\n`;
    message += `> All'arrivo (saldo): *${balance}€*\n`;
    message += `> Cauzione (restituibile): *200€*\n\n`;
    
    // Additional notes
    if (formValues.notes) {
      message += `*[NOTE] Note aggiuntive:*\n${formValues.notes}\n\n`;
    }
    
    // Call to action
    message += `[TELEFONO] Per confermare la disponibilità e procedere con la prenotazione, rispondete a questo messaggio!\n\n`;
    message += `*Villa MareBlu - La vostra vacanza da sogno nel Salento*`;
    
    return message;
  } catch (error) {
    console.error("Error creating WhatsApp message:", error);
    return null;
  }
};
