
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "./priceCalculator";
import { formatDateSection } from "./whatsApp/dateFormatter";
import { 
  formatGuestSection, 
  formatApartmentsSection, 
  formatServicesSection, 
  formatPaymentSection 
} from "./whatsApp/messageFormatter";
import { 
  formatPriceSection, 
  formatExtrasSection, 
  formatIncludedServicesSection 
} from "./whatsApp/priceFormatter";
import { toDateSafe } from "./dateConverter";

/**
 * Crea messaggio WhatsApp con dettagli preventivo ottimizzato
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
    
    // Valori dal calcolo prezzi
    const { 
      totalBeforeDiscount: subtotal, 
      discount, 
      totalAfterDiscount: totalFinal, 
      deposit, 
      cleaningFee, 
      touristTax 
    } = priceInfo;
    const balance = totalFinal - deposit;
    
    // Culle totali
    const totalCribs = formValues.childrenDetails?.filter(child => child.sleepsInCrib)?.length || 0;
    
    // Costruzione messaggio migliorato
    let message = `🏖️ *RICHIESTA PREVENTIVO VILLA MAREBLU* 🏖️\n\n`;
    
    // Sezioni del messaggio con formato migliorato
    message += formatDateSection(checkInDate, checkOutDate, nights, weeks);
    message += formatGuestSection(formValues);
    message += formatApartmentsSection(selectedApartments, formValues, priceInfo);
    message += formatServicesSection(formValues, selectedApartments);
    message += formatPriceSection(selectedApartments, priceInfo, nights, weeks);
    message += formatExtrasSection(formValues, selectedApartments, priceInfo);
    message += `💰 Subtotale soggiorno: *${subtotal}€*\n\n`;
    message += formatIncludedServicesSection(cleaningFee, touristTax, totalCribs);
    
    // Sconto se presente
    if (discount > 0) {
      message += `💸 *Sconto arrotondamento: -${discount}€*\n\n`;
    }
    
    // Totale finale
    message += `🎯 *TOTALE FINALE: ${totalFinal}€*\n`;
    
    // Risparmio totale
    if (priceInfo.occupancyDiscount && priceInfo.occupancyDiscount.discountAmount > 0) {
      const totalSavings = priceInfo.occupancyDiscount.discountAmount + discount;
      message += `🎉 *RISPARMIO TOTALE: ${totalSavings}€!* 🎉\n`;
    }
    message += `\n`;
    
    // Modalità pagamento
    message += formatPaymentSection(deposit, balance);
    
    // Note aggiuntive se presenti
    if (formValues.notes && formValues.notes.trim()) {
      message += `📝 *Note aggiuntive:*\n${formValues.notes}\n\n`;
    }
    
    console.log("✅ WhatsApp message created successfully");
    return message;
    
  } catch (error) {
    console.error("❌ Error creating WhatsApp message:", error);
    return null;
  }
};
