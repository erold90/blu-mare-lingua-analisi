
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

/**
 * Convert string or Date to Date object
 */
const toDateSafe = (date: Date | string | undefined): Date | null => {
  if (!date) return null;
  if (typeof date === 'string') return new Date(date);
  return date;
};

/**
 * Creates a WhatsApp message with quote details
 * Clean text format without emojis
 */
export const createWhatsAppMessage = (formValues: FormValues, apartments: Apartment[]): string | null => {
  // Check if we have necessary data
  if (!formValues.checkIn || !formValues.checkOut || !formValues.selectedApartment) {
    return null;
  }
  
  try {
    // Convert dates to Date objects
    const checkInDate = toDateSafe(formValues.checkIn);
    const checkOutDate = toDateSafe(formValues.checkOut);
    
    if (!checkInDate || !checkOutDate) {
      return null;
    }
    
    // Calculate prices using the same function as the summary
    const priceInfo = calculateTotalPrice(formValues, apartments);
    
    // Get selected apartments
    const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
    const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    if (selectedApartments.length === 0) {
      return null;
    }
    
    // Calculate duration details
    const nights = priceInfo.nights || 0;
    const weeks = Math.ceil(nights / 7);
    
    // Get EXACT values from price calculation
    const { 
      totalBeforeDiscount: subtotal, 
      discount, 
      totalAfterDiscount: totalFinal, 
      deposit, 
      cleaningFee, 
      touristTax 
    } = priceInfo;
    const balance = totalFinal - deposit;
    
    // Calculate total cribs needed
    const totalCribs = formValues.childrenDetails?.filter(child => child.sleepsInCrib)?.length || 0;
    
    // Build WhatsApp message sections
    let message = `*Richiesta Preventivo Villa MareBlu*\n\n`;
    
    // Add all sections
    message += formatDateSection(checkInDate, checkOutDate, nights, weeks);
    message += formatGuestSection(formValues);
    message += formatApartmentsSection(selectedApartments, formValues, priceInfo);
    message += formatServicesSection(formValues, selectedApartments);
    message += formatPriceSection(selectedApartments, priceInfo, nights, weeks);
    message += formatExtrasSection(formValues, selectedApartments, priceInfo);
    message += `Subtotale soggiorno: ${subtotal}€\n\n`;
    message += formatIncludedServicesSection(cleaningFee, touristTax, totalCribs);
    
    // Discount if any (solo arrotondamento, non occupazione che è già mostrato sopra)
    if (discount > 0) {
      message += `*Sconto arrotondamento: -${discount}€*\n\n`;
    }
    
    // Final total con evidenziazione del risparmio totale
    message += `*TOTALE FINALE: ${totalFinal}€*\n`;
    
    // Mostra il risparmio totale se c'è stato uno sconto di occupazione
    if (priceInfo.occupancyDiscount && priceInfo.occupancyDiscount.discountAmount > 0) {
      const totalSavings = priceInfo.occupancyDiscount.discountAmount + discount;
      message += `*🎉 RISPARMIO TOTALE: ${totalSavings}€! 🎉*\n`;
    }
    message += `\n`;
    
    // Payment breakdown
    message += formatPaymentSection(deposit, balance);
    
    // Additional notes
    if (formValues.notes) {
      message += `*Note aggiuntive:*\n${formValues.notes}\n\n`;
    }
    
    return message;
  } catch (error) {
    console.error("Error creating WhatsApp message:", error);
    return null;
  }
};
