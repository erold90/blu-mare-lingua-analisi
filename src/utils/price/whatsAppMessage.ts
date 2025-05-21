
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
    
    // Create message
    let message = `*Richiesta Preventivo* 📝\n\n`;
    
    // Guest info
    message += `*Cliente:* ${formValues.name || "Cliente"}\n`;
    message += `*Email:* ${formValues.email || "Non specificata"}\n`;
    message += `*Telefono:* ${formValues.phone || "Non specificato"}\n\n`;
    
    // Stay details
    message += `*Date soggiorno:*\n`;
    message += `Check-in: ${formattedCheckIn}\n`;
    message += `Check-out: ${formattedCheckOut}\n`;
    message += `Durata: ${priceInfo.nights} notti\n\n`;
    
    // Guest details
    message += `*Ospiti:*\n`;
    message += `Adulti: ${formValues.adults}\n`;
    message += `Bambini: ${formValues.children || 0}\n`;
    message += `Totale: ${(formValues.adults || 0) + (formValues.children || 0)}\n\n`;
    
    // Apartments
    message += `*Appartamenti:*\n`;
    selectedApartments.forEach(apartment => {
      const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
      message += `- ${apartment.name}: ${apartmentPrice}€\n`;
    });
    message += `\n`;
    
    // Cost summary
    message += `*Riepilogo costi:*\n`;
    message += `Costo appartamenti: ${priceInfo.basePrice}€\n`;
    message += `Pulizia finale: ${priceInfo.cleaningFee}€ (inclusa)\n`;
    
    if (priceInfo.extras > 0) {
      message += `Servizi extra: ${priceInfo.extras}€\n`;
    }
    
    message += `Subtotale: ${priceInfo.subtotal}€\n`;
    message += `Tassa di soggiorno: ${priceInfo.touristTax}€\n`;
    
    if (priceInfo.discount > 0) {
      message += `Totale con sconto: ${priceInfo.totalAfterDiscount}€\n`;
      message += `Risparmio: ${priceInfo.discount}€\n`;
    } else {
      message += `Totale: ${priceInfo.totalAfterDiscount}€\n`;
    }
    
    message += `\n*Totale da pagare: ${priceInfo.totalAfterDiscount}€*\n`;
    message += `Caparra (30%): ${priceInfo.deposit}€\n\n`;
    
    // Additional notes
    if (formValues.notes) {
      message += `*Note:*\n${formValues.notes}\n\n`;
    }
    
    message += `Grazie per la richiesta! Ti contatteremo al più presto per confermare la disponibilità.`;
    
    return message;
  } catch (error) {
    console.error("Error creating WhatsApp message:", error);
    return null;
  }
};
