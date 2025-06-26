
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "./priceCalculator";
import { toDateSafe } from "./dateConverter";
import { format } from "date-fns";
import { it } from 'date-fns/locale';

/**
 * Crea messaggio WhatsApp con formato semplificato e pulito
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
    
    // Culle totali e bambini che dormono con i genitori
    const totalCribs = formValues.childrenDetails?.filter(child => child.sleepsInCrib)?.length || 0;
    const childrenWithParents = formValues.childrenDetails?.filter(child => child.sleepsWithParents)?.length || 0;
    
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
    
    // Costruzione messaggio semplificato
    let message = `*Richiesta Preventivo Villa MareBlu*\n\n`;
    
    // Date soggiorno
    message += `Date soggiorno:\n`;
    message += `Check-in: ${formattedCheckIn}\n`;
    message += `Check-out: ${formattedCheckOut}\n`;
    message += `Durata: ${formatDuration(nights)}\n\n`;
    
    // Ospiti
    message += `*Ospiti:*\n`;
    message += `Adulti: ${formValues.adults}\n`;
    message += `Bambini: ${formValues.children || 0}\n`;
    
    // Dettagli bambini se presenti
    if (formValues.children && formValues.children > 0 && formValues.childrenDetails && formValues.childrenDetails.length > 0) {
      message += `\n*Dettagli bambini:*\n`;
      formValues.childrenDetails.forEach((child, index) => {
        message += `• Bambino ${index + 1}: `;
        const details = [];
        if (child.isUnder12) details.push("Sotto i 12 anni");
        if (child.sleepsWithParents) details.push("Dorme con i genitori");
        if (child.sleepsInCrib) details.push("Necessita di culla");
        message += details.length > 0 ? details.join(", ") : "Standard";
        message += "\n";
      });
    }
    
    message += `\nTotale ospiti: ${(formValues.adults || 0) + (formValues.children || 0)}`;
    
    // Aggiungi informazioni sui posti letto se ci sono bambini che non li occupano
    if (childrenWithParents > 0 || totalCribs > 0) {
      const effectiveGuests = (formValues.adults || 0) + (formValues.children || 0) - childrenWithParents - totalCribs;
      message += `\nPosti letto necessari: ${effectiveGuests}`;
    }
    message += `\n\n`;
    
    // Appartamenti selezionati
    message += `*Appartamenti selezionati:*\n`;
    selectedApartments.forEach(apartment => {
      const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
      
      // Se c'è uno sconto di occupazione, mostra il prezzo scontato
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
    message += `*Servizi richiesti:*\n`;
    message += `Biancheria: ${formValues.needsLinen ? "SI - Richiesta" : "NO - Non richiesta"}\n`;
    
    if (formValues.hasPets) {
      let apartmentsWithPets = 0;
      if (selectedApartments.length === 1) {
        apartmentsWithPets = 1;
      } else if (formValues.petsInApartment) {
        apartmentsWithPets = Object.values(formValues.petsInApartment).filter(Boolean).length;
      }
      message += `Animali domestici: SI - ${apartmentsWithPets} ${apartmentsWithPets === 1 ? 'appartamento' : 'appartamenti'}\n`;
    } else {
      message += `Animali domestici: NO - Nessuno\n`;
    }
    
    if (totalCribs > 0) {
      message += `Culle richieste: ${totalCribs} (gratuite)\n`;
    }
    
    if (childrenWithParents > 0) {
      message += `Bambini che dormono con i genitori: ${childrenWithParents} (non occupano posto letto)\n`;
    }
    message += `\n`;
    
    // Dettaglio prezzi
    message += `*Dettaglio prezzi:*\n`;
    
    // Se c'è sconto di occupazione, mostra prima il prezzo originale
    if (occupancyDiscount && occupancyDiscount.discountAmount > 0) {
      const originalPrice = occupancyDiscount.originalBasePrice;
      const originalPricePerNight = nights > 0 ? Math.round(originalPrice / nights) : 0;
      const originalPricePerWeek = weeks > 0 ? Math.round(originalPrice / weeks) : 0;
      
      message += `Prezzo listino originale: *${originalPrice}€*\n`;
      message += `• Prezzo per notte: ~${originalPricePerNight}€\n`;
      message += `• Prezzo per settimana: ~${originalPricePerWeek}€\n\n`;
      
      message += `${occupancyDiscount.description}\n`;
      message += `Sconto applicato: -*${occupancyDiscount.discountAmount}€*\n\n`;
    }
    
    // Prezzo base finale
    const pricePerNight = nights > 0 ? Math.round(basePrice / nights) : 0;
    const pricePerWeek = weeks > 0 ? Math.round(basePrice / weeks) : 0;
    
    if (selectedApartments.length > 1) {
      message += `Prezzo base appartamenti: *${basePrice}€*\n`;
    } else {
      message += `Prezzo base appartamento: *${basePrice}€*\n`;
    }
    message += `• Prezzo per notte: ~${pricePerNight}€\n`;
    message += `• Prezzo per settimana: ~${pricePerWeek}€\n`;
    message += `• ${nights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'}): ${basePrice}€\n\n`;
    
    // Servizi extra se presenti - CORRETTA LA VISUALIZZAZIONE
    if (extrasCost > 0) {
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
    message += `*Servizi inclusi nel prezzo:*\n`;
    message += `• Pulizia finale: (inclusa) +${cleaningFee}€\n`;
    message += `• Tassa di soggiorno: (inclusa) +${touristTax}€\n`;
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
    message += `*Modalità di pagamento:*\n`;
    message += `> Alla prenotazione (30%): *${deposit}€*\n`;
    message += `> All'arrivo (saldo): *${balance}€*\n`;
    message += `> Cauzione (restituibile): *200€*\n`;
    
    // Note aggiuntive se presenti
    if (formValues.notes && formValues.notes.trim()) {
      message += `\n*Note aggiuntive:*\n${formValues.notes}`;
    }
    
    console.log("✅ WhatsApp message created successfully");
    return message;
    
  } catch (error) {
    console.error("❌ Error creating WhatsApp message:", error);
    return null;
  }
};
