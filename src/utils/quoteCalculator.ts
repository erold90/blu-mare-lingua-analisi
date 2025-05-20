
import { Apartment } from "../data/apartments";
import { FormValues } from "./quoteFormSchema";

export interface PriceCalculation {
  basePrice: number;
  extras: number;
  touristTax: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  savings: number;
  deposit: number;
  nights: number;
}

export const calculateTotalPrice = (formValues: FormValues, apartments: Apartment[]): PriceCalculation => {
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0) return { 
    basePrice: 0, 
    extras: 0, 
    touristTax: 0, 
    totalBeforeDiscount: 0, 
    totalAfterDiscount: 0, 
    savings: 0, 
    deposit: 0, 
    nights: 0 
  };
  
  const checkIn = formValues.checkIn;
  const checkOut = formValues.checkOut;
  
  if (!checkIn || !checkOut) return { 
    basePrice: 0, 
    extras: 0, 
    touristTax: 0, 
    totalBeforeDiscount: 0, 
    totalAfterDiscount: 0, 
    savings: 0, 
    deposit: 0, 
    nights: 0 
  };
  
  // Calcolo il numero di notti
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcolo il prezzo base degli appartamenti
  let basePrice = selectedApartments.reduce((total, apartment) => {
    return total + (apartment.price * nights);
  }, 0);
  
  // Aggiungo eventuali extra
  const linenOption = formValues.linenOption;
  
  // Calcolo il costo della biancheria (15€ per persona)
  let extraForLinen = 0;
  if (linenOption === "extra") {
    const adults = formValues.adults || 0;
    const childrenDetails = formValues.childrenDetails || [];
    const independentChildren = childrenDetails.filter(child => !child.sleepsWithParents).length;
    const totalPeople = adults + independentChildren;
    
    extraForLinen = totalPeople * 15; // 15€ per persona
  }
  
  // Calcolo il prezzo degli animali domestici (50€ per appartamento con animali)
  let petPrice = 0;
  if (formValues.hasPets) {
    if (selectedApartments.length === 1) {
      // Prezzo fisso di 50€ per un solo appartamento
      petPrice = 50;
    } else if (selectedApartments.length > 1 && formValues.petsInApartment) {
      // 50€ per ogni appartamento con animali
      const apartmentsWithPets = Object.entries(formValues.petsInApartment)
        .filter(([_, hasPet]) => hasPet)
        .length;
      
      petPrice = apartmentsWithPets * 50;
    } else {
      // Default se non è specificato quale appartamento ha animali
      petPrice = 50;
    }
  }
  
  // Calcolo della tassa di soggiorno
  const adults = formValues.adults;
  const touristTax = adults * nights * 2; // € 2 per persona per notte
  
  // Prezzo totale (esclusa tassa di soggiorno)
  const totalPrice = basePrice + extraForLinen + petPrice;
  
  // Arrotondamento per difetto al multiplo di 50 più vicino
  const roundedPrice = Math.floor(totalPrice / 50) * 50;
  
  return {
    basePrice,
    extras: extraForLinen + petPrice,
    touristTax,
    totalBeforeDiscount: totalPrice,
    totalAfterDiscount: roundedPrice,
    savings: totalPrice - roundedPrice,
    deposit: Math.ceil(roundedPrice * 0.3), // 30% di caparra
    nights
  };
};

export const createWhatsAppMessage = (formValues: FormValues, apartments: Apartment[]): string => {
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) return "";
  
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  // Creo il messaggio per WhatsApp
  const name = formValues.name;
  let message = `${name ? `Salve ${name}, ` : "Salve, "}desidero prenotare a Villa MareBlu:\n`;
  message += `- Periodo: dal ${formatDate(formValues.checkIn)} al ${formatDate(formValues.checkOut)} (${priceInfo.nights} notti)\n`;
  message += `- Ospiti: ${formValues.adults} adulti`;
  
  if (formValues.children > 0) {
    message += `, ${formValues.children} bambini`;
  }
  
  message += "\n- Appartamenti:";
  selectedApartments.forEach(apartment => {
    message += `\n  * ${apartment.name}`;
  });
  
  // Aggiungo informazioni su servizi extra
  message += "\n- Servizi extra:";
  
  // Biancheria
  if (formValues.linenOption === "extra") {
    message += "\n  * Servizio biancheria incluso";
  }
  
  // Animali
  if (formValues.hasPets) {
    message += "\n  * Con animali domestici";
    
    if (selectedApartments.length > 1 && formValues.petsInApartment) {
      const apartmentsWithPets = Object.entries(formValues.petsInApartment)
        .filter(([id, hasPet]) => hasPet)
        .map(([id]) => selectedApartments.find(apt => apt.id === id)?.name || id);
      
      message += ` (in ${apartmentsWithPets.join(", ")})`;
    }
  }
  
  message += `\n- Totale preventivo: ${priceInfo.totalAfterDiscount}€ (+ ${priceInfo.touristTax}€ tassa di soggiorno)`;
  
  return message;
};

// Helper function to format dates correctly
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}
