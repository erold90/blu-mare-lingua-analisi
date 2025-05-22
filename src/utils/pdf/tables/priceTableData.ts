
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { TableCell } from "../types";
import { formatItalianDate } from "../formatUtils";

/**
 * Create table data for apartment costs
 */
export const createApartmentRows = (
  selectedApts: Apartment[],
  priceCalculation: PriceCalculation
): (string | TableCell)[][] => {
  const rows: (string | TableCell)[][] = [];
  
  // Add section header for apartments with elegant styling
  rows.push([{
    content: "APPARTAMENTI",
    styles: { fontStyle: 'bold', textColor: [0, 50, 100], fontSize: 10 }
  }, {
    content: "",
    styles: {}
  }]);
  
  if (selectedApts.length === 1) {
    // For single apartment, show detailed pricing
    const apt = selectedApts[0];
    const aptPrice = priceCalculation.basePrice || 0;
    const pricePerNight = Math.round(aptPrice / priceCalculation.nights);
    
    rows.push([{
      content: `${apt.name} (${apt.bedrooms} camere, ${apt.capacity} ospiti max)`,
      styles: { fontStyle: 'bold' }
    }, {
      content: "",
      styles: {}
    }]);
    
    rows.push([
      `  • Soggiorno: ${priceCalculation.nights} notti a € ${pricePerNight} per notte`, 
      {
        content: `€ ${aptPrice}`,
        styles: { halign: 'right' }
      }
    ]);
    
    // Add apartment features
    rows.push([
      `  • ${apt.size} m² • ${apt.beds} posti letto`, 
      {
        content: "",
        styles: {}
      }
    ]);
    
  } else {
    // For multiple apartments, list each one with details
    selectedApts.forEach((apt, index) => {
      const aptPrice = priceCalculation.apartmentPrices?.[apt.id] || 0;
      const pricePerNight = Math.round(aptPrice / priceCalculation.nights);
      
      rows.push([{
        content: `${apt.name} (${apt.bedrooms} camere, ${apt.capacity} ospiti max)`,
        styles: { fontStyle: 'bold' }
      }, {
        content: "",
        styles: {}
      }]);
      
      rows.push([
        `  • Soggiorno: ${priceCalculation.nights} notti a € ${pricePerNight} per notte`, 
        {
          content: `€ ${aptPrice}`,
          styles: { halign: 'right' }
        }
      ]);
      
      // Add apartment features
      rows.push([
        `  • ${apt.size} m² • ${apt.beds} posti letto`, 
        {
          content: "",
          styles: {}
        }
      ]);
      
      // Add separator between apartments (except after the last one)
      if (index < selectedApts.length - 1) {
        rows.push([{
          content: "",
          styles: {}
        }, {
          content: "",
          styles: {}
        }]);
      }
    });
    
    // Add a subtotal row for apartment base prices
    rows.push([{
      content: "Subtotale appartamenti",
      styles: { fontStyle: 'bold' }
    }, {
      content: `€ ${priceCalculation.basePrice}`,
      styles: { fontStyle: 'bold', halign: 'right' }
    }]);
  }
  
  return rows;
};

/**
 * Create table data for extra costs
 */
