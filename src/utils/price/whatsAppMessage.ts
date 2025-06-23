
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
 * Creates a WhatsApp message with quote details
 * Using only text labels for maximum compatibility
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
    message += formatDateSection(formValues.checkIn, formValues.checkOut, nights, weeks);
    message += formatGuestSection(formValues);
    message += formatApartmentsSection(selectedApartments, formValues, priceInfo);
    message += formatServicesSection(formValues, selectedApartments);
    message += formatPriceSection(selectedApartments, priceInfo, nights, weeks);
    message += formatExtrasSection(formValues, selectedApartments, priceInfo);
    message += `Subtotale soggiorno: ${subtotal}€\n\n`;
    message += formatIncludedServicesSection(cleaningFee, touristTax, totalCribs);
    
    // Discount if any
    if (discount > 0) {
      message += `[SCONTO] *Sconto applicato: -${discount}€*\n\n`;
    }
    
    // Final total
    message += `[TOTALE] *TOTALE FINALE: ${totalFinal}€*\n\n`;
    
    // Payment breakdown
    message += formatPaymentSection(deposit, balance);
    
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
