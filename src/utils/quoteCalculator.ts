
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
  const selectedApartmentId = formValues.selectedApartment;
  const apartment = apartments.find(apt => apt.id === selectedApartmentId);
  
  if (!apartment) return { 
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
  
  // Calcolo il prezzo base dell'appartamento
  let basePrice = apartment.price * nights;
  
  // Aggiungo eventuali extra
  const linenOption = formValues.linenOption;
  const extraForLinen = linenOption === "extra" ? 30 : linenOption === "deluxe" ? 60 : 0;
  
  // Calcolo il prezzo degli animali domestici
  let petPrice = 0;
  if (formValues.hasPets) {
    const petsCount = formValues.petsCount || 0;
    const petSize = formValues.petSize;
    
    const pricePerPet = petSize === "small" ? 5 : petSize === "medium" ? 10 : 15;
    petPrice = pricePerPet * petsCount * nights;
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
  const selectedApartmentId = formValues.selectedApartment;
  const apartment = apartments.find(apt => apt.id === selectedApartmentId);
  
  if (!apartment || !formValues.checkIn || !formValues.checkOut) return "";
  
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  // Creo il messaggio per WhatsApp
  const name = formValues.name;
  let message = `${name ? `Salve ${name}, ` : "Salve, "}desidero prenotare a Villa MareBlu:\n`;
  message += `- Periodo: dal ${format(formValues.checkIn, "dd/MM/yyyy")} al ${format(formValues.checkOut, "dd/MM/yyyy")} (${priceInfo.nights} notti)\n`;
  message += `- Ospiti: ${formValues.adults} adulti`;
  
  if (formValues.children > 0) {
    message += `, ${formValues.children} bambini`;
  }
  
  message += `\n- Appartamento: ${apartment.name}\n`;
  message += `- Totale preventivo: ${priceInfo.totalAfterDiscount}€ (+ ${priceInfo.touristTax}€ tassa di soggiorno)`;
  
  return message;
};

// Helper function to format dates
function format(date: Date, formatStr: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return formatStr.replace('dd', day).replace('MM', month).replace('yyyy', year);
}
