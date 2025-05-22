
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
  
  if (priceCalculation.extras > 0) {
    // Calculate linen cost
    let linenCost = 0;
    if (formData.linenOption === "extra") {
      const totalPeople = (formData.adults || 0) + (formData.children || 0);
      linenCost = totalPeople * 15;
    }
    
    // Calculate pet cost
    let petCost = 0;
    if (formData.hasPets) {
      if (selectedApts.length === 1) {
        petCost = 50; // Single apartment with pets
      } else if (formData.petsInApartment) {
        // Count apartments with pets
        const apartmentsWithPets = Object.values(formData.petsInApartment).filter(Boolean).length;
        petCost = apartmentsWithPets * 50;
      }
    }
    
    // Add linen fee if applicable
    if (linenCost > 0) {
      const linenLabel = formData.linenOption === "deluxe" ? 
        "Biancheria deluxe" : "Biancheria da letto e bagno";
      rows.push([linenLabel, `€${linenCost}`]);
    }
    
    // Add pet fee if applicable
    if (petCost > 0) {
      if (selectedApts.length === 1) {
        rows.push(["Supplemento animali", `€${petCost}`]);
      } else {
        const apartmentsWithPets = Object.entries(formData.petsInApartment || {})
          .filter(([_, hasPet]) => hasPet);
        
        if (apartmentsWithPets.length === 1) {
          const [aptId, _] = apartmentsWithPets[0];
          const apartment = selectedApts.find(apt => apt.id === aptId);
          if (apartment) {
            rows.push([`Supplemento animali - ${apartment.name}`, `€${petCost}`]);
          }
        } else if (apartmentsWithPets.length > 1) {
          rows.push([`Supplemento animali (${apartmentsWithPets.length} appartamenti)`, `€${petCost}`]);
        }
      }
    }
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
  
  // Add cleaning fee
  if (priceCalculation.cleaningFee > 0) {
    rows.push([{
      content: "Pulizie finali", 
      styles: { textColor: [0, 128, 0] }
    }, {
      content: "incluse",
      styles: { textColor: [0, 128, 0], halign: 'right' }
    }]);
  }
  
  // Add tourist tax (showing as included)
  rows.push([{
    content: "Tassa di soggiorno", 
    styles: { textColor: [0, 128, 0] }
  }, {
    content: "inclusa",
    styles: { textColor: [0, 128, 0], halign: 'right' }
  }]);
  
  return rows;
};
