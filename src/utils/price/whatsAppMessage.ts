
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "./priceCalculator";
import { toDateSafe } from "./dateConverter";
import { format } from "date-fns";
import { it } from 'date-fns/locale';

/**
 * Crea messaggio WhatsApp con formato semplificato e dettagli bambini corretti
 */
export const createWhatsAppMessage = (formValues: FormValues, apartments: Apartment[]): string | null => {
  // Validazione input
  if (!formValues.checkIn || !formValues.checkOut || !formValues.selectedApartment) {
    console.log("❌ Missing required data for WhatsApp message");
    return null;
  }
  
  try {
    // Conversione date sicura
    const checkInDate = toDateSafe(formValues.checkIn);
    const checkOutDate = toDateSafe(formValues.checkOut);
    
    if (!checkInDate || !checkOutDate) {
      console.log("❌ Invalid dates for WhatsApp message");
      return null;
    }
    
    // Calcolo prezzi
    const priceInfo = calculateTotalPrice(formValues, apartments);
    
    // Appartamenti selezionati
    const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
    const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    if (selectedApartments.length === 0) {
      console.log("❌ No apartments found for WhatsApp message");
      return null;
    }
    
    // Dettagli durata
    const nights = priceInfo.nights || 0;
    const weeks = Math.ceil(nights / 7);
    
    // Valori dai calcoli
    const { 
      totalAfterDiscount: totalFinal, 
      deposit, 
      cleaningFee, 
      touristTax,
      extras: extrasCost,
      basePrice,
      occupancyDiscount,
      discount: roundingDiscount
    } = priceInfo;
    
    const balance = totalFinal - deposit;
    
    // Analisi dettagli bambini
    const childrenDetails = formValues.childrenDetails || [];
    const totalCribs = childrenDetails.filter(child => child.sleepsInCrib).length;
    const childrenWithParents = childrenDetails.filter(child => child.sleepsWithParents).length;
    const childrenUnder12 = childrenDetails.filter(child => child.isUnder12).length;
    const childrenOver12 = (formValues.children || 0) - childrenUnder12;
    
    // Formattazione date
    const formattedCheckIn = format(checkInDate, "EEEE dd MMMM yyyy", { locale: it });
    const formattedCheckOut = format(checkOutDate, "EEEE dd MMMM yyyy", { locale: it });
    
    // Durata formattata
    const formatDuration = (totalNights: number): string => {
      const weeks = Math.floor(totalNights / 7);
      const extraNights = totalNights % 7;
      
      if (weeks === 0) {
        return `${totalNights} ${totalNights === 1 ? 'notte' : 'notti'}`;
      }
      
      if (extraNights === 0) {
        return `${totalNights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'})`;
      }
      
      return `${totalNights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'} + ${extraNights} ${extraNights === 1 ? 'notte' : 'notti'})`;
    };
    
    // Costruzione messaggio
    let message = `*Richiesta Preventivo Villa MareBlu*\n\n`;
    
    // Date soggiorno
    message += `📅 *PERIODO SOGGIORNO*\n`;
    message += `Check-in: ${formattedCheckIn}\n`;
    message += `Check-out: ${formattedCheckOut}\n`;
    message += `Durata: ${formatDuration(nights)}\n\n`;
    
    // Ospiti con dettagli bambini
    message += `👥 *COMPOSIZIONE GRUPPO*\n`;
    message += `Adulti: ${formValues.adults}\n`;
    message += `Bambini: ${formValues.children || 0}\n`;
    
    // Dettagli specifici bambini se presenti
    if ((formValues.children || 0) > 0 && childrenDetails.length > 0) {
      message += `\n👶 *Dettagli bambini:*\n`;
      
      // Riassunto per età
      if (childrenUnder12 > 0) {
        message += `• Sotto 12 anni: ${childrenUnder12} (tassa soggiorno gratuita)\n`;
      }
      if (childrenOver12 > 0) {
        message += `• Sopra 12 anni: ${childrenOver12}\n`;
      }
      
      // Sistemazioni speciali
      if (childrenWithParents > 0) {
        message += `• Dormono con genitori: ${childrenWithParents} (non occupano posto letto)\n`;
      }
      if (totalCribs > 0) {
        message += `• Necessitano culla: ${totalCribs} (gratuite)\n`;
      }
      
      message += `\n📋 *Dettaglio per bambino:*\n`;
      childrenDetails.forEach((child, index) => {
        message += `Bambino ${index + 1}: `;
        const details = [];
        if (child.isUnder12) details.push("Sotto 12 anni");
        if (child.sleepsWithParents) details.push("Dorme con genitori");
        if (child.sleepsInCrib) details.push("Culla richiesta");
        if (details.length === 0) details.push("Standard");
        message += details.join(", ") + "\n";
      });
    }
    
    message += `\nTotale ospiti: ${(formValues.adults || 0) + (formValues.children || 0)}`;
    
    // Posti letto effettivi se diversi
    if (childrenWithParents > 0 || totalCribs > 0) {
      const effectiveGuests = (formValues.adults || 0) + (formValues.children || 0) - childrenWithParents - totalCribs;
      message += `\nPosti letto necessari: ${effectiveGuests}`;
    }
    message += `\n\n`;
    
    // Appartamenti selezionati
    message += `🏠 *APPARTAMENTI SELEZIONATI*\n`;
    selectedApartments.forEach(apartment => {
      const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
      
      if (occupancyDiscount && occupancyDiscount.discountAmount > 0) {
        const originalTotal = occupancyDiscount.originalBasePrice;
        const discountedTotal = basePrice;
        const originalPrice = Math.round((apartmentPrice / discountedTotal) * originalTotal);
        message += `• ${apartment.name}: ~~${originalPrice}€~~ → ${apartmentPrice}€\n`;
      } else {
        message += `• ${apartment.name}: ${apartmentPrice}€\n`;
      }
    });
    message += `\n`;
    
    // Servizi richiesti
    message += `🛎️ *SERVIZI RICHIESTI*\n`;
    message += `Biancheria: ${formValues.needsLinen ? "✅ Richiesta" : "❌ Non richiesta"}\n`;
    
    if (formValues.hasPets) {
      let apartmentsWithPets = 0;
      if (selectedApartments.length === 1) {
        apartmentsWithPets = 1;
      } else if (formValues.petsInApartment) {
        apartmentsWithPets = Object.values(formValues.petsInApartment).filter(Boolean).length;
      }
      message += `Animali domestici: ✅ SI (${apartmentsWithPets} ${apartmentsWithPets === 1 ? 'appartamento' : 'appartamenti'})\n`;
    } else {
      message += `Animali domestici: ❌ Nessuno\n`;
    }
    
    if (totalCribs > 0) {
      message += `Culle richieste: ${totalCribs} (gratuite)\n`;
    }
    message += `\n`;
    
    // Dettaglio prezzi
    message += `💰 *DETTAGLIO PREZZI*\n`;
    
    // Prezzo originale se c'è sconto occupazione
    if (occupancyDiscount && occupancyDiscount.discountAmount > 0) {
      const originalPrice = occupancyDiscount.originalBasePrice;
      const originalPricePerNight = nights > 0 ? Math.round(originalPrice / nights) : 0;
      
      message += `Prezzo listino originale: ${originalPrice}€\n`;
      message += `• Prezzo per notte: ~${originalPricePerNight}€\n\n`;
      
      message += `${occupancyDiscount.description}\n`;
      message += `Sconto applicato: -*${occupancyDiscount.discountAmount}€*\n\n`;
    }
    
    // Prezzo base finale
    const pricePerNight = nights > 0 ? Math.round(basePrice / nights) : 0;
    
    message += `Prezzo base: *${basePrice}€*\n`;
    message += `• Prezzo per notte: ~${pricePerNight}€\n`;
    message += `• ${nights} notti: ${basePrice}€\n\n`;
    
    // Servizi extra se presenti
    if (extrasCost > 0) {
      const extraDetails = [];
      
      if (formValues.needsLinen) {
        const totalPeople = (formValues.adults || 0) + (formValues.children || 0);
        const guestsNeedingLinen = totalPeople - childrenWithParents - totalCribs;
        const linenCost = guestsNeedingLinen * 15;
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
      
      message += `Servizi extra: ${extrasCost}€`;
      if (extraDetails.length > 0) {
        message += ` (${extraDetails.join(", ")})`;
      }
      message += `\n\n`;
    }
    
    // Subtotale
    const subtotal = basePrice + extrasCost;
    message += `Subtotale soggiorno: ${subtotal}€\n\n`;
    
    // Servizi inclusi
    message += `📋 *SERVIZI INCLUSI NEL PREZZO*\n`;
    message += `• Pulizia finale: ${cleaningFee}€\n`;
    message += `• Tassa di soggiorno: ${touristTax}€`;
    if (childrenUnder12 > 0) {
      message += ` (${childrenUnder12} bambini esenti)`;
    }
    message += `\n`;
    if (totalCribs > 0) {
      message += `• Culle per bambini (${totalCribs}): Gratuite\n`;
    }
    message += `\n`;
    
    // Sconto arrotondamento se presente
    if (roundingDiscount > 0) {
      message += `Sconto arrotondamento: -*${roundingDiscount}€*\n\n`;
    }
    
    // Totale finale
    message += `*TOTALE FINALE: ${totalFinal}€*\n\n`;
    
    // Risparmio totale se presente
    let totalSavings = roundingDiscount;
    if (occupancyDiscount && occupancyDiscount.discountAmount > 0) {
      totalSavings += occupancyDiscount.discountAmount;
    }
    
    if (totalSavings > 0) {
      message += `*RISPARMIO TOTALE: ${totalSavings}€*\n\n`;
    }
    
    // Modalità pagamento
    message += `💳 *MODALITÀ DI PAGAMENTO*\n`;
    message += `> Alla prenotazione (30%): *${deposit}€*\n`;
    message += `> All'arrivo (saldo): *${balance}€*\n`;
    message += `> Cauzione (restituibile): *200€*\n`;
    
    // Note aggiuntive se presenti
    if (formValues.notes && formValues.notes.trim()) {
      message += `\n📝 *Note aggiuntive:*\n${formValues.notes}`;
    }
    
    console.log("✅ WhatsApp message created successfully with children details");
    return message;
    
  } catch (error) {
    console.error("❌ Error creating WhatsApp message:", error);
    return null;
  }
};
