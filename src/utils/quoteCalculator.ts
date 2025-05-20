import { Apartment } from "../data/apartments";
import { FormValues } from "./quoteFormSchema";

export interface PriceCalculation {
  basePrice: number;
  extras: number;
  cleaningFee: number;
  touristTax: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
  nights: number;
  totalPrice: number;
}

export const calculateTotalPrice = (formValues: FormValues, apartments: Apartment[]): PriceCalculation => {
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0) return { 
    basePrice: 0, 
    extras: 0,
    cleaningFee: 0,
    touristTax: 0, 
    totalBeforeDiscount: 0, 
    totalAfterDiscount: 0,
    discount: 0,
    savings: 0, 
    deposit: 0, 
    nights: 0,
    totalPrice: 0
  };
  
  const checkIn = formValues.checkIn;
  const checkOut = formValues.checkOut;
  
  if (!checkIn || !checkOut) return { 
    basePrice: 0, 
    extras: 0,
    cleaningFee: 0,
    touristTax: 0, 
    totalBeforeDiscount: 0, 
    totalAfterDiscount: 0,
    discount: 0,
    savings: 0, 
    deposit: 0, 
    nights: 0,
    totalPrice: 0
  };
  
  // Calcolo il numero di notti
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcolo il prezzo base degli appartamenti
  let basePrice = selectedApartments.reduce((total, apartment) => {
    return total + (apartment.price * nights);
  }, 0);
  
  // Calculate cleaning fee for each apartment
  let cleaningFee = selectedApartments.reduce((total, apartment) => {
    // Use a default cleaning fee of 50€ per apartment if not specified
    const apartmentCleaningFee = apartment.cleaningFee || 50;
    return total + apartmentCleaningFee;
  }, 0);
  
  // Aggiungo eventuali extra
  let totalExtras = 0;
  
  // Calcolo il costo della biancheria (15€ per persona)
  if (formValues.linenOption === "extra") {
    if (selectedApartments.length === 1 || !formValues.personsPerApartment) {
      // Se c'è un solo appartamento o non sono state specificate le persone per appartamento
      const adults = formValues.adults || 0;
      const childrenDetails = formValues.childrenDetails || [];
      
      // Contiamo solo i bambini che NON dormono con i genitori E NON dormono in culla
      const independentChildren = childrenDetails.filter(child => 
        !child.sleepsWithParents && !child.sleepsInCrib
      ).length;
      
      // Il totale delle persone che necessitano di biancheria
      const totalPeople = adults + independentChildren;
      
      totalExtras += totalPeople * 15; // 15€ per persona
    } else {
      // Se ci sono più appartamenti, calcolo in base alle persone per appartamento
      Object.values(formValues.personsPerApartment).forEach(personCount => {
        totalExtras += personCount * 15;
      });
    }
  }
  
  // Calcolo il prezzo degli animali domestici (50€ per appartamento con animali)
  if (formValues.hasPets) {
    if (selectedApartments.length === 1) {
      // Prezzo fisso di 50€ per un solo appartamento
      totalExtras += 50;
    } else if (selectedApartments.length > 1 && formValues.petsInApartment) {
      // 50€ per ogni appartamento con animali
      const apartmentsWithPets = Object.entries(formValues.petsInApartment)
        .filter(([_, hasPet]) => hasPet)
        .length;
      
      totalExtras += apartmentsWithPets * 50;
    } else {
      // Default se non è specificato quale appartamento ha animali
      totalExtras += 50;
    }
  }
  
  // Calcolo della tassa di soggiorno (1€ per persona per notte, esclusi bambini < 12 anni)
  const adults = formValues.adults || 0;
  const childrenDetails = formValues.childrenDetails || [];
  
  // Conto solo i bambini con età >= 12 anni per la tassa di soggiorno
  const childrenOver12 = childrenDetails.filter(child => !child.isUnder12).length;
  
  // Totale persone che pagano la tassa di soggiorno
  const peoplePayingTax = adults + childrenOver12;
  
  // Calcolo tassa: 1€ per persona per notte
  const touristTax = peoplePayingTax * nights * 1;
  
  // Include cleaning fee in the total price calculation
  const totalBeforeDiscount = basePrice + totalExtras + touristTax + cleaningFee;
  
  // Arrotondamento per difetto al multiplo di 50 più vicino
  const roundedPrice = Math.floor(totalBeforeDiscount / 50) * 50;
  
  // Calculate the discount amount
  const discount = totalBeforeDiscount - roundedPrice;
  
  return {
    basePrice,
    extras: totalExtras,
    cleaningFee,
    touristTax,
    totalBeforeDiscount,
    totalAfterDiscount: roundedPrice,
    discount,
    savings: discount,
    deposit: Math.ceil(roundedPrice * 0.3), // 30% di caparra
    nights,
    totalPrice: roundedPrice
  };
};

export const createWhatsAppMessage = (formValues: FormValues, apartments: Apartment[]): string => {
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) return "";
  
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  // Creo il messaggio per WhatsApp con informazioni di riepilogo complete per l'host
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

// Helper function to format dates correctly
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}
