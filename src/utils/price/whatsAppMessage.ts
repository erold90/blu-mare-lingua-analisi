
// Generate WhatsApp message from quote data
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { formatDate } from "./dateUtils";
import { calculateTotalPrice } from "./priceCalculator";

export const createWhatsAppMessage = (formValues: FormValues, apartments: Apartment[]): string => {
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) return "";
  
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  // Create the WhatsApp message with complete summary information for the host
  const clientName = formValues.name || "Cliente";
  const clientContact = formValues.phone || formValues.email || "Contatto non specificato";
  
  let message = `*Richiesta Preventivo Villa MareBlu*\n\n`;
  message += `Da: ${clientName}\n`;
  message += `Contatto: ${clientContact}\n\n`;
  message += `*Dettagli soggiorno:*\n`;
  message += `- Check-in: ${formatDate(formValues.checkIn)}\n`;
  message += `- Check-out: ${formatDate(formValues.checkOut)}\n`;
  message += `- Durata: ${priceInfo.nights} notti\n\n`;
  
  message += `*Ospiti:*\n`;
  message += `- ${formValues.adults} adulti\n`;
  
  if (formValues.children > 0) {
    const childrenDetails = formValues.childrenDetails || [];
    const sleepingWithParents = childrenDetails.filter(child => child.sleepsWithParents).length;
    const sleepingInCribs = childrenDetails.filter(child => child.sleepsInCrib).length;
    const normalChildren = formValues.children - sleepingWithParents - sleepingInCribs;
    
    message += `- ${formValues.children} bambini totali\n`;
    
    if (sleepingWithParents > 0) {
      message += `  * ${sleepingWithParents} dormono con i genitori\n`;
    }
    
    if (sleepingInCribs > 0) {
      message += `  * ${sleepingInCribs} in culla\n`;
    }
    
    if (normalChildren > 0) {
      message += `  * ${normalChildren} in letto normale\n`;
    }
  }
  
  message += `\n*Appartamenti:*\n`;
  selectedApartments.forEach(apartment => {
    let personsCount = 0;
    if (formValues.personsPerApartment && formValues.personsPerApartment[apartment.id]) {
      personsCount = formValues.personsPerApartment[apartment.id];
    }
    
    const hasPets = formValues.petsInApartment && formValues.petsInApartment[apartment.id];
    
    message += `- ${apartment.name} (${personsCount} persone${hasPets ? ', con animali' : ''})\n`;
  });
  
  message += `\n*Servizi extra:*\n`;
  
  // Biancheria
  if (formValues.linenOption === "extra") {
    message += `- Servizio biancheria: Sì\n`;
  } else {
    message += `- Servizio biancheria: No\n`;
  }
  
  // Animali
  if (formValues.hasPets) {
    message += `- Animali domestici: Sì\n`;
  } else {
    message += `- Animali domestici: No\n`;
  }
  
  // Note aggiuntive
  if (formValues.notes && formValues.notes.trim()) {
    message += `\n*Note:*\n${formValues.notes}\n`;
  }
  
  message += `\n*Riepilogo costi:*\n`;
  message += `- Totale: ${priceInfo.totalAfterDiscount}€\n`;
  message += `- Caparra (30%): ${priceInfo.deposit}€\n`;
  message += `- Cauzione: 200€ (restituibile)\n`;
  message += `- Tassa di soggiorno: inclusa\n`;
  
  return message;
};