export const createExtrasRows = (
  priceCalculation: PriceCalculation,
  formData: FormValues,
  selectedApts: Apartment[]
): (string | TableCell)[][] => {
  const rows: (string | TableCell)[][] = [];
  
  // Add section header for extras with elegant styling
  rows.push([{
    content: "EXTRA E SERVIZI",
    styles: { fontStyle: 'bold', textColor: [0, 50, 100], fontSize: 10 }
  }, {
    content: "",
    styles: {}
  }]);
  
  // Calculate linen cost with more details
  if (formData.linenOption) {
    const totalPeople = (formData.adults || 0) + (formData.children || 0);
    let linenCost = 0;
    let linenLabel = "";
    let pricePerPerson = 0;
    
    switch (formData.linenOption) {
      case "extra":
        pricePerPerson = 15;
        linenCost = totalPeople * pricePerPerson;
        linenLabel = "Biancheria extra";
        break;
      case "deluxe":
        pricePerPerson = 25;
        linenCost = totalPeople * pricePerPerson;
        linenLabel = "Biancheria deluxe";
        break;
      default:
        linenCost = 0;
        linenLabel = "Biancheria standard";
        pricePerPerson = 0;
    }
    
    // Add linen fee with detailed description
    if (linenCost > 0) {
      rows.push([
        `${linenLabel} (${totalPeople} persone x € ${pricePerPerson})`,
        {
          content: `€ ${linenCost}`,
          styles: { halign: 'right' }
        }
      ]);
    } else {
      rows.push([
        linenLabel,
        {
          content: "Inclusa",
          styles: { halign: 'right', textColor: [0, 128, 0] }
        }
      ]);
    }
  }
  
  // Calculate pet cost with details
  if (formData.hasPets && formData.petsCount && formData.petsCount > 0) {
    const petCostPerAnimal = 30;
    const petCost = formData.petsCount * petCostPerAnimal;
    rows.push([
      `Supplemento animali (${formData.petsCount} ${formData.petsCount > 1 ? 'animali' : 'animale'} x € ${petCostPerAnimal})`,
      {
        content: `€ ${petCost}`,
        styles: { halign: 'right' }
      }
    ]);
  }
  
  // Add cleaning fee with detailed description
  if (priceCalculation.cleaningFee > 0) {
    const apartmentText = selectedApts.length > 1 
      ? `${selectedApts.length} appartamenti` 
      : '1 appartamento';
      
    rows.push([
      `Pulizia finale (${apartmentText})`,
      {
        content: `€ ${priceCalculation.cleaningFee}`,
        styles: { halign: 'right' }
      }
    ]);
  }
  
  // Add tourist tax with detailed calculation
  const touristTaxPerNight = priceCalculation.touristTaxPerPerson || 2;
  const totalTouristTax = formData.adults ? (formData.adults * touristTaxPerNight * priceCalculation.nights) : 0;
  
  if (totalTouristTax > 0) {
    rows.push([
      `Tassa di soggiorno (${formData.adults} adulti x € ${touristTaxPerNight} x ${priceCalculation.nights} notti)`,
      {
        content: `€ ${totalTouristTax}`,
        styles: { halign: 'right' }
      }
    ]);
  }
  
  // Add subtotal of extras
  if (priceCalculation.extras > 0 || priceCalculation.cleaningFee > 0 || totalTouristTax > 0) {
    const totalExtras = priceCalculation.extras + priceCalculation.cleaningFee + totalTouristTax;
    rows.push([{
      content: "Subtotale extra e servizi",
      styles: { fontStyle: 'bold' }
    }, {
      content: `€ ${totalExtras}`,
      styles: { fontStyle: 'bold', halign: 'right' }
    }]);
  }
  
  return rows;
};

/**
 * Create table data for included services
 */
export const createIncludedServicesRows = (
  priceCalculation: PriceCalculation
): (string | TableCell)[][] => {
  const rows: (string | TableCell)[][] = [];
  
  // Add included services header with elegant styling
  rows.push([{
    content: "SERVIZI INCLUSI",
    styles: { fontStyle: 'bold', textColor: [0, 100, 50], fontSize: 10 }
  }, {
    content: "",
    styles: {}
  }]);
  
  // List all included services with green color
  rows.push([{
    content: "• WiFi ad alta velocità", 
    styles: { textColor: [0, 120, 0] }
  }, {
    content: "Incluso",
    styles: { textColor: [0, 120, 0], halign: 'right' }
  }]);
  
  rows.push([{
    content: "• Posto auto riservato", 
    styles: { textColor: [0, 120, 0] }
  }, {
    content: "Incluso",
    styles: { textColor: [0, 120, 0], halign: 'right' }
  }]);
  
  rows.push([{
    content: "• Aria condizionata", 
    styles: { textColor: [0, 120, 0] }
  }, {
    content: "Inclusa",
    styles: { textColor: [0, 120, 0], halign: 'right' }
  }]);
  
  rows.push([{
    content: "• Consumi (acqua, elettricità, gas)", 
    styles: { textColor: [0, 120, 0] }
  }, {
    content: "Inclusi",
    styles: { textColor: [0, 120, 0], halign: 'right' }
  }]);
  
  rows.push([{
    content: "• Set di cortesia per il bagno", 
    styles: { textColor: [0, 120, 0] }
  }, {
    content: "Incluso",
    styles: { textColor: [0, 120, 0], halign: 'right' }
  }]);
  
  // Add more included services for a more comprehensive list
  rows.push([{
    content: "• Biancheria da letto e da bagno", 
    styles: { textColor: [0, 120, 0] }
  }, {
    content: "Inclusa",
    styles: { textColor: [0, 120, 0], halign: 'right' }
  }]);
  
  rows.push([{
    content: "• Assistenza 24/7", 
    styles: { textColor: [0, 120, 0] }
  }, {
    content: "Inclusa",
    styles: { textColor: [0, 120, 0], halign: 'right' }
  }]);
  
  return rows;
};
