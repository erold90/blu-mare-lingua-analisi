
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { TableCell } from "../types";

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
  
  if (selectedApts.length === 1) {
    // For single apartment, show nights info
    const aptPrice = priceCalculation.basePrice || 0;
    rows.push([
      `${selectedApts[0].name} (${priceCalculation.nights} notti)`, 
      `€${aptPrice}`
    ]);
  } else {
    // For multiple apartments, list each one separately
    selectedApts.forEach((apt) => {
      const aptPrice = priceCalculation.apartmentPrices?.[apt.id] || 0;
      rows.push([apt.name, `€${aptPrice}`]);
    });
    
    // Add a subtotal row for apartment base prices
    rows.push([
      "Subtotale appartamenti", 
      `€${priceCalculation.basePrice}`
    ]);
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
  
  // Always show extras section header if there are extras
  if (priceCalculation.extras > 0) {
    // Calculate linen cost
    let linenCost = 0;
    if (formData.linenOption === "extra") {
      const totalPeople = (formData.adults || 0) + (formData.children || 0);
      linenCost = totalPeople * 15;
      
      // Add linen fee
      const linenLabel = formData.linenOption === "extra" ? 
        "Biancheria extra" : "Biancheria deluxe";
      rows.push([linenLabel, `€${linenCost}`]);
    }
    
    // Calculate pet cost
    if (formData.hasPets && formData.petsCount && formData.petsCount > 0) {
      const petCost = formData.petsCount * 30;
      rows.push([`Supplemento animali (${formData.petsCount})`, `€${petCost}`]);
    }
  }
  
  // Add cleaning fee (shown as a separate line item)
  if (priceCalculation.cleaningFee > 0) {
    rows.push(["Pulizia finale", `€${priceCalculation.cleaningFee}`]);
  }
  
  // Add tourist tax (always shown)
  const touristTaxPerNight = 2; // Default value
  const totalTouristTax = formData.adults ? (formData.adults * touristTaxPerNight * priceCalculation.nights) : 0;
  
  if (totalTouristTax > 0) {
    rows.push([
      `Tassa di soggiorno (${touristTaxPerNight}€ x ${formData.adults} persone x ${priceCalculation.nights} notti)`,
      `€${totalTouristTax}`
    ]);
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
  
  // Add included services note
  rows.push([{
    content: "Servizi inclusi:", 
    styles: { fontStyle: 'bold' }
  }, ""]);
  
  // List all included services
  rows.push([{
    content: "- WiFi ad alta velocità", 
    styles: { textColor: [0, 128, 0] }
  }, ""]);
  
  rows.push([{
    content: "- Posto auto riservato", 
    styles: { textColor: [0, 128, 0] }
  }, ""]);
  
  rows.push([{
    content: "- Aria condizionata", 
    styles: { textColor: [0, 128, 0] }
  }, ""]);
  
  return rows;
};
