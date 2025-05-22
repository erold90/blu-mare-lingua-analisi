import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { TableCell } from "../types";
import { formatItalianDate } from "../formatUtils";

/**
 * Create table data for apartment costs
 * @param selectedApts - Selected apartments
 * @param priceCalculation - Price calculation object
 * @returns Table body rows for apartment costs
 */
export const createApartmentRows = (
  selectedApts: Apartment[],
  priceCalculation: PriceCalculation
): (string | TableCell)[][] => {
  const rows = [];
  
  // Add section header for apartments
  rows.push([{
    content: "APPARTAMENTI",
    styles: { fontStyle: 'bold', textColor: [0, 0, 120] }
  }, ""]);
  
  if (selectedApts.length === 1) {
    // For single apartment, show detailed pricing
    const apt = selectedApts[0];
    const aptPrice = priceCalculation.basePrice || 0;
    const pricePerNight = Math.round(aptPrice / priceCalculation.nights);
    
    rows.push([
      `${apt.name} (${apt.bedrooms} camere, ${apt.capacity} ospiti max)`, 
      ""
    ]);
    
    rows.push([
      `  • Prezzo per notte: €${pricePerNight} x ${priceCalculation.nights} notti`, 
      `€${aptPrice}`
    ]);
    
  } else {
    // For multiple apartments, list each one with details
    selectedApts.forEach((apt) => {
      const aptPrice = priceCalculation.apartmentPrices?.[apt.id] || 0;
      const pricePerNight = Math.round(aptPrice / priceCalculation.nights);
      
      rows.push([
        `${apt.name} (${apt.bedrooms} camere, ${apt.capacity} ospiti max)`, 
        ""
      ]);
      
      rows.push([
        `  • Prezzo per notte: €${pricePerNight} x ${priceCalculation.nights} notti`, 
        `€${aptPrice}`
      ]);
    });
    
    // Add a subtotal row for apartment base prices
    rows.push([{
      content: "Subtotale appartamenti",
      styles: { fontStyle: 'bold' }
    }, {
      content: `€${priceCalculation.basePrice}`,
      styles: { fontStyle: 'bold' }
    }]);
  }
  
  return rows;
};

/**
 * Create table data for extra costs
 * @param priceCalculation - Price calculation object
 * @param formData - Form data
 * @param selectedApts - Selected apartments
 * @returns Table body rows for extras
 */
export const createExtrasRows = (
  priceCalculation: PriceCalculation,
  formData: FormValues,
  selectedApts: Apartment[]
): (string | TableCell)[][] => {
  const rows = [];
  
  // Add section header for extras
  rows.push([{
    content: "EXTRA E SERVIZI",
    styles: { fontStyle: 'bold', textColor: [0, 0, 120] }
  }, ""]);
  
  // Calculate linen cost
  if (formData.linenOption) {
    const totalPeople = (formData.adults || 0) + (formData.children || 0);
    let linenCost = 0;
    let linenLabel = "";
    
    switch (formData.linenOption) {
      case "extra":
        linenCost = totalPeople * 15;
        linenLabel = "Biancheria extra";
        break;
      case "deluxe":
        linenCost = totalPeople * 25;
        linenLabel = "Biancheria deluxe";
        break;
      default:
        linenCost = 0;
        linenLabel = "Biancheria standard (inclusa)";
    }
    
    // Add linen fee if applicable
    if (linenCost > 0) {
      rows.push([
        `${linenLabel} (${totalPeople} persone)`,
        `€${linenCost}`
      ]);
    } else {
      rows.push([
        linenLabel,
        "Inclusa"
      ]);
    }
  }
  
  // Calculate pet cost
  if (formData.hasPets && formData.petsCount && formData.petsCount > 0) {
    const petCost = formData.petsCount * 30;
    rows.push([
      `Supplemento animali (${formData.petsCount} ${formData.petsCount > 1 ? 'animali' : 'animale'})`,
      `€${petCost}`
    ]);
  }
  
  // Add cleaning fee (shown as a separate line item)
  if (priceCalculation.cleaningFee > 0) {
    rows.push([
      `Pulizia finale ${selectedApts.length > 1 ? '(tutti gli appartamenti)' : ''}`,
      `€${priceCalculation.cleaningFee}`
    ]);
  }
  
  // Add tourist tax (always shown)
  const touristTaxPerNight = priceCalculation.touristTaxPerPerson || 2; // Use stored value or default
  const totalTouristTax = formData.adults ? (formData.adults * touristTaxPerNight * priceCalculation.nights) : 0;
  
  if (totalTouristTax > 0) {
    rows.push([
      `Tassa di soggiorno (${touristTaxPerNight}€ x ${formData.adults} persone x ${priceCalculation.nights} notti)`,
      `€${totalTouristTax}`
    ]);
  }
  
  // Add subtotal of extras
  if (priceCalculation.extras > 0 || priceCalculation.cleaningFee > 0 || totalTouristTax > 0) {
    const totalExtras = priceCalculation.extras + priceCalculation.cleaningFee + totalTouristTax;
    rows.push([{
      content: "Subtotale extra e servizi",
      styles: { fontStyle: 'bold' }
    }, {
      content: `€${totalExtras}`,
      styles: { fontStyle: 'bold' }
    }]);
  }
  
  return rows;
};

/**
 * Create table data for included services
 * @param priceCalculation - Price calculation object
 * @returns Table body rows for included services
 */
export const createIncludedServicesRows = (
  priceCalculation: PriceCalculation
): (string | TableCell)[][] => {
  const rows = [];
  
  // Add included services header
  rows.push([{
    content: "SERVIZI INCLUSI",
    styles: { fontStyle: 'bold', textColor: [0, 100, 0] }
  }, ""]);
  
  // List all included services with green color
  rows.push([{
    content: "• WiFi ad alta velocità", 
    styles: { textColor: [0, 128, 0] }
  }, {
    content: "Incluso",
    styles: { textColor: [0, 128, 0] }
  }]);
  
  rows.push([{
    content: "• Posto auto riservato", 
    styles: { textColor: [0, 128, 0] }
  }, {
    content: "Incluso",
    styles: { textColor: [0, 128, 0] }
  }]);
  
  rows.push([{
    content: "• Aria condizionata", 
    styles: { textColor: [0, 128, 0] }
  }, {
    content: "Inclusa",
    styles: { textColor: [0, 128, 0] }
  }]);
  
  rows.push([{
    content: "• Consumi (acqua, elettricità, gas)", 
    styles: { textColor: [0, 128, 0] }
  }, {
    content: "Inclusi",
    styles: { textColor: [0, 128, 0] }
  }]);
  
  rows.push([{
    content: "• Set di cortesia per il bagno", 
    styles: { textColor: [0, 128, 0] }
  }, {
    content: "Incluso",
    styles: { textColor: [0, 128, 0] }
  }]);
  
  return rows;
};
